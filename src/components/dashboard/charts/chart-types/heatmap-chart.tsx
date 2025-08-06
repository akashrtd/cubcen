import React from 'react'
import { ResponsiveContainer } from 'recharts'
import type { ChartData, ChartConfiguration, ChartDataPoint, LegendItem } from '@/types/dashboard'

interface HeatmapChartProps {
  data: ChartData
  config: ChartConfiguration
  height: number
  responsive: boolean
  interactive: boolean
  exportable: boolean
  onDataClick?: (data: ChartDataPoint) => void
  onLegendClick?: (legendItem: LegendItem) => void
  colors: string[]
}

interface HeatmapCell {
  x: string | number
  y: string | number
  value: number
  color: string
  originalData: ChartDataPoint
}

export function HeatmapChart({
  data,
  config,
  height,
  responsive,
  interactive,
  onDataClick,
  onLegendClick,
  colors,
}: HeatmapChartProps) {
  // Transform data for heatmap format
  const { heatmapData, xLabels, yLabels, minValue, maxValue } = React.useMemo(() => {
    if (!data.datasets || data.datasets.length === 0) {
      return { heatmapData: [], xLabels: [], yLabels: [], minValue: 0, maxValue: 0 }
    }

    const allData: HeatmapCell[] = []
    const xSet = new Set<string | number>()
    const ySet = new Set<string | number>()
    let min = Infinity
    let max = -Infinity

    // Collect all data points
    data.datasets.forEach(dataset => {
      dataset.data.forEach(point => {
        if (point.x !== undefined && point.y !== undefined) {
          const value = point.value || 0
          xSet.add(point.x)
          ySet.add(point.y)
          min = Math.min(min, value)
          max = Math.max(max, value)
          
          allData.push({
            x: point.x,
            y: point.y,
            value,
            color: point.color || '',
            originalData: point,
          })
        }
      })
    })

    const xLabels = Array.from(xSet).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b
      return String(a).localeCompare(String(b))
    })

    const yLabels = Array.from(ySet).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b
      return String(a).localeCompare(String(b))
    })

    return {
      heatmapData: allData,
      xLabels,
      yLabels,
      minValue: min === Infinity ? 0 : min,
      maxValue: max === -Infinity ? 0 : max,
    }
  }, [data])

  // Generate color based on value
  const getColorForValue = (value: number): string => {
    if (maxValue === minValue) return colors[0] || '#3F51B5'
    
    const normalizedValue = (value - minValue) / (maxValue - minValue)
    
    // Use a gradient from light to dark based on the primary color
    const baseColor = colors[0] || '#3F51B5'
    const opacity = 0.2 + (normalizedValue * 0.8) // Range from 0.2 to 1.0
    
    // Convert hex to rgba
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Handle cell click
  const handleCellClick = (cell: HeatmapCell) => {
    if (!interactive || !onDataClick) return
    
    const chartDataPoint: ChartDataPoint = {
      x: cell.x,
      y: cell.y,
      value: cell.value,
      label: `${cell.x}, ${cell.y}`,
      metadata: cell.originalData.metadata,
    }
    onDataClick(chartDataPoint)
  }

  // Calculate cell dimensions
  const cellWidth = Math.max(40, (responsive ? 600 : 600) / Math.max(xLabels.length, 1))
  const cellHeight = Math.max(30, (height - 100) / Math.max(yLabels.length, 1))
  const chartWidth = cellWidth * xLabels.length + 100 // Add margin for labels
  const chartHeight = cellHeight * yLabels.length + 100 // Add margin for labels

  // Custom tooltip
  const [tooltip, setTooltip] = React.useState<{
    visible: boolean
    x: number
    y: number
    data: HeatmapCell | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  })

  const handleMouseEnter = (event: React.MouseEvent, cell: HeatmapCell) => {
    if (!config.tooltip?.show) return
    
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      data: cell,
    })
  }

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }

  const containerHeight = responsive ? Math.max(height, chartHeight) : height

  return (
    <div className="relative w-full" style={{ height: containerHeight }}>
      <ResponsiveContainer width="100%" height={containerHeight}>
        <div className="flex flex-col items-center">
          {/* Chart Title */}
          {data.metadata?.title && (
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {data.metadata.title}
            </h3>
          )}
          
          {/* Heatmap Grid */}
          <div className="relative">
            <svg
              width={chartWidth}
              height={chartHeight}
              className="overflow-visible"
            >
              {/* Y-axis labels */}
              {yLabels.map((yLabel, yIndex) => (
                <text
                  key={`y-${yIndex}`}
                  x={80}
                  y={90 + yIndex * cellHeight + cellHeight / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill="hsl(var(--muted-foreground))"
                >
                  {yLabel}
                </text>
              ))}
              
              {/* X-axis labels */}
              {xLabels.map((xLabel, xIndex) => (
                <text
                  key={`x-${xIndex}`}
                  x={90 + xIndex * cellWidth + cellWidth / 2}
                  y={80}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill="hsl(var(--muted-foreground))"
                  transform={`rotate(-45, ${90 + xIndex * cellWidth + cellWidth / 2}, 80)`}
                >
                  {xLabel}
                </text>
              ))}
              
              {/* Heatmap cells */}
              {yLabels.map((yLabel, yIndex) =>
                xLabels.map((xLabel, xIndex) => {
                  const cell = heatmapData.find(d => d.x === xLabel && d.y === yLabel)
                  const value = cell?.value || 0
                  const color = cell?.color || getColorForValue(value)
                  
                  return (
                    <rect
                      key={`cell-${xIndex}-${yIndex}`}
                      x={90 + xIndex * cellWidth}
                      y={90 + yIndex * cellHeight}
                      width={cellWidth - 1}
                      height={cellHeight - 1}
                      fill={color}
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                      style={{ cursor: interactive ? 'pointer' : 'default' }}
                      onClick={() => cell && handleCellClick(cell)}
                      onMouseEnter={(e) => cell && handleMouseEnter(e, cell)}
                      onMouseLeave={handleMouseLeave}
                    />
                  )
                })
              )}
            </svg>
          </div>
          
          {/* Color Legend */}
          {config.legend?.show && (
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm text-muted-foreground">
                {config.tooltip?.format ? config.tooltip.format(minValue) : minValue}
              </span>
              <div className="flex">
                {Array.from({ length: 10 }).map((_, index) => {
                  const value = minValue + (index / 9) * (maxValue - minValue)
                  return (
                    <div
                      key={index}
                      className="w-4 h-4"
                      style={{ backgroundColor: getColorForValue(value) }}
                    />
                  )
                })}
              </div>
              <span className="text-sm text-muted-foreground">
                {config.tooltip?.format ? config.tooltip.format(maxValue) : maxValue}
              </span>
            </div>
          )}
        </div>
      </ResponsiveContainer>
      
      {/* Custom Tooltip */}
      {tooltip.visible && tooltip.data && (
        <div
          className="absolute z-50 bg-background border border-border rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          <div className="text-sm">
            <div className="font-medium text-foreground">
              {tooltip.data.x} × {tooltip.data.y}
            </div>
            <div className="text-muted-foreground">
              Value: <span className="font-medium text-foreground">
                {config.tooltip?.format 
                  ? config.tooltip.format(tooltip.data.value) 
                  : tooltip.data.value
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}