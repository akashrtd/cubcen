'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, Settings } from 'lucide-react'
import { TaskPriority } from '@/lib/database'

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (taskData: {
    name: string
    description?: string
    agentId: string
    priority: TaskPriority
    scheduledAt: Date
    maxRetries: number
    timeoutMs: number
    parameters: Record<string, unknown>
    createdBy: string
  }) => Promise<void>
  agents: Array<{ id: string; name: string; platformId: string }>
}

const taskSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(200, 'Task name too long'),
  description: z.string().optional(),
  agentId: z.string().min(1, 'Agent is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  scheduledAt: z.string().optional(),
  maxRetries: z.number().min(0).max(10).default(3),
  timeoutMs: z.number().min(1000).max(300000).default(30000),
  parameters: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

const PRIORITY_OPTIONS: Array<{
  value: TaskPriority
  label: string
  description: string
}> = [
  {
    value: 'LOW',
    label: 'Low',
    description:
      'Non-urgent tasks that can be processed when resources are available',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: 'Standard priority tasks for regular processing',
  },
  {
    value: 'HIGH',
    label: 'High',
    description: 'Important tasks that should be processed quickly',
  },
  {
    value: 'CRITICAL',
    label: 'Critical',
    description: 'Urgent tasks that require immediate attention',
  },
]

export function TaskCreateModal({
  isOpen,
  onClose,
  onCreate,
  agents,
}: TaskCreateModalProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [parametersError, setParametersError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
      maxRetries: 3,
      timeoutMs: 30000,
    },
  })

  const selectedAgentId = watch('agentId')
  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  const validateParameters = (parametersString: string) => {
    if (!parametersString.trim()) return true
    try {
      JSON.parse(parametersString)
      setParametersError(null)
      return true
    } catch (error) {
      setParametersError('Invalid JSON format')
      return false
    }
  }

  const onSubmit = async (data: TaskFormData) => {
    // Validate parameters if provided
    if (data.parameters && !validateParameters(data.parameters)) {
      return;
    }

    setIsCreating(true);
    try {
      const taskData = {
        name: data.name,
        description: data.description || undefined,
        agentId: data.agentId,
        priority: data.priority,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
        maxRetries: data.maxRetries,
        timeoutMs: data.timeoutMs,
        parameters: data.parameters ? JSON.parse(data.parameters) : {},
        createdBy: 'current-user', // This should come from auth context
      };

      await onCreate(taskData);
      reset();
      onClose();
    } catch (_error) {
      console.error('Failed to create task:', _error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    reset()
    setParametersError(null)
    onClose()
  }

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-cubcen-primary" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Task Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter task name"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description (optional)"
                  rows={3}
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agentId">Agent *</Label>
                  <Select
                    value={selectedAgentId}
                    onValueChange={value => setValue('agentId', value)}
                  >
                    <SelectTrigger
                      className={errors.agentId ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>{agent.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({agent.platformId})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.agentId && (
                    <p className="text-sm text-red-500">
                      {errors.agentId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={watch('priority')}
                    onValueChange={(value: TaskPriority) =>
                      setValue('priority', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduling & Execution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeLocal(new Date())}
                  {...register('scheduledAt')}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to schedule immediately
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="0"
                    max="10"
                    {...register('maxRetries', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of retry attempts on failure
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeoutMs">Timeout (seconds)</Label>
                  <Input
                    id="timeoutMs"
                    type="number"
                    min="1"
                    max="300"
                    {...register('timeoutMs', {
                      valueAsNumber: true,
                      setValueAs: value => value * 1000, // Convert to milliseconds
                    })}
                    defaultValue="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum execution time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Task Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parameters">Parameters (JSON)</Label>
                <Textarea
                  id="parameters"
                  placeholder='{"key": "value", "setting": true}'
                  rows={4}
                  {...register('parameters')}
                  className={parametersError ? 'border-red-500' : ''}
                  onChange={e => {
                    register('parameters').onChange(e)
                    if (e.target.value.trim()) {
                      validateParameters(e.target.value)
                    } else {
                      setParametersError(null)
                    }
                  }}
                />
                {parametersError && (
                  <p className="text-sm text-red-500">{parametersError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional JSON parameters to pass to the agent
                </p>
              </div>

              {selectedAgent && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Selected Agent:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{selectedAgent.name}</span>
                    <span>•</span>
                    <span>{selectedAgent.platformId}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !!parametersError}
              className="bg-cubcen-primary hover:bg-cubcen-primary-hover"
            >
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
