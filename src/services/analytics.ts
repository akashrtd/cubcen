import { prisma } from '@/lib/database'
import { structuredLogger as logger } from '@/lib/logger'
import { AnalyticsCache, cached } from '@/lib/cache'
import { OptimizedQueries } from '@/lib/database-performance'
import { PaginationHelper, PaginatedResult } from '@/lib/pagination'

export interface AnalyticsData {
  totalAgents: number
  activeAgents: number
  totalTasks: number
  completedTasks: number
  failedTasks: number
  successRate: number
  averageResponseTime: number
  tasksByStatus: Array<{ status: string; count: number }>
  tasksByPriority: Array<{ priority: string; count: number }>
  agentPerformance: Array<{
    agentId: string
    agentName: string
    totalTasks: number
    successRate: number
    averageResponseTime: number
  }>
  platformDistribution: Array<{ platform: string; count: number }>
  dailyTaskTrends: Array<{ date: string; completed: number; failed: number }>
  errorPatterns: Array<{ error: string; count: number }>
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface ExportFormat {
  format: 'csv' | 'json'
  data: unknown
}

export class AnalyticsService {
  async getAnalyticsData(dateRange?: DateRange): Promise<AnalyticsData> {
    const cacheKey = AnalyticsCache.getCacheKey('analytics-data', { dateRange })

    return AnalyticsCache.getOrSet(
      cacheKey,
      async () => {
        try {
          const whereClause = dateRange
            ? {
                createdAt: {
                  gte: dateRange.startDate,
                  lte: dateRange.endDate,
                },
              }
            : {}

          // Use optimized queries for better performance
          const taskStats = await OptimizedQueries.getTaskStatistics(
            undefined,
            dateRange ? { start: dateRange.startDate, end: dateRange.endDate } : undefined
          )

          // Get basic counts with optimized queries
          const [totalAgents, activeAgents] = await Promise.all([
            prisma.agent.count(),
            prisma.agent.count({ where: { status: 'ACTIVE' } }),
          ])

          const totalTasks = taskStats.totalCount
          const completedTasks =
            taskStats.statusStats.find(s => s.status === 'COMPLETED')?._count
              .status || 0
          const failedTasks = (taskStats.statusStats.find(
            s => s.status === 'FAILED'
          )?._count.status || 0) as number

          const successRate =
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

          // Use pre-computed statistics from optimized queries
          const tasksByStatus = taskStats.statusStats.map(item => ({
            status: item.status,
            count: item._count.status,
          }))

          const tasksByPriority = taskStats.priorityStats.map(item => ({
            priority: item.priority,
            count: item._count.priority,
          }))

          // Get agent performance with caching
          const agentPerformance = await this.getAgentPerformance(dateRange)

          // Get platform distribution with caching
          const platformDistribution = await this.getPlatformDistribution()

          // Get daily task trends with caching
          const dailyTaskTrends = await this.getDailyTaskTrends(dateRange)

          // Get error patterns with caching
          const errorPatterns = await this.getErrorPatterns(dateRange)

          // Calculate average response time from health data with optimized query
          const healthMetrics = await OptimizedQueries.getAgentHealthMetrics()
          const averageResponseTime =
            healthMetrics.length > 0
              ? healthMetrics.reduce(
                  (sum, h) => sum + (h.responseTime || 0),
                  0
                ) / healthMetrics.length
              : 0

          return {
            totalAgents,
            activeAgents,
            totalTasks,
            completedTasks,
            failedTasks,
            successRate: Math.round(successRate * 100) / 100,
            averageResponseTime: Math.round(averageResponseTime),
            tasksByStatus,
            tasksByPriority,
            agentPerformance,
            platformDistribution,
            dailyTaskTrends,
            errorPatterns,
          }
        } catch (error) {
          logger.error('Failed to get analytics data', error instanceof Error ? error : undefined)
          throw new Error('Failed to retrieve analytics data')
        }
      },
      10 * 60 * 1000
    ) // 10 minute cache
  }

