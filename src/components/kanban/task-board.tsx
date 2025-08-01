'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import { TaskCard } from './task-card'
import { TaskDetailModal } from './task-detail-modal'
import { TaskCreateModal } from './task-create-modal'
import { TaskFilters } from './task-filters'
import { Task, TaskStatus, TaskPriority } from '@/lib/database'

interface TaskBoardProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
  onTaskCreate: (taskData: {
    name: string
    description?: string
    agentId: string
    priority: TaskPriority
    scheduledAt: Date
    maxRetries: number
    parameters: Record<string, unknown>
    createdBy: string
  }) => Promise<void>
  onTaskDelete: (taskId: string) => Promise<void>
  agents: Array<{ id: string; name: string; platformId: string }>
  isLoading?: boolean
}

const TASK_COLUMNS: Array<{
  id: TaskStatus
  title: string
  color: string
  bgColor: string
}> = [
  {
    id: 'PENDING',
    title: 'Pending',
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
  },
  {
    id: 'RUNNING',
    title: 'In Progress',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'COMPLETED',
    title: 'Completed',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  },
  {
    id: 'FAILED',
    title: 'Failed',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  },
]

export interface TaskFilter {
  search?: string
  agentId?: string
  priority?: TaskPriority
  dateFrom?: Date
  dateTo?: Date
}

export function TaskBoard({
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  agents,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<TaskFilter>({})
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Filter tasks based on current filters
  useEffect(() => {
    let filtered = [...tasks]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.agentId) {
      filtered = filtered.filter((task) => task.agentId === filters.agentId)
    }

    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (task) => new Date(task.createdAt) >= filters.dateFrom!
      )
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (task) => new Date(task.createdAt) <= filters.dateTo!
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, filters])

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = filteredTasks.find((t) => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Handle drag over logic if needed
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Find the task being moved
    const task = filteredTasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    try {
      await onTaskUpdate(taskId, { status: newStatus })
    } catch (error) {
      console.error('Failed to update task status:', error)
      // You might want to show a toast notification here
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailModalOpen(true)
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    await onTaskUpdate(taskId, updates)
    // Update selected task if it's the one being updated
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates })
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    await onTaskDelete(taskId)
    if (selectedTask?.id === taskId) {
      setIsDetailModalOpen(false)
      setSelectedTask(null)
    }
  }

  const getColumnStats = (status: TaskStatus) => {
    const tasks = getTasksByStatus(status)
    return {
      total: tasks.length,
      high: tasks.filter((t) => t.priority === 'HIGH' || t.priority === 'CRITICAL').length,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Manage and track task execution across all your agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-cubcen-primary hover:bg-cubcen-primary-hover gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      {isFiltersOpen && (
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          agents={agents}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TASK_COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id)
            const stats = getColumnStats(column.id)

            return (
              <Card key={column.id} className={`${column.bgColor} min-h-[600px]`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`flex items-center justify-between ${column.color}`}>
                    <span className="text-sm font-medium">{column.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {stats.total}
                      </Badge>
                      {stats.high > 0 && (
                        <Badge
                          variant="destructive"
                          className="text-xs bg-cubcen-secondary hover:bg-cubcen-secondary-hover"
                        >
                          {stats.high} high
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SortableContext
                    items={columnTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                        agents={agents}
                      />
                    ))}
                  </SortableContext>
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-sm">No tasks</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onClick={() => {}}
              agents={agents}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedTask(null)
        }}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
        agents={agents}
      />

      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onTaskCreate}
        agents={agents}
      />
    </div>
  )
}