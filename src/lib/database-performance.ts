/**
 * Cubcen Database Performance Optimization
 * Provides optimized database queries, connection pooling, and performance monitoring
 */

import { PrismaClient } from '../generated/prisma'
import { prisma } from './database'
import { logger } from './logger'

export interface QueryPerformanceMetrics {
  query: string
  duration: number
  timestamp: Date
  params?: unknown[]
  rowCount?: number
}

export interface DatabasePerformanceStats {
  totalQueries: number
  averageQueryTime: number
  slowQueries: QueryPerformanceMetrics[]
  connectionPoolStats: {
    active: number
    idle: number
    total: number
  }
  cacheHitRate: number
  indexUsage: Array<{
    table: string
    index: string
    usage: number
  }>
}

class DatabasePerformanceMonitor {
  private queryMetrics: QueryPerformanceMetrics[] = []
  private readonly SLOW_QUERY_THRESHOLD = 1000 // 1 second
  private readonly MAX_METRICS_HISTORY = 1000

  constructor() {
    this.setupQueryLogging()
  }

  private setupQueryLogging() {
    // Enable query logging for performance monitoring
    prisma.$use(async (params, next) => {
      const start = Date.now()
      const result = await next(params)
      const duration = Date.now() - start

      const metric: QueryPerformanceMetrics = {
        query: `${params.model}.${params.action}`,
        duration,
        timestamp: new Date(),
        params: params.args,
      }

      this.recordQueryMetric(metric)

      // Log slow queries
      if (duration > this.SLOW_QUERY_THRESHOLD) {
        logger.warn('Slow query detected', {
          query: metric.query,
          duration,
          params: params.args,
        })
      }

      return result
    })
  }

  private recordQueryMetric(metric: QueryPerformanceMetrics) {
    this.queryMetrics.push(metric)

    // Keep only recent metrics to prevent memory leaks
    if (this.queryMetrics.length > this.MAX_METRICS_HISTORY) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS_HISTORY)
    }
  }

  async getPerformanceStats(): Promise<DatabasePerformanceStats> {
    const now = Date.now()
    const recentMetrics = this.queryMetrics.filter(
      m => now - m.timestamp.getTime() < 3600000 // Last hour
    )

    const totalQueries = recentMetrics.length
    const averageQueryTime =
      totalQueries > 0
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries
        : 0

    const slowQueries = recentMetrics
      .filter(m => m.duration > this.SLOW_QUERY_THRESHOLD)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    return {
      totalQueries,
      averageQueryTime: Math.round(averageQueryTime * 100) / 100,
      slowQueries,
      connectionPoolStats: {
        active: 0, // SQLite doesn't have connection pooling
        idle: 0,
        total: 1,
      },
      cacheHitRate: 0, // Will be implemented with Redis cache
      indexUsage: await this.getIndexUsageStats(),
    }
  }

  private async getIndexUsageStats() {
    try {
      // SQLite-specific query to get index usage statistics
      const indexStats = await prisma.$queryRaw<
        Array<{
          name: string
          tbl_name: string
          sql: string
        }>
      >`
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
      `

      return indexStats.map(stat => ({
        table: stat.tbl_name,
        index: stat.name,
        usage: 0, // SQLite doesn't provide usage statistics
      }))
    } catch (error) {
      logger.error('Failed to get index usage stats', error)
      return []
    }
  }

  getSlowQueries(limit = 10): QueryPerformanceMetrics[] {
    return this.queryMetrics
      .filter(m => m.duration > this.SLOW_QUERY_THRESHOLD)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  clearMetrics() {
    this.queryMetrics = []
  }
}

// Optimized query builders for common operations
export class OptimizedQueries {
  /**
   * Get agents with their platform information efficiently
   */
  static async getAgentsWithPlatforms(limit = 50, offset = 0) {
    return prisma.agent.findMany({
      take: limit,
      skip: offset,
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }

  /**
   * Get task statistics efficiently using aggregation
   */
  static async getTaskStatistics(
    agentId?: string,
    dateRange?: { start: Date; end: Date }
  ) {
    const where = {
      ...(agentId && { agentId }),
      ...(dateRange && {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    }

    const [statusStats, priorityStats, totalCount] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),
      prisma.task.count({ where }),
    ])

    return {
      statusStats,
      priorityStats,
      totalCount,
    }
  }

  /**
   * Get agent health metrics efficiently
   */
  static async getAgentHealthMetrics(agentIds?: string[], limit = 100) {
    const where = agentIds ? { agentId: { in: agentIds } } : {}

    return prisma.agentHealth.findMany({
      where,
      take: limit,
      orderBy: {
        lastCheckAt: 'desc',
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })
  }

  /**
   * Get workflow execution statistics
   */
  static async getWorkflowStats(workflowId?: string) {
    const where = workflowId ? { workflowId } : {}

    const [taskStats, avgExecutionTime] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      prisma.task.aggregate({
        where: {
          ...where,
          status: 'COMPLETED',
          startedAt: { not: null },
          completedAt: { not: null },
        },
        _avg: {
          // Calculate average execution time in milliseconds
          // This would need a computed field in a real implementation
        },
      }),
    ])

    return {
      taskStats,
      avgExecutionTime: 0, // Placeholder - would need proper calculation
    }
  }

