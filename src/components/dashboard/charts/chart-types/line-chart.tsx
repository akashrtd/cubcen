import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
} from 'recharts'
import type {
  ChartData,
  ChartConfiguration,
  ChartDataPoint,
  LegendItem,
} from '@/types/dashboard'

interface LineChartProps {
  data: ChartData
  config: ChartConfiguration
  height: number
  responsive: boolean
  interactive: boolean
  exportable: boolean
  onDataClick?: (data: ChartDataPoint) => void
  onLegendClick?: (legendItem: LegendItem) => void
  colors: string[]
  area?: boolean
  scatter?: boolean
}

export function LineChart({
  data,
  config,
  height,
  responsive,
  interactive,
  onDataClick,
  onLegendClick,
  colors,
  area = false,
  scatter = false,
}: LineChartProps) {
  // Transform data for Recharts format
  const chartData = React.useMemo(() => {
    if (!data.datasets || data.datasets.length === 0) return []

    // Get all unique x values
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

  // Handle data point click
  const handleDataClick = (
    event: React.MouseEvent | any // recharts sometimes passes synthetic event, sometimes chart data
  ) => {
    if (!interactive || !onDataClick) return;

    // Try to extract chart data from event if possible
    let data: any = {};
    let index = 0;
    let clickedSeries = '';

    // If event has activePayload (recharts custom event)
    if (event && event.activePayload && Array.isArray(event.activePayload) && event.activePayload.length > 0) {
      data = event.activePayload[0].payload;
      clickedSeries = event.activePayload[0].dataKey || '';
      index = event.activeTooltipIndex || 0;
    } else if (event && event.payload) {
      // For some recharts events
      data = event.payload;
      clickedSeries = event.dataKey || '';
      index = event.index || 0;
    } else if (event && event.currentTarget) {
      // Fallback: try to get data-key from DOM
      clickedSeries = event.currentTarget.getAttribute('data-key') || '';
    }

    const chartDataPoint: ChartDataPoint = {
      x: data.x,
      y: data.value || (clickedSeries && data[clickedSeries]) || 0,
      value: data.value || (clickedSeries && data[clickedSeries]) || 0,
      label: data.x?.toString(),
      metadata: {
        category: data.x,
        series: clickedSeries,
        index,
        chartType: area ? 'area' : scatter ? 'scatter' : 'line',
        allData: data,
      },
    };
    onDataClick(chartDataPoint);
  };

  // Handle legend click
  const handleLegendClick = (data: any, index: number) => {
    if (!interactive || !onLegendClick) return

    const legendItem: LegendItem = {
      label: data.value,
      color: data.color,
      visible: true,
      metadata: {
        series: data.value,
        chartType: area ? 'area' : scatter ? 'scatter' : 'line',
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
              {config.tooltip?.format
                ? config.tooltip.format(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const containerHeight = responsive ? height : height

  if (scatter) {
    return (
      <ResponsiveContainer width="100%" height={containerHeight}>
        <ScatterChart
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
            />
          )}
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          {config.tooltip?.show && <Tooltip content={<CustomTooltip />} />}
          {config.legend?.show && (
            <Legend
              onClick={interactive ? handleLegendClick : undefined}
              wrapperStyle={{
                paddingTop: '20px',
                cursor: interactive ? 'pointer' : 'default',
              }}
            />
          )}
          {data.datasets.map((dataset, index) => (
            <Scatter
              key={dataset.label}
              dataKey={dataset.label}
              fill={colors[index]}
              onClick={
                interactive
                  ? handleDataClick
                  : undefined
              }
              style={{ cursor: interactive ? 'pointer' : 'default' }}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  if (area) {
    return (
      <ResponsiveContainer width="100%" height={containerHeight}>
        <AreaChart
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
            />
          )}
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          {config.tooltip?.show && <Tooltip content={<CustomTooltip />} />}
          {config.legend?.show && (
            <Legend
              onClick={interactive ? handleLegendClick : undefined}
              wrapperStyle={{
                paddingTop: '20px',
                cursor: interactive ? 'pointer' : 'default',
              }}
            />
          )}
          {data.datasets.map((dataset, index) => (
            <Area
              key={dataset.label}
              type="monotone"
              dataKey={dataset.label}
              stroke={colors[index]}
              fill={colors[index]}
              fillOpacity={0.3}
              strokeWidth={2}
              onClick={
                interactive
                  ? handleDataClick
                  : undefined
              }
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              animationDuration={
                config.animations?.enabled ? config.animations.duration : 0
              }
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={containerHeight}>
      <RechartsLineChart
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
          />
        )}
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        {config.tooltip?.show && <Tooltip content={<CustomTooltip />} />}
        {config.legend?.show && (
          <Legend
            onClick={interactive ? handleLegendClick : undefined}
            wrapperStyle={{
              paddingTop: '20px',
              cursor: interactive ? 'pointer' : 'default',
            }}
          />
        )}
        {data.datasets.map((dataset, index) => (
          <Line
            key={dataset.label}
            type="monotone"
            dataKey={dataset.label}
            stroke={colors[index]}
            strokeWidth={2}
            dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[index], strokeWidth: 2 }}
            onClick={
                interactive
                  ? handleDataClick
                  : undefined
            }
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            animationDuration={
              config.animations?.enabled ? config.animations.duration : 0
            }
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
