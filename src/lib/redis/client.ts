import Redis from 'ioredis';

// Initialize Redis client
export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Initialize Redis client for Bull (uses a separate connection pool)
export const redisQueueClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Handle connection errors
redisClient.on('error', (error) => {
  console.error('Redis Client Error:', error);
});

redisQueueClient.on('error', (error) => {
  console.error('Redis Queue Client Error:', error);
});

// Connection established
redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisQueueClient.on('connect', () => {
  console.log('Redis Queue Client Connected');
});

export default redisClient;
