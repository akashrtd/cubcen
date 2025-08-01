/**
 * Cubcen Error Handling Service
 * Manages error logs, patterns, and recovery operations
 */

import { prisma } from '@/lib/database'
import { logger } from '@/lib/logger'
import {
  ErrorLog,
  ErrorPattern,
  ErrorFilter,
  ErrorStats,
  RetryableTask,
} from '@/types/error'
import { z } from 'zod'

// Validation schemas
const errorFilterSchema = z.object({
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']).optional(),
  source: z.string().optional(),
  agentId: z.string().optional(),
  taskId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
})

export class ErrorService {
  /**
   * Get error logs with filtering and pagination
   */
  async getErrorLogs(
    options: {
      filter?: ErrorFilter
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ): Promise<{
    logs: ErrorLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const {
        filter = {},
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc',
      } = options

      // Validate filter
      const validatedFilter = errorFilterSchema.parse(filter)

      // Build where clause
      const where: Record<string, unknown> = {}

      if (validatedFilter.level) {
        where.level = validatedFilter.level
      }

      if (validatedFilter.source) {
        where.source = { contains: validatedFilter.source, mode: 'insensitive' }
      }

      if (validatedFilter.dateFrom || validatedFilter.dateTo) {
        where.timestamp = {}
        if (validatedFilter.dateFrom) {
          ;(where.timestamp as Record<string, unknown>).gte =
            validatedFilter.dateFrom
        }
        if (validatedFilter.dateTo) {
          ;(where.timestamp as Record<string, unknown>).lte =
            validatedFilter.dateTo
        }
      }

      if (validatedFilter.search) {
        where.OR = [
          {
            message: { contains: validatedFilter.search, mode: 'insensitive' },
          },
          {
            context: { contains: validatedFilter.search, mode: 'insensitive' },
          },
        ]
      }

      // Get total count
      const total = await prisma.systemLog.count({ where })

      // Get logs with pagination
      const logs = await prisma.systemLog.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      })

      // Transform to ErrorLog format
      const errorLogs: ErrorLog[] = logs.map(log => ({
        id: log.id,
        level: log.level as ErrorLog['level'],
        message: log.message,
        context: log.context ? JSON.parse(log.context) : undefined,
        source: log.source,
        timestamp: log.timestamp,
        // Extract additional fields from context if available
        stackTrace: log.context
          ? JSON.parse(log.context)?.stackTrace
          : undefined,
        agentId: log.context ? JSON.parse(log.context)?.agentId : undefined,
        taskId: log.context ? JSON.parse(log.context)?.taskId : undefined,
        platformId: log.context
          ? JSON.parse(log.context)?.platformId
          : undefined,
        userId: log.context ? JSON.parse(log.context)?.userId : undefined,
      }))

