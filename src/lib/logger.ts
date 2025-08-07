/**
 * Cubcen Logging Service
 * Structured logging with Winston for the Cubcen platform
 */

import path from 'path'

// Define a no-op logger for client-side to prevent bundling server-side dependencies
const noOpLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
}

let winstonLoggerInstance: any

// Conditionally import winston only on the server side
if (typeof window === 'undefined') {
  // This code runs only on the server
  const winston = require('winston')

  // Define log levels
  const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  }

  // Define log colors
  const logColors = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  }

  winston.addColors(logColors)

  // Create logs directory if it doesn't exist
  const logsDir = path.join(process.cwd(), 'logs')

  // Winston logger configuration
  winstonLoggerInstance = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.json()
    ),
    transports: [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),

      // File transport for all logs
      new winston.transports.File({
        filename: path.join(logsDir, 'cubcen.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),

      // Separate file for errors
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],

    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(logsDir, 'exceptions.log'),
      }),
    ],

    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(logsDir, 'rejections.log'),
      }),
    ],
  })
} else {
  // This code runs only on the client
  winstonLoggerInstance = noOpLogger
}

// Create a structured logger interface
interface LogContext {
  [key: string]: unknown
}

export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
  fatal(message: string, error?: Error, context?: LogContext): void
}

// Enhanced logger with structured context
export const structuredLogger: Logger = {
  debug(message: string, context?: LogContext): void {
    winstonLoggerInstance.debug(message, context)
  },

  info(message: string, context?: LogContext): void {
    winstonLoggerInstance.info(message, context)
  },

  warn(message: string, context?: LogContext): void {
    winstonLoggerInstance.warn(message, context)
  },

  error(message: string, error?: Error, context?: LogContext): void {
    const logData = {
      ...context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    }
    winstonLoggerInstance.error(message, logData)
  },

  fatal(message: string, error?: Error, context?: LogContext): void {
    const logData = {
      ...context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    }
    winstonLoggerInstance.log('fatal', message, logData)
  },
}

// Export both the winston logger and structured logger
export { winstonLoggerInstance as winstonLogger }
export default structuredLogger
