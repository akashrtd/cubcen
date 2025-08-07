'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bot,
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Settings,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from './agent-list'

export interface AgentStatusCardsProps {
  agents: Agent[]
  loading?: boolean
  onViewAgent?: (agent: Agent) => void
  onConfigureAgent?: (agent: Agent) => void
  onRefreshAgent?: (agentId: string) => Promise<void>
  className?: string
}

const statusConfig = {
  ACTIVE: {
    label: 'Active',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    progressColor: 'bg-green-500',
  },
  INACTIVE: {
    label: 'Inactive',
    icon: Pause,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    progressColor: 'bg-gray-400',
  },
  ERROR: {
    label: 'Error',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    progressColor: 'bg-red-500',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    icon: Settings,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    progressColor: 'bg-yellow-500',
  },
}

const healthConfig = {
  healthy: {
    label: 'Healthy',
    color: 'text-green-600',
    progress: 100,
    pulseColor: 'bg-green-400',
  },
  degraded: {
    label: 'Degraded',
    color: 'text-yellow-600',
    progress: 60,
    pulseColor: 'bg-yellow-400',
  },
  unhealthy: {
    label: 'Unhealthy',
    color: 'text-red-600',
    progress: 20,
    pulseColor: 'bg-red-400',
  },
}

function AgentStatusCard({
  agent,
  onViewAgent,
  onConfigureAgent,
  onRefreshAgent,
}: {
  agent: Agent
  onViewAgent?: (agent: Agent) => void
  onConfigureAgent?: (agent: Agent) => void
  onRefreshAgent?: (agentId: string) => Promise<void>
}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const statusInfo = statusConfig[agent.status]
  const healthInfo = healthConfig[agent.healthStatus.status]
  const StatusIcon = statusInfo.icon

  const handleRefresh = async () => {
    if (onRefreshAgent) {
      setIsRefreshing(true)
      try {
        await onRefreshAgent(agent.id)
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  const formatLastCheck = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getUptimePercentage = () => {
    // This would be calculated from actual uptime data
    // For now, we'll simulate based on health status
    if (agent.healthStatus.status === 'healthy') return 99.9
    if (agent.healthStatus.status === 'degraded') return 95.5
    return 85.2
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-md',
        statusInfo.bgColor,
        statusInfo.borderColor,
        'border-l-4'
      )}
    >
      {/* Real-time pulse indicator */}
      {agent.status === 'ACTIVE' && agent.healthStatus.status === 'healthy' && (
        <div className="absolute top-2 right-2">
          <div
            className={cn(
              'w-3 h-3 rounded-full animate-pulse',
              healthInfo.pulseColor
            )}
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className={cn('h-5 w-5', statusInfo.color)} />
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {agent.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn('text-xs', statusInfo.color, 'border-current')}
                >
                  {statusInfo.label}
                </Badge>
                <Badge className="text-xs bg-cubcen-primary text-white">
                  {agent.platform.name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 hover:bg-white/50"
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-cubcen-primary" />
              <span className="text-sm font-medium">Health Status</span>
            </div>
            <Badge
              className={cn(
                'text-xs text-white',
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

          <div className="space-y-1">
            <Progress value={healthInfo.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Response Time: {agent.healthStatus.responseTime || 'N/A'}ms
              </span>
              <span>Uptime: {getUptimePercentage()}%</span>
            </div>
          </div>
        </div>

        {/* Last Check */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last Check</span>
          </div>
          <span className="text-sm font-medium">
            {formatLastCheck(agent.healthStatus.lastCheck)}
          </span>
        </div>

        {/* Capabilities */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-cubcen-secondary" />
            <span className="text-sm font-medium">Capabilities</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 3).map(capability => (
              <Badge
                key={capability}
                variant="outline"
                className="text-xs bg-cubcen-secondary-light text-cubcen-secondary-hover border-cubcen-secondary"
              >
                {capability}
              </Badge>
            ))}
            {agent.capabilities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agent.capabilities.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Error Information */}
        {agent.healthStatus.error && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                Error Details
              </span>
            </div>
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {agent.healthStatus.error}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewAgent?.(agent)}
            className="flex-1 hover:bg-cubcen-primary hover:text-white hover:border-cubcen-primary"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigureAgent?.(agent)}
            className="flex-1 hover:bg-cubcen-secondary hover:text-white hover:border-cubcen-secondary"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

export function AgentStatusCards({
  agents,
  loading = false,
  onViewAgent,
  onConfigureAgent,
  onRefreshAgent,
  className,
}: AgentStatusCardsProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Agents Found</h3>
          <p className="text-muted-foreground text-center">
            Connect to a platform to start monitoring your AI agents.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {agents.map(agent => (
        <AgentStatusCard
          key={agent.id}
          agent={agent}
          onViewAgent={onViewAgent}
          onConfigureAgent={onConfigureAgent}
          onRefreshAgent={onRefreshAgent}
        />
      ))}
    </div>
  )
}
