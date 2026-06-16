import { app } from './app';
import { config } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';

const PORT = config.PORT || 4000;

async function bootstrap() {
  try {
    // Check Database
    await prisma.$connect();
    console.log('✅ Connected to Database');

    // Check Redis
    await redis.ping();
    console.log('✅ Redis is ready');

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${config.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
