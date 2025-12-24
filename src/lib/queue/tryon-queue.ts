import Queue from 'bull';
import { TryOnJobData } from './types';

// Create Bull queue for virtual try-on jobs
// Note: Bull Queue only accepts one type parameter (job data type)
// The result type is inferred from the processor return value
export const tryOnQueue = new Queue<TryOnJobData>(
  'tryon-jobs',
  {
    redis: {
      host: process.env.REDIS_URL?.split('//')[1]?.split(':')[0] || 'localhost',
      port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
    },
    settings: {
      maxStalledCount: 3,
      lockDuration: 5000,
      lockRenewTime: 2500,
    },
    defaultJobOptions: {
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 seconds
      },
    },
  }
);

// Queue event handlers
tryOnQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error.message);
});

tryOnQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

tryOnQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

export default tryOnQueue;
