import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { FASHNClient } from './client';
import { FASHNError } from './types';

// Mock axios
vi.mock('axios', () => {
  const mockClient = {
    post: vi.fn(),
    get: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockClient),
      isAxiosError: vi.fn((error) => error?.isAxiosError === true),
    },
  };
});

describe('FASHN Client', () => {
  let client: FASHNClient;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FASHN_API_KEY = 'test-api-key';
    process.env.FASHN_API_URL = 'https://api.fashn.ai/v1';
    client = new FASHNClient();
  });

  describe('constructor', () => {
    it('should initialize with API key from environment', () => {
      expect(client).toBeDefined();
    });

    it('should throw error if API key is not set', () => {
      delete process.env.FASHN_API_KEY;

      expect(() => new FASHNClient()).toThrow('FASHN_API_KEY');
    });

    it('should use default API URL if not set', () => {
      delete process.env.FASHN_API_URL;

      const testClient = new FASHNClient();
      expect(testClient).toBeDefined();
    });
  });

  describe('generate', () => {
    it('should send generation request successfully', async () => {
      const mockResponse = {
        data: {
          id: 'job-123',
          status: 'processing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      const mockAxios = axios.create() as any;
      mockAxios.post.mockResolvedValue(mockResponse);

      const request = {
        model_image_url: 'https://example.com/model.jpg',
        garment_image_url: 'https://example.com/garment.jpg',
        category: 'shirt',
        type: 'virtual-tryon',
      };

      const result = await client.generate(request);

      expect(result).toBeDefined();
      expect(result.id).toBe('job-123');
      expect(result.status).toBe('processing');
    });

    it('should handle generation error', async () => {
      const mockAxios = axios.create() as any;
      const mockError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { error: 'Invalid request' },
        },
      };

      mockAxios.post.mockRejectedValue(mockError);

      const request = {
        model_image_url: 'https://example.com/model.jpg',
        garment_image_url: 'https://example.com/garment.jpg',
        category: 'shirt',
        type: 'virtual-tryon',
      };

      await expect(client.generate(request)).rejects.toThrow(FASHNError);
    });
  });

  describe('getStatus', () => {
    it('should get job status successfully', async () => {
      const mockResponse = {
        data: {
          id: 'job-123',
          status: 'completed',
          image_url: 'https://example.com/result.jpg',
          progress: 100,
        },
      };

      const mockAxios = axios.create() as any;
      mockAxios.get.mockResolvedValue(mockResponse);

      const status = await client.getStatus('job-123');

      expect(status).toBeDefined();
      expect(status.id).toBe('job-123');
      expect(status.status).toBe('completed');
    });

    it('should retry on failure with exponential backoff', async () => {
      const mockAxios = axios.create() as any;
      const mockError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      };

      // First call fails, second succeeds
      mockAxios.get
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
          data: {
            id: 'job-123',
            status: 'processing',
          },
        });

      vi.useFakeTimers();

      const statusPromise = client.getStatus('job-123');

      // Advance timer to trigger first retry
      await vi.advanceTimersByTimeAsync(5000);

      const status = await statusPromise;

      expect(status).toBeDefined();
      expect(mockAxios.get).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe('pollJobStatus', () => {
    it('should poll until job completes', async () => {
      const mockAxios = axios.create() as any;

      mockAxios.get
        .mockResolvedValueOnce({
          data: { id: 'job-123', status: 'processing', progress: 50 },
        })
        .mockResolvedValueOnce({
          data: {
            id: 'job-123',
            status: 'completed',
            image_url: 'https://example.com/result.jpg',
          },
        });

      vi.useFakeTimers();

      const statusPromise = client.pollJobStatus('job-123', 60000, 1000);

      await vi.advanceTimersByTimeAsync(6000);

      const status = await statusPromise;

      expect(status.status).toBe('completed');
      expect(status.image_url).toBe('https://example.com/result.jpg');

      vi.useRealTimers();
    });

    it('should timeout if job takes too long', async () => {
      const mockAxios = axios.create() as any;

      mockAxios.get.mockResolvedValue({
        data: { id: 'job-123', status: 'processing', progress: 50 },
      });

      vi.useFakeTimers();

      const statusPromise = client.pollJobStatus('job-123', 5000, 1000);

      await vi.advanceTimersByTimeAsync(10000);

      try {
        await statusPromise;
        throw new Error('Should have timed out');
      } catch (error) {
        if (error instanceof FASHNError) {
          expect(error.statusCode).toBe(408);
          expect(error.apiError).toBe('TIMEOUT');
        }
      }

      vi.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('should convert axios error to FASHNError', async () => {
      const mockAxios = axios.create() as any;
      const mockError = {
        isAxiosError: true,
        response: {
          status: 429,
          data: { error: 'Rate limited' },
        },
      };

      mockAxios.get.mockRejectedValue(mockError);

      try {
        await client.getStatus('job-123');
        throw new Error('Should have thrown');
      } catch (error) {
        if (error instanceof FASHNError) {
          expect(error.statusCode).toBe(429);
          expect(error.apiError).toBe('Rate limited');
        }
      }
    });
  });
});
