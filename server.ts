import path from 'path';
import { createServer as createViteServer } from 'vite';
import { env, validateEnv } from './backend/src/config/env.ts';
import { logger } from './backend/src/config/logger.ts';
import { createApp } from './backend/src/app.ts';

async function startServer() {
  // Validate environment before doing anything
  validateEnv();

  const app = createApp();

  // ── Dev: Vite middleware for hot-reload SPA ────────────────────────────────
  if (!env.isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // ── Prod: Serve built SPA from dist/ ──────────────────────────────────────
    const { default: express } = await import('express');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`RoomSetu API running`, {
      port: env.PORT,
      env: env.NODE_ENV,
      health: `http://localhost:${env.PORT}/health`,
    });
    console.log(`============================================================`);
    console.log(`  ROOMSETU Full-Stack Engine running on port ${env.PORT}`);
    console.log(`  Health Check: http://localhost:${env.PORT}/health`);
    console.log(`  Environment : ${env.NODE_ENV}`);
    console.log(`============================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
