import React from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type {
  ChartData,
  ChartConfiguration,
  ChartDataPoint,
  LegendItem,
} from '@/types/dashboard'

interface PieChartProps {
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

export function PieChart({
  data,
  config,
  height,
  responsive,
  interactive,
  onDataClick,
  onLegendClick,
  colors,
}: PieChartProps) {
  // Transform data for Recharts pie chart format
  const chartData = React.useMemo(() => {
    if (!data.datasets || data.datasets.length === 0) return []

    // For pie charts, we typically use the first dataset
    const dataset = data.datasets[0]
    if (!dataset) return []

    return dataset.data.map((point, index) => ({
      name: point.label || point.x?.toString() || `Item ${index + 1}`,
      value: point.value || point.y || 0,
      color: point.color || colors[index % colors.length],
      originalData: point,
    }))
  }, [data, colors])

  // Handle pie slice click
  const handleSliceClick = (
    data: any,
    index: number,
    event?: React.MouseEvent
  ) => {
    if (!interactive || !onDataClick) return

    const totalValue = chartData.reduce((sum, item) => sum + Number(item.value), 0)
    const percentage =
      totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : '0'

    const chartDataPoint: ChartDataPoint = {
      x: data.name,
      y: data.value,
      value: data.value,
      label: data.name,
      color: data.color,
      metadata: {
        ...data.originalData?.metadata,
        category: data.name,
        percentage,
        index,
        chartType: 'pie',
        totalValue,
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
        category: data.value,
        chartType: 'pie',
        index,
      },
    }
    onLegendClick(legendItem)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0]
    const percentage = (
      (Number(data.value) / chartData.reduce((sum, item) => sum + Number(item.value), 0)) *
      100
    ).toFixed(1)

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-medium text-foreground">{data.name}</span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Value:{' '}
          <span className="font-medium text-foreground">
            {config.tooltip?.format
              ? config.tooltip.format(data.value)
              : data.value}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Percentage:{' '}
          <span className="font-medium text-foreground">{percentage}%</span>
        </div>
      </div>
    )
  }

  // Custom label renderer
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices smaller than 5%

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    if (!config.legend?.show) return null

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-sm ${
              interactive ? 'cursor-pointer hover:opacity-80' : ''
            }`}
            onClick={() => handleLegendClick(entry, index)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  const containerHeight = responsive ? height : height

  return (
    <ResponsiveContainer width="100%" height={containerHeight}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={Math.min(containerHeight * 0.35, 120)}
          fill="#8884d8"
          dataKey="value"
          onClick={
            interactive
              ? (data, index, event) => handleSliceClick(data, index, event)
              : undefined
          }
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          animationDuration={
            config.animations?.enabled ? config.animations.duration : 0
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {config.tooltip?.show && <Tooltip content={<CustomTooltip />} />}
        {config.legend?.show && <Legend content={<CustomLegend />} />}
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
