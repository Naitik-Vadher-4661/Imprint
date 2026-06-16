import { defineConfig } from '@prisma/config';
import { config } from './src/config/env';

export default defineConfig({
  earlyAccess: true,
  studio: {
    port: 5555,
  },
  datasource: {
    url: config.DATABASE_URL,
  },
});
