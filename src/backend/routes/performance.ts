/**
 * Cubcen Performance Monitoring API Routes
 * Provides endpoints for performance metrics, monitoring, and optimization
 */

import { Router } from 'express'
import { z } from 'zod'
import { structuredLogger as logger } from '@/lib/logger'
import { performanceMonitor } from '@/lib/performance-monitor'
import {
  dbPerformanceMonitor,
  DatabaseOptimizer,
} from '@/lib/database-performance'
import { cache } from '@/lib/cache'
import { Benchmark, LoadTester, PerformanceTestSuite } from '@/lib/benchmark'
import { authenticate } from '@/backend/middleware/auth'
import { validateRequest } from '@/backend/middleware/validation'

const router = Router()

// Apply authentication to all performance routes
router.use(authenticate)

// Validation schemas
const benchmarkSchema = {
  body: z.object({
    name: z.string().min(1),
    iterations: z.number().min(1).max(10000).optional(),
  })
}

const loadTestSchema = {
  body: z.object({
    name: z.string().min(1),
    duration: z.number().min(1000).max(300000), // 1 second to 5 minutes
    concurrency: z.number().min(1).max(100),
    rampUpTime: z.number().min(0).optional(),
    warmupRuns: z.number().min(0).max(100).optional(),
  })
}

const metricsQuerySchema = z.object({
  metric: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).optional(),
})

/**
 * @swagger
 * /api/cubcen/v1/performance/metrics:
 *   get:
 *     summary: Get current system performance metrics
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cpu:
 *                   type: object
 *                 memory:
 *                   type: object
 *                 database:
 *                   type: object
 *                 cache:
 *                   type: object
 *                 api:
 *                   type: object
 *                 agents:
 *                   type: object
 */
