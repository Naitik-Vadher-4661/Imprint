import Redis from 'ioredis';
import { config } from './env';

export const redis = new Redis(config.REDIS_URL);

redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});
