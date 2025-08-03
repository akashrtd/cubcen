import { Router, Request, Response } from 'express'
import { analyticsService, DateRange } from '@/services/analytics'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import {
  asyncHandler,
  createSuccessResponse,
  APIError,
  APIErrorCode,
} from '@/lib/api-error-handler'

const router = Router()

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

const exportSchema = z.object({
  format: z.enum(['csv', 'json']),
  dataType: z
    .enum(['overview', 'agents', 'tasks', 'trends', 'errors'])
    .optional(),
})

/**
 * GET /api/cubcen/v1/analytics
 * Get comprehensive analytics data
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const query = dateRangeSchema.safeParse(req.query)

  if (!query.success) {
    throw new APIError(
      APIErrorCode.VALIDATION_ERROR,
      'Invalid date range parameters',
      query.error.issues
    )
  }

  let dateRange: DateRange | undefined
  if (query.data.startDate || query.data.endDate) {
    dateRange = {
      startDate: query.data.startDate
        ? new Date(query.data.startDate)
        : new Date(0),
      endDate: query.data.endDate ? new Date(query.data.endDate) : new Date(),
    }
  }

  try {
    const analyticsData = await analyticsService.getAnalyticsData(dateRange)
    
    res.json(createSuccessResponse(
      analyticsData,
      'Analytics data retrieved successfully',
      req.headers['x-request-id'] as string
    ))
  } catch (error) {
    logger.error('Analytics service error', error as Error, {
      requestId: req.headers['x-request-id'],
      dateRange,
    })
    
    throw new APIError(
      APIErrorCode.INTERNAL_ERROR,
      'Failed to retrieve analytics data'
    )
  }
}))

/**
 * GET /api/cubcen/v1/analytics/kpis
 * Get key performance indicators only
 */
router.get('/kpis', asyncHandler(async (req: Request, res: Response) => {
  const query = dateRangeSchema.safeParse(req.query)

  if (!query.success) {
    throw new APIError(
      APIErrorCode.VALIDATION_ERROR,
      'Invalid date range parameters',
      query.error.issues
    )
  }

  let dateRange: DateRange | undefined
  if (query.data.startDate || query.data.endDate) {
    dateRange = {
      startDate: query.data.startDate
        ? new Date(query.data.startDate)
        : new Date(0),
      endDate: query.data.endDate ? new Date(query.data.endDate) : new Date(),
    }
  }

  try {
    const analyticsData = await analyticsService.getAnalyticsData(dateRange)

    // Return only KPIs
    const kpis = {
      totalAgents: analyticsData.totalAgents,
      activeAgents: analyticsData.activeAgents,
      totalTasks: analyticsData.totalTasks,
      completedTasks: analyticsData.completedTasks,
      failedTasks: analyticsData.failedTasks,
      successRate: analyticsData.successRate,
      averageResponseTime: analyticsData.averageResponseTime,
    }

    res.json(createSuccessResponse(
      kpis,
      'KPI data retrieved successfully',
      req.headers['x-request-id'] as string
    ))
  } catch (error) {
    logger.error('Analytics service error', error as Error, {
      requestId: req.headers['x-request-id'],
      dateRange,
    })
    
    throw new APIError(
      APIErrorCode.INTERNAL_ERROR,
      'Failed to retrieve KPI data'
    )
  }
}))

/**
 * POST /api/cubcen/v1/analytics/export
 * Export analytics data in specified format
 */
router.post('/export', async (req: Request, res: Response) => {
  try {
    const body = exportSchema.safeParse(req.body)

    if (!body.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid export parameters',
          details: body.error.issues,
        },
      })
    }

    const { format, dataType = 'overview' } = body.data
    const query = dateRangeSchema.safeParse(req.query)

    let dateRange: DateRange | undefined
    if (query.success && (query.data.startDate || query.data.endDate)) {
      dateRange = {
        startDate: query.data.startDate
          ? new Date(query.data.startDate)
          : new Date(0),
        endDate: query.data.endDate ? new Date(query.data.endDate) : new Date(),
      }
    }

    const analyticsData = await analyticsService.getAnalyticsData(dateRange)

    // Select data based on type
    let exportData: unknown
    switch (dataType) {
      case 'agents':
        exportData = analyticsData.agentPerformance
        break
      case 'tasks':
        exportData = {
          tasksByStatus: analyticsData.tasksByStatus,
          tasksByPriority: analyticsData.tasksByPriority,
        }
        break
      case 'trends':
        exportData = analyticsData.dailyTaskTrends
        break
      case 'errors':
        exportData = analyticsData.errorPatterns
        break
      default:
        exportData = analyticsData
    }

    const exportedData = await analyticsService.exportData(exportData, format)

    // Set appropriate headers
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `cubcen-analytics-${dataType}-${timestamp}.${format}`

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader(
      'Content-Type',
      format === 'csv' ? 'text/csv' : 'application/json'
    )

    res.send(exportedData)
  } catch (error) {
    logger.error('Failed to export analytics data', error)
    res.status(500).json({
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to export analytics data',
        timestamp: new Date().toISOString(),
      },
    })
  }
})

/**
 * GET /api/cubcen/v1/analytics/trends
 * Get trend data for charts
 */
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const query = dateRangeSchema.safeParse(req.query)

    if (!query.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date range parameters',
          details: query.error.issues,
        },
      })
    }

    let dateRange: DateRange | undefined
    if (query.data.startDate || query.data.endDate) {
      dateRange = {
        startDate: query.data.startDate
          ? new Date(query.data.startDate)
          : new Date(0),
        endDate: query.data.endDate ? new Date(query.data.endDate) : new Date(),
      }
    }

    const analyticsData = await analyticsService.getAnalyticsData(dateRange)

    res.json({
      success: true,
      data: {
        dailyTrends: analyticsData.dailyTaskTrends,
        tasksByStatus: analyticsData.tasksByStatus,
        tasksByPriority: analyticsData.tasksByPriority,
        platformDistribution: analyticsData.platformDistribution,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Failed to get trend data', error)
    res.status(500).json({
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to retrieve trend data',
        timestamp: new Date().toISOString(),
      },
    })
  }
})

export default router
