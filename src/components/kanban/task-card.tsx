'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Avatar components not needed for this implementation
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  User,
  Calendar,
} from 'lucide-react'
import { Task, TaskPriority, TaskStatus } from '@/lib/database'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick: () => void
  agents: Array<{ id: string; name: string; platformId: string }>
  isDragging?: boolean
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    color: string
    bgColor: string
    icon: React.ReactNode
  }
> = {
  LOW: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: <Clock className="h-3 w-3" />,
  },
  MEDIUM: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: <Clock className="h-3 w-3" />,
  },
  HIGH: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  CRITICAL: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
}

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
  RUNNING: <PlayCircle className="h-4 w-4 text-blue-500" />,
  COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  CANCELLED: <XCircle className="h-4 w-4 text-gray-500" />,
}

export function TaskCard({
  task,
  onClick,
  agents,
  isDragging = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const agent = agents.find(a => a.id === task.agentId)
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const statusIcon = STATUS_ICONS[task.status]

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getExecutionTime = () => {
    if (task.status === 'RUNNING' && task.startedAt) {
      const elapsed = Date.now() - new Date(task.startedAt).getTime()
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    if (task.status === 'COMPLETED' && task.startedAt && task.completedAt) {
      const elapsed =
        new Date(task.completedAt).getTime() -
        new Date(task.startedAt).getTime()
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    return null
  }

  const executionTime = getExecutionTime()

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        'border-l-4 border-l-cubcen-primary',
        isDragging || isSortableDragging ? 'opacity-50 rotate-2 shadow-lg' : '',
        'hover:border-l-cubcen-secondary'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {statusIcon}
            <Badge
              variant="secondary"
              className={cn(
                'text-xs font-medium',
                priorityConfig.color,
                priorityConfig.bgColor
              )}
            >
              <span className="flex items-center gap-1">
                {priorityConfig.icon}
                {task.priority}
              </span>
            </Badge>
          </div>
          {task.retryCount > 0 && (
            <Badge variant="outline" className="text-xs">
              Retry {task.retryCount}
            </Badge>
          )}
        </div>

        {/* Task Name */}
        <div>
          <h4 className="font-medium text-sm line-clamp-2 mb-1">{task.name}</h4>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Agent Info */}
        {agent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{agent.name}</span>
            <Badge variant="outline" className="text-xs">
              {agent.platformId}
            </Badge>
          </div>
        )}

        {/* Timing Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.scheduledAt)}</span>
          </div>
          {executionTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{executionTime}</span>
            </div>
          )}
        </div>

        {/* Progress Bar for Running Tasks */}
        {task.status === 'RUNNING' && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-cubcen-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: '60%' }} // This would come from real progress data
            />
          </div>
        )}

        {/* Error Indicator */}
        {task.status === 'FAILED' && task.error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs">
            <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300 line-clamp-1">
              {JSON.parse(task.error).message || 'Task failed'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
