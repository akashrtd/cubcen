/**
 * Compatibility wrappers for gradual migration from old analytics components
 * to new modular dashboard components
 */

'use client'

import { ComponentProps, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardCard } from '@/components/dashboard/cards/dashboard-card'
import { MetricCard } from '@/components/dashboard/cards/metric-card'
import { ChartCard } from '@/components/dashboard/cards/chart-card'
import { DashboardDataTransforms } from '@/lib/dashboard-data-transforms'
import { 
  DashboardMigration, 
  LegacyDataAdapter, 
  MigrationAnalytics,
  MigrationRollback 
} from '@/lib/dashboard-migration'
import { AnalyticsData } from '@/services/analytics'
import { useAuth } from '@/hooks/use-auth'

/**
 * Compatibility wrapper for KPI Cards
 * Gradually migrates from old Card components to new MetricCard components
 */
interface CompatibilityKPICardsProps {
  data: AnalyticsData
  loading?: boolean
  userId?: string
}

export function CompatibilityKPICards({ 
  data, 
  loading,
  userId 
}: CompatibilityKPICardsProps) {
  const migration = DashboardMigration.getInstance()
  const featureFlags = migration.getFeatureFlags(userId)
  
  useEffect(() => {
    // Track component usage
    MigrationAnalytics.trackComponentUsage(
      'KPICards', 
      featureFlags.KPI_CARDS_V2 ? 'new' : 'legacy',
      userId
    )
  }, [featureFlags.KPI_CARDS_V2, userId])

  // Check for rollback conditions
  if (MigrationRollback.shouldRollback('KPICards', userId)) {
    return renderLegacyKPICards(data, loading)
  }

  if (featureFlags.KPI_CARDS_V2) {
    try {
      // Use new MetricCard components
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            title="Total Agents"
            metrics={[{
              label: "Total",
              value: data.totalAgents,
              unit: "agents",
              trend: data.activeAgents > data.totalAgents * 0.8 ? 'up' : 'neutral',
              color: "text-blue-600"
            }]}
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
            loading={loading}
          />
        </div>
      )
    } catch (error) {
      // Track error and fallback to legacy
      MigrationAnalytics.trackError('KPICards', error as Error, userId)
      return renderLegacyKPICards(data, loading)
    }
  }

  // Fallback to legacy implementation
  return renderLegacyKPICards(data, loading)
}

function renderLegacyKPICards(data: AnalyticsData, loading?: boolean) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2 w-16" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalAgents}</div>
          <p className="text-xs text-muted-foreground">{data.activeAgents} active</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeAgents}</div>
          <p className="text-xs text-muted-foreground">Currently running</p>
        </CardContent>
      </Card>
      {/* Additional legacy cards would go here */}
    </div>
  )
}

/**
 * Compatibility wrapper for Performance Charts
 * Gradually migrates from old chart implementations to new ChartCard components
 */
interface CompatibilityPerformanceChartsProps {
  data: AnalyticsData
  loading?: boolean
  userId?: string
}

export function CompatibilityPerformanceCharts({ 
  data, 
  loading,
  userId 
}: CompatibilityPerformanceChartsProps) {
  const migration = DashboardMigration.getInstance()
  const featureFlags = migration.getFeatureFlags(userId)
  
  useEffect(() => {
    // Track component usage
    MigrationAnalytics.trackComponentUsage(
      'PerformanceCharts', 
      featureFlags.CHARTS_V2 ? 'new' : 'legacy',
      userId
    )
  }, [featureFlags.CHARTS_V2, userId])

  // Check for rollback conditions
  if (MigrationRollback.shouldRollback('PerformanceCharts', userId)) {
    return renderLegacyCharts(data, loading)
  }

  if (featureFlags.CHARTS_V2) {
    try {
      // Use new ChartCard components with transformed data
      return (
        <div className="space-y-6">
          <ChartCard
            title="Task Trends Over Time"
            subtitle="Daily completed and failed tasks over the selected period"
            chartType="area"
            data={DashboardDataTransforms.transformDailyTaskTrends(data.dailyTaskTrends)}
            loading={loading}
            exportable
          />
          
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard
              title="Task Status Distribution"
              subtitle="Breakdown of tasks by current status"
              chartType="pie"
              data={DashboardDataTransforms.transformTasksByStatus(data.tasksByStatus)}
              loading={loading}
              exportable
            />
            
            <ChartCard
              title="Task Priority Distribution"
              subtitle="Tasks organized by priority level"
              chartType="bar"
              data={DashboardDataTransforms.transformTasksByPriority(data.tasksByPriority)}
              loading={loading}
              exportable
            />
          </div>
        </div>
      )
    } catch (error) {
      // Track error and fallback to legacy
      MigrationAnalytics.trackError('PerformanceCharts', error as Error, userId)
      return renderLegacyCharts(data, loading)
    }
  }

  // Fallback to legacy chart implementation
  return renderLegacyCharts(data, loading)
}

function renderLegacyCharts(data: AnalyticsData, loading?: boolean) {
  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Trends Over Time</CardTitle>
          <CardDescription>Daily completed and failed tasks over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Legacy chart - {data.dailyTaskTrends.length} data points
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Migration utilities for admin controls
 */
export function getMigrationStatus() {
  const migration = DashboardMigration.getInstance()
  return migration.getMigrationStatus()
}

export function updateMigrationConfig(config: any) {
  const migration = DashboardMigration.getInstance()
  migration.updateConfig(config)
}