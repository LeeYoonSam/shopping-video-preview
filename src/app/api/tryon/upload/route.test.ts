import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/image/validator', () => ({
  isValidImageFormat: vi.fn((type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type)),
  isValidImageSize: vi.fn((size) => size > 0 && size <= 10 * 1024 * 1024),
}));

vi.mock('@/lib/image/processor', () => ({
  processImage: vi.fn().mockResolvedValue({
    buffer: Buffer.from('processed-data'),
    width: 1024,
    height: 1024,
    format: 'JPEG',
    fileSize: 500000,
  }),
}));

vi.mock('@/lib/storage/s3-client', () => ({
  generateS3Key: vi.fn((type, name) => `tryon/${type}/test-${name}`),
  uploadToS3: vi.fn().mockResolvedValue({
    url: 'https://example.com/image.jpg',
    s3Key: 'tryon/product/test-image.jpg',
    fileSize: 500000,
  }),
}));

describe('POST /api/tryon/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject request with no file', async () => {
    const mockRequest = {
      formData: vi.fn().mockResolvedValue(new FormData()),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('No file provided');
  });

  it('should reject unsupported image format', async () => {
    const formData = new FormData();
    const file = new File(['data'], 'test.bmp', { type: 'image/bmp' });
    formData.append('file', file);

    const mockRequest = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid image format');
  });

  it('should reject file exceeding size limit', async () => {
    const largeFile = new File(
      ['x'.repeat(11 * 1024 * 1024)],
      'large.jpg',
      { type: 'image/jpeg' }
    );

    // Mock the formData to return a large file
    const mockRequest = {
      formData: vi.fn().mockResolvedValue({
        get: (key: string) => {
          if (key === 'file') {
            return { ...largeFile, size: 11 * 1024 * 1024 };
          }
          return null;
        },
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.error).toContain('exceeds maximum');
  });

  it('should upload valid JPEG image successfully', async () => {
    const file = new File(['image-data'], 'product.jpg', { type: 'image/jpeg' });
    const formData = {
      get: (key: string) => {
        if (key === 'file') return file;
        return null;
      },
    };

    const mockRequest = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('url');
    expect(data).toHaveProperty('s3Key');
    expect(data).toHaveProperty('width');
    expect(data).toHaveProperty('height');
  });

  it('should upload valid PNG image successfully', async () => {
    const file = new File(['image-data'], 'product.png', { type: 'image/png' });
    const formData = {
      get: (key: string) => {
        if (key === 'file') return file;
        return null;
      },
    };

    const mockRequest = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.format).toBe('JPEG');
  });
});
