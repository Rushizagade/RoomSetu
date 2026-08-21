import { env } from './env.ts';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  const configuredLevel = (env.LOG_LEVEL || 'info') as LogLevel;
  return LOG_LEVELS[level] >= (LOG_LEVELS[configuredLevel] ?? LOG_LEVELS.info);
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, any>): string {
  const timestamp = new Date().toISOString();

  if (env.isProd) {
    return JSON.stringify({ timestamp, level, message, ...meta });
  }

  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  debug(message: string, meta?: Record<string, any>): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, meta));
    }
  },

  info(message: string, meta?: Record<string, any>): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, meta));
    }
  },

  warn(message: string, meta?: Record<string, any>): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  error(message: string, meta?: Record<string, any>): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta));
    }
  },
};
