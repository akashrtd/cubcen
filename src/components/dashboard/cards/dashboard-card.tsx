import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAriaLabels, AriaDescription } from '../accessibility/aria-labels'
import { useScreenReaderAnnouncer } from '../accessibility/screen-reader-announcer'
import {
  TouchInteraction,
  useIsTouchDevice,
  useIsMobile,
} from '../mobile/touch-interactions'
import { MobileTooltip } from '../mobile/mobile-tooltip'
import type { DashboardCardProps, FilterValue } from '@/types/dashboard'

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
  const ariaLabels = useAriaLabels()
  const { announceError } = useScreenReaderAnnouncer()
  const isTouchDevice = useIsTouchDevice()
  const isMobile = useIsMobile()

  // Generate unique IDs for ARIA relationships
  const cardId = React.useId()
  const titleId = `${cardId}-title`
  const subtitleId = `${cardId}-subtitle`
  const metricId = `${cardId}-metric`
  const errorId = `${cardId}-error`
  const descriptionId = `${cardId}-description`
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (interactive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick?.()
    }
  }

  // Handle touch interactions
  const handleTouchTap = useCallback(
    (event: TouchEvent) => {
      if (interactive && onClick) {
        onClick()
      }
    },
    [interactive, onClick]
  )

  const handleTouchLongPress = useCallback(
    (event: TouchEvent) => {
      if (interactive && onFilter) {
        // Long press could trigger filter options
        onFilter({ type: 'string', value: title || 'card' })
      }
    },
    [interactive, onFilter, title]
  )

  // Generate comprehensive ARIA label
  const getAriaLabel = () => {
    if (loading) {
      return ariaLabels.card.loading(title)
    }

    if (error) {
      return ariaLabels.card.error(title, error)
    }

    if (interactive && title) {
      return ariaLabels.card.interactive(title)
    }

    if (metric && title) {
      return ariaLabels.card.metric(
        title,
        metric.value,
        metric.unit,
        metric.trend
      )
    }

    return title || 'Dashboard card'
  }

  // Announce errors to screen readers
  React.useEffect(() => {
    if (error) {
      announceError(error, title ? `${title} card` : 'Dashboard card')
    }
  }, [error, title, announceError])

  if (loading) {
    return (
      <Card
        className={cn('dashboard-card', cardSizeClasses[size], className)}
        role="status"
        aria-label={getAriaLabel()}
        aria-describedby={descriptionId}
      >
        <AriaDescription id={descriptionId}>
          {title ? `${title} card is loading` : 'Card content is loading'}
        </AriaDescription>
        <CardHeader className="dashboard-card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardHeader>
        <CardContent className="dashboard-card-content">
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card
        className={cn(
          'dashboard-card border-red-200 bg-red-50 dark:bg-red-950/20',
          cardSizeClasses[size],
          className
        )}
        role="alert"
        aria-label={getAriaLabel()}
        aria-describedby={errorId}
      >
        <AriaDescription id={errorId}>
          {title
            ? `${title} card has an error: ${error}`
            : `Card error: ${error}`}
        </AriaDescription>
        <CardContent className="dashboard-card-content">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const cardContent = (
    <Card
      className={cn(
        'dashboard-card',
        cardSizeClasses[size],
        priorityClasses[priority],
        interactive && [
          'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-all duration-200 ease-out',
          // Adjust hover effects for touch devices
          !isTouchDevice && 'hover:scale-[1.02]',
          // Touch-specific styles
          isTouchDevice && 'active:scale-[0.98] active:shadow-lg',
        ],
        // Mobile-specific optimizations
        isMobile && [
          'mb-4', // Add bottom margin for mobile stacking
          'mx-2', // Add horizontal margin for mobile
        ],
        className
      )}
      onClick={interactive && !isTouchDevice ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : 'region'}
      aria-label={getAriaLabel()}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={subtitle ? subtitleId : descriptionId}
    >
      <AriaDescription id={descriptionId}>
        {interactive
          ? 'Interactive dashboard card. Press Enter or Space to activate.'
          : 'Dashboard card with information display.'}
      </AriaDescription>
      {(title || subtitle || Icon || actions) && (
        <CardHeader className="dashboard-card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {Icon && (
                <Icon
                  className="h-5 w-5 text-muted-foreground flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <CardTitle
                    id={titleId}
                    className="dashboard-card-title text-base font-semibold leading-tight"
                  >
                    {title}
                  </CardTitle>
                )}
                {subtitle && (
                  <p
                    id={subtitleId}
                    className="dashboard-card-subtitle text-sm text-muted-foreground mt-1 truncate"
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="dashboard-card-actions flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="dashboard-card-content">
        {metric && (
          <div
            id={metricId}
            className="dashboard-card-metric mb-4"
            role="group"
            aria-label={ariaLabels.card.metric(
              title || 'Metric',
              metric.value,
              metric.unit,
              metric.trend
            )}
          >
            <div className="flex items-baseline space-x-2 flex-wrap">
              <span
                className="text-2xl font-bold text-foreground"
                aria-label={`Value: ${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`}
              >
                {metric.value}
              </span>
              {metric.unit && (
                <span
                  className="text-sm text-muted-foreground"
                  aria-label={`Unit: ${metric.unit}`}
                >
                  {metric.unit}
                </span>
              )}
              {metric.trend && metric.trendValue && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium',
                    metric.trend === 'up' &&
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    metric.trend === 'down' &&
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    metric.trend === 'neutral' &&
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  )}
                  role="img"
                  aria-label={`Trend: ${metric.trend === 'up' ? 'increasing' : metric.trend === 'down' ? 'decreasing' : 'stable'} by ${metric.trendValue}`}
                >
                  {getTrendIcon(metric.trend)}
                  <span aria-hidden="true">{metric.trendValue}</span>
                </span>
              )}
            </div>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )

  // Wrap with touch interactions for touch devices
  if (interactive && isTouchDevice) {
    return (
      <TouchInteraction
        onTap={handleTouchTap}
        onLongPress={handleTouchLongPress}
        className="dashboard-card-touch-wrapper"
      >
        {cardContent}
      </TouchInteraction>
    )
  }

  return cardContent
}
