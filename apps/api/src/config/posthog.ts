import { PostHog } from 'posthog-node';
import { config } from './env';

export const posthog = new PostHog(config.POSTHOG_API_KEY, {
  host: config.POSTHOG_HOST,
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await posthog.shutdown();
  process.exit(0);
});
