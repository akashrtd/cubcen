// Cubcen Express Server
// Main server setup with middleware configuration and error handling

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { logger } from '@/lib/logger'
// import { sanitizeInput } from '@/backend/middleware/validation'

// Import routes
import authRoutes from '@/backend/routes/auth'
import agentRoutes from '@/backend/routes/agents'
import taskRoutes from '@/backend/routes/tasks'
import platformRoutes from '@/backend/routes/platforms'
import userRoutes from '@/backend/routes/users'
import healthRoutes from '@/backend/routes/health'
import websocketRoutes from '@/backend/routes/websocket'
import { createWorkflowRoutes } from '@/backend/routes/workflows'

// Error types
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: unknown
    timestamp: string
    requestId: string
  }
}

interface CustomError extends Error {
  statusCode?: number
  code?: string
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create Express app
const app = express()

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://cubcen.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Compression middleware
app.use(compression())

// Request parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = generateRequestId()
  req.headers['x-request-id'] = requestId
  res.setHeader('X-Request-ID', requestId)
  next()
})

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim(), { source: 'http' })
    }
  }
}))

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    })
    
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      }
    })
  }
})

// Apply rate limiting to all API routes
app.use('/api', limiter)

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    })
    
    res.status(429).json({
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later.',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      }
    })
  }
})

// Input sanitization middleware (disabled for now due to Express 5 compatibility issues)
// app.use(sanitizeInput)

// Health check routes (no rate limiting for health checks)
app.use('/health', healthRoutes)

// API routes
app.use('/api/cubcen/v1/auth', authLimiter, authRoutes)
app.use('/api/cubcen/v1/agents', agentRoutes)
app.use('/api/cubcen/v1/tasks', taskRoutes)
app.use('/api/cubcen/v1/platforms', platformRoutes)
app.use('/api/cubcen/v1/users', userRoutes)
app.use('/api/cubcen/v1/websocket', websocketRoutes)

// Workflow routes will be initialized in index.ts with service dependencies
export { createWorkflowRoutes }

// 404 handler for API routes
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    logger.warn('API endpoint not found', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.status(404).json({
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: `API endpoint ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      }
    })
  } else {
    next()
  }
})

// Global error handling middleware
app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId()
  
  // Log the error with context
  logger.error('Unhandled server error', error, {
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params
  })
  
  // Determine status code
  let statusCode = error.statusCode || 500
  let errorCode = error.code || 'INTERNAL_SERVER_ERROR'
  let message = error.message || 'Internal server error'
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    errorCode = 'VALIDATION_ERROR'
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401
    errorCode = 'UNAUTHORIZED'
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403
    errorCode = 'FORBIDDEN'
  } else if (error.name === 'NotFoundError') {
    statusCode = 404
    errorCode = 'NOT_FOUND'
  } else if (error.name === 'ConflictError') {
    statusCode = 409
    errorCode = 'CONFLICT'
  }
  
  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error'
  }
  
  const errorResponse: ErrorResponse = {
    error: {
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
      requestId
    }
  }
  
  // Include error details in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.details = {
      stack: error.stack,
      name: error.name
    }
  }
  
  res.status(statusCode).json(errorResponse)
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled promise rejection', new Error(String(reason)), {
    promise: promise.toString()
  })
})

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', error)
  process.exit(1)
})

export default app