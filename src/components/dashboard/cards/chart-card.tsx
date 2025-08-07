import React, { Suspense, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { DashboardCard } from './dashboard-card'
import { FilterableChart } from '../filters/filterable-chart'
import { ChartWrapper } from '../charts/chart-wrapper'
import { useCrossCardFiltering } from '../filters/filter-synchronizer'
import { Download, Filter, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChartCardProps, ChartDataPoint, LegendItem, FilterValue } from '@/types/dashboard'

interface EnhancedChartCardProps extends ChartCardProps {
  // Enhanced filtering props
  enableCrossCardFiltering?: boolean
  filterMappings?: {
    dataClick?: (dataPoint: ChartDataPoint) => Record<string, FilterValue>
    legendClick?: (legendItem: LegendItem) => Record<string, FilterValue>
  }
  // Export props
  exportFilename?: string
  onExportStart?: (format: string) => void
  onExportComplete?: (format: string) => void
  onExportError?: (error: Error, format: string) => void
}

export function ChartCard({
  title,
  subtitle,
  icon,
  chartType,
  data,
  chartConfig,
  exportable = false,
  filterable = false,
  enableCrossCardFiltering = true,
  filterMappings,
  exportFilename,
  onExportStart,
  onExportComplete,
  onExportError,
  children,
  actions,
  loading = false,
  error,
  className,
  size = 'md',
  priority = 'medium',
  interactive = true,
  onClick,
  onFilter,
}: EnhancedChartCardProps) {
  // Handle chart data clicks for filtering
  const handleDataClick = useCallback((dataPoint: ChartDataPoint) => {
    if (onFilter) {
      // Create a filter based on the clicked data point
      const filterValue: FilterValue = {
        type: 'string',
        value: dataPoint.label || dataPoint.x?.toString() || '',
        operator: 'equals'
      }
      onFilter(filterValue)
    }
  }, [onFilter])

  // Handle legend clicks for filtering
  const handleLegendClick = useCallback((legendItem: LegendItem) => {
    if (onFilter) {
      // Create a filter based on the clicked legend item
      const filterValue: FilterValue = {
        type: 'string',
        value: legendItem.label,
        operator: 'equals'
      }
      onFilter(filterValue)
    }
  }, [onFilter])

  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    onExportStart?.(format)
    // TODO: Implement chart export functionality
    console.log(`Exporting chart as ${format}`)
    onExportComplete?.(format)
  }

  const handleFilter = () => {
    if (onFilter) {
      // Create a generic filter for the chart
      onFilter({
        type: 'string',
        value: title || 'chart',
        operator: 'equals'
      })
    }
  }

  const renderChartActions = () => {
    if (!exportable && !filterable && !actions) return null

    const chartActions = (
      <div className="flex items-center space-x-2">
        {filterable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFilter}
            className="h-8 w-8 p-0"
            aria-label="Filter chart data"
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
        
        {exportable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Export chart"
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('png')}>
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('svg')}>
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {actions && (
          <>
            {(exportable || filterable) && (
              <div className="w-px h-4 bg-border" />
            )}
            {actions}
          </>
        )}
      </div>
    )

    return chartActions
  }

  const renderChart = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="flex justify-center space-x-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <div className="text-center">
            <p className="text-sm font-medium">Unable to load chart</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )
    }

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        {enableCrossCardFiltering ? (
          <FilterableChart
            type={chartType}
            data={data}
            config={chartConfig}
            className="chart-card-wrapper"
            interactive={interactive}
            exportable={exportable}
            exportFilename={exportFilename || title || 'chart'}
            enableFiltering={filterable}
            filterMappings={filterMappings}
            onDataClick={handleDataClick}
            onLegendClick={handleLegendClick}
            onExportStart={onExportStart}
            onExportComplete={onExportComplete}
            onExportError={onExportError}
          />
        ) : (
          <ChartWrapper
            type={chartType}
            data={data}
            config={chartConfig}
            className="chart-card-wrapper"
            interactive={interactive}
            exportable={exportable}
            exportFilename={exportFilename || title || 'chart'}
            onDataClick={handleDataClick}
            onLegendClick={handleLegendClick}
            onExportStart={onExportStart}
            onExportComplete={onExportComplete}
            onExportError={onExportError}
          />
        )}
      </Suspense>
    )
  }

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={renderChartActions()}
      loading={false} // Handle loading internally
      error={undefined} // Handle error internally
      className={cn('chart-card', className)}
      size={size}
      priority={priority}
      interactive={false} // Chart handles its own interactivity
      onClick={onClick}
      onFilter={onFilter}
    >
      <div className="chart-card-content">
        {renderChart()}
        {children}
      </div>
    </DashboardCard>
  )
}