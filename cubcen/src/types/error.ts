/**
 * Error handling types for Cubcen platform
 */

export interface ErrorLog {
  id: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  message: string
  context?: Record<string, unknown>
  source: string
  timestamp: Date
  stackTrace?: string
  agentId?: string
  taskId?: string
  platformId?: string
  userId?: string
}

export interface ErrorPattern {
  id: string
  pattern: string
  description: string
  frequency: number
  lastOccurrence: Date
  affectedAgents: string[]
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  suggestedAction?: string
}

export interface SystemHealthIndicator {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  value?: number
  threshold?: number
  unit?: string
  lastCheck: Date
  details?: Record<string, unknown>
  trend?: 'improving' | 'stable' | 'degrading'
}

export interface RetryableTask {
  id: string
  name: string
  agentId: string
  agentName: string
  status: 'FAILED' | 'CANCELLED'
  error: string
  retryCount: number
  maxRetries: number
  lastAttempt: Date
  canRetry: boolean
  parameters?: Record<string, unknown>
}

export interface ErrorFilter {
  level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  source?: string
  agentId?: string
  taskId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface ErrorStats {
  total: number
  byLevel: Record<string, number>
  bySource: Record<string, number>
  recentTrend: 'increasing' | 'stable' | 'decreasing'
  topErrors: Array<{
    message: string
    count: number
    lastOccurrence: Date
  }>
}