  private async getAgentPerformance(
    dateRange?: DateRange
  ): Promise<AnalyticsData['agentPerformance']> {
    const whereClause = dateRange
      ? {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }
      : {}

    const agentTasks = await prisma.task.groupBy({
      by: ['agentId'],
      where: whereClause,
      _count: { id: true },
    })

    const agentSuccessRates = await prisma.task.groupBy({
      by: ['agentId'],
      where: { ...whereClause, status: 'COMPLETED' },
      _count: { id: true },
    })

    const agents = await prisma.agent.findMany({
      where: {
        id: { in: agentTasks.map(task => task.agentId) },
      },
      select: { id: true, name: true },
    })

    const agentHealthData = await prisma.agentHealth.groupBy({
      by: ['agentId'],
      where: dateRange
        ? {
            lastCheckAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          }
        : {},
      _avg: { responseTime: true },
    })

    return agentTasks.map(agentTask => {
      const agent = agents.find(a => a.id === agentTask.agentId)
      const successCount =
        agentSuccessRates.find(a => a.agentId === agentTask.agentId)?._count
          .id || 0
      const successRate = (successCount / agentTask._count.id) * 100
      const healthData = agentHealthData.find(
        h => h.agentId === agentTask.agentId
      )

      return {
        agentId: agentTask.agentId,
        agentName: agent?.name || 'Unknown Agent',
        totalTasks: agentTask._count.id,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: Math.round(healthData?._avg.responseTime || 0),
      }
    })
  }

  private async getPlatformDistribution(): Promise<
    AnalyticsData['platformDistribution']
  > {
    const platformData = await prisma.agent.groupBy({
      by: ['platformId'],
      _count: { id: true },
    })

    const platforms = await prisma.platform.findMany({
      where: {
        id: { in: platformData.map(p => p.platformId) },
      },
      select: { id: true, name: true, type: true },
    })

    return platformData.map(item => {
      const platform = platforms.find(p => p.id === item.platformId)
      return {
        platform: platform
          ? `${platform.name} (${platform.type})`
          : 'Unknown Platform',
        count: item._count.id,
      }
    })
  }

  private async getDailyTaskTrends(
    dateRange?: DateRange
  ): Promise<AnalyticsData['dailyTaskTrends']> {
    const endDate = dateRange?.endDate || new Date()
    const startDate =
      dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    // Get completed tasks by day
    const completedTasks = await prisma.task.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { completedAt: true },
    })

