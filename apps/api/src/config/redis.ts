import Redis from 'ioredis';
import { config } from './env';

let redisClient: Redis | null = null;
let isConnected = false;

// Check if REDIS_URL is valid and not a placeholder or HTTP URL
const isValidRedisUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith('redis://') || url.startsWith('rediss://') || url.includes('localhost') || url.includes('127.0.0.1');
};

if (isValidRedisUrl(config.REDIS_URL)) {
  try {
    redisClient = new Redis(config.REDIS_URL);
    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis successfully');
      isConnected = true;
    });
    redisClient.on('error', (err: Error) => {
      console.error('❌ Redis Connection Error:', err);
      isConnected = false;
    });
  } catch (err) {
    console.error('❌ Failed to initialize Redis client:', err);
  }
} else {
  console.log('ℹ️ Redis URL not configured or invalid. Caching will be disabled/mocked.');
}

export const redis = {
  ping: async () => {
    if (redisClient && isConnected) {
      try {
        return await redisClient.ping();
      } catch (err) {
        console.warn('⚠️ Redis ping failed:', err);
        return 'PONG';
      }
    }
    return 'PONG';
  },
  get: async (key: string) => {
    if (redisClient && isConnected) {
      try {
        return await redisClient.get(key);
      } catch (err) {
        console.error('❌ Redis GET error:', err);
      }
    }
    return null;
  },
  setex: async (key: string, seconds: number, value: string) => {
    if (redisClient && isConnected) {
      try {
        return await redisClient.setex(key, seconds, value);
      } catch (err) {
        console.error('❌ Redis SETEX error:', err);
      }
    }
    return 'OK';
  },
  on: (event: string, handler: (...args: any[]) => void) => {
    if (redisClient) {
      redisClient.on(event, handler);
    }
  }
};


