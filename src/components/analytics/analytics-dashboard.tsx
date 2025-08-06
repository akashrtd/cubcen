'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePickerWithRange } from '@/components/analytics/date-range-picker'
import { 
  LazyAgentPerformanceTableWithSuspense,
  LazyErrorPatternsChartWithSuspense,
  LazyExportDialogWithSuspense
} from '@/components/analytics/lazy-components'
import { ErrorBoundary } from '@/components/error-boundary'
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Clock,
  AlertCircle,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  Zap,
  PieChart as PieChartIcon
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { AnalyticsData } from '@/services/analytics'
import { toast } from 'sonner'

// Import new modular dashboard components
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout'
import { DashboardGrid } from '@/components/dashboard/grid/dashboard-grid'
import { DashboardCard } from '@/components/dashboard/cards/dashboard-card'
import { MetricCard } from '@/components/dashboard/cards/metric-card'
import { ChartCard } from '@/components/dashboard/cards/chart-card'
import { ChartWrapper } from '@/components/dashboard/charts/chart-wrapper'
import { DashboardDataTransforms } from '@/lib/dashboard-data-transforms'

interface AnalyticsDashboardProps {
  className?: string
}

interface ErrorState {
  message: string
  code?: string
  timestamp: string
  retryCount: number
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorState | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [refreshInterval, setRefreshInterval] = useState<string>('manual')
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnalyticsData = useCallback(async (range?: DateRange, isRetry = false) => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      if (!isRetry) {
        setLoading(true)
      }
      setError(null)

      const params = new URLSearchParams()
      if (range?.from) {
        params.append('startDate', range.from.toISOString())
      }
      if (range?.to) {
        params.append('endDate', range.to.toISOString())
      }

      const response = await fetch(`/api/analytics?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorCode = 'HTTP_ERROR'
        
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error.message || errorMessage
            errorCode = errorData.error.code || errorCode
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(
          result.error?.message || 'Failed to fetch analytics data'
        )
      }

      setData(result.data)
      setLastUpdated(new Date())
      setIsOnline(true)
      
      // Clear any retry timeout
      if (retryTimeout) {
        clearTimeout(retryTimeout)
        setRetryTimeout(null)
      }
      
      if (isRetry) {
        toast.success('Analytics data refreshed successfully')
      }
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      const currentError = error || { message: '', code: '', timestamp: '', retryCount: 0 }
      
      const newError: ErrorState = {
        message: errorMessage,
        code: errorMessage.includes('HTTP') ? 'HTTP_ERROR' : 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
        retryCount: isRetry ? currentError.retryCount + 1 : 0
      }
      
      setError(newError)
      setIsOnline(false)
      
      // Show different toast messages based on error type
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        toast.error('Network connection error', {
          description: 'Please check your internet connection and try again.',
        })
      } else if (errorMessage.includes('HTTP 5')) {
        toast.error('Server error', {
          description: 'The server is experiencing issues. Please try again later.',
        })
      } else {
        toast.error('Failed to load analytics data', {
          description: errorMessage,
        })
      }
      
      // Auto-retry for network errors (max 3 times)
      if (newError.retryCount < 3 && (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError'))) {
        const retryDelay = Math.min(1000 * Math.pow(2, newError.retryCount), 10000) // Exponential backoff, max 10s
        const timeout = setTimeout(() => {
          fetchAnalyticsData(range, true)
        }, retryDelay)
        setRetryTimeout(timeout)
      }
      
    } finally {
      setLoading(false)
    }
  }, [error, retryTimeout])

  const handleRefresh = useCallback(() => {
    fetchAnalyticsData(dateRange)
  }, [fetchAnalyticsData, dateRange])

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range)
    fetchAnalyticsData(range)
  }, [fetchAnalyticsData])

  const handleRefreshIntervalChange = useCallback((interval: string) => {
    setRefreshInterval(interval)

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Set new interval
    if (interval !== 'manual') {
      const intervalMs =
        interval === '30s' ? 30000 : interval === '1m' ? 60000 : 300000 // 5m
      intervalRef.current = setInterval(() => {
        fetchAnalyticsData(dateRange)
      }, intervalMs)
    }
  }, [fetchAnalyticsData, dateRange])

  const handleRetry = useCallback(() => {
    if (retryTimeout) {
      clearTimeout(retryTimeout)
      setRetryTimeout(null)
    }
    fetchAnalyticsData(dateRange, true)
  }, [fetchAnalyticsData, dateRange, retryTimeout])

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (error) {
        fetchAnalyticsData(dateRange)
      }
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [error, fetchAnalyticsData, dateRange])

  useEffect(() => {
    fetchAnalyticsData()

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchAnalyticsData])

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View comprehensive analytics and performance metrics for your AI agents.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Filters skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-80" />
        </CardContent>
      </Card>

      {/* KPI Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-1 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  if (loading && !data) {
    return <LoadingSkeleton />
  }

  // Enhanced error state component
  const ErrorState = ({ error }: { error: ErrorState }) => (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View comprehensive analytics and performance metrics for your AI agents.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isOnline && (
            <Badge variant="destructive" className="flex items-center">
              <WifiOff className="mr-1 h-3 w-3" />
              Offline
            </Badge>
          )}
          {isOnline && (
            <Badge variant="outline" className="flex items-center">
              <Wifi className="mr-1 h-3 w-3" />
              Online
            </Badge>
          )}
        </div>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-medium mb-1">
              {error.code === 'NETWORK_ERROR' ? 'Connection Error' : 
               error.code === 'HTTP_ERROR' ? 'Server Error' : 'Error Loading Analytics'}
            </div>
            <div className="text-sm">{error.message}</div>
            {error.retryCount > 0 && (
              <div className="text-xs mt-1 opacity-75">
                Retry attempt {error.retryCount}/3
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
            Unable to Load Analytics Data
          </CardTitle>
          <CardDescription>
            {error.code === 'NETWORK_ERROR' 
              ? 'Please check your internet connection and try again.'
              : error.code === 'HTTP_ERROR'
              ? 'The server is experiencing issues. Please try again later.'
              : 'An unexpected error occurred while loading analytics data.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">Error Details:</div>
              <div className="text-sm text-muted-foreground font-mono">
                {error.message}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Occurred at: {new Date(error.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <Button 
                onClick={handleRetry} 
                disabled={loading}
                className="bg-cubcen-primary hover:bg-cubcen-primary-hover"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Retrying...' : 'Retry Now'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              
              {error.code === 'NETWORK_ERROR' && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    // Test network connectivity
                    fetch('/api/health')
                      .then(() => {
                        toast.success('Connection restored')
                        handleRetry()
                      })
                      .catch(() => {
                        toast.error('Still unable to connect')
                      })
                  }}
                >
                  Test Connection
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (error && !data) {
    return <ErrorState error={error} />
  }

  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              View comprehensive analytics and performance metrics for your AI agents.
            </p>
            {lastUpdated && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="mr-1 h-3 w-3" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Connection status indicator */}
            {!isOnline && (
              <Badge variant="destructive" className="flex items-center">
                <WifiOff className="mr-1 h-3 w-3" />
                Offline
              </Badge>
            )}
            
            {/* Error indicator */}
            {error && data && (
              <Badge variant="secondary" className="flex items-center">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Partial Data
              </Badge>
            )}
            
            <Select
              value={refreshInterval}
              onValueChange={handleRefreshIntervalChange}
              disabled={loading}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="30s">30 seconds</SelectItem>
                <SelectItem value="1m">1 minute</SelectItem>
                <SelectItem value="5m">5 minutes</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            
            <Button
              onClick={() => setExportDialogOpen(true)}
              variant="outline"
              size="sm"
              disabled={loading || !data}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Error alert for partial data */}
        {error && data && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <div className="font-medium">Warning: Displaying cached data</div>
                <div className="text-sm">{error.message}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={loading}
              >
                <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Date Range Filter using new DashboardCard */}
        <DashboardCard
          title="Filters"
          subtitle="Select date range to filter analytics data"
          size="md"
          priority="medium"
        >
          <div className="flex items-center space-x-4">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={handleDateRangeChange}
            />
            {dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDateRangeChange(undefined)}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </DashboardCard>

        {/* KPI Cards using new MetricCard components */}
        <ErrorBoundary fallback={({ error, resetError }) => (
          <DashboardCard
            title="KPI Cards Error"
            icon={AlertTriangle}
            error={error.message}
            actions={
              <Button onClick={resetError} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            }
          />
        )}>
          {data && (
            <DashboardGrid columns={6} className="mb-6">
              <MetricCard
                title="Total Agents"
                metrics={[{
                  label: "Total",
                  value: data.totalAgents,
                  unit: "agents",
                  trend: data.activeAgents > data.totalAgents * 0.8 ? 'up' : 'neutral',
                  color: "text-blue-600"
                }]}
                icon={Users}
                size="sm"
                priority="high"
                loading={loading}
              />
              <MetricCard
                title="Active Agents"
                metrics={[{
                  label: "Active",
                  value: data.activeAgents,
                  unit: "running",
                  trend: data.activeAgents > 0 ? 'up' : 'down',
                  color: "text-cubcen-primary"
                }]}
                icon={Zap}
                size="sm"
                priority="critical"
                loading={loading}
              />
              <MetricCard
                title="Total Tasks"
                metrics={[{
                  label: "All time",
                  value: data.totalTasks,
                  unit: "tasks",
                  color: "text-purple-600"
                }]}
                icon={Activity}
                size="sm"
                priority="medium"
                loading={loading}
              />
              <MetricCard
                title="Success Rate"
                metrics={[{
                  label: "Completed",
                  value: `${data.successRate}%`,
                  trend: data.successRate >= 90 ? 'up' : data.successRate >= 70 ? 'neutral' : 'down',
                  trendValue: `${data.completedTasks} completed`,
                  color: "text-green-600"
                }]}
                icon={Target}
                size="sm"
                priority="critical"
                loading={loading}
              />
              <MetricCard
                title="Failed Tasks"
                metrics={[{
                  label: "Needs attention",
                  value: data.failedTasks,
                  unit: "failed",
                  trend: data.failedTasks > 0 ? 'down' : 'neutral',
                  color: "text-red-600"
                }]}
                icon={XCircle}
                size="sm"
                priority="high"
                loading={loading}
              />
              <MetricCard
                title="Avg Response Time"
                metrics={[{
                  label: "Performance",
                  value: data.averageResponseTime,
                  unit: "ms",
                  trend: data.averageResponseTime < 1000 ? 'up' : data.averageResponseTime < 3000 ? 'neutral' : 'down',
                  color: "text-orange-600"
                }]}
                icon={Clock}
                size="sm"
                priority="medium"
                loading={loading}
              />
            </DashboardGrid>
          )}
        </ErrorBoundary>

        {/* Performance Charts using new ChartCard components */}
        <ErrorBoundary fallback={({ error, resetError }) => (
          <DashboardCard
            title="Charts Error"
            icon={AlertTriangle}
            error={error.message}
            actions={
              <Button onClick={resetError} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            }
          />
        )}>
          {data && (
            <DashboardGrid className="space-y-6">
              {/* Daily Task Trends */}
              <ChartCard
                title="Task Trends Over Time"
                subtitle="Daily completed and failed tasks over the selected period"
                icon={TrendingUp}
                chartType="area"
                data={DashboardDataTransforms.transformDailyTaskTrends(data.dailyTaskTrends)}
                chartConfig={{
                  colors: {
                    primary: '#4CAF50',
                    secondary: '#F44336',
                    accent: '#3F51B5'
                  },
                  legend: { show: true, position: 'bottom' },
                  tooltip: { show: true },
                  responsive: {
                    breakpoints: {
                      mobile: { legend: { position: 'top' } }
                    }
                  }
                }}
                size="lg"
                priority="high"
                loading={loading}
                exportable
                colSpan={12}
              />

              <div className="grid gap-4 md:grid-cols-2">
                {/* Task Status Distribution */}
                <ChartCard
                  title="Task Status Distribution"
                  subtitle="Breakdown of tasks by current status"
                  icon={PieChartIcon}
                  chartType="pie"
                  data={DashboardDataTransforms.transformTasksByStatus(data.tasksByStatus)}
                  chartConfig={{
                    colors: {
                      primary: '#4CAF50',
                      secondary: '#F44336',
                      accent: '#FF9800',
                      success: '#4CAF50',
                      warning: '#FF9800',
                      error: '#F44336'
                    },
                    legend: { show: true, position: 'bottom' }
                  }}
                  size="md"
                  priority="medium"
                  loading={loading}
                  exportable
                />

                {/* Task Priority Distribution */}
                <ChartCard
                  title="Task Priority Distribution"
                  subtitle="Tasks organized by priority level"
                  icon={BarChart3}
                  chartType="bar"
                  data={DashboardDataTransforms.transformTasksByPriority(data.tasksByPriority)}
                  chartConfig={{
                    colors: {
                      primary: '#3F51B5',
                      secondary: '#B19ADA',
                      accent: '#FF6B35'
                    },
                    legend: { show: false }
                  }}
                  size="md"
                  priority="medium"
                  loading={loading}
                  exportable
                />

                {/* Platform Distribution */}
                <ChartCard
                  title="Platform Distribution"
                  subtitle="Agents distributed across platforms"
                  icon={Activity}
                  chartType="bar"
                  data={DashboardDataTransforms.transformPlatformDistribution(data.platformDistribution)}
                  chartConfig={{
                    colors: {
                      primary: '#B19ADA',
                      secondary: '#3F51B5'
                    },
                    legend: { show: false }
                  }}
                  size="md"
                  priority="low"
                  loading={loading}
                  exportable
                />

                {/* Top Performing Agents */}
                <DashboardCard
                  title="Top Performing Agents"
                  subtitle="Agents with highest success rates"
                  icon={TrendingUp}
                  size="md"
                  priority="medium"
                  loading={loading}
                >
                  <div className="space-y-4">
                    {data.agentPerformance
                      .sort((a, b) => b.successRate - a.successRate)
                      .slice(0, 5)
                      .map((agent, index) => (
                        <div
                          key={`agent-${agent.agentId || index}`}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {agent.agentName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {agent.totalTasks} tasks • {agent.averageResponseTime}ms avg
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                agent.successRate >= 90
                                  ? 'default'
                                  : agent.successRate >= 70
                                    ? 'secondary'
                                    : 'destructive'
                              }
                              className="text-xs"
                            >
                              {agent.successRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {data.agentPerformance.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No agent performance data available
                      </div>
                    )}
                  </div>
                </DashboardCard>
              </div>
            </DashboardGrid>
          )}
        </ErrorBoundary>

        {/* Agent Performance Table */}
        <ErrorBoundary fallback={({ error, resetError }) => (
          <DashboardCard
            title="Agent Performance Error"
            icon={AlertTriangle}
            error={error.message}
            actions={
              <Button onClick={resetError} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            }
          />
        )}>
          {data && (
            <LazyAgentPerformanceTableWithSuspense data={data.agentPerformance} loading={loading} />
          )}
        </ErrorBoundary>

        {/* Error Patterns */}
        <ErrorBoundary fallback={({ error, resetError }) => (
          <DashboardCard
            title="Error Patterns Error"
            icon={AlertTriangle}
            error={error.message}
            actions={
              <Button onClick={resetError} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            }
          />
        )}>
          {data && (
            <LazyErrorPatternsChartWithSuspense data={data.errorPatterns} loading={loading} />
          )}
        </ErrorBoundary>

        {/* Export Dialog */}
        <LazyExportDialogWithSuspense
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          dateRange={dateRange}
        />
      </div>
    </ErrorBoundary>
  )
}
