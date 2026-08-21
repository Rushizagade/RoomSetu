import { createApp } from './app.ts';
import { env, validateEnv } from './config/env.ts';
import { logger } from './config/logger.ts';

async function startServer() {
  // Validate required environment variables before starting
  validateEnv();

  const app = createApp();

  app.listen(env.PORT, '0.0.0.0', () => {
    logger.info('RoomSetu API running', {
      port: env.PORT,
      env: env.NODE_ENV,
      health: `http://localhost:${env.PORT}/health`,
    });
    console.log('============================================================');
    console.log(`  ROOMSETU Backend running on port ${env.PORT}`);
    console.log(`  Health : http://localhost:${env.PORT}/health`);
    console.log(`  Env    : ${env.NODE_ENV}`);
    console.log('============================================================');
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
