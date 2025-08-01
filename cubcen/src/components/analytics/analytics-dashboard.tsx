'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/analytics/date-range-picker'
import { KPICards } from '@/components/analytics/kpi-cards'
import { PerformanceCharts } from '@/components/analytics/performance-charts'
import { AgentPerformanceTable } from '@/components/analytics/agent-performance-table'
import { ErrorPatternsChart } from '@/components/analytics/error-patterns-chart'
import { ExportDialog } from '@/components/analytics/export-dialog'
import { BarChart3, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { AnalyticsData } from '@/services/analytics'
import { toast } from 'sonner'

interface AnalyticsDashboardProps {
  className?: string
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [refreshInterval, setRefreshInterval] = useState<string>('manual')
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const fetchAnalyticsData = async (range?: DateRange) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (range?.from) {
        params.append('startDate', range.from.toISOString())
      }
      if (range?.to) {
        params.append('endDate', range.to.toISOString())
      }

      const response = await fetch(`/api/cubcen/v1/analytics?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch analytics data')
      }

      setData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast.error('Failed to load analytics data', {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchAnalyticsData(dateRange)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    fetchAnalyticsData(range)
  }

  const handleRefreshIntervalChange = (interval: string) => {
    setRefreshInterval(interval)
    
    // Clear existing interval
    if (typeof window !== 'undefined') {
      const existingInterval = (window as any).analyticsInterval
      if (existingInterval) {
        clearInterval(existingInterval)
      }
    }

    // Set new interval
    if (interval !== 'manual' && typeof window !== 'undefined') {
      const intervalMs = interval === '30s' ? 30000 : interval === '1m' ? 60000 : 300000 // 5m
      const newInterval = setInterval(() => {
        fetchAnalyticsData(dateRange)
      }, intervalMs)
      ;(window as any).analyticsInterval = newInterval
    }
  }

  useEffect(() => {
    fetchAnalyticsData()

    // Cleanup interval on unmount
    return () => {
      if (typeof window !== 'undefined') {
        const existingInterval = (window as any).analyticsInterval
        if (existingInterval) {
          clearInterval(existingInterval)
        }
      }
    }
  }, [])

  if (loading && !data) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              View comprehensive analytics and performance metrics for your AI agents.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View comprehensive analytics and performance metrics for your AI agents.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
            <CardDescription>
              Failed to load analytics data. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View comprehensive analytics and performance metrics for your AI agents.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={refreshInterval} onValueChange={handleRefreshIntervalChange}>
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
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setExportDialogOpen(true)} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Select date range to filter analytics data
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {data && <KPICards data={data} loading={loading} />}

      {/* Performance Charts */}
      {data && <PerformanceCharts data={data} loading={loading} />}

      {/* Agent Performance Table */}
      {data && <AgentPerformanceTable data={data.agentPerformance} loading={loading} />}

      {/* Error Patterns */}
      {data && <ErrorPatternsChart data={data.errorPatterns} loading={loading} />}

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        dateRange={dateRange}
      />
    </div>
  )
}