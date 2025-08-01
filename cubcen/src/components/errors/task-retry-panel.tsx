"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  RotateCcw, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Zap,
  AlertTriangle
} from 'lucide-react'
import { RetryableTask } from '@/types/error'
import { format } from 'date-fns'

interface TaskRetryPanelProps {
  className?: string
}

export function TaskRetryPanel({ className }: TaskRetryPanelProps) {
  const [tasks, setTasks] = useState<RetryableTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [retryingTasks, setRetryingTasks] = useState<Set<string>>(new Set())
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [retryResults, setRetryResults] = useState<{
    successful: string[]
    failed: Array<{ taskId: string; error: string }>
  } | null>(null)

  // Fetch retryable tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setRefreshing(true)
      
      const response = await fetch('/api/cubcen/v1/errors/retryable-tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch retryable tasks')
      }

      const data = await response.json()
      setTasks(data.tasks || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch retryable tasks')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchTasks()
  }, [fetchTasks])

  // Handle task selection
  const handleTaskSelection = useCallback((taskId: string, checked: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(taskId)
      } else {
        newSet.delete(taskId)
      }
      return newSet
    })
  }, [])

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(tasks.filter(t => t.canRetry).map(t => t.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }, [tasks])

  // Handle single task retry
  const handleSingleRetry = useCallback(async (taskId: string) => {
    try {
      setRetryingTasks(prev => new Set(prev).add(taskId))
      
      const response = await fetch(`/api/cubcen/v1/errors/retry-task/${taskId}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to retry task')
      }
      
      // Refresh the task list
      await fetchTasks()
      
      // Show success message
      setRetryResults({
        successful: [taskId],
        failed: []
      })
    } catch (err) {
      setRetryResults({
        successful: [],
        failed: [{ taskId, error: err instanceof Error ? err.message : 'Unknown error' }]
      })
    } finally {
      setRetryingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }, [fetchTasks])

  // Handle bulk retry
  const handleBulkRetry = useCallback(async () => {
    if (selectedTasks.size === 0) return
    
    try {
      setRetryingTasks(new Set(selectedTasks))
      
      const response = await fetch('/api/cubcen/v1/errors/bulk-retry-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskIds: Array.from(selectedTasks)
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to retry tasks')
      }
      
      const results = await response.json()
      setRetryResults(results)
      
      // Clear selection and refresh
      setSelectedTasks(new Set())
      await fetchTasks()
    } catch (err) {
      setRetryResults({
        successful: [],
        failed: Array.from(selectedTasks).map(taskId => ({
          taskId,
          error: err instanceof Error ? err.message : 'Unknown error'
        }))
      })
    } finally {
      setRetryingTasks(new Set())
      setShowConfirmDialog(false)
    }
  }, [selectedTasks, fetchTasks])

  // Get status badge
  const getStatusBadge = (status: RetryableTask['status']) => {
    const config = {
      FAILED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      CANCELLED: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle }
    }
    
    const { color, icon: Icon } = config[status]
    
    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  // Format retry info
  const formatRetryInfo = (task: RetryableTask) => {
    return `${task.retryCount}/${task.maxRetries}`
  }

  if (loading && tasks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-[#3F51B5]" />
            Failed Tasks
          </CardTitle>
          <CardDescription>
            Tasks that can be retried manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-[#3F51B5]" />
              Failed Tasks
              {tasks.length > 0 && (
                <Badge variant="secondary" className="bg-[#B19ADA] text-white">
                  {tasks.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedTasks.size > 0 && (
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={retryingTasks.size > 0}
                  className="bg-[#3F51B5] hover:bg-[#303F9F] text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Selected ({selectedTasks.size})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-[#3F51B5] text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Tasks that failed and can be retried manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {retryResults && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Retry completed: {retryResults.successful.length} successful, {retryResults.failed.length} failed
                {retryResults.failed.length > 0 && (
                  <div className="mt-2 text-sm">
                    Failed tasks: {retryResults.failed.map(f => f.taskId.slice(0, 8)).join(', ')}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Failed Tasks</h3>
              <p className="text-gray-500">
                All tasks are running successfully. No manual retries needed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Actions */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={selectedTasks.size === tasks.filter(t => t.canRetry).length && tasks.filter(t => t.canRetry).length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={retryingTasks.size > 0}
                />
                <span className="text-sm text-gray-600">
                  Select all retryable tasks ({tasks.filter(t => t.canRetry).length} available)
                </span>
              </div>

              {/* Tasks Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Last Attempt</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedTasks.has(task.id)}
                            onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                            disabled={!task.canRetry || retryingTasks.size > 0}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{task.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {task.id.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{task.agentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(task.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{formatRetryInfo(task)}</span>
                            {!task.canRetry && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                Max reached
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            {format(new Date(task.lastAttempt), 'MMM dd, HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-red-600">
                            {task.error}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSingleRetry(task.id)}
                            disabled={!task.canRetry || retryingTasks.has(task.id)}
                            className="text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
                          >
                            {retryingTasks.has(task.id) ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Bulk Retry
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to retry {selectedTasks.size} selected task{selectedTasks.size !== 1 ? 's' : ''}?
              This will reset their status and attempt execution again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={retryingTasks.size > 0}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkRetry}
              disabled={retryingTasks.size > 0}
              className="bg-[#3F51B5] hover:bg-[#303F9F] text-white"
            >
              {retryingTasks.size > 0 ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Tasks
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}