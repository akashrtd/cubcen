'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Bot, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Settings, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Agent {
  id: string
  name: string
  platformId: string
  platform: {
    id: string
    name: string
    type: 'N8N' | 'MAKE' | 'ZAPIER'
  }
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE'
  healthStatus: {
    status: 'healthy' | 'unhealthy' | 'degraded'
    lastCheck: Date
    responseTime?: number
    details?: Record<string, unknown>
    error?: string
  }
  capabilities: string[]
  configuration: Record<string, unknown>
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface AgentListProps {
  agents: Agent[]
  loading?: boolean
  onRefresh?: () => void
  onViewAgent?: (agent: Agent) => void
  onConfigureAgent?: (agent: Agent) => void
  className?: string
}

const statusConfig = {
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: CheckCircle,
    description: 'Agent is running normally'
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    icon: Clock,
    description: 'Agent is not currently active'
  },
  ERROR: {
    label: 'Error',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: AlertCircle,
    description: 'Agent has encountered an error'
  },
  MAINTENANCE: {
    label: 'Maintenance',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: Wrench,
    description: 'Agent is under maintenance'
  }
}

const healthConfig = {
  healthy: {
    label: 'Healthy',
    color: 'bg-cubcen-primary',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  degraded: {
    label: 'Degraded',
    color: 'bg-cubcen-secondary',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50'
  },
  unhealthy: {
    label: 'Unhealthy',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50'
  }
}

const platformConfig = {
  N8N: {
    label: 'n8n',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50'
  },
  MAKE: {
    label: 'Make.com',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50'
  },
  ZAPIER: {
    label: 'Zapier',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50'
  }
}

export function AgentList({ 
  agents, 
  loading = false, 
  onRefresh, 
  onViewAgent, 
  onConfigureAgent,
  className 
}: AgentListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [healthFilter, setHealthFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'platform' | 'health' | 'lastCheck'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter and sort agents
  const filteredAndSortedAgents = agents
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.platform.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
      const matchesPlatform = platformFilter === 'all' || agent.platform.type === platformFilter
      const matchesHealth = healthFilter === 'all' || agent.healthStatus.status === healthFilter
      
      return matchesSearch && matchesStatus && matchesPlatform && matchesHealth
    })
    .sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'platform':
          aValue = a.platform.name.toLowerCase()
          bValue = b.platform.name.toLowerCase()
          break
        case 'health':
          aValue = a.healthStatus.status
          bValue = b.healthStatus.status
          break
        case 'lastCheck':
          aValue = new Date(a.healthStatus.lastCheck).getTime()
          bValue = new Date(b.healthStatus.lastCheck).getTime()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
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

  const getHealthProgress = (health: Agent['healthStatus']) => {
    if (health.status === 'healthy') return 100
    if (health.status === 'degraded') return 60
    return 20
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            Agent Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Loading skeleton for filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
            
            {/* Loading skeleton for table */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5 text-cubcen-primary" />
            Agent Monitoring
            <Badge variant="secondary" className="ml-2 bg-cubcen-secondary text-white">
              {filteredAndSortedAgents.length} agents
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="hover:bg-cubcen-primary hover:text-white"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32" aria-label="Filter by status">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full sm:w-32" aria-label="Filter by platform">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="N8N">n8n</SelectItem>
                <SelectItem value="MAKE">Make.com</SelectItem>
                <SelectItem value="ZAPIER">Zapier</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-full sm:w-32" aria-label="Filter by health">
                <Activity className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="unhealthy">Unhealthy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agents Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Agent Name
                      {sortBy === 'name' && (
                        <span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('platform')}
                  >
                    <div className="flex items-center">
                      Platform
                      {sortBy === 'platform' && (
                        <span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === 'status' && (
                        <span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('health')}
                  >
                    <div className="flex items-center">
                      Health
                      {sortBy === 'health' && (
                        <span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('lastCheck')}
                  >
                    <div className="flex items-center">
                      Last Check
                      {sortBy === 'lastCheck' && (
                        <span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Bot className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' || platformFilter !== 'all' || healthFilter !== 'all'
                            ? 'No agents match your filters'
                            : 'No agents found'
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedAgents.map((agent) => {
                    const statusInfo = statusConfig[agent.status]
                    const healthInfo = healthConfig[agent.healthStatus.status]
                    const platformInfo = platformConfig[agent.platform.type]
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <TableRow key={agent.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-foreground">{agent.name}</div>
                            {agent.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {agent.description}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {agent.capabilities.slice(0, 2).map((capability) => (
                                <Badge 
                                  key={capability} 
                                  variant="outline" 
                                  className="text-xs bg-cubcen-secondary-light text-cubcen-secondary-hover"
                                >
                                  {capability}
                                </Badge>
                              ))}
                              {agent.capabilities.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{agent.capabilities.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              "text-white",
                              platformInfo.color
                            )}
                          >
                            {platformInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={cn("h-4 w-4", statusInfo.textColor)} />
                            <Badge 
                              variant="outline"
                              className={cn(
                                statusInfo.textColor,
                                statusInfo.bgColor,
                                "border-current"
                              )}
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                className={cn(
                                  "text-white text-xs",
                                  healthInfo.color
                                )}
                              >
                                {healthInfo.label}
                              </Badge>
                              {agent.healthStatus.responseTime && (
                                <span className="text-xs text-muted-foreground">
                                  {agent.healthStatus.responseTime}ms
                                </span>
                              )}
                            </div>
                            <Progress 
                              value={getHealthProgress(agent.healthStatus)} 
                              className="h-1 w-16"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatLastCheck(agent.healthStatus.lastCheck)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewAgent?.(agent)}
                              className="hover:bg-cubcen-primary hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onConfigureAgent?.(agent)}
                              className="hover:bg-cubcen-secondary hover:text-white"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}