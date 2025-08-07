import React, { Suspense, lazy, useMemo, useRef, useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChartExportControls } from './chart-export-controls'
import { KeyboardNavigation } from '../accessibility/keyboard-navigation'
import { useAriaLabels, AriaDescription } from '../accessibility/aria-labels'
import { useScreenReaderAnnouncer, DataAnnouncer, ChartAnnouncer } from '../accessibility/screen-reader-announcer'
import { TouchInteraction, useIsTouchDevice, useIsMobile } from '../mobile/touch-interactions'
import { ChartMobileTooltip } from '../mobile/mobile-tooltip'
import type {
  ChartType,
  ChartData,
  ChartConfiguration,
  ChartDataPoint,
  LegendItem,
  TooltipProps,
  AxisConfiguration,
} from '@/types/dashboard'

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
  exportFilename?: string
  onDataClick?: (data: ChartDataPoint) => void
  onLegendClick?: (legendItem: LegendItem) => void
  onExportStart?: (format: string) => void
  onExportComplete?: (format: string) => void
  onExportError?: (error: Error, format: string) => void
  className?: string
}

// Import dynamic chart components
import { ChartBundle, trackDynamicImportPerformance } from '../performance/dynamic-imports'

const { LineChart: LazyLineChart, BarChart: LazyBarChart, PieChart: LazyPieChart, HeatmapChart: LazyHeatmapChart } = ChartBundle

// Default color palette following Cubcen brand colors
const DEFAULT_COLORS = {
  primary: '#3F51B5',
  secondary: '#B19ADA',
  accent: '#FF6B35',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}

