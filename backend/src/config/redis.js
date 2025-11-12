import Redis from 'ioredis';
import logger from './logger.js';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableAutoPipelining: true,
  lazyConnect: true
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('Redis Client Error', { error: err.message });
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

export default redis;