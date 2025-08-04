import React, { Suspense } from 'react'
import { cn } from '@/lib/utils'

type ChartType = 'line' | 'bar' | 'pie' | 'heatmap' | 'area' | 'scatter'

interface ChartWrapperProps {
  type: ChartType
  data: ChartData
  config?: ChartConfiguration
  loading?: boolean
  error?: string
  height?: number
  responsive?: boolean
  interactive?: boolean
  exportable?: boolean
  onDataClick?: (data: ChartDataPoint) => void
  onLegendClick?: (legendItem: LegendItem) => void
  className?: string
}

interface ChartConfiguration {
  colors?: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
  }
  legend?: {
    show: boolean
    position: 'top' | 'bottom' | 'left' | 'right'
    align: 'start' | 'center' | 'end'
  }
  tooltip?: {
    show: boolean
    format?: (value: any) => string
    customContent?: React.ComponentType<TooltipProps>
  }
  axes?: {
    x?: AxisConfiguration
    y?: AxisConfiguration
  }
  animations?: {
    enabled: boolean
    duration: number
    easing: string
  }
  responsive?: {
    breakpoints: Record<string, Partial<ChartConfiguration>>
  }
}

interface ChartData {
  datasets: ChartDataset[]
  labels?: string[]
  metadata?: Record<string, any>
}

interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  color?: string
  type?: ChartType
  options?: Record<string, any>
}

interface ChartDataPoint {
  x?: string | number
  y?: string | number
  value?: string | number
  label?: string
  color?: string
  metadata?: Record<string, any>
}

interface LegendItem {
  label: string
  color: string
  visible: boolean
}

interface TooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

interface AxisConfiguration {
  show: boolean
  label?: string
  format?: (value: any) => string
  domain?: [number, number]
}

export function ChartWrapper({
  type,
  data,
  config,
  loading = false,
  error,
  height = 300,
  responsive = true,
  interactive = true,
  exportable = false,
  onDataClick,
  onLegendClick,
  className,
}: ChartWrapperProps) {
  if (loading) {
    return (
      <div
        className={cn('chart-wrapper chart-loading', className)}
        style={{ height: `${height}px` }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn('chart-wrapper chart-error', className)}
        style={{ height: `${height}px` }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('chart-wrapper', className)}
      style={{ height: responsive ? 'auto' : `${height}px` }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        }
      >
        <div className="chart-container">
          {/* Chart component will be dynamically loaded here */}
          <div className="text-center text-muted-foreground p-8">
            Chart component for {type} will be implemented in subsequent tasks
          </div>
        </div>
      </Suspense>
    </div>
  )
}