'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bot,
  Activity,
  Settings,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Wrench,
  Server,
  Database,
  Network,
  RefreshCw,
  Edit,
  Trash2,
  Play,
  Square,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from './agent-list'

export interface AgentDetailViewProps {
  agent: Agent | null
  loading?: boolean
  onEdit?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  onStart?: (agent: Agent) => void
  onStop?: (agent: Agent) => void
  onRestart?: (agent: Agent) => void
  onRefresh?: (agent: Agent) => Promise<void>
  className?: string
}

const statusConfig = {
  ACTIVE: {
    label: 'Active',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  INACTIVE: {
    label: 'Inactive',
    icon: Pause,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  ERROR: {
    label: 'Error',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    icon: Wrench,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
}

const healthConfig = {
  healthy: {
    label: 'Healthy',
    color: 'text-green-600',
    progress: 100,
    description: 'Agent is operating normally',
  },
  degraded: {
    label: 'Degraded',
    color: 'text-yellow-600',
    progress: 60,
    description: 'Agent has some performance issues',
  },
  unhealthy: {
    label: 'Unhealthy',
    color: 'text-red-600',
    progress: 20,
    description: 'Agent is experiencing critical issues',
  },
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AgentDetailView({
  agent,
  loading = false,
  onEdit,
  onDelete,
  onStart,
  onStop,
  onRestart,
  onRefresh,
  className,
}: AgentDetailViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (agent && onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh(agent)
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const formatLastCheck = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`

    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  const getUptimeStats = () => {
    // This would be calculated from actual uptime data
    // For now, we'll simulate based on health status
    if (!agent) return { uptime: 0, downtime: 0, availability: 0 }

    if (agent.healthStatus.status === 'healthy') {
      return { uptime: 99.9, downtime: 0.1, availability: 99.9 }
    } else if (agent.healthStatus.status === 'degraded') {
      return { uptime: 95.5, downtime: 4.5, availability: 95.5 }
    } else {
      return { uptime: 85.2, downtime: 14.8, availability: 85.2 }
    }
  }

  if (loading) {
    return (
      <div className={className}>
        <LoadingSkeleton />
      </div>
    )
  }

  if (!agent) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Agent Selected</h3>
          <p className="text-muted-foreground text-center">
            Select an agent from the list to view its details.
          </p>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = statusConfig[agent.status]
  const healthInfo = healthConfig[agent.healthStatus.status]
  const StatusIcon = statusInfo.icon
  const uptimeStats = getUptimeStats()

  return (
    <div className={cn('space-y-6', className)}>
      {/* Agent Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <StatusIcon className={cn('h-8 w-8', statusInfo.color)} />
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {agent.name}
                  </CardTitle>
                  {agent.description && (
                    <p className="text-muted-foreground mt-1">
                      {agent.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-sm',
                    statusInfo.color,
                    statusInfo.bgColor,
                    statusInfo.borderColor,
                    'border-2'
                  )}
                >
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusInfo.label}
                </Badge>

                <Badge className="text-sm bg-cubcen-primary text-white">
                  <Server className="h-4 w-4 mr-2" />
                  {agent.platform.name}
                </Badge>

                <Badge
                  className={cn(
                    'text-sm text-white',
                    agent.healthStatus.status === 'healthy'
                      ? 'bg-cubcen-primary'
                      : agent.healthStatus.status === 'degraded'
                        ? 'bg-cubcen-secondary'
                        : 'bg-red-500'
                  )}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {healthInfo.label}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-cubcen-primary hover:text-white"
              >
                <RefreshCw
                  className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')}
                />
                Refresh
              </Button>

              {agent.status === 'INACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStart?.(agent)}
                  className="hover:bg-green-500 hover:text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}

              {agent.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStop?.(agent)}
                  className="hover:bg-red-500 hover:text-white"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestart?.(agent)}
                className="hover:bg-yellow-500 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(agent)}
                className="hover:bg-cubcen-secondary hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(agent)}
                className="hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-cubcen-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Agent ID
                </label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {agent.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Platform ID
                </label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {agent.platformId}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Platform Type</span>
                <Badge
                  variant="outline"
                  className="bg-cubcen-primary-light text-cubcen-primary"
                >
                  {agent.platform.type}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(agent.createdAt)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(agent.updatedAt)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Health Check</span>
                <span className="text-sm text-muted-foreground">
                  {formatLastCheck(agent.healthStatus.lastCheck)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health & Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-cubcen-primary" />
              Health & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Health Status</span>
                <Badge
                  className={cn(
                    'text-white',
                    agent.healthStatus.status === 'healthy'
                      ? 'bg-cubcen-primary'
                      : agent.healthStatus.status === 'degraded'
                        ? 'bg-cubcen-secondary'
                        : 'bg-red-500'
                  )}
                >
                  {healthInfo.label}
                </Badge>
              </div>

              <Progress value={healthInfo.progress} className="h-3" />

              <p className="text-xs text-muted-foreground">
                {healthInfo.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cubcen-primary">
                  {uptimeStats.uptime}%
                </div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cubcen-secondary">
                  {agent.healthStatus.responseTime || 'N/A'}ms
                </div>
                <div className="text-xs text-muted-foreground">
                  Response Time
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Availability</span>
                <span className="text-sm font-semibold text-cubcen-primary">
                  {uptimeStats.availability}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Downtime</span>
                <span className="text-sm text-red-600">
                  {uptimeStats.downtime}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-cubcen-secondary" />
              Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agent.capabilities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map(capability => (
                  <Badge
                    key={capability}
                    variant="outline"
                    className="bg-cubcen-secondary-light text-cubcen-secondary-hover border-cubcen-secondary"
                  >
                    {capability}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No capabilities defined for this agent.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-cubcen-primary" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(agent.configuration).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(agent.configuration).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">
                      {key}
                    </span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded max-w-xs truncate">
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No configuration parameters set for this agent.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Details */}
      {agent.healthStatus.error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-100 border border-red-200 rounded p-4">
              <p className="text-sm text-red-800 font-mono">
                {agent.healthStatus.error}
              </p>

              {agent.healthStatus.details && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-xs text-red-600 mb-2">
                    Additional Details:
                  </p>
                  <pre className="text-xs text-red-700 bg-red-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(agent.healthStatus.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
