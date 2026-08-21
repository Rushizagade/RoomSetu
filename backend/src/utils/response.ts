import { Response } from 'express';

/**
 * Send a successful JSON response.
 */
export function sendSuccess(res: Response, data: Record<string, any> = {}, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    ...data,
  });
}

/**
 * Send a created (201) JSON response.
 */
export function sendCreated(res: Response, data: Record<string, any> = {}): void {
  sendSuccess(res, data, 201);
}

/**
 * Send an error JSON response.
 * Used by the centralized error handler — controllers should throw errors instead.
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  errors?: Array<{ field: string; message: string }>
): void {
  const body: Record<string, any> = {
    success: false,
    error: { code, message },
  };

  if (errors && errors.length > 0) {
    body.error.errors = errors;
  }

  res.status(statusCode).json(body);
}
