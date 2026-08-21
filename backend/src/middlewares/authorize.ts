import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.ts';
import { UserRole } from '../types/index.ts';

/**
 * Middleware factory that restricts access to users with specific roles.
 * Must be used after authenticateToken middleware.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource.');
    }
    next();
  };
}
