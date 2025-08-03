'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AnalyticsData } from '@/services/analytics'
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react'

interface PerformanceChartsProps {
  data: AnalyticsData
  loading?: boolean
}

const COLORS = {
  primary: '#3F51B5',
  secondary: '#B19ADA',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
}

const STATUS_COLORS = {
  COMPLETED: COLORS.success,
  FAILED: COLORS.error,
  PENDING: COLORS.warning,
  RUNNING: COLORS.info,
  CANCELLED: '#9E9E9E',
}

const PRIORITY_COLORS = {
  CRITICAL: COLORS.error,
  HIGH: COLORS.warning,
  MEDIUM: COLORS.primary,
  LOW: COLORS.info,
}

export function PerformanceCharts({ data, loading }: PerformanceChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Validate data to prevent runtime errors
  if (!data || typeof data !== 'object') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No chart data available</p>
        </CardContent>
      </Card>
    )
  }

  // Ensure required data arrays exist and have valid structure
  const safeData = {
    dailyTaskTrends: Array.isArray(data.dailyTaskTrends) ? data.dailyTaskTrends : [],
    tasksByStatus: Array.isArray(data.tasksByStatus) ? data.tasksByStatus : [],
    tasksByPriority: Array.isArray(data.tasksByPriority) ? data.tasksByPriority : [],
    platformDistribution: Array.isArray(data.platformDistribution) ? data.platformDistribution : [],
    agentPerformance: Array.isArray(data.agentPerformance) ? data.agentPerformance : [],
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Daily Task Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-cubcen-primary" />
            Task Trends Over Time
          </CardTitle>
          <CardDescription>
            Daily completed and failed tasks over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={safeData.dailyTaskTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={value => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke={COLORS.success}
                fill={COLORS.success}
                fillOpacity={0.6}
                name="Completed Tasks"
              />
              <Area
                type="monotone"
                dataKey="failed"
                stackId="1"
                stroke={COLORS.error}
                fill={COLORS.error}
                fillOpacity={0.6}
                name="Failed Tasks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-cubcen-secondary" />
              Task Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of tasks by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={safeData.tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {safeData.tasksByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        STATUS_COLORS[
                          entry.status as keyof typeof STATUS_COLORS
                        ] || COLORS.primary
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {safeData.tasksByStatus.map((item, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  style={{
                    borderColor:
                      STATUS_COLORS[
                        item.status as keyof typeof STATUS_COLORS
                      ] || COLORS.primary,
                    color:
                      STATUS_COLORS[
                        item.status as keyof typeof STATUS_COLORS
                      ] || COLORS.primary,
                  }}
                >
                  {item.status}: {item.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-cubcen-primary" />
              Task Priority Distribution
            </CardTitle>
            <CardDescription>Tasks organized by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={safeData.tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                >
                  {safeData.tasksByPriority.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        PRIORITY_COLORS[
                          entry.priority as keyof typeof PRIORITY_COLORS
                        ] || COLORS.primary
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {safeData.tasksByPriority.map((item, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  style={{
                    borderColor:
                      PRIORITY_COLORS[
                        item.priority as keyof typeof PRIORITY_COLORS
                      ] || COLORS.primary,
                    color:
                      PRIORITY_COLORS[
                        item.priority as keyof typeof PRIORITY_COLORS
                      ] || COLORS.primary,
                  }}
                >
                  {item.priority}: {item.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-cubcen-secondary" />
              Platform Distribution
            </CardTitle>
            <CardDescription>
              Agents distributed across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={safeData.platformDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="platform" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill={COLORS.secondary}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-cubcen-primary" />
              Top Performing Agents
            </CardTitle>
            <CardDescription>Agents with highest success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeData.agentPerformance
                .sort((a, b) => b.successRate - a.successRate)
                .slice(0, 5)
                .map((agent, index) => (
                  <div
                    key={agent.agentId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {agent.agentName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {agent.totalTasks} tasks • {agent.averageResponseTime}ms
                        avg
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          agent.successRate >= 90
                            ? 'default'
                            : agent.successRate >= 70
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="text-xs"
                      >
                        {agent.successRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              {safeData.agentPerformance.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No agent performance data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
