/**
 * Cubcen Performance Monitoring and Alerting System
 * Monitors system performance metrics and triggers alerts for performance issues
 */

import { logger } from './logger'
import { cache } from './cache'
import { prisma } from './database'
import { dbPerformanceMonitor } from './database-performance'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
}

export interface PerformanceAlert {
  id: string
  metric: string
  threshold: number
  currentValue: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
}

export interface SystemPerformanceStats {
  cpu: {
    usage: number
    loadAverage: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
    heapUsed: number
    heapTotal: number
  }
  database: {
    connectionCount: number
    queryCount: number
    averageQueryTime: number
    slowQueries: number
  }
  cache: {
    hitRate: number
    memoryUsage: number
    entryCount: number
  }
  api: {
    requestCount: number
    averageResponseTime: number
    errorRate: number
  }
  agents: {
    totalCount: number
    activeCount: number
    errorCount: number
    averageResponseTime: number
  }
}

export interface PerformanceThreshold {
  metric: string
  warning: number
  critical: number
  unit: string
  comparison: 'greater' | 'less'
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private alerts: PerformanceAlert[] = []
  private monitoringInterval: NodeJS.Timeout | null = null
  private readonly MAX_METRICS_HISTORY = 10000
  private readonly MONITORING_INTERVAL = 30000 // 30 seconds

  // Default performance thresholds
  private readonly thresholds: PerformanceThreshold[] = [
    {
      metric: 'cpu_usage',
      warning: 70,
      critical: 90,
      unit: '%',
      comparison: 'greater',
    },
    {
      metric: 'memory_usage',
      warning: 80,
      critical: 95,
      unit: '%',
      comparison: 'greater',
    },
    {
      metric: 'database_query_time',
      warning: 1000,
      critical: 5000,
      unit: 'ms',
      comparison: 'greater',
    },
    {
      metric: 'api_response_time',
      warning: 2000,
      critical: 5000,
      unit: 'ms',
      comparison: 'greater',
    },
    {
      metric: 'api_error_rate',
      warning: 5,
      critical: 10,
      unit: '%',
      comparison: 'greater',
    },
    {
      metric: 'cache_hit_rate',
      warning: 70,
      critical: 50,
      unit: '%',
      comparison: 'less',
    },
    {
      metric: 'agent_error_rate',
      warning: 10,
      critical: 25,
      unit: '%',
      comparison: 'greater',
    },
  ]

  private apiMetrics = {
    requestCount: 0,
    totalResponseTime: 0,
    errorCount: 0,
  }

