'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, ArrowUpDown, Users } from 'lucide-react'
import { AnalyticsData } from '@/services/analytics'

interface AgentPerformanceTableProps {
  data: AnalyticsData['agentPerformance']
  loading?: boolean
}

type SortField =
  | 'agentName'
  | 'totalTasks'
  | 'successRate'
  | 'averageResponseTime'
type SortDirection = 'asc' | 'desc'

export function AgentPerformanceTable({
  data,
  loading,
}: AgentPerformanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('successRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterPerformance, setFilterPerformance] = useState<string>('all')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedData = (data || [])
    .filter(agent => {
      const matchesSearch = (agent.agentName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      switch (filterPerformance) {
        case 'excellent':
          return (agent.successRate || 0) >= 90
        case 'good':
          return (agent.successRate || 0) >= 70 && (agent.successRate || 0) < 90
        case 'poor':
          return (agent.successRate || 0) < 70
        default:
          return true
      }
    })
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'agentName':
          aValue = a.agentName || ''
          bValue = b.agentName || ''
          break
        case 'totalTasks':
          aValue = a.totalTasks || 0
          bValue = b.totalTasks || 0
          break
        case 'successRate':
          aValue = a.successRate || 0
          bValue = b.successRate || 0
          break
        case 'averageResponseTime':
          aValue = a.averageResponseTime || 0
          bValue = b.averageResponseTime || 0
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

  const getPerformanceBadge = (successRate: number) => {
    if (successRate >= 90) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Excellent
        </Badge>
      )
    } else if (successRate >= 70) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Good
        </Badge>
      )
    } else {
      return <Badge variant="destructive">Needs Improvement</Badge>
    }
  }

  const getResponseTimeBadge = (responseTime: number) => {
    if (responseTime <= 100) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Fast
        </Badge>
      )
    } else if (responseTime <= 500) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Average
        </Badge>
      )
    } else {
      return <Badge variant="destructive">Slow</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-cubcen-primary" />
          Agent Performance Details
        </CardTitle>
        <CardDescription>
          Detailed performance metrics for all agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterPerformance}
            onValueChange={setFilterPerformance}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by performance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Performance</SelectItem>
              <SelectItem value="excellent">Excellent (≥90%)</SelectItem>
              <SelectItem value="good">Good (70-89%)</SelectItem>
              <SelectItem value="poor">Poor (&lt;70%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('agentName')}
                    className="h-auto p-0 font-semibold"
                  >
                    Agent Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('totalTasks')}
                    className="h-auto p-0 font-semibold"
                  >
                    Total Tasks
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('successRate')}
                    className="h-auto p-0 font-semibold"
                  >
                    Success Rate
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('averageResponseTime')}
                    className="h-auto p-0 font-semibold"
                  >
                    Avg Response Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Speed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {data.length === 0
                      ? 'No agent performance data available'
                      : 'No agents match the current filters'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map(agent => (
                  <TableRow key={agent.agentId || `agent-${Math.random()}`}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{agent.agentName || 'Unknown Agent'}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {(agent.agentId || 'unknown').slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">{agent.totalTasks || 0}</div>
                        <div className="text-xs text-muted-foreground">
                          tasks
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">
                          {(agent.successRate || 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          success
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">
                          {agent.averageResponseTime || 0}ms
                        </div>
                        <div className="text-xs text-muted-foreground">
                          average
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(agent.successRate || 0)}
                    </TableCell>
                    <TableCell>
                      {getResponseTimeBadge(agent.averageResponseTime || 0)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredAndSortedData.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedData.length} of {data.length} agents
          </div>
        )}
      </CardContent>
    </Card>
  )
}
