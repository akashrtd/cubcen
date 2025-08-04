import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardCardProps {
  title?: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  metric?: {
    value: string | number
    unit?: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
  }
  children?: React.ReactNode
  actions?: React.ReactNode
  loading?: boolean
  error?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  interactive?: boolean
  onClick?: () => void
  onFilter?: (filter: FilterValue) => void
}

interface FilterValue {
  type: 'string' | 'number' | 'date' | 'boolean' | 'array'
  value: any
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between'
}

export function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  metric,
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
}: DashboardCardProps) {
  const cardSizeClasses = {
    sm: 'dashboard-card-sm',
    md: 'dashboard-card-md',
    lg: 'dashboard-card-lg',
    xl: 'dashboard-card-xl',
  }

  const priorityClasses = {
    low: 'dashboard-card-priority-low',
    medium: 'dashboard-card-priority-medium',
    high: 'dashboard-card-priority-high',
    critical: 'dashboard-card-priority-critical',
  }

  if (loading) {
    return (
      <Card className={cn('dashboard-card', cardSizeClasses[size], className)}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('dashboard-card border-red-200', cardSizeClasses[size], className)}>
        <CardContent className="p-6">
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'dashboard-card',
        cardSizeClasses[size],
        priorityClasses[priority],
        interactive && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={interactive ? onClick : undefined}
    >
      {(title || subtitle || Icon || actions) && (
        <CardHeader className="dashboard-card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              <div>
                {title && <CardTitle className="dashboard-card-title">{title}</CardTitle>}
                {subtitle && <p className="dashboard-card-subtitle text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="dashboard-card-actions">{actions}</div>}
          </div>
        </CardHeader>
      )}
      
      <CardContent className="dashboard-card-content">
        {metric && (
          <div className="dashboard-card-metric mb-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
              {metric.trend && metric.trendValue && (
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    metric.trend === 'up' && 'bg-green-100 text-green-800',
                    metric.trend === 'down' && 'bg-red-100 text-red-800',
                    metric.trend === 'neutral' && 'bg-gray-100 text-gray-800'
                  )}
                >
                  {metric.trendValue}
                </span>
              )}
            </div>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}