router.get('/metrics', async (req, res) => {
  try {
    const stats = {
      metrics: performanceMonitor.getMetrics(),
      componentMetrics: performanceMonitor.getComponentMetrics(),
      coreWebVitals: performanceMonitor.getCoreWebVitals()
    }
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Failed to get performance metrics', error instanceof Error ? error : new Error(String(error)))
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/metrics/history:
 *   get:
 *     summary: Get historical performance metrics
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *         description: Specific metric name to filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for metrics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for metrics
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Maximum number of metrics to return
 *     responses:
 *       200:
 *         description: Historical performance metrics
 */
router.get(
  '/metrics/history',
  validateRequest({ query: metricsQuerySchema }),
  async (req, res) => {
    try {
      const { metric, startDate, endDate } = req.query as any

      const timeRange =
        startDate && endDate
          ? {
              start: new Date(startDate),
              end: new Date(endDate),
            }
          : undefined

      const metrics = performanceMonitor.getMetrics()
      // Note: metrics is an object, not an array, so we return it as-is
      const limitedMetrics = metrics

      res.json({
        success: true,
        data: limitedMetrics,
        meta: {
          total: metrics.length,
          returned: limitedMetrics.length,
          metric,
          timeRange,
        },
      })
    } catch (error) {
      logger.error('Failed to get metrics history', error instanceof Error ? error : new Error(String(error)))
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics history',
      })
    }
  }
)

/**
 * @swagger
 * /api/cubcen/v1/performance/alerts:
 *   get:
 *     summary: Get active performance alerts
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active performance alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = performanceMonitor.getActiveAlerts()
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    })
  } catch (error) {
    logger.error('Failed to get performance alerts', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance alerts',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/alerts/{alertId}/resolve:
 *   post:
 *     summary: Resolve a performance alert
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID to resolve
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 */
router.post('/alerts/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params
    const resolved = performanceMonitor.resolveAlert(alertId)

    if (resolved) {
      res.json({
        success: true,
        message: 'Alert resolved successfully',
      })
    } else {
      res.status(404).json({
        success: false,
        error: 'Alert not found',
      })
    }
  } catch (error) {
    logger.error('Failed to resolve alert', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/database:
 *   get:
 *     summary: Get database performance statistics
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database performance statistics
 */
router.get('/database', async (req, res) => {
  try {
    const stats = await dbPerformanceMonitor.getPerformanceStats()
    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    logger.error('Failed to get database performance stats', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database performance statistics',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/database/optimize:
 *   post:
 *     summary: Optimize database performance
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database optimization completed
 */
router.post('/database/optimize', async (req, res) => {
  try {
    // Require admin role for database optimization
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin role required for database optimization',
      })
    }

    await DatabaseOptimizer.createOptimalIndexes()
    const analysis = await DatabaseOptimizer.analyzePerformance()

    res.json({
      success: true,
      message: 'Database optimization completed',
      data: analysis,
    })
  } catch (error) {
    logger.error('Failed to optimize database', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to optimize database',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/cache:
 *   get:
 *     summary: Get cache performance statistics
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache performance statistics
 */
router.get('/cache', async (req, res) => {
  try {
    const stats = cache.getStats()
    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    logger.error('Failed to get cache stats', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache statistics',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/cache/clear:
 *   post:
 *     summary: Clear cache
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 */
router.post('/cache/clear', async (req, res) => {
  try {
    // Require admin role for cache clearing
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin role required for cache operations',
      })
    }

    cache.clear()
    res.json({
      success: true,
      message: 'Cache cleared successfully',
    })
  } catch (error) {
    logger.error('Failed to clear cache', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/benchmark:
 *   post:
 *     summary: Run performance benchmark
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               iterations:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *     responses:
 *       200:
 *         description: Benchmark completed
 */
router.post(
  '/benchmark',
  validateRequest(benchmarkSchema),
  async (req, res) => {
    try {
      // Require admin role for benchmarks
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Admin role required for performance benchmarks',
        })
      }

      const { name } = req.body

      let result
      switch (name) {
        case 'database':
          result = await Benchmark.benchmarkDatabase()
          break
        case 'cache':
          result = await Benchmark.benchmarkCache()
          break
        case 'api':
          result = await Benchmark.benchmarkAPI()
          break
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid benchmark name. Use: database, cache, or api',
          })
      }

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error('Failed to run benchmark', error as Error)
      res.status(500).json({
        success: false,
        error: 'Failed to run benchmark',
      })
    }
  }
)

/**
 * @swagger
 * /api/cubcen/v1/performance/load-test:
 *   post:
 *     summary: Run load test
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 minimum: 1000
 *                 maximum: 300000
 *               concurrency:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *               rampUpTime:
 *                 type: integer
 *                 minimum: 0
 *               warmupRuns:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Load test completed
 */
router.post('/load-test', validateRequest(loadTestSchema), async (req, res) => {
  try {
    // Require admin role for load tests
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin role required for load tests',
      })
    }

    const { name, duration, concurrency } = req.body

    let result
    switch (name) {
      case 'database':
        result = await LoadTester.testDatabase(duration, concurrency)
        break
      case 'cache':
        result = await LoadTester.testCache(duration, concurrency)
        break
      case 'memory':
        result = await LoadTester.testMemory(duration, concurrency)
        break
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid load test name. Use: database, cache, or memory',
        })
    }

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error('Failed to run load test', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to run load test',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/test-suite:
 *   post:
 *     summary: Run comprehensive performance test suite
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance test suite completed
 */
router.post('/test-suite', async (req, res) => {
  try {
    // Require admin role for test suite
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin role required for performance test suite',
      })
    }

    const result = await PerformanceTestSuite.runAll()

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error('Failed to run performance test suite', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to run performance test suite',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/monitoring/start:
 *   post:
 *     summary: Start performance monitoring
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance monitoring started
 */
router.post('/monitoring/start', async (req, res) => {
  try {
    // Require admin role for monitoring control
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin role required for monitoring control',
      })
    }

    performanceMonitor.startMonitoring()
    res.json({
      success: true,
      message: 'Performance monitoring started',
    })
  } catch (error) {
    logger.error('Failed to start performance monitoring', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to start performance monitoring',
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/performance/monitoring/stop:
 *   post:
 *     summary: Stop performance monitoring
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance monitoring stopped
 */
router.post('/monitoring/stop', async (req, res) => {
  try {
    // Require admin role for monitoring control
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin role required for monitoring control',
      })
    }

    performanceMonitor.stopMonitoring()
    res.json({
      success: true,
      message: 'Performance monitoring stopped',
    })
  } catch (error) {
    logger.error('Failed to stop performance monitoring', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to stop performance monitoring',
    })
  }
})

export default router
