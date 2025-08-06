import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ChartData, ChartConfiguration, ChartDataPoint, LegendItem } from '@/types/dashboard'

interface BarChartProps {
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

export function BarChart({
  data,
  config,
  height,
  responsive,
  interactive,
  onDataClick,
  onLegendClick,
  colors,
}: BarChartProps) {
  // Transform data for Recharts format
  const chartData = React.useMemo(() => {
    if (!data.datasets || data.datasets.length === 0) return []

    // Get all unique x values (categories)
    const allXValues = new Set<string | number>()
    data.datasets.forEach(dataset => {
      dataset.data.forEach(point => {
        if (point.x !== undefined) allXValues.add(point.x)
      })
    })

    // Convert to array and sort
    const sortedXValues = Array.from(allXValues).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b
      return String(a).localeCompare(String(b))
    })

    // Create chart data points
    return sortedXValues.map(xValue => {
      const dataPoint: any = { x: xValue }
      
      data.datasets.forEach((dataset, index) => {
        const point = dataset.data.find(p => p.x === xValue)
        dataPoint[dataset.label] = point?.y || point?.value || 0
      })

      return dataPoint
    })
  }, [data])

  // Handle bar click
  const handleBarClick = (data: any, index: number, event?: React.MouseEvent) => {
    if (!interactive || !onDataClick) return
    
    // Find the clicked series from the event target or use first non-x key
    const clickedSeries = event?.currentTarget?.getAttribute('data-key') || 
                         Object.keys(data).find(key => key !== 'x') || ''
    
    const chartDataPoint: ChartDataPoint = {
      x: data.x,
      y: data[clickedSeries] || 0,
      value: data[clickedSeries] || 0,
      label: data.x?.toString(),
      metadata: {
        category: data.x,
        series: clickedSeries,
        index,
        chartType: 'bar',
        allData: data, // Include all data for advanced filtering
      },
    }
    onDataClick(chartDataPoint)
  }

  // Handle legend click
  const handleLegendClick = (data: any, index: number) => {
    if (!interactive || !onLegendClick) return
    
    const legendItem: LegendItem = {
      label: data.value,
      color: data.color,
      visible: true,
      metadata: {
        series: data.value,
        chartType: 'bar',
        index,
      },
    }
    onLegendClick(legendItem)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.dataKey}:</span>
            <span className="font-medium text-foreground">
              {config.tooltip?.format ? config.tooltip.format(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const containerHeight = responsive ? height : height

  return (
    <ResponsiveContainer width="100%" height={containerHeight}>
      <RechartsBarChart 
        data={chartData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {config.axes?.x?.show && (
          <XAxis 
            dataKey="x" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
        )}
        {config.axes?.y?.show && (
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={config.axes?.y?.format}
          />
        )}
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        {config.tooltip?.show && <Tooltip content={<CustomTooltip />} />}
        {config.legend?.show && (
          <Legend 
            onClick={interactive ? handleLegendClick : undefined}
            wrapperStyle={{ 
              paddingTop: '20px',
              cursor: interactive ? 'pointer' : 'default'
            }}
          />
        )}
        {data.datasets.map((dataset, index) => (
          <Bar
            key={dataset.label}
            dataKey={dataset.label}
            fill={colors[index]}
            onClick={interactive ? (data, index, event) => handleBarClick(data, index, event) : undefined}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            animationDuration={config.animations?.enabled ? config.animations.duration : 0}
            radius={[4, 4, 0, 0]} // Rounded top corners
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}