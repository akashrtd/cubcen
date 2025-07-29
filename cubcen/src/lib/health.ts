/**
 * Cubcen Health Monitoring Service
 * Health checks for database, memory, and external services
 */

import { prisma as database } from './database'
import structuredLogger from './logger'
import os from 'os'
import fs from 'fs/promises'

export interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  lastCheck: Date
  responseTime?: number
  details?: Record<string, unknown>
  error?: string
}

export interface SystemMetrics {
  timestamp: Date
  cpu: {
    usage: number
    loadAverage: number[]
  }
  memory: {
    used: number
    free: number
    total: number
    heapUsed: number
    heapTotal: number
    external: number
  }
  disk: {
    free: number
    total: number
  }
  uptime: number
  activeConnections?: number
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: Date
  checks: HealthCheck[]
  metrics: SystemMetrics
  version: string
}

class HealthMonitoringService {
  private healthChecks: Map<string, HealthCheck> = new Map()
  private metricsHistory: SystemMetrics[] = []
  private readonly maxHistorySize = 100

  /**
   * Check database connectivity and performance
   */
  async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now()
    const check: HealthCheck = {
      name: 'database',
      status: 'healthy',
      lastCheck: new Date(),
    }

    try {
      // Test database connection with a simple query
      await database.user.findFirst({
        select: { id: true }
      })
      
      const responseTime = Date.now() - startTime
      check.responseTime = responseTime
      check.details = {
        connectionStatus: 'connected',
        queryTime: responseTime,
        testQuery: 'SELECT id FROM User LIMIT 1'
      }

      // Check if response time is acceptable
      if (responseTime > 1000) {
        check.status = 'degraded'
        check.details.warning = 'Database response time is slow'
      }

    } catch (error) {
      check.status = 'unhealthy'
      check.error = error instanceof Error ? error.message : 'Unknown database error'
      check.details = {
        connectionStatus: 'failed',
        error: check.error
      }
      
      structuredLogger.error('Database health check failed', error as Error, {
        healthCheck: 'database'
      })
    }

