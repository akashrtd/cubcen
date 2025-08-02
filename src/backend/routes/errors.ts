/**
 * Cubcen Error Handling API Routes
 * Handles error logs, patterns, and recovery operations
 */

import { Router } from 'express'
import { ErrorService } from '@/services/error'
import { healthMonitoring } from '@/lib/health'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const router = Router()
const errorService = new ErrorService()

// Validation schemas
const errorFilterSchema = z.object({
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']).optional(),
  source: z.string().optional(),
  agentId: z.string().optional(),
  taskId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
})

const timeRangeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
})

const bulkRetrySchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1).max(50),
})

/**
 * GET /api/cubcen/v1/errors/logs
 * Get error logs with filtering and pagination
 */
router.get('/logs', async (req, res) => {
  try {
    // Validate query parameters
    const validatedQuery = errorFilterSchema.parse(req.query)

    // Parse filter parameters
    const filter = {
      ...(validatedQuery.level && { level: validatedQuery.level }),
      ...(validatedQuery.source && { source: validatedQuery.source }),
      ...(validatedQuery.agentId && { agentId: validatedQuery.agentId }),
      ...(validatedQuery.taskId && { taskId: validatedQuery.taskId }),
      ...(validatedQuery.dateFrom && {
        dateFrom: new Date(validatedQuery.dateFrom),
      }),
      ...(validatedQuery.dateTo && { dateTo: new Date(validatedQuery.dateTo) }),
      ...(validatedQuery.search && { search: validatedQuery.search }),
    }

    const page = validatedQuery.page ? parseInt(validatedQuery.page) : 1
    const limit = validatedQuery.limit ? parseInt(validatedQuery.limit) : 50

    // Get error logs
    const result = await errorService.getErrorLogs({
      filter,
      page,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    })

    res.json(result)
  } catch (error) {
    logger.error('Failed to get error logs', error as Error, {
      query: req.query,
      endpoint: '/errors/logs',
    })

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.issues,
      })
    }

    res.status(500).json({
      error: 'Failed to fetch error logs',
    })
  }
})

/**
 * GET /api/cubcen/v1/errors/stats
 * Get error statistics for a time range
 */
router.get('/stats', async (req, res) => {
  try {
    // Default to last 24 hours if no time range provided
    const defaultTimeRange = {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }

    const timeRangeQuery = {
      from: (req.query.from as string) || defaultTimeRange.from,
      to: (req.query.to as string) || defaultTimeRange.to,
    }

    const validatedTimeRange = timeRangeSchema.parse(timeRangeQuery)

    const timeRange = {
      from: new Date(validatedTimeRange.from),
      to: new Date(validatedTimeRange.to),
    }

    // Get error statistics
    const stats = await errorService.getErrorStats(timeRange)

    res.json({ stats })
  } catch (error) {
    logger.error('Failed to get error statistics', error as Error, {
      query: req.query,
      endpoint: '/errors/stats',
    })

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid time range parameters',
        details: error.issues,
      })
    }

    res.status(500).json({
      error: 'Failed to fetch error statistics',
    })
  }
})

/**
 * GET /api/cubcen/v1/errors/patterns
 * Detect error patterns in a time range
 */
router.get('/patterns', async (req, res) => {
  try {
    // Default to last 24 hours if no time range provided
    const defaultTimeRange = {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }

    const timeRangeQuery = {
      from: (req.query.from as string) || defaultTimeRange.from,
      to: (req.query.to as string) || defaultTimeRange.to,
    }

    const validatedTimeRange = timeRangeSchema.parse(timeRangeQuery)

    const timeRange = {
      from: new Date(validatedTimeRange.from),
      to: new Date(validatedTimeRange.to),
    }

    // Detect error patterns
    const patterns = await errorService.detectErrorPatterns(timeRange)

    res.json({ patterns })
  } catch (error) {
    logger.error('Failed to detect error patterns', error as Error, {
      query: req.query,
      endpoint: '/errors/patterns',
    })

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid time range parameters',
        details: error.issues,
      })
    }

    res.status(500).json({
      error: 'Failed to detect error patterns',
    })
  }
})

/**
 * GET /api/cubcen/v1/errors/retryable-tasks
 * Get tasks that can be retried
 */
router.get('/retryable-tasks', async (req, res) => {
  try {
    const tasks = await errorService.getRetryableTasks()
    res.json({ tasks })
  } catch (error) {
    logger.error('Failed to get retryable tasks', error as Error, {
      endpoint: '/errors/retryable-tasks',
    })

    res.status(500).json({
      error: 'Failed to fetch retryable tasks',
    })
  }
})

/**
 * POST /api/cubcen/v1/errors/retry-task/:taskId
 * Retry a single failed task
 */
router.post('/retry-task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params

    if (!taskId) {
      return res.status(400).json({
        error: 'Task ID is required',
      })
    }

    await errorService.retryTask(taskId)

    res.json({
      message: 'Task retry initiated successfully',
      taskId,
    })
  } catch (error) {
    logger.error('Failed to retry task', error as Error, {
      taskId: req.params.taskId,
      endpoint: '/errors/retry-task',
    })

    res.status(500).json({
      error: (error as Error).message || 'Failed to retry task',
    })
  }
})

/**
 * POST /api/cubcen/v1/errors/bulk-retry-tasks
 * Retry multiple failed tasks
 */
router.post('/bulk-retry-tasks', async (req, res) => {
  try {
    const validatedBody = bulkRetrySchema.parse(req.body)

    const result = await errorService.bulkRetryTasks(validatedBody.taskIds)

    res.json(result)
  } catch (error) {
    logger.error('Failed to bulk retry tasks', error as Error, {
      body: req.body,
      endpoint: '/errors/bulk-retry-tasks',
    })

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.issues,
      })
    }

    res.status(500).json({
      error: 'Failed to retry tasks',
    })
  }
})

/**
 * GET /api/cubcen/v1/health/indicators
 * Get system health indicators
 */
router.get('/health/indicators', async (req, res) => {
  try {
    const healthStatus = await healthMonitoring.runAllHealthChecks()

    // Transform health checks to indicators format
    const indicators = healthStatus.checks.map(check => ({
      name: check.name,
      status: check.status,
      value: check.details?.value || check.responseTime,
      threshold: check.details?.threshold,
      unit: check.details?.unit || (check.responseTime ? 'ms' : undefined),
      lastCheck: check.lastCheck,
      details: check.details,
      trend: check.details?.trend || 'stable',
    }))

    res.json({
      indicators,
      overallStatus: healthStatus.status,
      timestamp: healthStatus.timestamp,
    })
  } catch (error) {
    logger.error('Failed to get health indicators', error as Error, {
      endpoint: '/health/indicators',
    })

    res.status(500).json({
      error: 'Failed to fetch health indicators',
    })
  }
})

export default router
