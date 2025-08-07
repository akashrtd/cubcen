'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AccessibleTable as Table,
  AccessibleTableBody as TableBody,
  AccessibleTableCell as TableCell,
  AccessibleTableHead as TableHead,
  AccessibleTableHeader as TableHeader,
  AccessibleTableRow as TableRow,
} from '@/components/ui/accessible-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  RefreshCw,
  Activity,
  Users,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Platform {
  id: string
  name: string
  type: 'n8n' | 'make' | 'zapier'
  baseUrl: string
  status: 'connected' | 'disconnected' | 'error'
  lastSyncAt: Date | null
  agentCount: number
  healthStatus: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    lastCheck: Date
    responseTime?: number
    version?: string
  }
  createdAt: Date
  updatedAt: Date
}

interface PlatformListProps {
  onPlatformSelect?: (platform: Platform) => void
  onPlatformEdit?: (platform: Platform) => void
  onPlatformDelete?: (platform: Platform) => void
  onRefresh?: () => void
}

const PLATFORM_TYPE_LABELS = {
  n8n: 'n8n',
  make: 'Make.com',
  zapier: 'Zapier',
} as const

const PLATFORM_TYPE_COLORS = {
  n8n: 'bg-blue-100 text-blue-800 border-blue-200',
  make: 'bg-purple-100 text-purple-800 border-purple-200',
  zapier: 'bg-orange-100 text-orange-800 border-orange-200',
} as const

const STATUS_COLORS = {
  connected: 'bg-green-100 text-green-800 border-green-200',
  disconnected: 'bg-gray-100 text-gray-800 border-gray-200',
  error: 'bg-red-100 text-red-800 border-red-200',
} as const

const HEALTH_STATUS_COLORS = {
  healthy: 'text-green-600',
  degraded: 'text-yellow-600',
  unhealthy: 'text-red-600',
} as const

const HEALTH_STATUS_ICONS = {
  healthy: CheckCircle,
  degraded: AlertCircle,
  unhealthy: XCircle,
} as const

export function PlatformList({
  onPlatformSelect,
  onPlatformEdit,
  onPlatformDelete,
  onRefresh,
}: PlatformListProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'status' | 'lastSync'>(
    'name'
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const fetchPlatforms = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/platforms', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch platforms')
      }

      const result = await response.json()
      if (result.success) {
        setPlatforms(result.data.platforms)
      } else {
        throw new Error(result.error?.message || 'Failed to fetch platforms')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const handleRefresh = () => {
    fetchPlatforms()
    onRefresh?.()
  }

  const filteredAndSortedPlatforms = platforms
    .filter(platform => {
      const matchesSearch =
        platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        platform.baseUrl.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || platform.type === typeFilter
      const matchesStatus =
        statusFilter === 'all' || platform.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'lastSync':
          aValue = a.lastSyncAt?.getTime() || 0
          bValue = b.lastSyncAt?.getTime() || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Platforms ({filteredAndSortedPlatforms.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search platforms..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label="Filter by type"
              >
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="n8n">n8n</SelectItem>
                <SelectItem value="make">Make.com</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label="Filter by status"
              >
                <Activity className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Table */}
          <div className="rounded-md border">
            <Table
              caption="List of connected automation platforms with their status and health information"
              sortable={true}
            >
              <TableHeader>
                <TableRow>
                  <TableHead
                    sortable={true}
                    sortDirection={sortBy === 'name' ? sortOrder : 'none'}
                    onSort={direction => {
                      setSortBy('name')
                      setSortOrder(direction)
                    }}
                  >
                    Platform Name
                  </TableHead>
                  <TableHead
                    sortable={true}
                    sortDirection={sortBy === 'type' ? sortOrder : 'none'}
                    onSort={direction => {
                      setSortBy('type')
                      setSortOrder(direction)
                    }}
                  >
                    Type
                  </TableHead>
                  <TableHead
                    sortable={true}
                    sortDirection={sortBy === 'status' ? sortOrder : 'none'}
                    onSort={direction => {
                      setSortBy('status')
                      setSortOrder(direction)
                    }}
                  >
                    Status
                  </TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Agents</TableHead>
                  <TableHead
                    sortable={true}
                    sortDirection={sortBy === 'lastSync' ? sortOrder : 'none'}
                    onSort={direction => {
                      setSortBy('lastSync')
                      setSortOrder(direction)
                    }}
                  >
                    Last Sync
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPlatforms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      {platforms.length === 0
                        ? 'No platforms configured yet'
                        : 'No platforms match your filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedPlatforms.map(platform => {
                    const HealthIcon =
                      HEALTH_STATUS_ICONS[platform.healthStatus.status]

                    return (
                      <TableRow
                        key={platform.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => onPlatformSelect?.(platform)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{platform.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {platform.baseUrl}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'capitalize',
                              PLATFORM_TYPE_COLORS[platform.type]
                            )}
                          >
                            {PLATFORM_TYPE_LABELS[platform.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'capitalize',
                              STATUS_COLORS[platform.status]
                            )}
                          >
                            {platform.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <HealthIcon
                              className={cn(
                                'h-4 w-4',
                                HEALTH_STATUS_COLORS[
                                  platform.healthStatus.status
                                ]
                              )}
                            />
                            <span className="text-sm capitalize">
                              {platform.healthStatus.status}
                            </span>
                            {platform.healthStatus.responseTime && (
                              <span className="text-xs text-gray-500">
                                ({platform.healthStatus.responseTime}ms)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{platform.agentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatLastSync(platform.lastSyncAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {onPlatformEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation()
                                  onPlatformEdit(platform)
                                }}
                              >
                                Edit
                              </Button>
                            )}
                            {onPlatformDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation()
                                  onPlatformDelete(platform)
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            )}
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