  /**
   * Search agents with full-text search optimization
   */
  static async searchAgents(searchTerm: string, limit = 20) {
    // SQLite FTS would be ideal here, but for MVP we'll use LIKE
    return prisma.agent.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        platform: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }

  /**
   * Get recent system logs efficiently
   */
  static async getRecentLogs(level?: string, source?: string, limit = 100) {
    const where = {
      ...(level && { level: level as any }),
      ...(source && { source }),
    }

    return prisma.systemLog.findMany({
      where,
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
    })
  }
}

// Database optimization utilities
export class DatabaseOptimizer {
  /**
   * Analyze database performance and suggest optimizations
   */
  static async analyzePerformance() {
    const analysis = {
      tableStats: await this.getTableStats(),
      indexRecommendations: await this.getIndexRecommendations(),
      queryOptimizations: await this.getQueryOptimizations(),
    }

    logger.info('Database performance analysis completed', analysis)
    return analysis
  }

  private static async getTableStats() {
    try {
      // Get table sizes and row counts
      const tables = await prisma.$queryRaw<
        Array<{
          name: string
          count: number
        }>
      >`
        SELECT 
          name,
          (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=m.name) as count
        FROM sqlite_master m 
        WHERE type='table' AND name LIKE 'cubcen_%'
      `

      return tables
    } catch (error) {
      logger.error('Failed to get table stats', error)
      return []
    }
  }

  private static async getIndexRecommendations() {
    // Analyze common query patterns and suggest indexes
    const recommendations = [
      {
        table: 'cubcen_tasks',
        columns: ['agentId', 'status', 'createdAt'],
        reason: 'Frequently filtered by agent and status with date ordering',
      },
      {
        table: 'cubcen_agent_health',
        columns: ['agentId', 'lastCheckAt'],
        reason: 'Health monitoring queries by agent and time',
      },
      {
        table: 'cubcen_system_logs',
        columns: ['level', 'source', 'timestamp'],
        reason: 'Log filtering and time-based queries',
      },
      {
        table: 'cubcen_notifications',
        columns: ['userId', 'status', 'createdAt'],
        reason: 'User notification queries with status filtering',
      },
    ]

    return recommendations
  }

  private static async getQueryOptimizations() {
    return [
      {
        query: 'Agent list with task counts',
        optimization: 'Use _count relation instead of separate queries',
        impact: 'Reduces N+1 query problems',
      },
      {
        query: 'Task statistics by date range',
        optimization: 'Use groupBy with date functions',
        impact: 'Reduces data transfer and processing time',
      },
      {
        query: 'Health monitoring dashboard',
        optimization: 'Batch health checks and use aggregation',
        impact: 'Improves dashboard load time',
      },
    ]
  }

  /**
   * Create recommended indexes
   */
  static async createOptimalIndexes() {
    const indexQueries = [
      // Task performance indexes
      `CREATE INDEX IF NOT EXISTS idx_tasks_agent_status_date 
       ON cubcen_tasks(agentId, status, createdAt)`,

      // Health monitoring indexes
      `CREATE INDEX IF NOT EXISTS idx_agent_health_agent_date 
       ON cubcen_agent_health(agentId, lastCheckAt)`,

      // System logs indexes
      `CREATE INDEX IF NOT EXISTS idx_system_logs_level_source_time 
       ON cubcen_system_logs(level, source, timestamp)`,

      // Notification indexes
      `CREATE INDEX IF NOT EXISTS idx_notifications_user_status_date 
       ON cubcen_notifications(userId, status, createdAt)`,

      // Workflow performance indexes
      `CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_order 
       ON cubcen_workflow_steps(workflowId, stepOrder)`,
    ]

    for (const query of indexQueries) {
      try {
        await prisma.$executeRawUnsafe(query)
        logger.info('Created database index', { query })
      } catch (error) {
        logger.error('Failed to create index', { query, error })
      }
    }
  }
}

// Export singleton instance
export const dbPerformanceMonitor = new DatabasePerformanceMonitor()
