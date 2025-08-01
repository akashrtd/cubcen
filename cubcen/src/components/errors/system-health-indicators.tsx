"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Activity, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Database,
  Server,
  Cpu,
  HardDrive,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { SystemHealthIndicator } from '@/types/error'
import { format } from 'date-fns'

interface SystemHealthIndicatorsProps {
  className?: string
  refreshInterval?: number
}

const HEALTH_STATUS_COLORS = {
  healthy: 'bg-green-100 text-green-800 border-green-200',
  degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  unhealthy: 'bg-red-100 text-red-800 border-red-200'
}

const HEALTH_STATUS_ICONS = {
  healthy: CheckCircle,
  degraded: AlertTriangle,
  unhealthy: AlertCircle
}

const TREND_ICONS = {
  improving: TrendingUp,
  stable: Minus,
  degrading: TrendingDown
}

const TREND_COLORS = {
  improving: 'text-green-600',
  stable: 'text-gray-600',
  degrading: 'text-red-600'
}

const INDICATOR_ICONS = {
  database: Database,
  memory: Cpu,
  disk: HardDrive,
  application: Server
}

export function SystemHealthIndicators({ 
  className, 
  refreshInterval = 30000 
}: SystemHealthIndicatorsProps) {
  const [indicators, setIndicators] = useState<SystemHealthIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Fetch health indicators
  const fetchHealthIndicators = useCallback(async () => {
    try {
      setRefreshing(true)
      
      const response = await fetch('/api/cubcen/v1/health/indicators')
      if (!response.ok) {
        throw new Error('Failed to fetch health indicators')
      }

      const data = await response.json()
      setIndicators(data.indicators || [])
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health indicators')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchHealthIndicators()
  }, [fetchHealthIndicators])

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchHealthIndicators, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchHealthIndicators, refreshInterval])

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    fetchHealthIndicators()
  }, [fetchHealthIndicators])

  // Get status icon
  const getStatusIcon = (status: SystemHealthIndicator['status']) => {
    const Icon = HEALTH_STATUS_ICONS[status]
    return <Icon className="h-4 w-4" />
  }

  // Get trend icon
  const getTrendIcon = (trend?: SystemHealthIndicator['trend']) => {
    if (!trend) return null
    const Icon = TREND_ICONS[trend]
    return <Icon className={`h-3 w-3 ${TREND_COLORS[trend]}`} />
  }

  // Get indicator icon
  const getIndicatorIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    let iconKey = 'application'
    
    if (lowerName.includes('database')) iconKey = 'database'
    else if (lowerName.includes('memory')) iconKey = 'memory'
    else if (lowerName.includes('disk')) iconKey = 'disk'
    
    const Icon = INDICATOR_ICONS[iconKey as keyof typeof INDICATOR_ICONS]
    return <Icon className="h-4 w-4 text-gray-500" />
  }

  // Format value with unit
  const formatValue = (indicator: SystemHealthIndicator) => {
    if (indicator.value === undefined) return 'N/A'
    
    const value = indicator.value
    const unit = indicator.unit || ''
    
    if (unit === '%') {
      return `${Math.round(value)}%`
    } else if (unit === 'ms') {
      return `${Math.round(value)}ms`
    } else if (unit === 'MB') {
      return `${Math.round(value)}MB`
    } else if (unit === 'GB') {
      return `${Math.round(value)}GB`
    }
    
    return `${Math.round(value)}${unit}`
  }

  // Get progress value for indicators with thresholds
  const getProgressValue = (indicator: SystemHealthIndicator) => {
    if (indicator.value === undefined || indicator.threshold === undefined) {
      return undefined
    }
    
    return Math.min(100, (indicator.value / indicator.threshold) * 100)
  }

  // Get overall system status
  const getOverallStatus = () => {
    if (indicators.length === 0) return 'unknown'
    
    const hasUnhealthy = indicators.some(i => i.status === 'unhealthy')
    const hasDegraded = indicators.some(i => i.status === 'degraded')
    
    if (hasUnhealthy) return 'unhealthy'
    if (hasDegraded) return 'degraded'
    return 'healthy'
  }

  const overallStatus = getOverallStatus()

  if (loading && indicators.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#3F51B5]" />
            System Health
          </CardTitle>
          <CardDescription>
            Real-time system health indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#3F51B5]" />
            System Health
            <Badge 
              variant="outline" 
              className={`${HEALTH_STATUS_COLORS[overallStatus]} flex items-center gap-1`}
            >
              {getStatusIcon(overallStatus)}
              {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(lastUpdate, 'HH:mm:ss')}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-[#3F51B5] text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time system health indicators and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {indicators.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Health Data</h3>
            <p className="text-gray-500">
              System health indicators are not available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {indicators.map((indicator) => {
              const progressValue = getProgressValue(indicator)
              
              return (
                <div key={indicator.name} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getIndicatorIcon(indicator.name)}
                      <span className="text-sm font-medium text-gray-700">
                        {indicator.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(indicator.trend)}
                      <Badge 
                        variant="outline" 
                        className={`${HEALTH_STATUS_COLORS[indicator.status]} text-xs`}
                      >
                        {getStatusIcon(indicator.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatValue(indicator)}
                      </span>
                      {indicator.threshold && (
                        <span className="text-xs text-gray-500">
                          / {formatValue({ ...indicator, value: indicator.threshold })}
                        </span>
                      )}
                    </div>

                    {progressValue !== undefined && (
                      <div className="space-y-1">
                        <Progress 
                          value={progressValue} 
                          className="h-2"
                          style={{
                            '--progress-background': indicator.status === 'healthy' 
                              ? '#3F51B5' 
                              : indicator.status === 'degraded' 
                                ? '#f59e0b' 
                                : '#ef4444'
                          } as React.CSSProperties}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>{Math.round(progressValue)}%</span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Last check: {format(new Date(indicator.lastCheck), 'HH:mm:ss')}
                    </div>

                    {indicator.details && Object.keys(indicator.details).length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            Details
                          </summary>
                          <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                            {Object.entries(indicator.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Overall System Status Summary */}
        {indicators.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Overall Status:</span>
                <Badge 
                  variant="outline" 
                  className={`${HEALTH_STATUS_COLORS[overallStatus]} flex items-center gap-1`}
                >
                  {getStatusIcon(overallStatus)}
                  {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {indicators.filter(i => i.status === 'healthy').length} healthy, {' '}
                {indicators.filter(i => i.status === 'degraded').length} degraded, {' '}
                {indicators.filter(i => i.status === 'unhealthy').length} unhealthy
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}