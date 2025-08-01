/**
 * Cubcen Health Check API Routes
 * Endpoints for system health monitoring and metrics
 */

import { Router, Request, Response } from 'express'
import healthMonitoring, { HealthCheck } from '../../lib/health'
import structuredLogger from '../../lib/logger'

const router = Router()

/**
 * GET /health
 * Overall system health status
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const healthStatus = await healthMonitoring.runAllHealthChecks()

    const statusCode =
      healthStatus.status === 'healthy'
        ? 200
        : healthStatus.status === 'degraded'
          ? 200
          : 503

    res.status(statusCode).json({
      success: true,
      data: healthStatus,
    })
  } catch (error) {
    structuredLogger.error('Health check endpoint failed', error as Error, {
      endpoint: '/health',
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Failed to perform health check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
})

/**
 * GET /health/live
 * Liveness probe - basic application status
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
    },
  })
})

/**
 * GET /health/ready
 * Readiness probe - check if application is ready to serve requests
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check critical dependencies
    const databaseCheck = await healthMonitoring.checkDatabase()
    const memoryCheck = await healthMonitoring.checkMemory()

    const isReady =
      databaseCheck.status !== 'unhealthy' && memoryCheck.status !== 'unhealthy'

    const statusCode = isReady ? 200 : 503

    res.status(statusCode).json({
      success: true,
      data: {
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: databaseCheck.status,
          memory: memoryCheck.status,
        },
      },
    })
  } catch (error) {
    structuredLogger.error('Readiness check failed', error as Error, {
      endpoint: '/health/ready',
    })

    res.status(503).json({
      success: false,
      error: {
        code: 'READINESS_CHECK_FAILED',
        message: 'Application is not ready',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
})

/**
 * GET /health/checks/:name
 * Get specific health check details
 */
router.get('/checks/:name', async (req: Request, res: Response) => {
  const { name } = req.params

  try {
    let check: HealthCheck | undefined

    switch (name) {
      case 'database':
        check = await healthMonitoring.checkDatabase()
        break
      case 'memory':
        check = await healthMonitoring.checkMemory()
        break
      case 'disk':
        check = await healthMonitoring.checkDiskSpace()
        break
      case 'application':
        check = await healthMonitoring.checkApplication()
        break
      default:
        return res.status(404).json({
          success: false,
          error: {
            code: 'HEALTH_CHECK_NOT_FOUND',
            message: `Health check '${name}' not found`,
            availableChecks: ['database', 'memory', 'disk', 'application'],
          },
        })
    }

    if (!check) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_NOT_FOUND',
          message: `Health check '${name}' not found`,
        },
      })
    }

    const statusCode =
      check.status === 'healthy' ? 200 : check.status === 'degraded' ? 200 : 503

    res.status(statusCode).json({
      success: true,
      data: check,
    })
  } catch (error) {
    structuredLogger.error(`Health check '${name}' failed`, error as Error, {
      endpoint: `/health/checks/${name}`,
      checkName: name,
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: `Failed to perform health check '${name}'`,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
})

/**
 * GET /health/metrics
 * Get current system metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await healthMonitoring.collectSystemMetrics()

    res.status(200).json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    structuredLogger.error('Metrics collection failed', error as Error, {
      endpoint: '/health/metrics',
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_COLLECTION_FAILED',
        message: 'Failed to collect system metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
})

/**
 * GET /health/metrics/history
 * Get historical system metrics
 */
router.get('/metrics/history', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined
    const history = healthMonitoring.getMetricsHistory(limit)

    res.status(200).json({
      success: true,
      data: {
        metrics: history,
        count: history.length,
        limit: limit || 'none',
      },
    })
  } catch (error) {
    structuredLogger.error('Metrics history retrieval failed', error as Error, {
      endpoint: '/health/metrics/history',
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_HISTORY_FAILED',
        message: 'Failed to retrieve metrics history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
})

export default router
