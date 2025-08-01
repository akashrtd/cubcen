'use client'

import React, { useState } from 'react'
import { TaskBoard } from '@/components/kanban/task-board'
import { Task } from '@/lib/database'
import { toast } from 'sonner'

type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

// Mock data for development - in real app this would come from API
const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Process Customer Data',
    description: 'Extract and process customer information from CRM',
    agentId: 'agent-1',
    workflowId: null,
    status: 'PENDING',
    priority: 'HIGH',
    parameters: '{"source": "crm", "limit": 100}',
    scheduledAt: new Date(),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
    retryCount: 0,
    maxRetries: 3,
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Generate Weekly Report',
    description: 'Create automated weekly performance report',
    agentId: 'agent-2',
    workflowId: null,
    status: 'RUNNING',
    priority: 'MEDIUM',
    parameters: '{"period": "weekly", "format": "pdf"}',
    scheduledAt: new Date(Date.now() - 300000), // 5 minutes ago
    startedAt: new Date(Date.now() - 120000), // 2 minutes ago
    completedAt: null,
    result: null,
    error: null,
    retryCount: 0,
    maxRetries: 3,
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date(Date.now() - 120000),
  },
  {
    id: '3',
    name: 'Send Email Notifications',
    description: 'Send automated email notifications to customers',
    agentId: 'agent-1',
    workflowId: null,
    status: 'COMPLETED',
    priority: 'LOW',
    parameters: '{"template": "welcome", "recipients": 50}',
    scheduledAt: new Date(Date.now() - 3600000), // 1 hour ago
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3300000), // 55 minutes ago
    result: '{"sent": 50, "failed": 0, "duration": 45}',
    error: null,
    retryCount: 0,
    maxRetries: 3,
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3300000),
  },
  {
    id: '4',
    name: 'Data Backup Process',
    description: 'Backup critical database information',
    agentId: 'agent-3',
    workflowId: null,
    status: 'FAILED',
    priority: 'CRITICAL',
    parameters: '{"database": "production", "compression": true}',
    scheduledAt: new Date(Date.now() - 7200000), // 2 hours ago
    startedAt: new Date(Date.now() - 7200000),
    completedAt: new Date(Date.now() - 6900000), // 1h 55m ago
    result: null,
    error:
      '{"message": "Database connection timeout", "code": "DB_TIMEOUT", "timestamp": "2024-01-15T10:30:00Z"}',
    retryCount: 2,
    maxRetries: 3,
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 6900000),
  },
]

const mockAgents = [
  { id: 'agent-1', name: 'Email Automation Agent', platformId: 'n8n' },
  { id: 'agent-2', name: 'Report Generator', platformId: 'make' },
  { id: 'agent-3', name: 'Database Manager', platformId: 'n8n' },
  { id: 'agent-4', name: 'Data Processor', platformId: 'make' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [isLoading, setIsLoading] = useState(false)

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      )

      toast.success('Task updated successfully')
    } catch (error) {
      toast.error('Failed to update task')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskCreate = async (taskData: {
    name: string
    description?: string
    agentId: string
    priority: TaskPriority
    scheduledAt: Date
    maxRetries: number
    parameters: Record<string, unknown>
    createdBy: string
  }) => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: taskData.name,
        description: taskData.description ?? null,
        agentId: taskData.agentId,
        workflowId: null,
        status: 'PENDING',
        priority: taskData.priority,
        parameters: JSON.stringify(taskData.parameters),
        scheduledAt: taskData.scheduledAt,
        startedAt: null,
        completedAt: null,
        result: null,
        error: null,
        retryCount: 0,
        maxRetries: taskData.maxRetries,
        createdBy: taskData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setTasks(prevTasks => [newTask, ...prevTasks])
      toast.success('Task created successfully')
    } catch (error) {
      toast.error('Failed to create task')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully')
    } catch (error) {
      toast.error('Failed to delete task')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TaskBoard
      tasks={tasks}
      onTaskUpdate={handleTaskUpdate}
      onTaskCreate={handleTaskCreate}
      onTaskDelete={handleTaskDelete}
      agents={mockAgents}
      isLoading={isLoading}
    />
  )
}
