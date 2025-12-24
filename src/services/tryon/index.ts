import tryOnQueue from '@/lib/queue/tryon-queue';
import { TryOnJobData } from '@/lib/queue/types';
import {
  cacheTryOnResult,
  getCachedTryOnResult,
  deleteCachedTryOnResult,
} from '@/lib/cache/tryon-cache';
import { TryOnRequest, TryOnResponse, TryOnJobStatus } from './types';

/**
 * TryOn Service
 * Core business logic for virtual try-on feature
 */
export class TryOnService {
  /**
   * Create a new virtual try-on job
   */
  async createJob(request: TryOnRequest): Promise<TryOnResponse> {
    try {
      // Validate inputs
      if (!request.productImageUrl || !request.modelImageUrl) {
        throw new Error('Product and model image URLs are required');
      }

      // Add job to queue
      const job = await tryOnQueue.add(
        {
          productImageId: request.productImageId,
          modelImageId: request.modelImageId,
          productImageUrl: request.productImageUrl,
          modelImageUrl: request.modelImageUrl,
        } as TryOnJobData,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        }
      );

      return {
        jobId: String(job.id),
        status: 'queued',
        progress: 0,
      };
    } catch (error) {
      throw new Error(`Failed to create try-on job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<TryOnJobStatus> {
    try {
      const job = await tryOnQueue.getJob(jobId);

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      const state = await job.getState();
      const progress = job.progress();

      // Map Bull job state to our status
      const statusMap: Record<string, TryOnJobStatus['status']> = {
        waiting: 'queued',
        active: 'processing',
        completed: 'completed',
        failed: 'failed',
        delayed: 'queued',
        paused: 'queued',
      };

      const status = statusMap[state] || 'queued';

      const response: TryOnJobStatus = {
        jobId,
        status,
        progress: typeof progress === 'number' ? progress : 0,
        createdAt: new Date(job.timestamp),
      };

      if (status === 'completed' && job.returnvalue) {
        response.resultImageUrl = job.returnvalue.resultImageUrl;
      }

      if (status === 'failed' && job.failedReason) {
        response.errorMessage = job.failedReason;
        response.retryCount = job.attemptsMade || 0;
        response.maxRetries = job.opts?.attempts || 3;
      }

      if (job.finishedOn) {
        response.completedAt = new Date(job.finishedOn);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to get job status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get result with caching
   */
  async getResult(resultId: string) {
    try {
      // Check cache first
      const cached = await getCachedTryOnResult(resultId);

      if (cached) {
        return {
          ...cached,
          cached: true,
        };
      }

      throw new Error(`Result ${resultId} not found in cache`);
    } catch (error) {
      throw new Error(`Failed to get result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cache result
   */
  async cacheResult(
    resultId: string,
    result: {
      resultImageUrl: string;
      width: number;
      height: number;
      format: string;
      fileSize: number;
    },
    ttl?: number
  ) {
    try {
      await cacheTryOnResult(resultId, result, ttl);
    } catch (error) {
      throw new Error(`Failed to cache result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete result
   */
  async deleteResult(resultId: string) {
    try {
      await deleteCachedTryOnResult(resultId);
    } catch (error) {
      throw new Error(`Failed to delete result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string) {
    try {
      const job = await tryOnQueue.getJob(jobId);

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      await job.remove();
    } catch (error) {
      throw new Error(`Failed to cancel job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const tryOnService = new TryOnService();
