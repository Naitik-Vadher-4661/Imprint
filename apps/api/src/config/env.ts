import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  FRONTEND_URL: z.string().url(),
  
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().min(1),
  
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  
  GEMINI_API_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  
  CLIMATEIQ_API_KEY: z.string().min(1),
  LOCATIONIQ_API_KEY: z.string().min(1),
  
  POSTHOG_API_KEY: z.string().min(1),
  POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com'),
  
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().email(),
  
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = parsed.data;
