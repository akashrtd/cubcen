'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Square,
  RotateCcw,
  Trash2,
  User,
  Settings,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  PlayCircle,
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority } from '@/lib/database'
import { cn } from '@/lib/utils'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  agents: Array<{ id: string; name: string; platformId: string }>
}

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    color: string
    bgColor: string
    icon: React.ReactNode
    label: string
  }
> = {
  PENDING: {
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: <Clock className="h-4 w-4" />,
    label: 'Pending',
  },
  RUNNING: {
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: <PlayCircle className="h-4 w-4" />,
    label: 'Running',
  },
  COMPLETED: {
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="h-4 w-4" />,
    label: 'Completed',
  },
  FAILED: {
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: <XCircle className="h-4 w-4" />,
    label: 'Failed',
  },
  CANCELLED: {
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    icon: <XCircle className="h-4 w-4" />,
    label: 'Cancelled',
  },
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    color: string
    bgColor: string
    label: string
  }
> = {
  LOW: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Low',
  },
  MEDIUM: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Medium',
  },
  HIGH: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'High',
  },
  CRITICAL: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Critical',
  },
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  agents,
}: TaskDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!task) return null

  const agent = agents.find(a => a.id === task.agentId)
  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getExecutionTime = () => {
    if (task.status === 'RUNNING' && task.startedAt) {
      const elapsed = Date.now() - new Date(task.startedAt).getTime()
      return Math.floor(elapsed / 1000)
    }
    if (task.status === 'COMPLETED' && task.startedAt && task.completedAt) {
      const elapsed =
        new Date(task.completedAt).getTime() -
        new Date(task.startedAt).getTime()
      return Math.floor(elapsed / 1000)
    }
    return null
  }

  const executionTime = getExecutionTime()

  const handleRetry = async () => {
    if (task.status !== 'FAILED') return
    setIsUpdating(true)
    try {
      await onUpdate(task.id, { status: 'PENDING' })
    } catch (error) {
      console.error('Failed to retry task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (task.status !== 'PENDING' && task.status !== 'RUNNING') return
    setIsUpdating(true)
    try {
      await onUpdate(task.id, { status: 'CANCELLED' })
    } catch (error) {
      console.error('Failed to cancel task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(task.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const parseJsonSafely = (jsonString: string | null) => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString)
    } catch {
      return jsonString
    }
  }

  const taskParameters = parseJsonSafely(task.parameters)
  const taskResult = parseJsonSafely(task.result)
  const taskError = parseJsonSafely(task.error)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {statusConfig.icon}
              <span>{task.name}</span>
            </div>
            <Badge
              className={cn(
                'text-xs',
                statusConfig.color,
                statusConfig.bgColor
              )}
            >
              {statusConfig.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                priorityConfig.color,
                priorityConfig.bgColor
              )}
            >
              {priorityConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Task Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Description
                    </label>
                    <p className="text-sm mt-1">
                      {task.description || 'No description provided'}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Created
                      </label>
                      <p className="mt-1">{formatDate(task.createdAt)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Scheduled
                      </label>
                      <p className="mt-1">{formatDate(task.scheduledAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Agent Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agent ? (
                    <>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Agent Name
                        </label>
                        <p className="text-sm mt-1">{agent.name}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Platform
                        </label>
                        <Badge variant="outline" className="mt-1">
                          {agent.platformId}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Agent not found
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Execution Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Execution Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Started
                      </label>
                      <p className="mt-1">{formatDate(task.startedAt)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Completed
                      </label>
                      <p className="mt-1">{formatDate(task.completedAt)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Retry Count
                      </label>
                      <p className="mt-1">
                        {task.retryCount} / {task.maxRetries}
                      </p>
                    </div>
                    {executionTime !== null && (
                      <div>
                        <label className="font-medium text-muted-foreground">
                          Duration
                        </label>
                        <p className="mt-1">{executionTime}s</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status & Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {task.status === 'FAILED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRetry}
                        disabled={isUpdating}
                        className="gap-2"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Retry
                      </Button>
                    )}
                    {(task.status === 'PENDING' ||
                      task.status === 'RUNNING') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUpdating}
                        className="gap-2"
                      >
                        <Square className="h-3 w-3" />
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Task Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {taskParameters ? (
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(taskParameters, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No parameters provided
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Execution Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {task.status === 'RUNNING' ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-blue-600">
                        <PlayCircle className="h-3 w-3" />
                        <span>Task execution started</span>
                        <span className="text-muted-foreground">
                          {formatDate(task.startedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Activity className="h-3 w-3 animate-pulse" />
                        <span>Task is currently running...</span>
                      </div>
                    </div>
                  ) : task.status === 'COMPLETED' ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-blue-600">
                        <PlayCircle className="h-3 w-3" />
                        <span>Task execution started</span>
                        <span className="text-muted-foreground">
                          {formatDate(task.startedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Task completed successfully</span>
                        <span className="text-muted-foreground">
                          {formatDate(task.completedAt)}
                        </span>
                      </div>
                    </div>
                  ) : task.status === 'FAILED' && taskError ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-blue-600">
                        <PlayCircle className="h-3 w-3" />
                        <span>Task execution started</span>
                        <span className="text-muted-foreground">
                          {formatDate(task.startedAt)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-red-600">
                        <XCircle className="h-3 w-3 mt-0.5" />
                        <div>
                          <div>Task execution failed</div>
                          <div className="text-muted-foreground mt-1">
                            {formatDate(task.completedAt)}
                          </div>
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-red-700 dark:text-red-300">
                            {taskError.message || 'Unknown error'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No execution logs available
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Execution Result</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {taskResult ? (
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(taskResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No result data available
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