  constructor() {
    this.startMonitoring()
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      return
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics()
        await this.checkThresholds()
      } catch (error) {
        logger.error('Performance monitoring error', error)
      }
    }, this.MONITORING_INTERVAL)

    logger.info('Performance monitoring started')
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      logger.info('Performance monitoring stopped')
    }
  }

  /**
   * Collect system performance metrics
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = new Date()

    // CPU metrics
    const cpuUsage = process.cpuUsage()
    const cpuPercent = this.calculateCPUPercentage(cpuUsage)
    this.recordMetric('cpu_usage', cpuPercent, '%', timestamp)

    // Memory metrics
    const memoryUsage = process.memoryUsage()
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
    this.recordMetric('memory_usage', memoryPercent, '%', timestamp)
    this.recordMetric(
      'heap_used',
      memoryUsage.heapUsed / 1024 / 1024,
      'MB',
      timestamp
    )

    // Database metrics
    const dbStats = await dbPerformanceMonitor.getPerformanceStats()
    this.recordMetric(
      'database_query_count',
      dbStats.totalQueries,
      'count',
      timestamp
    )
    this.recordMetric(
      'database_query_time',
      dbStats.averageQueryTime,
      'ms',
      timestamp
    )
    this.recordMetric(
      'database_slow_queries',
      dbStats.slowQueries.length,
      'count',
      timestamp
    )

    // Cache metrics
    const cacheStats = cache.getStats()
    this.recordMetric('cache_hit_rate', cacheStats.hitRate, '%', timestamp)
    this.recordMetric(
      'cache_memory_usage',
      cacheStats.memoryUsage / 1024 / 1024,
      'MB',
      timestamp
    )
    this.recordMetric(
      'cache_entry_count',
      cacheStats.totalEntries,
      'count',
      timestamp
    )

    // API metrics
    const apiErrorRate =
      this.apiMetrics.requestCount > 0
        ? (this.apiMetrics.errorCount / this.apiMetrics.requestCount) * 100
        : 0
    const avgResponseTime =
      this.apiMetrics.requestCount > 0
        ? this.apiMetrics.totalResponseTime / this.apiMetrics.requestCount
        : 0

    this.recordMetric(
      'api_request_count',
      this.apiMetrics.requestCount,
      'count',
      timestamp
    )
    this.recordMetric('api_response_time', avgResponseTime, 'ms', timestamp)
    this.recordMetric('api_error_rate', apiErrorRate, '%', timestamp)

    // Agent metrics
    await this.collectAgentMetrics(timestamp)

    // Clean up old metrics
    this.cleanupMetrics()
  }

  /**
   * Collect agent-specific performance metrics
   */
  private async collectAgentMetrics(timestamp: Date): Promise<void> {
    try {
      const [totalAgents, activeAgents, recentErrors, healthMetrics] =
        await Promise.all([
          prisma.agent.count(),
          prisma.agent.count({ where: { status: 'ACTIVE' } }),
          prisma.task.count({
            where: {
              status: 'FAILED',
              createdAt: {
                gte: new Date(Date.now() - 3600000), // Last hour
              },
            },
          }),
          prisma.agentHealth.aggregate({
            _avg: { responseTime: true },
            where: {
              lastCheckAt: {
                gte: new Date(Date.now() - 3600000), // Last hour
              },
            },
          }),
        ])

      this.recordMetric('agent_total_count', totalAgents, 'count', timestamp)
      this.recordMetric('agent_active_count', activeAgents, 'count', timestamp)
      this.recordMetric('agent_error_count', recentErrors, 'count', timestamp)

      const avgResponseTime = healthMetrics._avg.responseTime || 0
      this.recordMetric('agent_response_time', avgResponseTime, 'ms', timestamp)

      // Calculate agent error rate
      const totalTasks = await prisma.task.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 3600000),
          },
        },
      })

      const agentErrorRate =
        totalTasks > 0 ? (recentErrors / totalTasks) * 100 : 0
      this.recordMetric('agent_error_rate', agentErrorRate, '%', timestamp)
    } catch (error) {
      logger.error('Failed to collect agent metrics', error)
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(
    name: string,
    value: number,
    unit: string,
    timestamp: Date,
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp,
      tags,
    }

    this.metrics.push(metric)

    // Store in database for persistence
    this.storeMetricInDatabase(metric).catch(error => {
      logger.error('Failed to store metric in database', error)
    })
  }

  /**
   * Store metric in database
   */
  private async storeMetricInDatabase(
    metric: PerformanceMetric
  ): Promise<void> {
    try {
      await prisma.metric.create({
        data: {
          type: 'GAUGE',
          name: metric.name,
          value: metric.value,
          tags: metric.tags ? JSON.stringify(metric.tags) : null,
          timestamp: metric.timestamp,
        },
      })
    } catch (error) {
      // Don't throw error to avoid disrupting monitoring
      logger.warn('Failed to store metric in database', {
        metric: metric.name,
        error,
      })
    }
  }

  /**
   * Check performance thresholds and generate alerts
   */
  private async checkThresholds(): Promise<void> {
    const recentMetrics = this.getRecentMetrics(5 * 60 * 1000) // Last 5 minutes

    for (const threshold of this.thresholds) {
      const metricValues = recentMetrics
        .filter(m => m.name === threshold.metric)
        .map(m => m.value)

      if (metricValues.length === 0) continue

      // Use average of recent values
      const avgValue =
        metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length

      // Check if threshold is exceeded
      const isWarning = this.isThresholdExceeded(
        avgValue,
        threshold.warning,
        threshold.comparison
      )
      const isCritical = this.isThresholdExceeded(
        avgValue,
        threshold.critical,
        threshold.comparison
      )

      if (isCritical || isWarning) {
        const severity = isCritical ? 'CRITICAL' : 'HIGH'
        const thresholdValue = isCritical
          ? threshold.critical
          : threshold.warning

        await this.generateAlert(
          threshold.metric,
          thresholdValue,
          avgValue,
          severity
        )
      }
    }
  }

  /**
   * Check if a threshold is exceeded
   */
  private isThresholdExceeded(
    value: number,
    threshold: number,
    comparison: 'greater' | 'less'
  ): boolean {
    return comparison === 'greater' ? value > threshold : value < threshold
  }

  /**
   * Generate performance alert
   */
  private async generateAlert(
    metric: string,
    threshold: number,
    currentValue: number,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    const alertId = `${metric}-${Date.now()}`

    // Check if similar alert already exists and is not resolved
    const existingAlert = this.alerts.find(
      a =>
        a.metric === metric &&
        !a.resolved &&
        Date.now() - a.timestamp.getTime() < 300000 // 5 minutes
    )

    if (existingAlert) {
      return // Don't spam alerts
    }

    const alert: PerformanceAlert = {
      id: alertId,
      metric,
      threshold,
      currentValue,
      severity,
      message: this.generateAlertMessage(
        metric,
        threshold,
        currentValue,
        severity
      ),
      timestamp: new Date(),
      resolved: false,
    }

    this.alerts.push(alert)

    // Log the alert
    logger.warn('Performance alert generated', alert)

    // Store alert in database
    try {
      await prisma.notification.create({
        data: {
          eventType: 'SYSTEM_ERROR',
          priority: severity as NotificationPriority,
          title: `Performance Alert: ${metric}`,
          message: alert.message,
          data: JSON.stringify({
            metric,
            threshold,
            currentValue,
            severity,
          }),
          channels: JSON.stringify(['EMAIL', 'IN_APP']),
        },
      })
    } catch (error) {
      logger.error('Failed to store performance alert', error)
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    metric: string,
    threshold: number,
    currentValue: number,
    severity: string
  ): string {
    const metricName = metric.replace(/_/g, ' ').toUpperCase()
    return `${severity.toUpperCase()} ALERT: ${metricName} is ${currentValue.toFixed(2)} (threshold: ${threshold})`
  }

  /**
   * Get recent metrics
   */
  private getRecentMetrics(timeWindow: number): PerformanceMetric[] {
    const cutoff = Date.now() - timeWindow
    return this.metrics.filter(m => m.timestamp.getTime() > cutoff)
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupMetrics(): void {
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY)
    }

    // Clean up old alerts (keep for 24 hours)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    this.alerts = this.alerts.filter(a => a.timestamp.getTime() > cutoff)
  }

  /**
   * Calculate CPU percentage (simplified)
   */
  private calculateCPUPercentage(cpuUsage: NodeJS.CpuUsage): number {
    // This is a simplified calculation
    // In a real implementation, you'd need to track previous values
    const totalUsage = cpuUsage.user + cpuUsage.system
    return Math.min(100, (totalUsage / 1000000) * 100) // Convert microseconds to percentage
  }

  /**
   * Record API request metrics
   */
  recordAPIRequest(responseTime: number, isError: boolean): void {
    this.apiMetrics.requestCount++
    this.apiMetrics.totalResponseTime += responseTime
    if (isError) {
      this.apiMetrics.errorCount++
    }
  }

  /**
   * Get current system performance stats
   */
  async getCurrentStats(): Promise<SystemPerformanceStats> {
    const recentMetrics = this.getRecentMetrics(5 * 60 * 1000) // Last 5 minutes

    const getLatestMetric = (name: string): number => {
      const metrics = recentMetrics.filter(m => m.name === name)
      return metrics.length > 0 ? metrics[metrics.length - 1].value : 0
    }

    const memoryUsage = process.memoryUsage()
    const cacheStats = cache.getStats()
    const dbStats = await dbPerformanceMonitor.getPerformanceStats()

    return {
      cpu: {
        usage: getLatestMetric('cpu_usage'),
        loadAverage:
          process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
      },
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: getLatestMetric('memory_usage'),
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
      },
      database: {
        connectionCount: 1, // SQLite single connection
        queryCount: dbStats.totalQueries,
        averageQueryTime: dbStats.averageQueryTime,
        slowQueries: dbStats.slowQueries.length,
      },
      cache: {
        hitRate: cacheStats.hitRate,
        memoryUsage: cacheStats.memoryUsage,
        entryCount: cacheStats.totalEntries,
      },
      api: {
        requestCount: this.apiMetrics.requestCount,
        averageResponseTime:
          this.apiMetrics.requestCount > 0
            ? this.apiMetrics.totalResponseTime / this.apiMetrics.requestCount
            : 0,
        errorRate:
          this.apiMetrics.requestCount > 0
            ? (this.apiMetrics.errorCount / this.apiMetrics.requestCount) * 100
            : 0,
      },
      agents: {
        totalCount: getLatestMetric('agent_total_count'),
        activeCount: getLatestMetric('agent_active_count'),
        errorCount: getLatestMetric('agent_error_count'),
        averageResponseTime: getLatestMetric('agent_response_time'),
      },
    }
  }

  /**
   * Get performance metrics for a specific time range
   */
  getMetrics(
    metricName?: string,
    timeRange?: { start: Date; end: Date }
  ): PerformanceMetric[] {
    let filteredMetrics = this.metrics

    if (metricName) {
      filteredMetrics = filteredMetrics.filter(m => m.name === metricName)
    }

    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      )
    }

    return filteredMetrics.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.resolved)
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      logger.info('Performance alert resolved', { alertId })
      return true
    }
    return false
  }

  /**
   * Reset API metrics (called periodically)
   */
  resetAPIMetrics(): void {
    this.apiMetrics = {
      requestCount: 0,
      totalResponseTime: 0,
      errorCount: 0,
    }
  }

  /**
   * Destroy monitor and cleanup
   */
  destroy(): void {
    this.stopMonitoring()
    this.metrics = []
    this.alerts = []
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Graceful shutdown
process.on('SIGTERM', () => {
  performanceMonitor.destroy()
})

process.on('SIGINT', () => {
  performanceMonitor.destroy()
})
