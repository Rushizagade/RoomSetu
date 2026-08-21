import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'roomsetu-dev-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_ADMIN_EXPIRES_IN: process.env.JWT_ADMIN_EXPIRES_IN || '1d',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  APP_URL: process.env.APP_URL || `http://localhost:3000`,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  MAX_JSON_SIZE: process.env.MAX_JSON_SIZE || '15mb',
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  get isDev(): boolean {
    return this.NODE_ENV === 'development';
  },

  get isProd(): boolean {
    return this.NODE_ENV === 'production';
  },
};

/**
 * Validate critical environment variables in production.
 * Call once at startup.
 */
export function validateEnv(): void {
  const warnings: string[] = [];

  if (env.isProd) {
    if (env.JWT_SECRET === 'roomsetu-dev-jwt-secret-change-in-production') {
      throw new Error('FATAL: JWT_SECRET must be set to a secure value in production.');
    }
    if (env.CORS_ORIGIN === '*') {
      warnings.push('WARNING: CORS_ORIGIN is set to * in production. Consider restricting.');
    }
  }

  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(`[env] ${w}`));
  }
}
