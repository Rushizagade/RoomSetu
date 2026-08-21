import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import { db } from './database/engine.ts';

import authRoutes from './routes/auth.routes.ts';
import locationRoutes from './routes/location.routes.ts';
import propertyRoutes from './routes/property.routes.ts';
import ownerRoutes from './routes/owner.routes.ts';
import inquiryRoutes from './routes/inquiry.routes.ts';
import visitRoutes from './routes/visit.routes.ts';
import savedRoutes from './routes/saved.routes.ts';
import notificationRoutes from './routes/notification.routes.ts';
import uploadRoutes from './routes/upload.routes.ts';
import adminRoutes from './routes/admin.routes.ts';

export function createApp() {
  const app = express();

  // ── Core middleware ────────────────────────────────────────────────────────
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: env.MAX_JSON_SIZE }));
  app.use(express.urlencoded({ extended: true }));

  // ── Health & Observability ─────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'RoomSetu API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      propertiesCount: db.properties.size,
    });
  });

  app.get('/ready', (_req: Request, res: Response) => {
    res.json({ status: 'ready', uptime: process.uptime() });
  });

  // ── API Routes ─────────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/owner', ownerRoutes);
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/visits', visitRoutes);
  app.use('/api/saved-properties', savedRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/admin', adminRoutes);

  // ── Centralized error handler (must be last) ───────────────────────────────
  app.use(errorHandler);

  return app;
}
