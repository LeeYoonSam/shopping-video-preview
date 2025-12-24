import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
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
    s3Key: 'tryon/model/test-image.jpg',
    fileSize: 500000,
  }),
}));

describe('GET /api/tryon/models', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of available models', async () => {
    const mockRequest = {} as NextRequest;

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('url');
    expect(data[0]).toHaveProperty('isActive');
  });

  it('should return models with required properties', async () => {
    const mockRequest = {} as NextRequest;

    const response = await GET(mockRequest);
    const data = await response.json();

    const model = data[0];
    expect(model).toHaveProperty('id');
    expect(model).toHaveProperty('name');
    expect(model).toHaveProperty('url');
    expect(model).toHaveProperty('width');
    expect(model).toHaveProperty('height');
    expect(model).toHaveProperty('isActive');
  });
});

describe('POST /api/tryon/models', () => {
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

  it('should reject request without model name', async () => {
    const file = new File(['image-data'], 'model.jpg', { type: 'image/jpeg' });
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

    expect(response.status).toBe(400);
    expect(data.error).toContain('Model name');
  });

  it('should reject unsupported image format', async () => {
    const file = new File(['data'], 'model.bmp', { type: 'image/bmp' });
    const formData = {
      get: (key: string) => {
        if (key === 'file') return file;
        if (key === 'name') return 'Test Model';
        return null;
      },
    };

    const mockRequest = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid image format');
  });

  it('should register model successfully', async () => {
    const file = new File(['image-data'], 'model.jpg', { type: 'image/jpeg' });
    const formData = {
      get: (key: string) => {
        if (key === 'file') return file;
        if (key === 'name') return 'Test Model';
        return null;
      },
    };

    const mockRequest = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('url');
    expect(data).toHaveProperty('width');
    expect(data).toHaveProperty('height');
    expect(data.isActive).toBe(true);
  });
});
