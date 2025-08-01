'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Bot,
  LayoutGrid,
  List,
  Eye,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { AgentList, type Agent } from './agent-list'
import { AgentStatusCards } from './agent-status-cards'
import { AgentDetailView } from './agent-detail-view'
import { useWebSocketAgents } from '@/hooks/use-websocket-agents'

export interface AgentMonitoringDashboardProps {
  className?: string
}

interface AgentStats {
  total: number
  active: number
  inactive: number
  error: number
  maintenance: number
  healthy: number
  degraded: number
  unhealthy: number
}

export function AgentMonitoringDashboard({
  className,
}: AgentMonitoringDashboardProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'detail'>('cards')

  // WebSocket integration for real-time updates
  const {
    connected: wsConnected,
    connecting: wsConnecting,
    error: wsError,
    reconnect: wsReconnect,
  } = useWebSocketAgents({
    subscribeToAll: true,
    onStatusUpdate: update => {
      setAgents(prev =>
        prev.map(agent =>
          agent.id === update.agentId
            ? {
                ...agent,
                status: update.status.toUpperCase() as Agent['status'],
                updatedAt: new Date(),
              }
            : agent
        )
      )
    },
    onHealthUpdate: update => {
      setAgents(prev =>
        prev.map(agent =>
          agent.id === update.agentId
            ? {
                ...agent,
                healthStatus: {
                  ...agent.healthStatus,
                  ...update.health,
                  lastCheck: new Date(update.health.lastCheck),
                },
              }
            : agent
        )
      )
    },
    onAgentError: event => {
      // Update agent with error status
      setAgents(prev =>
        prev.map(agent =>
          agent.id === event.agentId
            ? {
                ...agent,
                status: 'ERROR',
                healthStatus: {
                  ...agent.healthStatus,
                  status: 'unhealthy',
                  error: event.error.message,
                  lastCheck: new Date(),
                },
              }
            : agent
        )
      )
    },
    showToasts: true,
    autoReconnect: true,
  })

  // Fetch agents from API
  const fetchAgents = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true)
        } else {
          setRefreshing(true)
        }
        setError(null)

        const token = localStorage.getItem('auth_token')
        const response = await fetch('/api/cubcen/v1/agents', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch agents: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success) {
          const agentsData = data.data.agents.map((agent: any) => ({
            ...agent,
            capabilities: JSON.parse(agent.capabilities || '[]'),
            configuration: JSON.parse(agent.configuration || '{}'),
            healthStatus: JSON.parse(
              agent.healthStatus || '{"status":"unknown","lastCheck":null}'
            ),
            createdAt: new Date(agent.createdAt),
            updatedAt: new Date(agent.updatedAt),
          }))

          setAgents(agentsData)

          // Update selected agent if it exists
          if (selectedAgent) {
            const updatedSelectedAgent = agentsData.find(
              (a: Agent) => a.id === selectedAgent.id
            )
            if (updatedSelectedAgent) {
              setSelectedAgent(updatedSelectedAgent)
            }
          }
        } else {
          throw new Error(data.error?.message || 'Failed to fetch agents')
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        toast.error('Failed to fetch agents', {
          description: errorMessage,
        })
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [selectedAgent]
  )

  // Refresh single agent
  const refreshAgent = useCallback(
    async (agentId: string) => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/api/cubcen/v1/agents/${agentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to refresh agent: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success) {
          const agentData = {
            ...data.data.agent,
            capabilities: JSON.parse(data.data.agent.capabilities || '[]'),
            configuration: JSON.parse(data.data.agent.configuration || '{}'),
            healthStatus: JSON.parse(
              data.data.agent.healthStatus ||
                '{"status":"unknown","lastCheck":null}'
            ),
            createdAt: new Date(data.data.agent.createdAt),
            updatedAt: new Date(data.data.agent.updatedAt),
          }

          setAgents(prev =>
            prev.map(agent => (agent.id === agentId ? agentData : agent))
          )

          if (selectedAgent?.id === agentId) {
            setSelectedAgent(agentData)
          }

          toast.success('Agent refreshed successfully')
        } else {
          throw new Error(data.error?.message || 'Failed to refresh agent')
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        toast.error('Failed to refresh agent', {
          description: errorMessage,
        })
      }
    },
    [selectedAgent]
  )

  // Calculate agent statistics
  const calculateStats = useCallback((): AgentStats => {
    return agents.reduce(
      (stats, agent) => {
        stats.total++

        // Status counts
        switch (agent.status) {
          case 'ACTIVE':
            stats.active++
            break
          case 'INACTIVE':
            stats.inactive++
            break
          case 'ERROR':
            stats.error++
            break
          case 'MAINTENANCE':
            stats.maintenance++
            break
        }

        // Health counts
        switch (agent.healthStatus.status) {
          case 'healthy':
            stats.healthy++
            break
          case 'degraded':
            stats.degraded++
            break
          case 'unhealthy':
            stats.unhealthy++
            break
        }

        return stats
      },
      {
        total: 0,
        active: 0,
        inactive: 0,
        error: 0,
        maintenance: 0,
        healthy: 0,
        degraded: 0,
        unhealthy: 0,
      }
    )
  }, [agents])

  const stats = calculateStats()

  // Event handlers
  const handleViewAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent)
    setViewMode('detail')
  }, [])

  const handleConfigureAgent = useCallback((agent: Agent) => {
    // This would open a configuration modal or navigate to config page
    toast.info('Configuration', {
      description: `Opening configuration for ${agent.name}`,
    })
  }, [])

  const handleRefresh = useCallback(() => {
    fetchAgents(false)
  }, [fetchAgents])

  // Initial load
  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Agent Monitoring
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage your AI agents across all platforms in
              real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* WebSocket Status */}
            <div className="flex items-center space-x-2">
              {wsConnecting ? (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-600"
                >
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Connecting
                </Badge>
              ) : wsConnected ? (
                <Badge className="bg-cubcen-primary text-white">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live Updates
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-600"
                >
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}

              {wsError && !wsConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={wsReconnect}
                  className="hover:bg-cubcen-primary hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reconnect
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="hover:bg-cubcen-primary hover:text-white"
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4 mr-2',
                  (loading || refreshing) && 'animate-spin'
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-cubcen-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {stats.inactive}
                  </div>
                  <div className="text-xs text-muted-foreground">Inactive</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.error}
                  </div>
                  <div className="text-xs text-muted-foreground">Error</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.maintenance}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Maintenance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-cubcen-primary" />
                <div>
                  <div className="text-2xl font-bold text-cubcen-primary">
                    {stats.healthy}
                  </div>
                  <div className="text-xs text-muted-foreground">Healthy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-cubcen-secondary" />
                <div>
                  <div className="text-2xl font-bold text-cubcen-secondary">
                    {stats.degraded}
                  </div>
                  <div className="text-xs text-muted-foreground">Degraded</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-500">
                    {stats.unhealthy}
                  </div>
                  <div className="text-xs text-muted-foreground">Unhealthy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* WebSocket Error Alert */}
      {wsError && !wsConnected && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Real-time updates are unavailable: {wsError}
            <Button
              variant="link"
              size="sm"
              onClick={wsReconnect}
              className="ml-2 p-0 h-auto text-yellow-800 underline"
            >
              Try reconnecting
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs
        value={viewMode}
        onValueChange={value => setViewMode(value as typeof viewMode)}
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="cards" className="flex items-center space-x-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Cards</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger value="detail" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Detail</span>
            </TabsTrigger>
          </TabsList>

          {viewMode === 'detail' && selectedAgent && (
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="bg-cubcen-primary-light text-cubcen-primary"
              >
                Viewing: {selectedAgent.name}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Back to Overview
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="cards" className="mt-6">
          <AgentStatusCards
            agents={agents}
            loading={loading}
            onViewAgent={handleViewAgent}
            onConfigureAgent={handleConfigureAgent}
            onRefreshAgent={refreshAgent}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <AgentList
            agents={agents}
            loading={loading}
            onRefresh={handleRefresh}
            onViewAgent={handleViewAgent}
            onConfigureAgent={handleConfigureAgent}
          />
        </TabsContent>

        <TabsContent value="detail" className="mt-6">
          <AgentDetailView
            agent={selectedAgent}
            loading={loading && !selectedAgent}
            onEdit={handleConfigureAgent}
            onRefresh={refreshAgent}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
