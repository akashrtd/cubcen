'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Zap,
  Calendar,
  Clock,
  User,
  Server,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ErrorLog, ErrorFilter } from '@/types/error'
import { format } from 'date-fns'

interface ErrorLogViewerProps {
  className?: string
}

const ERROR_LEVEL_COLORS = {
  DEBUG: 'bg-gray-100 text-gray-800 border-gray-200',
  INFO: 'bg-blue-100 text-blue-800 border-blue-200',
  WARN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ERROR: 'bg-red-100 text-red-800 border-red-200',
  FATAL: 'bg-red-200 text-red-900 border-red-300',
}

const ERROR_LEVEL_ICONS = {
  DEBUG: Info,
  INFO: Info,
  WARN: AlertTriangle,
  ERROR: AlertCircle,
  FATAL: XCircle,
}

export function ErrorLogViewer({ className }: ErrorLogViewerProps) {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setSelectedLog] = useState<ErrorLog | null>(null)
  const [filter, setFilter] = useState<ErrorFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const limit = 25

  // Fetch error logs
  const fetchLogs = useCallback(
    async (page = 1, newFilter?: ErrorFilter) => {
      try {
        setLoading(page === 1)
        setRefreshing(page !== 1)

        const filterToUse = newFilter || filter
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filterToUse.level && { level: filterToUse.level }),
          ...(filterToUse.source && { source: filterToUse.source }),
          ...(filterToUse.agentId && { agentId: filterToUse.agentId }),
          ...(filterToUse.taskId && { taskId: filterToUse.taskId }),
          ...(filterToUse.dateFrom && {
            dateFrom: filterToUse.dateFrom.toISOString(),
          }),
          ...(filterToUse.dateTo && {
            dateTo: filterToUse.dateTo.toISOString(),
          }),
          ...(searchTerm && { search: searchTerm }),
        })

        const response = await fetch(`/api/errors/logs?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch error logs')
        }

        const data = await response.json()
        setLogs(Array.isArray(data.logs) ? data.logs : [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
        setCurrentPage(data.page || 1)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch error logs'
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [filter, searchTerm]
  )

  // Initial load
  useEffect(() => {
    fetchLogs(1)
  }, [fetchLogs])

  // Handle search
  const handleSearch = useCallback(() => {
    setCurrentPage(1)
    fetchLogs(1)
  }, [fetchLogs])

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilter: Partial<ErrorFilter>) => {
      const updatedFilter = { ...filter, ...newFilter }
      setFilter(updatedFilter)
      setCurrentPage(1)
      fetchLogs(1, updatedFilter)
    },
    [filter, fetchLogs]
  )

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchLogs(currentPage)
  }, [fetchLogs, currentPage])

  // Handle pagination
  const handlePageChange = useCallback(
    (page: number) => {
      fetchLogs(page)
    },
    [fetchLogs]
  )

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss')
  }

  // Get error level icon
  const getLevelIcon = (level: ErrorLog['level']) => {
    const Icon = ERROR_LEVEL_ICONS[level]
    return <Icon className="h-4 w-4" />
  }

  // Truncate message for table display
  const truncateMessage = (message: string, maxLength = 80) => {
    return message.length > maxLength
      ? `${message.slice(0, maxLength)}...`
      : message
  }

  if (loading && logs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#3F51B5]" />
            Error Logs
          </CardTitle>
          <CardDescription>
            System error logs and debugging information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#3F51B5]" />
            Error Logs
            {total > 0 && (
              <Badge variant="secondary" className="bg-[#B19ADA] text-white">
                {total.toLocaleString()}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-[#3F51B5] text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          System error logs and debugging information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search error messages..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={filter.level || 'all'}
              onValueChange={value =>
                handleFilterChange({
                  level:
                    value === 'all' ? undefined : (value as ErrorLog['level']),
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="FATAL">Fatal</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Source filter..."
              value={filter.source || ''}
              onChange={e =>
                handleFilterChange({ source: e.target.value || undefined })
              }
              className="w-40"
            />
            <Button
              variant="outline"
              onClick={handleSearch}
              className="border-[#3F51B5] text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </div>

        {/* Error Logs Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Level</TableHead>
                <TableHead className="w-32">Timestamp</TableHead>
                <TableHead className="w-32">Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No error logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${ERROR_LEVEL_COLORS[log.level]} flex items-center gap-1`}
                      >
                        {getLevelIcon(log.level)}
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(log.timestamp), 'MMM dd')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Server className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-mono">{log.source}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {truncateMessage(log.message)}
                        </div>
                        {(log.agentId || log.taskId) && (
                          <div className="flex gap-2 text-xs text-gray-500">
                            {log.agentId && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Agent: {log.agentId.slice(0, 8)}
                              </span>
                            )}
                            {log.taskId && (
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Task: {log.taskId.slice(0, 8)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getLevelIcon(log.level)}
                              Error Details - {log.level}
                            </DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                              {/* Basic Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Timestamp
                                  </label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">
                                      {formatTimestamp(log.timestamp)}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Source
                                  </label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Server className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-mono">
                                      {log.source}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Message */}
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Message
                                </label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                  <pre className="text-sm whitespace-pre-wrap">
                                    {log.message}
                                  </pre>
                                </div>
                              </div>

                              {/* Stack Trace */}
                              {log.stackTrace && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Stack Trace
                                  </label>
                                  <div className="mt-1 p-3 bg-red-50 rounded-lg">
                                    <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-x-auto">
                                      {log.stackTrace}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {/* Context */}
                              {log.context &&
                                Object.keys(log.context).length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      Context
                                    </label>
                                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                                      <pre className="text-xs text-blue-800 whitespace-pre-wrap overflow-x-auto">
                                        {JSON.stringify(log.context, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                              {/* Related IDs */}
                              {(log.agentId ||
                                log.taskId ||
                                log.platformId ||
                                log.userId) && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Related IDs
                                  </label>
                                  <div className="mt-1 grid grid-cols-2 gap-2">
                                    {log.agentId && (
                                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">
                                          Agent: {log.agentId}
                                        </span>
                                      </div>
                                    )}
                                    {log.taskId && (
                                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <Zap className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">
                                          Task: {log.taskId}
                                        </span>
                                      </div>
                                    )}
                                    {log.platformId && (
                                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <Server className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">
                                          Platform: {log.platformId}
                                        </span>
                                      </div>
                                    )}
                                    {log.userId && (
                                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">
                                          User: {log.userId}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * limit + 1} to{' '}
              {Math.min(currentPage * limit, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-[#3F51B5] text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-[#3F51B5] text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
