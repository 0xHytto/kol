import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;

export async function initRedis(): Promise<RedisClientType | null> {
  if (redisClient) {
    return redisClient;
  }

  try {
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      database: Number(process.env.REDIS_DB) || 0,
      socket: {
        connectTimeout: 5000, // 5 second timeout
      },
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
    });

    await client.connect();
    redisClient = client;
    logger.info('Redis initialized successfully');

    return client;
  } catch (error) {
    logger.warn('Redis connection failed, continuing without cache:', error);
    return null;
  }
}

export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export default getRedisClient;
