/**
 * Cubcen Logging Service
 * Structured logging with Winston for the Cubcen platform
 */

import winston from 'winston'
import path from 'path'

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
export const logger = winston.createLogger({
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
    logger.debug(message, context)
  },
  
  info(message: string, context?: LogContext): void {
    logger.info(message, context)
  },
  
  warn(message: string, context?: LogContext): void {
    logger.warn(message, context)
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
    logger.error(message, logData)
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
    logger.log('fatal', message, logData)
  },
}

// Export both the winston logger and structured logger
export { logger as winstonLogger }
export default structuredLogger