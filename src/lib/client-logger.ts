// src/lib/client-logger.ts
// This logger is intended for client-side use.
// In development, it logs to the console. In production, it's a no-op.

const isDevelopment = process.env.NODE_ENV === 'development';

export const clientLogger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
