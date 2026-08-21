import { db } from '../database/engine.ts';
import { DEV_OTP_CODES } from '../constants/index.ts';
import { env } from '../config/env.ts';
import { logger } from '../config/logger.ts';

export const otpService = {
  /**
   * Generate and store an OTP for the given phone + role.
   * In development, always returns '123456' for easy demo testing.
   */
  generate(phone: string, role: 'USER' | 'ROOM_OWNER'): string {
    const code = env.isDev ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000;
    db.otps.set(`${phone}_${role}`, { code, role, expiresAt, attempts: 0 });
    logger.info('OTP generated', { phone, role, expiresInMinutes: env.OTP_EXPIRY_MINUTES });
    return code;
  },

  /**
   * Verify an OTP code.
   * Accepts dev bypass codes in all environments for demo purposes.
   * Deletes the OTP entry on successful verification.
   */
  verify(phone: string, role: 'USER' | 'ROOM_OWNER', code: string): boolean {
    // Dev bypass always works
    if (DEV_OTP_CODES.includes(code as any)) return true;

    const entry = db.otps.get(`${phone}_${role}`);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      db.otps.delete(`${phone}_${role}`);
      return false;
    }

    if (entry.code === code) {
      db.otps.delete(`${phone}_${role}`);
      return true;
    }

    entry.attempts += 1;
    return false;
  },
};
