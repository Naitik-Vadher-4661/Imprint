import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  FRONTEND_URL: z.string().default('*'),
  
  DATABASE_URL: z.string().url().catch('postgres://user:pass@localhost:5432/db'),
  REDIS_URL: z.string().catch(''),
  
  JWT_SECRET: z.string().catch('default_secret_key_needs_to_be_long_enough'),
  JWT_REFRESH_SECRET: z.string().catch('default_refresh_secret_key_needs_to_be_long_enough'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  
  GEMINI_API_KEY: z.string().catch(''),
  GROQ_API_KEY: z.string().catch(''),
  
  CLIMATEIQ_API_KEY: z.string().catch(''),
  LOCATIONIQ_API_KEY: z.string().catch(''),
  
  POSTHOG_API_KEY: z.string().catch(''),
  POSTHOG_HOST: z.string().catch('https://us.i.posthog.com'),
  
  SMTP_HOST: z.string().catch(''),
  SMTP_PORT: z.string().catch('25').transform(Number),
  SMTP_USER: z.string().catch(''),
  SMTP_PASS: z.string().catch(''),
  SMTP_FROM: z.string().catch('test@example.com'),
  
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
