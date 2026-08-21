import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.ts';
import { logger } from '../config/logger.ts';
import { env } from '../config/env.ts';

/**
 * Centralized error handler middleware.
 * Must be registered last in the Express middleware chain.
 *
 * Catches all errors thrown from routes/controllers/services and returns
 * a consistent JSON error response format matching the frontend expectation:
 *   { success: false, error: { code, message } }
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Known operational errors
  if (err instanceof AppError) {
    const body: Record<string, any> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Attach validation errors if present
    if (err instanceof ValidationError && err.errors.length > 0) {
      body.error.errors = err.errors;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Unexpected / programming errors
  logger.error('Unhandled error', {
    message: err.message,
    stack: env.isDev ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isProd
        ? 'An unexpected error occurred'
        : err.message || 'An unexpected error occurred',
    },
  });
}
