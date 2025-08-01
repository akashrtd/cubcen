'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Activity, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Clock,
  Target,
  Zap
} from 'lucide-react'
import { AnalyticsData } from '@/services/analytics'

interface KPICardsProps {
  data: AnalyticsData
  loading?: boolean
}

export function KPICards({ data, loading }: KPICardsProps) {
  const kpis = [
    {
      title: 'Total Agents',
      value: data.totalAgents,
      icon: Users,
      description: `${data.activeAgents} active`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progress: data.totalAgents > 0 ? (data.activeAgents / data.totalAgents) * 100 : 0,
    },
    {
      title: 'Total Tasks',
      value: data.totalTasks,
      icon: Activity,
      description: 'All time',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Success Rate',
      value: `${data.successRate}%`,
      icon: Target,
      description: `${data.completedTasks} completed`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      progress: data.successRate,
    },
    {
      title: 'Failed Tasks',
      value: data.failedTasks,
      icon: XCircle,
      description: 'Needs attention',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Avg Response Time',
      value: `${data.averageResponseTime}ms`,
      icon: Clock,
      description: 'Performance metric',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Active Agents',
      value: data.activeAgents,
      icon: Zap,
      description: 'Currently running',
      color: 'text-cubcen-primary',
      bgColor: 'bg-cubcen-primary/10',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded w-20" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mb-2">
                {kpi.description}
              </p>
              
              {kpi.progress !== undefined && (
                <div className="space-y-1">
                  <Progress 
                    value={kpi.progress} 
                    className="h-1"
                    style={{
                      '--progress-background': kpi.color.replace('text-', 'bg-'),
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {/* Status badges for specific KPIs */}
              {kpi.title === 'Success Rate' && (
                <Badge 
                  variant={data.successRate >= 90 ? 'default' : data.successRate >= 70 ? 'secondary' : 'destructive'}
                  className="mt-2 text-xs"
                >
                  {data.successRate >= 90 ? 'Excellent' : data.successRate >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              )}

              {kpi.title === 'Active Agents' && (
                <Badge 
                  variant={data.activeAgents > 0 ? 'default' : 'secondary'}
                  className="mt-2 text-xs bg-cubcen-secondary text-white"
                >
                  {data.activeAgents > 0 ? 'Online' : 'Offline'}
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}