      return {
        logs: errorLogs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      logger.error('Failed to get error logs', error as Error, {
        filter: options.filter,
        page: options.page,
        limit: options.limit,
      })
      throw error
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStats(timeRange: {
    from: Date
    to: Date
  }): Promise<ErrorStats> {
    try {
      // Get total error count
      const total = await prisma.systemLog.count({
        where: {
          timestamp: {
            gte: timeRange.from,
            lte: timeRange.to,
          },
        },
      })

      // Get errors by level
      const byLevelRaw = await prisma.systemLog.groupBy({
        by: ['level'],
        _count: { level: true },
        where: {
          timestamp: {
            gte: timeRange.from,
            lte: timeRange.to,
          },
        },
      })

      const byLevel = byLevelRaw.reduce(
        (acc, item) => {
          acc[item.level] = item._count.level
          return acc
        },
        {} as Record<string, number>
      )

      // Get errors by source
      const bySourceRaw = await prisma.systemLog.groupBy({
        by: ['source'],
        _count: { source: true },
        where: {
          timestamp: {
            gte: timeRange.from,
            lte: timeRange.to,
          },
        },
        orderBy: {
          _count: {
            source: 'desc',
          },
        },
        take: 10,
      })

      const bySource = bySourceRaw.reduce(
        (acc, item) => {
          acc[item.source] = item._count.source
          return acc
        },
        {} as Record<string, number>
      )

      // Get top errors
      const topErrorsRaw = await prisma.systemLog.groupBy({
        by: ['message'],
        _count: { message: true },
        _max: { timestamp: true },
        where: {
          level: { in: ['ERROR', 'FATAL'] },
          timestamp: {
            gte: timeRange.from,
            lte: timeRange.to,
          },
        },
        orderBy: {
          _count: {
            message: 'desc',
          },
        },
        take: 5,
      })

      const topErrors = topErrorsRaw.map(item => ({
        message: item.message,
        count: item._count.message,
        lastOccurrence: item._max.timestamp || new Date(),
      }))

      // Calculate trend (simplified - compare with previous period)
      const previousPeriod = {
        from: new Date(
          timeRange.from.getTime() -
            (timeRange.to.getTime() - timeRange.from.getTime())
        ),
        to: timeRange.from,
      }

      const previousTotal = await prisma.systemLog.count({
        where: {
          level: { in: ['ERROR', 'FATAL'] },
          timestamp: {
            gte: previousPeriod.from,
            lte: previousPeriod.to,
          },
        },
      })

      const currentErrors = byLevel.ERROR || 0 + byLevel.FATAL || 0
      let recentTrend: 'increasing' | 'stable' | 'decreasing' = 'stable'

      if (currentErrors > previousTotal * 1.1) {
        recentTrend = 'increasing'
      } else if (currentErrors < previousTotal * 0.9) {
        recentTrend = 'decreasing'
      }

      return {
        total,
        byLevel,
        bySource,
        recentTrend,
        topErrors,
      }
    } catch (error) {
      logger.error('Failed to get error statistics', error as Error, {
        timeRange,
      })
      throw error
    }
  }

  /**
   * Detect error patterns
   */
  async detectErrorPatterns(timeRange: {
    from: Date
    to: Date
  }): Promise<ErrorPattern[]> {
    try {
      // Get frequent error messages
      const frequentErrors = await prisma.systemLog.groupBy({
        by: ['message', 'source'],
        _count: { message: true },
        _max: { timestamp: true },
        where: {
          level: { in: ['ERROR', 'FATAL'] },
          timestamp: {
            gte: timeRange.from,
            lte: timeRange.to,
          },
        },
        having: {
          message: {
            _count: {
              gt: 2, // At least 3 occurrences
            },
          },
        },
        orderBy: {
          _count: {
            message: 'desc',
          },
        },
        take: 20,
      })

      // Transform to error patterns
      const patterns: ErrorPattern[] = []

      for (const error of frequentErrors) {
        // Get affected agents for this error pattern
        const affectedAgentsRaw = await prisma.systemLog.findMany({
          where: {
            message: error.message,
            source: error.source,
            timestamp: {
              gte: timeRange.from,
              lte: timeRange.to,
            },
            context: {
              contains: 'agentId',
            },
          },
          select: {
            context: true,
          },
        })

        const affectedAgents = Array.from(
          new Set(
            affectedAgentsRaw
              .map(log => {
                try {
                  const context = JSON.parse(log.context || '{}')
                  return context.agentId
                } catch {
                  return null
                }
              })
              .filter(Boolean)
          )
        )

        // Determine severity based on frequency and affected agents
        let severity: ErrorPattern['severity'] = 'LOW'
        if (error._count.message > 10 || affectedAgents.length > 5) {
          severity = 'CRITICAL'
        } else if (error._count.message > 5 || affectedAgents.length > 2) {
          severity = 'HIGH'
        } else if (error._count.message > 3) {
          severity = 'MEDIUM'
        }

        // Generate suggested action based on error pattern
        const suggestedAction = this.generateSuggestedAction(
          error.message,
          error.source
        )

        patterns.push({
          id: `${error.source}-${Buffer.from(error.message).toString('base64').slice(0, 8)}`,
          pattern: error.message,
          description: `Recurring error in ${error.source}`,
          frequency: error._count.message,
          lastOccurrence: error._max.timestamp || new Date(),
          affectedAgents,
          severity,
          suggestedAction,
        })
      }

      return patterns
    } catch (error) {
      logger.error('Failed to detect error patterns', error as Error, {
        timeRange,
      })
      throw error
    }
  }

  /**
   * Get retryable failed tasks
   */
  async getRetryableTasks(): Promise<RetryableTask[]> {
    try {
      const failedTasks = await prisma.task.findMany({
        where: {
          status: { in: ['FAILED', 'CANCELLED'] },
          retryCount: {
            lt: prisma.task.fields.maxRetries,
          },
        },
        include: {
          agent: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 50,
      })

      return failedTasks.map(task => ({
        id: task.id,
        name: task.name,
        agentId: task.agentId,
        agentName: task.agent.name,
        status: task.status as 'FAILED' | 'CANCELLED',
        error: task.error || 'Unknown error',
        retryCount: task.retryCount,
        maxRetries: task.maxRetries,
        lastAttempt: task.updatedAt,
        canRetry: task.retryCount < task.maxRetries,
        parameters: task.parameters ? JSON.parse(task.parameters) : undefined,
      }))
    } catch (error) {
      logger.error('Failed to get retryable tasks', error as Error)
      throw error
    }
  }

  /**
   * Retry a failed task
   */
  async retryTask(taskId: string): Promise<void> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      })

      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`)
      }

      if (task.status !== 'FAILED' && task.status !== 'CANCELLED') {
        throw new Error(`Task ${taskId} is not in a retryable state`)
      }

      if (task.retryCount >= task.maxRetries) {
        throw new Error(`Task ${taskId} has exceeded maximum retry attempts`)
      }

      // Reset task status and increment retry count
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'PENDING',
          retryCount: task.retryCount + 1,
          error: null,
          startedAt: null,
          completedAt: null,
          updatedAt: new Date(),
        },
      })

      logger.info('Task retry initiated', {
        taskId,
        retryCount: task.retryCount + 1,
        maxRetries: task.maxRetries,
      })
    } catch (error) {
      logger.error('Failed to retry task', error as Error, { taskId })
      throw error
    }
  }

  /**
   * Bulk retry multiple tasks
   */
  async bulkRetryTasks(taskIds: string[]): Promise<{
    successful: string[]
    failed: Array<{ taskId: string; error: string }>
  }> {
    const successful: string[] = []
    const failed: Array<{ taskId: string; error: string }> = []

    for (const taskId of taskIds) {
      try {
        await this.retryTask(taskId)
        successful.push(taskId)
      } catch (error) {
        failed.push({
          taskId,
          error: (error as Error).message,
        })
      }
    }

    logger.info('Bulk task retry completed', {
      total: taskIds.length,
      successful: successful.length,
      failed: failed.length,
    })

    return { successful, failed }
  }

  /**
   * Generate suggested action based on error pattern
   */
  private generateSuggestedAction(message: string, source: string): string {
    const lowerMessage = message.toLowerCase()

    if (
      lowerMessage.includes('connection') ||
      lowerMessage.includes('network')
    ) {
      return 'Check network connectivity and platform API status'
    }

    if (
      lowerMessage.includes('authentication') ||
      lowerMessage.includes('unauthorized')
    ) {
      return 'Verify API credentials and refresh authentication tokens'
    }

    if (lowerMessage.includes('timeout')) {
      return 'Increase timeout settings or check platform performance'
    }

    if (lowerMessage.includes('rate limit') || lowerMessage.includes('quota')) {
      return 'Implement rate limiting or upgrade platform plan'
    }

    if (
      lowerMessage.includes('validation') ||
      lowerMessage.includes('invalid')
    ) {
      return 'Review input parameters and data validation rules'
    }

    if (source.includes('adapter')) {
      return 'Check platform adapter configuration and connectivity'
    }

    return 'Review error details and check platform documentation'
  }
}
