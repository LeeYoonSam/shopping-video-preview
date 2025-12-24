import { redisClient } from '@/lib/redis/client';

const CACHE_PREFIX = 'tryon:result:';
const CACHE_TTL = 86400 * 7; // 7 days in seconds

export interface CachedTryOnResult {
  resultImageUrl: string;
  width: number;
  height: number;
  format: string;
  fileSize: number;
  cachedAt: number;
  expiresAt: number;
}

/**
 * Cache try-on result in Redis
 */
export async function cacheTryOnResult(
  resultId: string,
  result: Omit<CachedTryOnResult, 'cachedAt' | 'expiresAt'>,
  ttl: number = CACHE_TTL
): Promise<void> {
  try {
    const now = Date.now();
    const cacheData: CachedTryOnResult = {
      ...result,
      cachedAt: now,
      expiresAt: now + ttl * 1000,
    };

    const key = `${CACHE_PREFIX}${resultId}`;
    await redisClient.setex(
      key,
      ttl,
      JSON.stringify(cacheData)
    );
  } catch (error) {
    console.error('Cache store error:', error);
    throw new Error(`Failed to cache result: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieve cached try-on result
 */
export async function getCachedTryOnResult(
  resultId: string
): Promise<CachedTryOnResult | null> {
  try {
    const key = `${CACHE_PREFIX}${resultId}`;
    const cached = await redisClient.get(key);

    if (!cached) {
      return null;
    }

    const result = JSON.parse(cached) as CachedTryOnResult;

    // Check if cache has expired
    if (result.expiresAt && Date.now() > result.expiresAt) {
      await redisClient.del(key);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

/**
 * Delete cached try-on result
 */
export async function deleteCachedTryOnResult(resultId: string): Promise<void> {
  try {
    const key = `${CACHE_PREFIX}${resultId}`;
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
    throw new Error(`Failed to delete cache: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if result is cached
 */
export async function isTryOnResultCached(resultId: string): Promise<boolean> {
  try {
    const key = `${CACHE_PREFIX}${resultId}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Cache check error:', error);
    return false;
  }
}

/**
 * Get cache TTL
 */
export async function getCacheTTL(resultId: string): Promise<number> {
  try {
    const key = `${CACHE_PREFIX}${resultId}`;
    const ttl = await redisClient.ttl(key);
    return ttl; // Returns -2 if key doesn't exist, -1 if no expiry
  } catch (error) {
    console.error('Cache TTL error:', error);
    return -2;
  }
}

/**
 * Invalidate all try-on caches (admin function)
 */
export async function invalidateAllTryOnCaches(): Promise<void> {
  try {
    const pattern = `${CACHE_PREFIX}*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
    throw new Error(`Failed to invalidate caches: ${error instanceof Error ? error.message : String(error)}`);
  }
}
