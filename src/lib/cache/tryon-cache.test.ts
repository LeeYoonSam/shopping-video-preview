import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cacheTryOnResult,
  getCachedTryOnResult,
  deleteCachedTryOnResult,
  isTryOnResultCached,
  getCacheTTL,
  invalidateAllTryOnCaches,
} from './tryon-cache';

// Mock Redis client
vi.mock('@/lib/redis/client', () => {
  const mockRedis = {
    setex: vi.fn().mockResolvedValue('OK'),
    get: vi.fn(),
    del: vi.fn().mockResolvedValue(1),
    exists: vi.fn(),
    ttl: vi.fn(),
    keys: vi.fn(),
  };
  return {
    redisClient: mockRedis,
  };
});

describe('TryOn Cache', () => {
  let redisClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    redisClient = require('@/lib/redis/client').redisClient;
  });

  describe('cacheTryOnResult', () => {
    it('should cache result with default TTL', async () => {
      const resultId = 'result-123';
      const result = {
        resultImageUrl: 'https://example.com/result.jpg',
        width: 512,
        height: 512,
        format: 'JPEG',
        fileSize: 102400,
      };

      await cacheTryOnResult(resultId, result);

      expect(redisClient.setex).toHaveBeenCalledWith(
        expect.stringContaining(resultId),
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should cache result with custom TTL', async () => {
      const resultId = 'result-123';
      const result = {
        resultImageUrl: 'https://example.com/result.jpg',
        width: 512,
        height: 512,
        format: 'JPEG',
        fileSize: 102400,
      };
      const customTTL = 3600; // 1 hour

      await cacheTryOnResult(resultId, result, customTTL);

      expect(redisClient.setex).toHaveBeenCalledWith(
        expect.stringContaining(resultId),
        customTTL,
        expect.any(String)
      );
    });

    it('should include cache metadata in stored data', async () => {
      const resultId = 'result-123';
      const result = {
        resultImageUrl: 'https://example.com/result.jpg',
        width: 512,
        height: 512,
        format: 'JPEG',
        fileSize: 102400,
      };

      await cacheTryOnResult(resultId, result);

      const callArgs = redisClient.setex.mock.calls[0];
      const storedData = JSON.parse(callArgs[2]);

      expect(storedData).toHaveProperty('cachedAt');
      expect(storedData).toHaveProperty('expiresAt');
      expect(storedData.resultImageUrl).toBe(result.resultImageUrl);
    });
  });

  describe('getCachedTryOnResult', () => {
    it('should retrieve cached result', async () => {
      const resultId = 'result-123';
      const cachedData = {
        resultImageUrl: 'https://example.com/result.jpg',
        width: 512,
        height: 512,
        format: 'JPEG',
        fileSize: 102400,
        cachedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      };

      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getCachedTryOnResult(resultId);

      expect(result).toBeDefined();
      expect(result?.resultImageUrl).toBe(cachedData.resultImageUrl);
      expect(result?.width).toBe(512);
    });

    it('should return null if result not cached', async () => {
      redisClient.get.mockResolvedValue(null);

      const result = await getCachedTryOnResult('nonexistent');

      expect(result).toBeNull();
    });

    it('should delete expired cache entry', async () => {
      const resultId = 'result-123';
      const expiredData = {
        resultImageUrl: 'https://example.com/result.jpg',
        width: 512,
        height: 512,
        format: 'JPEG',
        fileSize: 102400,
        cachedAt: Date.now() - 86400000,
        expiresAt: Date.now() - 1000, // Expired
      };

      redisClient.get.mockResolvedValue(JSON.stringify(expiredData));

      const result = await getCachedTryOnResult(resultId);

      expect(result).toBeNull();
      expect(redisClient.del).toHaveBeenCalled();
    });
  });

  describe('deleteCachedTryOnResult', () => {
    it('should delete cached result', async () => {
      await deleteCachedTryOnResult('result-123');

      expect(redisClient.del).toHaveBeenCalledWith(
        expect.stringContaining('result-123')
      );
    });
  });

  describe('isTryOnResultCached', () => {
    it('should return true if result is cached', async () => {
      redisClient.exists.mockResolvedValue(1);

      const isCached = await isTryOnResultCached('result-123');

      expect(isCached).toBe(true);
    });

    it('should return false if result is not cached', async () => {
      redisClient.exists.mockResolvedValue(0);

      const isCached = await isTryOnResultCached('result-123');

      expect(isCached).toBe(false);
    });
  });

  describe('getCacheTTL', () => {
    it('should return TTL for cached result', async () => {
      redisClient.ttl.mockResolvedValue(3600);

      const ttl = await getCacheTTL('result-123');

      expect(ttl).toBe(3600);
    });

    it('should return -2 if key does not exist', async () => {
      redisClient.ttl.mockResolvedValue(-2);

      const ttl = await getCacheTTL('nonexistent');

      expect(ttl).toBe(-2);
    });
  });

  describe('invalidateAllTryOnCaches', () => {
    it('should delete all cached results', async () => {
      redisClient.keys.mockResolvedValue([
        'tryon:result:123',
        'tryon:result:456',
        'tryon:result:789',
      ]);

      await invalidateAllTryOnCaches();

      expect(redisClient.del).toHaveBeenCalledWith(
        'tryon:result:123',
        'tryon:result:456',
        'tryon:result:789'
      );
    });

    it('should handle empty cache gracefully', async () => {
      redisClient.keys.mockResolvedValue([]);

      await expect(invalidateAllTryOnCaches()).resolves.not.toThrow();
    });
  });
});
