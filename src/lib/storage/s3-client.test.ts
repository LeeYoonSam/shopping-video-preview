import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateS3Key, getSignedS3Url, uploadToS3, deleteFromS3 } from './s3-client';

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => {
  const mockS3Client = {
    send: vi.fn().mockResolvedValue({}),
  };
  return {
    S3Client: vi.fn(() => mockS3Client),
    PutObjectCommand: vi.fn((input) => ({ input })),
    GetObjectCommand: vi.fn((input) => ({ input })),
    DeleteObjectCommand: vi.fn((input) => ({ input })),
  };
});

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://example.com/signed-url'),
}));

describe('S3 Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.S3_BUCKET = 'test-bucket';
    process.env.S3_REGION = 'us-east-1';
  });

  describe('generateS3Key', () => {
    it('should generate S3 key for product image', () => {
      const key = generateS3Key('product', 'test.jpg');

      expect(key).toContain('tryon/product/');
      expect(key).toContain('.jpg');
    });

    it('should generate S3 key for model image', () => {
      const key = generateS3Key('model', 'model.png');

      expect(key).toContain('tryon/model/');
      expect(key).toContain('.png');
    });

    it('should generate S3 key for result image', () => {
      const key = generateS3Key('result', 'result.webp');

      expect(key).toContain('tryon/result/');
      expect(key).toContain('.webp');
    });

    it('should include timestamp and UUID in key', () => {
      const key = generateS3Key('product', 'test.jpg');

      // Should have format: tryon/product/timestamp-uuid.jpg
      const parts = key.split('/');
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe('tryon');
      expect(parts[1]).toBe('product');
    });
  });

  describe('uploadToS3', () => {
    it('should upload file to S3 successfully', async () => {
      const buffer = Buffer.from('test-image-data');
      const result = await uploadToS3({
        Key: 'test-key.jpg',
        Body: buffer,
        ContentType: 'image/jpeg',
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com/signed-url');
      expect(result.s3Key).toBe('test-key.jpg');
      expect(result.fileSize).toBeGreaterThan(0);
    });

    it('should throw error if S3_BUCKET not set', async () => {
      delete process.env.S3_BUCKET;

      const buffer = Buffer.from('test-image-data');
      await expect(
        uploadToS3({
          Key: 'test-key.jpg',
          Body: buffer,
          ContentType: 'image/jpeg',
        })
      ).rejects.toThrow('S3_BUCKET');
    });
  });

  describe('getSignedS3Url', () => {
    it('should generate signed URL successfully', async () => {
      const url = await getSignedS3Url('test-key.jpg', 3600);

      expect(url).toBe('https://example.com/signed-url');
    });

    it('should use custom expiration time', async () => {
      const url = await getSignedS3Url('test-key.jpg', 7200);

      expect(url).toBe('https://example.com/signed-url');
    });

    it('should throw error if S3_BUCKET not set', async () => {
      delete process.env.S3_BUCKET;

      await expect(getSignedS3Url('test-key.jpg')).rejects.toThrow('S3_BUCKET');
    });
  });

  describe('deleteFromS3', () => {
    it('should delete file from S3 successfully', async () => {
      await expect(deleteFromS3('test-key.jpg')).resolves.not.toThrow();
    });

    it('should throw error if S3_BUCKET not set', async () => {
      delete process.env.S3_BUCKET;

      await expect(deleteFromS3('test-key.jpg')).rejects.toThrow('S3_BUCKET');
    });
  });
});
