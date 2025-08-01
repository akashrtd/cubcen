/**
 * Test helpers for backend integration tests
 */

import express, { Express } from 'express'
import cors from 'cors'
import { logger } from '@/lib/logger'
import authRoutes from '@/backend/routes/auth'
import agentRoutes from '@/backend/routes/agents'
import platformRoutes from '@/backend/routes/platforms'
import taskRoutes from '@/backend/routes/tasks'
import userRoutes from '@/backend/routes/users'
import healthRoutes from '@/backend/routes/health'

/**
 * Create test Express application with all routes configured
 */
export async function createTestApp(): Promise<Express> {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // Routes
  app.use('/api/cubcen/v1/auth', authRoutes)
  app.use('/api/cubcen/v1/agents', agentRoutes)
  app.use('/api/cubcen/v1/platforms', platformRoutes)
  app.use('/api/cubcen/v1/tasks', taskRoutes)
  app.use('/api/cubcen/v1/users', userRoutes)
  app.use('/health', healthRoutes)

  // Global error handler
  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error in test app', error)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    })
  })

  return app
}