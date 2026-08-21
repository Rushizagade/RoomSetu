import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { ownerRepository } from '../repositories/owner.repository.ts';
import { UserRole } from '../types/index.ts';

export interface AuthTokenPayload {
  id: string;
  role: UserRole;
  phone?: string;
  email?: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/**
 * Require a valid JWT token. Sets req.user on success.
 * Also checks if the user account is SUSPENDED.
 */
export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

    // Check suspension status
    if (decoded.role === 'USER') {
      const u = userRepository.findById(decoded.id);
      if (u && u.status === 'SUSPENDED') {
        throw new ForbiddenError('Your account has been suspended by the platform administrator.', 'USER_SUSPENDED');
      }
    } else if (decoded.role === 'ROOM_OWNER') {
      const o = ownerRepository.findById(decoded.id);
      if (o && o.status === 'SUSPENDED') {
        throw new ForbiddenError('Your room owner account has been suspended by the platform administrator.', 'OWNER_SUSPENDED');
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof ForbiddenError) {
      throw err;
    }
    throw new UnauthorizedError('Invalid or expired session token', 'INVALID_TOKEN');
  }
}

/**
 * Optional authentication — sets req.user if a valid token is present, but doesn't fail without one.
 * Used for public endpoints that can optionally identify the user (e.g., search, property detail).
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      req.user = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    } catch {
      // Silently ignore invalid tokens for optional auth
    }
  }

  next();
}