    // Get failed tasks by day
    const failedTasks = await prisma.task.findMany({
      where: {
        status: 'FAILED',
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { completedAt: true },
    })

    // Group by date
    const dailyData = new Map<string, { completed: number; failed: number }>()

    // Initialize all dates in range
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dailyData.set(dateStr, { completed: 0, failed: 0 })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Count completed tasks
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const dateStr = task.completedAt.toISOString().split('T')[0]
        const existing = dailyData.get(dateStr)
        if (existing) {
          existing.completed++
        }
      }
    })

    // Count failed tasks
    failedTasks.forEach(task => {
      if (task.completedAt) {
        const dateStr = task.completedAt.toISOString().split('T')[0]
        const existing = dailyData.get(dateStr)
        if (existing) {
          existing.failed++
        }
      }
    })

    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      completed: data.completed,
      failed: data.failed,
    }))
  }

  private async getErrorPatterns(
    dateRange?: DateRange
  ): Promise<AnalyticsData['errorPatterns']> {
    const whereClause = dateRange
      ? {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }
      : {}

    const failedTasks = await prisma.task.findMany({
      where: {
        ...whereClause,
        status: 'FAILED',
        error: { not: null },
      },
      select: { error: true },
    })

    const errorCounts = new Map<string, number>()

    failedTasks.forEach(task => {
      if (task.error) {
        try {
          const errorData = JSON.parse(task.error)
          const errorMessage =
            errorData.message || errorData.error || 'Unknown error'
          const count = errorCounts.get(errorMessage) || 0
          errorCounts.set(errorMessage, count + 1)
        } catch {
          const count = errorCounts.get('Parse error') || 0
          errorCounts.set('Parse error', count + 1)
        }
      }
    })

    return Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 errors
  }

  async exportData(data: unknown, format: 'csv' | 'json'): Promise<string> {
    try {
      if (format === 'json') {
        return JSON.stringify(data, null, 2)
      } else if (format === 'csv') {
        return this.convertToCSV(data)
      }
      throw new Error('Unsupported export format')
    } catch (error) {
      logger.error('Failed to export analytics data', error instanceof Error ? error : undefined)
      throw new Error('Failed to export data')
    }
  }

  private convertToCSV(data: unknown): string {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data for CSV conversion')
    }

    // Handle different data structures
    if (Array.isArray(data)) {
      if (data.length === 0) return ''

      const headers = Object.keys(data[0])
      const csvRows = [headers.join(',')]

      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header]
          return typeof value === 'string'
            ? `"${value.replace(/"/g, '""')}"`
            : value
        })
        csvRows.push(values.join(','))
      })

      return csvRows.join('\n')
    } else {
      // Convert object to key-value CSV
      const csvRows = ['Key,Value']
      Object.entries(data).forEach(([key, value]) => {
        const csvValue =
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        csvRows.push(`"${key}",${csvValue}`)
      })
      return csvRows.join('\n')
    }
  }

  /**
   * Get paginated agent performance data
   */
  async getAgentPerformancePaginated(
    page = 1,
    limit = 20,
    dateRange?: DateRange,
    sortBy = 'totalTasks',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedResult<AnalyticsData['agentPerformance'][0]>> {
    const params = PaginationHelper.validateParams({
      page,
      limit,
      sortBy,
      sortOrder,
    })
    const offset = PaginationHelper.calculateOffset(params.page, params.limit)

    const whereClause = dateRange
      ? {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }
      : {}

    // Get total count for pagination
    const totalAgents = await prisma.agent.count()

    // Get paginated agent data with performance metrics
    const agents = await prisma.agent.findMany({
      skip: offset,
      take: params.limit,
      include: {
        tasks: {
          where: whereClause,
          select: {
            status: true,
            createdAt: true,
            completedAt: true,
            startedAt: true,
          },
        },
        _count: {
          select: {
            tasks: {
              where: whereClause,
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Calculate performance metrics for each agent
    const agentPerformance = agents.map(agent => {
      const totalTasks = agent._count.tasks
      const completedTasks = agent.tasks.filter(
        t => t.status === 'COMPLETED'
      ).length
      const successRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

      // Calculate average response time
      const completedTasksWithTimes = agent.tasks.filter(
        t => t.status === 'COMPLETED' && t.startedAt && t.completedAt
      )
      const averageResponseTime = (
        completedTasksWithTimes.length > 0
          ? completedTasksWithTimes.reduce((sum, task) => {
              const responseTime =
                task.completedAt!.getTime() - task.startedAt!.getTime()
              return sum + responseTime
            }, 0) / completedTasksWithTimes.length
          : 0
      ) as number

      return {
        agentId: agent.id,
        agentName: agent.name,
        totalTasks,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime),
      }
    })

    // Sort the results
    agentPerformance.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] as number
      const bValue = b[sortBy as keyof typeof b] as number
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

    return PaginationHelper.createResult(agentPerformance, totalAgents, params)
  }

  /**
   * Get paginated task history
   */
  async getTaskHistoryPaginated(
    page = 1,
    limit = 50,
    agentId?: string,
    status?: string,
    dateRange?: DateRange
  ): Promise<PaginatedResult<any>> {
    const params = PaginationHelper.validateParams({ page, limit })
    const offset = PaginationHelper.calculateOffset(params.page, params.limit)

    const whereClause: any = {}

    if (agentId) whereClause.agentId = agentId
    if (status) whereClause.status = status
    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      }
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        skip: offset,
        take: params.limit,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              platform: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.task.count({ where: whereClause }),
    ])

    return PaginationHelper.createResult(tasks, total, params)
  }

  /**
   * Invalidate analytics cache
   */
  invalidateCache(pattern?: string): void {
    if (pattern) {
      AnalyticsCache.invalidatePattern(pattern)
    } else {
      AnalyticsCache.invalidatePattern('analytics:')
    }
    logger.info('Analytics cache invalidated', { pattern })
  }
}

export const analyticsService = new AnalyticsService()
