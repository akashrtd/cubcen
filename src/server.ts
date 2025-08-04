// Cubcen Express Server
// Main server setup with middleware configuration and error handling

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import { structuredLogger as logger } from '@/lib/logger'
import {
  sanitizeInput,
  securityHeaders,
  csrfProtection,
  generateCsrfToken,
  suspiciousActivityDetection,
  AdvancedRateLimiter,
  honeypotProtection,
} from '@/backend/middleware/security'
import { sessionManager } from '@/lib/session-manager'
import { auditLogger, AuditEventType } from '@/lib/audit-logger'

// Import routes
import authRoutes from '@/backend/routes/auth'
import agentRoutes from '@/backend/routes/agents'
import taskRoutes from '@/backend/routes/tasks'
import platformRoutes from '@/backend/routes/platforms'
import userRoutes from '@/backend/routes/users'
import settingsRoutes from '@/backend/routes/settings'
import healthRoutes from '@/backend/routes/health'
import websocketRoutes from '@/backend/routes/websocket'
import analyticsRoutes from '@/backend/routes/analytics'
import errorRoutes from '@/backend/routes/errors'
import notificationRoutes from '@/backend/routes/notifications'
import backupRoutes from '@/backend/routes/backup'
import performanceRoutes from '@/backend/routes/performance'
import { createWorkflowRoutes } from '@/backend/routes/workflows'
import { setupSwagger } from '@/lib/swagger'
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from '@/lib/api-error-handler'
import {
  validateApiVersion,
  handleVersionTransforms,
} from '@/lib/api-versioning'
import { performanceMonitor } from '@/lib/performance-monitor'
import { CacheWarmer } from '@/lib/cache'

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

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      'cubcen-session-secret-change-in-production',
    name: 'cubcen.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict',
    },
  })
)

// Enhanced security middleware
app.use(securityHeaders)
app.use(
  helmet({
    contentSecurityPolicy: false, // We handle CSP in securityHeaders
    crossOriginEmbedderPolicy: false,
  })
)

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://cubcen.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

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

// Performance monitoring middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    const isError = res.statusCode >= 400

    // Record API request metrics
    performanceMonitor.recordAPIRequest(responseTime, isError)
  })

  next()
})

// Audit logging middleware for API requests
app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  // Log API access
  if (req.user) {
    await auditLogger.logEvent({
      eventType: AuditEventType.DATA_ACCESSED,
      severity: 'LOW' as any,
      userId: req.user.id,
      userEmail: req.user.email,
      action: `${req.method} ${req.path}`,
      description: `User ${req.user.email} accessed ${req.method} ${req.path}`,
      metadata: {
        query: req.query,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id'],
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date(),
      success: true,
    })
  }

  // Track response time and status
  res.on('finish', async () => {
    const duration = Date.now() - startTime

    // Log failed requests
    if (res.statusCode >= 400) {
      await auditLogger.logEvent({
        eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
        severity: res.statusCode >= 500 ? ('HIGH' as any) : ('MEDIUM' as any),
        userId: req.user?.id,
        userEmail: req.user?.email,
        action: `${req.method} ${req.path}`,
        description: `Request failed with status ${res.statusCode}`,
        metadata: {
          statusCode: res.statusCode,
          duration,
          query: req.query,
          body: req.body,
          userAgent: req.get('User-Agent'),
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id'] as string,
        timestamp: new Date(),
        success: false,
      })
    }
  })

  next()
})

// Logging middleware
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim(), { source: 'http' })
      },
    },
  })
)

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    })

    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      },
    })
  },
})

// Apply rate limiting to all API routes
app.use('/api', limiter)

// API versioning middleware
app.use('/api/cubcen', validateApiVersion)
app.use('/api/cubcen', handleVersionTransforms)

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
      method: req.method,
    })

    res.status(429).json({
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later.',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      },
    })
  },
})

// Security middleware
app.use(sanitizeInput)
app.use(suspiciousActivityDetection)
app.use(honeypotProtection)

// Advanced rate limiter for authentication endpoints
const authRateLimiter = new AdvancedRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 1000, // 1 minute initial block
  progressiveMultiplier: 2,
})

// Setup API documentation
setupSwagger(app)

// Add request ID middleware for better error tracking
app.use(requestIdMiddleware)

// Health check routes (no rate limiting for health checks)
app.use('/health', healthRoutes)

// CSRF token endpoint
app.get('/api/cubcen/v1/csrf-token', generateCsrfToken)

// API routes with enhanced security
app.use(
  '/api/cubcen/v1/auth',
  authLimiter,
  authRateLimiter.middleware(),
  authRoutes
)
app.use('/api/cubcen/v1/agents', agentRoutes)
app.use('/api/cubcen/v1/tasks', taskRoutes)
app.use('/api/cubcen/v1/platforms', platformRoutes)
app.use('/api/cubcen/v1/users', userRoutes)
app.use('/api/cubcen/v1/settings', settingsRoutes)
app.use('/api/cubcen/v1/websocket', websocketRoutes)
app.use('/api/cubcen/v1/analytics', analyticsRoutes)
app.use('/api/cubcen/v1/errors', errorRoutes)
app.use('/api/cubcen/v1/notifications', notificationRoutes)
app.use('/api/cubcen/v1/backup', backupRoutes)
app.use('/api/cubcen/v1/performance', performanceRoutes)

// Workflow routes will be initialized in index.ts with service dependencies
export { createWorkflowRoutes }

// 404 handler for API routes
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    notFoundHandler(req, res)
  } else {
    next()
  }
})

// Global error handling middleware
app.use(errorHandler)

// Initialize cache warming on startup
if (process.env.NODE_ENV === 'production') {
  CacheWarmer.warmCache().catch(error => {
    logger.warn('Cache warming failed on startup', error)
  })
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  performanceMonitor.stopMonitoring()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  performanceMonitor.stopMonitoring()
  process.exit(0)
})

// Unhandled promise rejection handler
process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled promise rejection', new Error(String(reason)), {
      promise: promise.toString(),
    })
  }
)

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', error)
  process.exit(1)
})

export default app