// Default chart color palette
const DEFAULT_CHART_PALETTE = [
  '#3F51B5', // Primary
  '#B19ADA', // Secondary
  '#FF6B35', // Accent
  '#10B981', // Success
  '#F59E0B', // Warning
  '#EF4444', // Error
  '#3B82F6', // Info
  '#8B5CF6', // Purple
]

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
  exportFilename = 'chart',
  onDataClick,
  onLegendClick,
  onExportStart,
  onExportComplete,
  onExportError,
  className,
}: ChartWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const focusedElementRef = useRef<number>(0)
  const [selectedElement, setSelectedElement] = useState<any>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [tooltipData, setTooltipData] = useState<any>(null)
  
  const ariaLabels = useAriaLabels()
  const { announceChartInteraction } = useScreenReaderAnnouncer()
  const isTouchDevice = useIsTouchDevice()
  const isMobile = useIsMobile()
  
  // Generate unique IDs for ARIA relationships
  const chartId = React.useId()
  const titleId = `${chartId}-title`
  const descriptionId = `${chartId}-description`
  const instructionsId = `${chartId}-instructions`

  // Track chart load completion
  useEffect(() => {
    const performanceTracker = trackDynamicImportPerformance(`${type}-chart`)
    performanceTracker.end()
  }, [type])
  // Memoize the merged configuration with sensible defaults
  const mergedConfig = useMemo((): ChartConfiguration => ({
    colors: {
      ...DEFAULT_COLORS,
      ...config?.colors,
    },
    legend: {
      show: true,
      position: 'bottom',
      align: 'center',
      ...config?.legend,
    },
    tooltip: {
      show: true,
      ...config?.tooltip,
    },
    axes: {
      x: {
        show: true,
        ...config?.axes?.x,
      },
      y: {
        show: true,
        ...config?.axes?.y,
      },
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-out',
      ...config?.animations,
    },
    responsive: config?.responsive,
  }), [config])

  // Memoize chart colors based on data
  const chartColors = useMemo(() => {
    if (!data?.datasets) return DEFAULT_CHART_PALETTE

    return data.datasets.map((dataset, index) => 
      dataset.color || DEFAULT_CHART_PALETTE[index % DEFAULT_CHART_PALETTE.length]
    )
  }, [data])

  // Handle keyboard navigation for chart elements
  const handleChartKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!interactive) return

    const { key } = event
    const chartElements = chartRef.current?.querySelectorAll('[data-chart-element]')
    
    if (!chartElements || chartElements.length === 0) return

    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusedElementRef.current = (focusedElementRef.current + 1) % chartElements.length
        ;(chartElements[focusedElementRef.current] as HTMLElement).focus()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusedElementRef.current = focusedElementRef.current === 0 
          ? chartElements.length - 1 
          : focusedElementRef.current - 1
        ;(chartElements[focusedElementRef.current] as HTMLElement).focus()
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        const activeElement = chartElements[focusedElementRef.current] as HTMLElement
        if (activeElement) {
          activeElement.click()
        }
        break
      case 'Home':
        event.preventDefault()
        focusedElementRef.current = 0
        ;(chartElements[0] as HTMLElement).focus()
        break
      case 'End':
        event.preventDefault()
        focusedElementRef.current = chartElements.length - 1
        ;(chartElements[chartElements.length - 1] as HTMLElement).focus()
        break
    }
  }, [interactive])

  // Handle chart element click with keyboard support
  const handleChartElementClick = useCallback((dataPoint: ChartDataPoint, index: number) => {
    focusedElementRef.current = index
    setSelectedElement(dataPoint)
    
    // Announce interaction to screen readers
    announceChartInteraction(
      'Selected',
      'data point',
      dataPoint.value || dataPoint.y,
      `${type} chart`
    )
    
    onDataClick?.(dataPoint)
  }, [onDataClick, type, announceChartInteraction])

  // Handle legend click with keyboard support
  const handleLegendClick = useCallback((legendItem: LegendItem, index: number) => {
    // Announce legend interaction
    announceChartInteraction(
      'Toggled',
      'legend item',
      legendItem.label,
      `${type} chart`
    )
    
    onLegendClick?.(legendItem)
  }, [onLegendClick, type, announceChartInteraction])

  // Handle touch interactions for charts
  const handleChartTap = useCallback((event: TouchEvent) => {
    // For touch devices, show tooltip data on tap
    if (selectedElement) {
      setTooltipData(selectedElement)
    }
  }, [selectedElement])

  const handleChartPinchZoom = useCallback((scale: number, event: TouchEvent) => {
    // Handle pinch-to-zoom for charts
    const newZoomLevel = Math.max(0.5, Math.min(3, zoomLevel * scale))
    setZoomLevel(newZoomLevel)
    
    // Announce zoom level change
    announceChartInteraction(
      'Zoomed',
      'chart',
      `${Math.round(newZoomLevel * 100)}%`,
      `${type} chart`
    )
  }, [zoomLevel, type, announceChartInteraction])

  const handleChartSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    // Handle swipe gestures for chart navigation
    announceChartInteraction(
      'Swiped',
      'chart',
      direction,
      `${type} chart`
    )
  }, [type, announceChartInteraction])

  // Generate chart title for accessibility
  const getChartTitle = () => {
    const datasetLabel = data?.datasets?.[0]?.label
    return datasetLabel || `${type} chart`
  }

  // Generate chart description for accessibility
  const getChartDescription = () => {
    const datasetCount = data?.datasets?.length || 0
    const dataPointCount = data?.datasets?.[0]?.data?.length || 0
    
    let description = `${type} chart`
    if (datasetCount > 0) {
      description += ` with ${datasetCount} dataset${datasetCount !== 1 ? 's' : ''}`
    }
    if (dataPointCount > 0) {
      description += ` and ${dataPointCount} data point${dataPointCount !== 1 ? 's' : ''}`
    }
    
    return description
  }

  // Loading state
  if (loading) {
    return (
      <div
        className={cn('chart-wrapper chart-loading', className)}
        style={{ height: `${height}px` }}
        role="status"
        aria-label={ariaLabels.chart.loading(type)}
        aria-describedby={descriptionId}
      >
        <AriaDescription id={descriptionId}>
          {`${type} chart is currently loading data`}
        </AriaDescription>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn('chart-wrapper chart-error', className)}
        style={{ height: `${height}px` }}
        role="alert"
        aria-label={ariaLabels.chart.error(type, error)}
        aria-describedby={descriptionId}
      >
        <AriaDescription id={descriptionId}>
          {`${type} chart failed to load: ${error}`}
        </AriaDescription>
        <div className="flex items-center justify-center h-full">
          <div className="text-destructive text-sm">{error}</div>
        </div>
      </div>
    )
  }

  // No data state
  if (!data?.datasets || data.datasets.length === 0) {
    return (
      <div
        className={cn('chart-wrapper chart-empty', className)}
        style={{ height: `${height}px` }}
        role="img"
        aria-label={ariaLabels.chart.noData(type)}
        aria-describedby={descriptionId}
      >
        <AriaDescription id={descriptionId}>
          {`${type} chart has no data to display`}
        </AriaDescription>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground text-sm">No data available</div>
        </div>
      </div>
    )
  }

  // Render appropriate chart component with performance tracking
  const renderChart = () => {
    const commonProps = {
      data,
      config: mergedConfig,
      height,
      responsive,
      interactive,
      exportable,
      onDataClick: handleChartElementClick,
      onLegendClick: handleLegendClick,
      colors: chartColors,
      // Mobile-specific props
      isTouchDevice,
      isMobile,
      zoomLevel: isTouchDevice ? zoomLevel : 1,
    }



    switch (type) {
      case 'line':
        return <LazyLineChart {...commonProps} />
      case 'bar':
        return <LazyBarChart {...commonProps} />
      case 'pie':
        return <LazyPieChart {...commonProps} />
      case 'heatmap':
        return <LazyHeatmapChart {...commonProps} />
      case 'area':
        return <LazyLineChart {...commonProps} area />
      case 'scatter':
        return <LazyLineChart {...commonProps} scatter />
      default:
        return (
          <div className="text-center text-muted-foreground p-8">
            Unsupported chart type: {type}
          </div>
        )
    }
  }

  const chartContainer = (
    <div
      data-chart-container
      onKeyDown={handleChartKeyDown}
      tabIndex={interactive ? 0 : -1}
      role={interactive ? 'application' : 'img'}
      aria-label={ariaLabels.chart.container(type, getChartTitle())}
      aria-labelledby={titleId}
      aria-describedby={`${descriptionId} ${interactive ? instructionsId : ''}`}
      style={{
        transform: isTouchDevice ? `scale(${zoomLevel})` : undefined,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* Chart title for screen readers */}
      <AriaDescription id={titleId}>
        {getChartTitle()}
      </AriaDescription>
      
      {/* Chart description for screen readers */}
      <AriaDescription id={descriptionId}>
        {getChartDescription()}
      </AriaDescription>

      {/* Screen reader instructions for interactive charts */}
      {interactive && (
        <AriaDescription id={instructionsId}>
          {isTouchDevice 
            ? 'Interactive chart. Tap to select elements, pinch to zoom, swipe to navigate.'
            : 'Interactive chart. Use arrow keys to navigate chart elements, Enter or Space to select, Home and End to go to first and last elements.'
          }
        </AriaDescription>
      )}

      {/* Export Controls */}
      {exportable && (
        <div className="absolute top-2 right-2 z-10">
          <ChartExportControls
            chartRef={chartRef}
            filename={exportFilename}
            onExportStart={onExportStart}
            onExportComplete={onExportComplete}
            onExportError={onExportError}
          />
        </div>
      )}

      <Suspense
        fallback={
          <div 
            className="flex items-center justify-center h-full"
            style={{ height: `${height}px` }}
            role="status"
            aria-label="Loading chart"
          >
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        }
      >
        <div 
          ref={chartRef}
          className="chart-container w-full h-full"
        >
          {renderChart()}
        </div>
      </Suspense>
    </div>
  )

  return (
    <DataAnnouncer
      data={data}
      dataType={`${type} chart`}
      loading={loading}
      error={error}
    >
      <ChartAnnouncer
        chartType={type}
        data={data}
        selectedElement={selectedElement}
      >
        <KeyboardNavigation
          className={cn(
            'chart-wrapper relative',
            // Mobile-specific styles
            isMobile && 'overflow-hidden',
            className
          )}
          style={{ height: responsive ? 'auto' : `${height}px` }}
        >
          {/* Wrap with touch interactions for touch devices */}
          {isTouchDevice && interactive ? (
            <TouchInteraction
              onTap={handleChartTap}
              onPinchZoom={handleChartPinchZoom}
              onSwipeLeft={() => handleChartSwipe('left')}
              onSwipeRight={() => handleChartSwipe('right')}
              onSwipeUp={() => handleChartSwipe('up')}
              onSwipeDown={() => handleChartSwipe('down')}
              className="chart-touch-wrapper w-full h-full"
            >
              {tooltipData ? (
                <ChartMobileTooltip
                  data={tooltipData}
                  side="top"
                  tapToShow={true}
                  tapToHide={true}
                >
                  {chartContainer}
                </ChartMobileTooltip>
              ) : (
                chartContainer
              )}
            </TouchInteraction>
          ) : (
            chartContainer
          )}
        </KeyboardNavigation>
      </ChartAnnouncer>
    </DataAnnouncer>
  )
}