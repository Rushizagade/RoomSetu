/**
 * Base application error. All custom errors extend this.
 * The centralized error handler uses `statusCode` and `code` to build API responses.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to access this resource.', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }> = []) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, 'INTERNAL_ERROR', false);
  }
}