    this.healthChecks.set('database', check)
    return check
  }

  /**
   * Check memory usage and availability
   */
  async checkMemory(): Promise<HealthCheck> {
    const check: HealthCheck = {
      name: 'memory',
      status: 'healthy',
      lastCheck: new Date(),
    }

    try {
      const memoryUsage = process.memoryUsage()
      const systemMemory = {
        free: os.freemem(),
        total: os.totalmem()
      }

      const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      const systemUsagePercent = ((systemMemory.total - systemMemory.free) / systemMemory.total) * 100

      check.details = {
        heap: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          usagePercent: Math.round(heapUsagePercent)
        },
        system: {
          free: Math.round(systemMemory.free / 1024 / 1024), // MB
          total: Math.round(systemMemory.total / 1024 / 1024), // MB
          usagePercent: Math.round(systemUsagePercent)
        },
        external: Math.round(memoryUsage.external / 1024 / 1024) // MB
      }

      // Determine status based on usage
      if (heapUsagePercent > 90 || systemUsagePercent > 95) {
        check.status = 'unhealthy'
        check.error = 'Memory usage critically high'
      } else if (heapUsagePercent > 75 || systemUsagePercent > 85) {
        check.status = 'degraded'
        check.details.warning = 'Memory usage is high'
      }

    } catch (error) {
      check.status = 'unhealthy'
      check.error = error instanceof Error ? error.message : 'Memory check failed'
      
      structuredLogger.error('Memory health check failed', error as Error, {
        healthCheck: 'memory'
      })
    }

    this.healthChecks.set('memory', check)
    return check
  }

  /**
   * Check disk space availability
   */
  async checkDiskSpace(): Promise<HealthCheck> {
    const check: HealthCheck = {
      name: 'disk',
      status: 'healthy',
      lastCheck: new Date(),
    }

    try {
      const stats = await fs.statfs(process.cwd())
      const free = stats.bavail * stats.bsize
      const total = stats.blocks * stats.bsize
      const usagePercent = ((total - free) / total) * 100

      check.details = {
        free: Math.round(free / 1024 / 1024 / 1024), // GB
        total: Math.round(total / 1024 / 1024 / 1024), // GB
        usagePercent: Math.round(usagePercent)
      }

      if (usagePercent > 95) {
        check.status = 'unhealthy'
        check.error = 'Disk space critically low'
      } else if (usagePercent > 85) {
        check.status = 'degraded'
        check.details.warning = 'Disk space is running low'
      }

    } catch (error) {
      check.status = 'unhealthy'
      check.error = error instanceof Error ? error.message : 'Disk check failed'
      
      structuredLogger.error('Disk health check failed', error as Error, {
        healthCheck: 'disk'
      })
    }

    this.healthChecks.set('disk', check)
    return check
  }

  /**
   * Check application-specific metrics
   */
  async checkApplication(): Promise<HealthCheck> {
    const check: HealthCheck = {
      name: 'application',
      status: 'healthy',
      lastCheck: new Date(),
    }

    try {
      const uptime = process.uptime()
      const loadAverage = os.loadavg()
      const cpuCount = os.cpus().length

      check.details = {
        uptime: Math.round(uptime),
        uptimeFormatted: this.formatUptime(uptime),
        loadAverage: loadAverage.map(load => Math.round(load * 100) / 100),
        cpuCount,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }

      // Check if load average is too high
      const avgLoad = loadAverage[0]
      if (avgLoad > cpuCount * 2) {
        check.status = 'unhealthy'
        check.error = 'System load is critically high'
      } else if (avgLoad > cpuCount) {
        check.status = 'degraded'
        check.details.warning = 'System load is high'
      }

    } catch (error) {
      check.status = 'unhealthy'
      check.error = error instanceof Error ? error.message : 'Application check failed'
      
      structuredLogger.error('Application health check failed', error as Error, {
        healthCheck: 'application'
      })
    }

    this.healthChecks.set('application', check)
    return check
  }

  /**
   * Collect comprehensive system metrics
   */
  async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      const memoryUsage = process.memoryUsage()
      const systemMemory = {
        free: os.freemem(),
        total: os.totalmem()
      }

      let diskStats = { free: 0, total: 0 }
      try {
        const stats = await fs.statfs(process.cwd())
        diskStats = {
          free: stats.bavail * stats.bsize,
          total: stats.blocks * stats.bsize
        }
      } catch (error) {
        structuredLogger.warn('Failed to get disk stats', { error })
      }

      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: {
          usage: await this.getCPUUsage(),
          loadAverage: os.loadavg()
        },
        memory: {
          used: systemMemory.total - systemMemory.free,
          free: systemMemory.free,
          total: systemMemory.total,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external
        },
        disk: diskStats,
        uptime: process.uptime()
      }

      // Store metrics in history
      this.metricsHistory.push(metrics)
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory.shift()
      }

      return metrics
    } catch (error) {
      structuredLogger.error('Failed to collect system metrics', error as Error)
      throw error
    }
  }

  /**
   * Run all health checks
   */
  async runAllHealthChecks(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Run all health checks in parallel
      const [databaseCheck, memoryCheck, diskCheck, applicationCheck] = await Promise.all([
        this.checkDatabase(),
        this.checkMemory(),
        this.checkDiskSpace(),
        this.checkApplication()
      ])

      const checks = [databaseCheck, memoryCheck, diskCheck, applicationCheck]
      const metrics = await this.collectSystemMetrics()

      // Determine overall status
      const hasUnhealthy = checks.some(check => check.status === 'unhealthy')
      const hasDegraded = checks.some(check => check.status === 'degraded')
      
      let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
      if (hasUnhealthy) {
        overallStatus = 'unhealthy'
      } else if (hasDegraded) {
        overallStatus = 'degraded'
      }

      const healthStatus: HealthStatus = {
        status: overallStatus,
        timestamp: new Date(),
        checks,
        metrics,
        version: process.env.npm_package_version || '0.1.0'
      }

      const duration = Date.now() - startTime
      structuredLogger.info('Health check completed', {
        status: overallStatus,
        duration,
        checksCount: checks.length
      })

      return healthStatus
    } catch (error) {
      structuredLogger.error('Health check failed', error as Error)
      throw error
    }
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(limit?: number): SystemMetrics[] {
    const history = [...this.metricsHistory]
    return limit ? history.slice(-limit) : history
  }

  /**
   * Get specific health check
   */
  getHealthCheck(name: string): HealthCheck | undefined {
    return this.healthChecks.get(name)
  }

  /**
   * Clear metrics history (for testing)
   */
  clearMetricsHistory(): void {
    this.metricsHistory = []
  }

  /**
   * Calculate CPU usage percentage
   */
  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage()
      const startTime = Date.now()

      setTimeout(() => {
        const currentUsage = process.cpuUsage(startUsage)
        const currentTime = Date.now()
        const timeDiff = currentTime - startTime

        const totalUsage = (currentUsage.user + currentUsage.system) / 1000 // Convert to milliseconds
        const usage = (totalUsage / timeDiff) * 100

        resolve(Math.min(100, Math.max(0, usage)))
      }, 100)
    })
  }

  /**
   * Format uptime in human-readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

    return parts.join(' ')
  }
}

// Export singleton instance
export const healthMonitoring = new HealthMonitoringService()
export default healthMonitoring