import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TryOnService } from './index';
import tryOnQueue from '@/lib/queue/tryon-queue';
import * as cache from '@/lib/cache/tryon-cache';

// Mock dependencies
vi.mock('@/lib/queue/tryon-queue', () => ({
  default: {
    add: vi.fn().mockResolvedValue({
      id: 'job-123',
      timestamp: Date.now(),
    }),
    getJob: vi.fn(),
  },
}));

vi.mock('@/lib/cache/tryon-cache', () => ({
  cacheTryOnResult: vi.fn().mockResolvedValue(undefined),
  getCachedTryOnResult: vi.fn(),
  deleteCachedTryOnResult: vi.fn().mockResolvedValue(undefined),
}));

describe('TryOn Service', () => {
  let service: TryOnService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TryOnService();
  });

  describe('createJob', () => {
    it('should create a new try-on job', async () => {
      const request = {
        productImageId: 'prod-123',
        productImageUrl: 'https://example.com/product.jpg',
        modelImageId: 'model-456',
        modelImageUrl: 'https://example.com/model.jpg',
      };

      const response = await service.createJob(request);

      expect(response).toBeDefined();
      expect(response.jobId).toBe('job-123');
      expect(response.status).toBe('queued');
      expect(response.progress).toBe(0);
    });

    it('should reject request without product image URL', async () => {
      const request = {
        productImageId: 'prod-123',
        productImageUrl: '',
        modelImageId: 'model-456',
        modelImageUrl: 'https://example.com/model.jpg',
      };

      await expect(service.createJob(request)).rejects.toThrow('URLs are required');
    });

    it('should reject request without model image URL', async () => {
      const request = {
        productImageId: 'prod-123',
        productImageUrl: 'https://example.com/product.jpg',
        modelImageId: 'model-456',
        modelImageUrl: '',
      };

      await expect(service.createJob(request)).rejects.toThrow('URLs are required');
    });
  });

  describe('getJobStatus', () => {
    it('should get job status successfully', async () => {
      vi.mocked(tryOnQueue.getJob).mockResolvedValue({
        id: 'job-123',
        timestamp: Date.now(),
        getState: vi.fn().mockResolvedValue('processing'),
        progress: vi.fn().mockReturnValue(50),
        failedReason: undefined,
        returnvalue: undefined,
        finishedOn: undefined,
      } as any);

      const status = await service.getJobStatus('job-123');

      expect(status).toBeDefined();
      expect(status.jobId).toBe('job-123');
      expect(status.status).toBe('processing');
      expect(status.progress).toBe(50);
    });

    it('should throw error for non-existent job', async () => {
      vi.mocked(tryOnQueue.getJob).mockResolvedValue(null);

      await expect(service.getJobStatus('nonexistent')).rejects.toThrow('not found');
    });

    it('should return result URL for completed job', async () => {
      vi.mocked(tryOnQueue.getJob).mockResolvedValue({
        id: 'job-123',
        timestamp: Date.now(),
        getState: vi.fn().mockResolvedValue('completed'),
        progress: vi.fn().mockReturnValue(100),
        returnvalue: {
          resultImageUrl: 'https://example.com/result.jpg',
        },
        failedReason: undefined,
        finishedOn: Date.now(),
      } as any);

      const status = await service.getJobStatus('job-123');

      expect(status.status).toBe('completed');
      expect(status.resultImageUrl).toBe('https://example.com/result.jpg');
      expect(status.progress).toBe(100);
    });

    it('should return error message for failed job', async () => {
      vi.mocked(tryOnQueue.getJob).mockResolvedValue({
        id: 'job-123',
        timestamp: Date.now(),
        getState: vi.fn().mockResolvedValue('failed'),
        progress: vi.fn().mockReturnValue(0),
        failedReason: 'FASHN API error',
        returnvalue: undefined,
        attemptsMade: 2,
        opts: { attempts: 3 },
        finishedOn: Date.now(),
      } as any);

      const status = await service.getJobStatus('job-123');

      expect(status.status).toBe('failed');
      expect(status.errorMessage).toBe('FASHN API error');
      expect(status.retryCount).toBe(2);
      expect(status.maxRetries).toBe(3);
    });
  });

  describe('cacheResult', () => {
    it('should cache result successfully', async () => {
      const result = {
        resultImageUrl: 'https://example.com/result.jpg',
        width: 512,
        height: 512,
        format: 'JPEG',
        fileSize: 102400,
      };

      await service.cacheResult('result-123', result);

      expect(cache.cacheTryOnResult).toHaveBeenCalledWith(
        'result-123',
        result,
        undefined
      );
    });

    it('should cache result with custom TTL', async () => {
      const result = {
        resultImageUrl: 'https://example.com/result.jpg',
        width: 512,
        height: 512,
        format: 'JPEG',
        fileSize: 102400,
      };

      await service.cacheResult('result-123', result, 3600);

      expect(cache.cacheTryOnResult).toHaveBeenCalledWith(
        'result-123',
        result,
        3600
      );
    });
  });

  describe('getResult', () => {
    it('should get cached result', async () => {
      vi.mocked(cache.getCachedTryOnResult).mockResolvedValue({
        resultImageUrl: 'https://example.com/result.jpg',
        width: 512,
        height: 512,
        format: 'JPEG',
        fileSize: 102400,
        cachedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      });

      const result = await service.getResult('result-123');

      expect(result).toBeDefined();
      expect(result.cached).toBe(true);
      expect(result.resultImageUrl).toBe('https://example.com/result.jpg');
    });

    it('should throw error if result not found', async () => {
      vi.mocked(cache.getCachedTryOnResult).mockResolvedValue(null);

      await expect(service.getResult('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('deleteResult', () => {
    it('should delete result from cache', async () => {
      await service.deleteResult('result-123');

      expect(cache.deleteCachedTryOnResult).toHaveBeenCalledWith('result-123');
    });
  });

  describe('cancelJob', () => {
    it('should cancel job successfully', async () => {
      const mockJob = {
        remove: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(tryOnQueue.getJob).mockResolvedValue(mockJob as any);

      await service.cancelJob('job-123');

      expect(mockJob.remove).toHaveBeenCalled();
    });

    it('should throw error for non-existent job', async () => {
      vi.mocked(tryOnQueue.getJob).mockResolvedValue(null);

      await expect(service.cancelJob('nonexistent')).rejects.toThrow('not found');
    });
  });
});
