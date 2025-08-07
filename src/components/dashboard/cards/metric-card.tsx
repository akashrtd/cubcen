import React from 'react'
import { cn } from '@/lib/utils'
import { DashboardCard } from './dashboard-card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { MetricCardProps } from '@/types/dashboard'

export function MetricCard({
  title,
  subtitle,
  icon,
  metrics,
  layout = 'vertical',
  children,
  actions,
  loading = false,
  error,
  className,
  size = 'md',
  priority = 'medium',
  interactive = false,
  onClick,
  onFilter,
}: MetricCardProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      case 'neutral':
        return <Minus className="h-3 w-3" />
      default:
        return null
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const renderMetrics = () => {
    if (!metrics || metrics.length === 0) return null

    const layoutClasses = {
      horizontal: 'flex flex-row items-center justify-between gap-4 flex-wrap',
      vertical: 'flex flex-col space-y-4',
      grid: cn(
        'grid gap-4',
        metrics.length === 2 && 'grid-cols-2',
        metrics.length === 3 && 'grid-cols-3',
        metrics.length === 4 && 'grid-cols-2 sm:grid-cols-4',
        metrics.length > 4 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      ),
    }

    return (
      <div className={layoutClasses[layout]}>
        {metrics.map((metric, index) => (
          <div
            key={`${metric.label}-${index}`}
            className={cn(
              'flex flex-col',
              layout === 'horizontal' && 'flex-1 min-w-0',
              layout === 'grid' && 'text-center'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground truncate">
                {metric.label}
              </span>
              {metric.trend && metric.trendValue && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs',
                    getTrendColor(metric.trend)
                  )}
                  aria-label={`${metric.label} trend: ${metric.trend}, ${metric.trendValue}`}
                >
                  {getTrendIcon(metric.trend)}
                  {metric.trendValue}
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <span
                className={cn(
                  'text-xl font-bold',
                  layout === 'grid' && 'text-lg',
                  metric.color && `text-[${metric.color}]`
                )}
                style={metric.color ? { color: metric.color } : undefined}
              >
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-sm text-muted-foreground">
                  {metric.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={actions}
      loading={loading}
      error={error}
      className={cn('metric-card', className)}
      size={size}
      priority={priority}
      interactive={interactive}
      onClick={onClick}
      onFilter={onFilter}
    >
      {renderMetrics()}
      {children}
    </DashboardCard>
  )
}
