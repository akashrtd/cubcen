/**
 * Cubcen Task Scheduling and Execution Service
 * Handles task scheduling, execution, retry logic, and status tracking
 */

import {
  PrismaClient,
  TaskStatus,
  TaskPriority,
  Task,
  Agent,
} from '@/generated/prisma'
import { logger } from '@/lib/logger'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { z } from 'zod'
import { EventEmitter } from 'events'

// Forward declaration to avoid circular dependency
interface WebSocketService {
  notifyTaskStatusChange(
    taskId: string,
    status: TaskStatus,
    metadata?: Record<string, unknown>
  ): void
  notifyTaskProgress(taskId: string, progress: number, message?: string): void
  notifyTaskError(
    taskId: string,
    error: string,
    context?: Record<string, unknown>
  ): void
}

// Validation schemas
const taskCreationSchema = z.object({
  agentId: z.string().min(1),
  workflowId: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  parameters: z.record(z.string(), z.unknown()).default({}),
  scheduledAt: z.date().optional(),
  maxRetries: z.number().min(0).max(10).default(3),
  timeoutMs: z.number().min(1000).max(300000).default(30000), // 1s to 5min
  createdBy: z.string().min(1),
})

const taskUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  scheduledAt: z.date().optional(),
  maxRetries: z.number().min(0).max(10).optional(),
  timeoutMs: z.number().min(1000).max(300000).optional(),
})

// Task queue interfaces
interface QueuedTask {
  id: string
  priority: TaskPriority
  scheduledAt: Date
  retryCount: number
  maxRetries: number
  timeoutMs: number
  createdAt: Date
}

interface TaskExecution {
  taskId: string
  startTime: Date
  timeout: NodeJS.Timeout
  abortController: AbortController
  promise: Promise<void>
}

interface TaskResult {
  success: boolean
  data?: unknown
  error?: string
  executionTime: number
  timestamp: Date
}

export interface TaskCreationData {
  agentId: string
  workflowId?: string
  name: string
  description?: string
  priority?: TaskPriority
  parameters?: Record<string, unknown>
  scheduledAt?: Date
  maxRetries?: number
  timeoutMs?: number
  createdBy: string
}

export interface TaskUpdateData {
  name?: string
  description?: string
  priority?: TaskPriority
  parameters?: Record<string, unknown>
  scheduledAt?: Date
  maxRetries?: number
  timeoutMs?: number
}

export interface TaskFilter {
  agentId?: string
  workflowId?: string
  status?: TaskStatus
  priority?: TaskPriority
  createdBy?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface TaskListOptions extends TaskFilter {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class TaskService extends EventEmitter {
  private prisma: PrismaClient
  private adapterManager: AdapterManager
  private webSocketService?: WebSocketService
  private taskQueue: Map<string, QueuedTask> = new Map()
  private runningTasks: Map<string, TaskExecution> = new Map()
  private schedulerInterval?: NodeJS.Timeout
  private maxConcurrentTasks: number = 10
  private queueProcessingInterval: number = 1000 // 1 second
  private isProcessing: boolean = false

  constructor(
    prisma: PrismaClient,
    adapterManager: AdapterManager,
    webSocketService?: WebSocketService
  ) {
    super()
    this.prisma = prisma
    this.adapterManager = adapterManager
    this.webSocketService = webSocketService
    this.startScheduler()
  }

  /**
   * Set WebSocket service for real-time updates
   */
  public setWebSocketService(webSocketService: WebSocketService): void {
    this.webSocketService = webSocketService
  }

  /**
   * Create a new task
   */
  async createTask(data: TaskCreationData): Promise<Task> {
    try {
      // Validate input data
      const validatedData = taskCreationSchema.parse({
        ...data,
        scheduledAt: data.scheduledAt || new Date(),
      })

      logger.info('Creating new task', {
        name: validatedData.name,
        agentId: validatedData.agentId,
        priority: validatedData.priority,
        scheduledAt: validatedData.scheduledAt,
      })

      // Verify agent exists and is active
      const agent = await this.prisma.agent.findUnique({
        where: { id: validatedData.agentId },
      })

      if (!agent) {
        throw new Error(`Agent with ID ${validatedData.agentId} not found`)
      }

      if (agent.status !== 'ACTIVE') {
        throw new Error(
          `Agent ${agent.name} is not active (status: ${agent.status})`
        )
      }

      // Create task in database
      const task = await this.prisma.task.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          agentId: validatedData.agentId,
          workflowId: validatedData.workflowId,
          status: 'PENDING',
          priority: validatedData.priority,
          parameters: JSON.stringify(validatedData.parameters),
          scheduledAt: validatedData.scheduledAt || new Date(),
          maxRetries: validatedData.maxRetries,
          createdBy: validatedData.createdBy,
        },
      })

      // Add to task queue
      this.addToQueue({
        id: task.id,
        priority: task.priority,
        scheduledAt: task.scheduledAt,
        retryCount: 0,
        maxRetries: validatedData.maxRetries,
        timeoutMs: validatedData.timeoutMs,
        createdAt: task.createdAt,
      })

      // Notify WebSocket clients
      this.webSocketService?.notifyTaskStatusChange(task.id, 'PENDING', {
        name: task.name,
        agentId: task.agentId,
        priority: task.priority,
        scheduledAt: task.scheduledAt,
      })

      logger.info('Task created successfully', {
        taskId: task.id,
        name: task.name,
        agentId: task.agentId,
      })

      return task
    } catch (error) {
      logger.error('Failed to create task', error as Error, {
        agentId: data.agentId,
        name: data.name,
      })
      throw error
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, data: TaskUpdateData): Promise<Task> {
    try {
      // Validate input data
      const validatedData = taskUpdateSchema.parse(data)

      logger.info('Updating task', { taskId, updateData: validatedData })

      // Check if task exists and is not running
      const existingTask = await this.prisma.task.findUnique({
        where: { id: taskId },
      })

      if (!existingTask) {
        throw new Error(`Task with ID ${taskId} not found`)
      }

      if (existingTask.status === 'RUNNING') {
        throw new Error('Cannot update a running task')
      }

      // Update task in database
      const task = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.description !== undefined && {
            description: validatedData.description,
          }),
          ...(validatedData.priority && { priority: validatedData.priority }),
          ...(validatedData.parameters && {
            parameters: JSON.stringify(validatedData.parameters),
          }),
          ...(validatedData.scheduledAt && {
            scheduledAt: validatedData.scheduledAt,
          }),
          ...(validatedData.maxRetries !== undefined && {
            maxRetries: validatedData.maxRetries,
          }),
          updatedAt: new Date(),
        },
      })

      // Update in queue if present
      const queuedTask = this.taskQueue.get(taskId)
      if (queuedTask) {
        this.taskQueue.set(taskId, {
          ...queuedTask,
          priority: validatedData.priority || queuedTask.priority,
          scheduledAt: validatedData.scheduledAt || queuedTask.scheduledAt,
          maxRetries:
            validatedData.maxRetries !== undefined
              ? validatedData.maxRetries
              : queuedTask.maxRetries,
        })
      }

      logger.info('Task updated successfully', { taskId, name: task.name })

      return task
    } catch (error) {
      logger.error('Failed to update task', error as Error, { taskId })
      throw error
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          agent: true,
          workflow: true,
          creator: {
            select: { id: true, email: true, name: true },
          },
        },
      })

      return task
    } catch (error) {
      logger.error('Failed to get task', error as Error, { taskId })
      throw error
    }
  }

  /**
   * Get tasks with filtering and pagination
   */
  async getTasks(options: TaskListOptions = {}): Promise<{
    tasks: Task[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const {
        agentId,
        workflowId,
        status,
        priority,
        createdBy,
        dateFrom,
        dateTo,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options

      // Build where clause
      const where: Record<string, unknown> = {}

      if (agentId) where.agentId = agentId
      if (workflowId) where.workflowId = workflowId
      if (status) where.status = status
      if (priority) where.priority = priority
      if (createdBy) where.createdBy = createdBy

      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom)
          (where.createdAt as Record<string, unknown>).gte = dateFrom
        if (dateTo) (where.createdAt as Record<string, unknown>).lte = dateTo
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ] as Record<string, unknown>[]
      }

      // Get total count
      const total = await this.prisma.task.count({ where })

      // Get tasks with pagination
      const tasks = await this.prisma.task.findMany({
        where,
        include: {
          agent: {
            select: { id: true, name: true, platformId: true },
          },
          workflow: {
            select: { id: true, name: true },
          },
          creator: {
            select: { id: true, email: true, name: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      })

      return {
        tasks,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      logger.error('Failed to get tasks', error as Error, options)
      throw error
    }
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<void> {
    try {
      logger.info('Cancelling task', { taskId })

      // Check if task is running
      const runningTask = this.runningTasks.get(taskId)
      if (runningTask) {
        // Cancel running task
        clearTimeout(runningTask.timeout)
        runningTask.abortController.abort()
        this.runningTasks.delete(taskId)

        logger.info('Running task cancelled', { taskId })
      }

      // Remove from queue
      this.taskQueue.delete(taskId)

      // Update task status in database
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'CANCELLED',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Notify WebSocket clients
      this.webSocketService?.notifyTaskStatusChange(taskId, 'CANCELLED', {
        cancelled: true,
        timestamp: new Date(),
      })

      logger.info('Task cancelled successfully', { taskId })
    } catch (error) {
      logger.error('Failed to cancel task', error as Error, { taskId })
      throw error
    }
  }

  /**
   * Retry a failed task
   */
  async retryTask(taskId: string): Promise<void> {
    try {
      logger.info('Retrying task', { taskId })

      // Get task from database
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      })

      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`)
      }

      if (task.status !== 'FAILED') {
        throw new Error(
          `Task ${taskId} is not in failed state (status: ${task.status})`
        )
      }

      // Reset task status and add back to queue
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'PENDING',
          startedAt: null,
          completedAt: null,
          result: null,
          error: null,
          updatedAt: new Date(),
        },
      })

      // Add back to queue
      this.addToQueue({
        id: task.id,
        priority: task.priority,
        scheduledAt: new Date(), // Retry immediately
        retryCount: task.retryCount,
        maxRetries: task.maxRetries,
        timeoutMs: 30000, // Default timeout
        createdAt: task.createdAt,
      })

      // Notify WebSocket clients
      this.webSocketService?.notifyTaskStatusChange(taskId, 'PENDING', {
        retried: true,
        retryCount: task.retryCount,
      })

      logger.info('Task retry initiated', { taskId })
    } catch (error) {
      logger.error('Failed to retry task', error as Error, { taskId })
      throw error
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      logger.info('Deleting task', { taskId })

      // Cancel if running
      await this.cancelTask(taskId)

      // Delete from database
      await this.prisma.task.delete({
        where: { id: taskId },
      })

      logger.info('Task deleted successfully', { taskId })
    } catch (error) {
      logger.error('Failed to delete task', error as Error, { taskId })
      throw error
    }
  }

  /**
   * Get task queue status
   */
  getQueueStatus(): {
    queueSize: number
    runningTasks: number
    maxConcurrentTasks: number
    isProcessing: boolean
    queuedTasks: Array<{
      id: string
      priority: TaskPriority
      scheduledAt: Date
      retryCount: number
    }>
  } {
    return {
      queueSize: this.taskQueue.size,
      runningTasks: this.runningTasks.size,
      maxConcurrentTasks: this.maxConcurrentTasks,
      isProcessing: this.isProcessing,
      queuedTasks: Array.from(this.taskQueue.values()).map(task => ({
        id: task.id,
        priority: task.priority,
        scheduledAt: task.scheduledAt,
        retryCount: task.retryCount,
      })),
    }
  }

  /**
   * Configure task execution settings
   */
  configureExecution(config: {
    maxConcurrentTasks?: number
    queueProcessingInterval?: number
  }): void {
    if (config.maxConcurrentTasks !== undefined) {
      this.maxConcurrentTasks = Math.max(
        1,
        Math.min(100, config.maxConcurrentTasks)
      )
    }

    if (config.queueProcessingInterval !== undefined) {
      this.queueProcessingInterval = Math.max(
        100,
        Math.min(10000, config.queueProcessingInterval)
      )

      // Restart scheduler with new interval
      this.stopScheduler()
      this.startScheduler()
    }

    logger.info('Task execution configuration updated', {
      maxConcurrentTasks: this.maxConcurrentTasks,
      queueProcessingInterval: this.queueProcessingInterval,
    })
  }

  /**
   * Add task to queue with priority handling
   */
  private addToQueue(task: QueuedTask): void {
    this.taskQueue.set(task.id, task)

    logger.debug('Task added to queue', {
      taskId: task.id,
      priority: task.priority,
      scheduledAt: task.scheduledAt,
      queueSize: this.taskQueue.size,
    })
  }

  /**
   * Get next task from queue based on priority and schedule
   */
  private getNextTask(): QueuedTask | null {
    const now = new Date()
    const availableTasks = Array.from(this.taskQueue.values())
      .filter(task => task.scheduledAt <= now)
      .sort((a, b) => {
        // Sort by priority first (CRITICAL > HIGH > MEDIUM > LOW)
        const priorityOrder: Record<TaskPriority, number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        }
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff

        // Then by scheduled time (earlier first)
        return a.scheduledAt.getTime() - b.scheduledAt.getTime()
      })

    return availableTasks[0] || null
  }

  /**
   * Execute a task
   */
  private async executeTask(queuedTask: QueuedTask): Promise<void> {
    const { id: taskId, timeoutMs } = queuedTask

    try {
      logger.info('Starting task execution', {
        taskId,
        retryCount: queuedTask.retryCount,
        timeout: timeoutMs,
      })

      // Get task details from database
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: { agent: { include: { platform: true } } },
      })

      if (!task) {
        throw new Error(`Task ${taskId} not found in database`)
      }

      // Update task status to running
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Notify WebSocket clients
      this.webSocketService?.notifyTaskStatusChange(taskId, 'RUNNING', {
        startedAt: new Date(),
        retryCount: queuedTask.retryCount,
      })

      // Create abort controller for cancellation
      const abortController = new AbortController()
      const startTime = new Date()

      // Set up timeout
      const timeout = setTimeout(() => {
        abortController.abort()
      }, timeoutMs)

      // Create task execution record
      const executionPromise = this.performTaskExecution(
        task,
        abortController.signal
      )

      const taskExecution: TaskExecution = {
        taskId,
        startTime,
        timeout,
        abortController,
        promise: executionPromise,
      }

      this.runningTasks.set(taskId, taskExecution)

      // Wait for execution to complete
      await executionPromise

      // Clean up
      clearTimeout(timeout)
      this.runningTasks.delete(taskId)

      logger.info('Task execution completed successfully', {
        taskId,
        executionTime: Date.now() - startTime.getTime(),
      })
    } catch (error) {
      // Clean up on error
      const execution = this.runningTasks.get(taskId)
      if (execution) {
        clearTimeout(execution.timeout)
        this.runningTasks.delete(taskId)
      }

      await this.handleTaskError(queuedTask, error as Error)
    }
  }

  /**
   * Perform the actual task execution
   */
  private async performTaskExecution(
    task: Task & { agent: Agent & { platform: any } },
    signal: AbortSignal
  ): Promise<void> {
    const startTime = Date.now()

    try {
      // Get platform adapter
      const adapter = this.adapterManager.getAdapter(task.agent.platformId)
      if (!adapter) {
        throw new Error(
          `No adapter found for platform ${task.agent.platformId}`
        )
      }

      // Parse task parameters
      const parameters = JSON.parse(task.parameters || '{}')

      // Report progress
      this.webSocketService?.notifyTaskProgress(
        task.id,
        25,
        'Initializing task execution'
      )

      // Execute task through adapter
      this.webSocketService?.notifyTaskProgress(
        task.id,
        50,
        'Executing agent workflow'
      )

      const result = await adapter.executeAgent(
        task.agent.externalId,
        parameters
      )

      if (signal.aborted) {
        throw new Error('Task execution was cancelled')
      }

      this.webSocketService?.notifyTaskProgress(
        task.id,
        75,
        'Processing results'
      )

      // Store successful result
      const executionTime = Date.now() - startTime
      const taskResult: TaskResult = {
        success: result.success,
        data: result.data,
        executionTime,
        timestamp: new Date(),
      }

      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          status: 'COMPLETED',
          result: JSON.stringify(taskResult),
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Final progress update
      this.webSocketService?.notifyTaskProgress(
        task.id,
        100,
        'Task completed successfully'
      )

      // Notify WebSocket clients
      this.webSocketService?.notifyTaskStatusChange(task.id, 'COMPLETED', {
        success: true,
        executionTime,
        completedAt: new Date(),
      })

      // Emit completion event
      this.emit('taskCompleted', {
        taskId: task.id,
        agentId: task.agentId,
        result: taskResult,
      })
    } catch (error) {
      if (signal.aborted) {
        throw new Error('Task execution was cancelled')
      }
      throw error
    }
  }

  /**
   * Handle task execution error
   */
  private async handleTaskError(
    queuedTask: QueuedTask,
    error: Error
  ): Promise<void> {
    const { id: taskId, retryCount, maxRetries } = queuedTask

    logger.error('Task execution failed', error, {
      taskId,
      retryCount,
      maxRetries,
    })

    // Check if we should retry
    if (
      retryCount < maxRetries &&
      error.message !== 'Task execution was cancelled'
    ) {
      // Increment retry count and reschedule
      const nextRetryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000) // Exponential backoff, max 30s
      const nextScheduledAt = new Date(Date.now() + nextRetryDelay)

      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          retryCount: retryCount + 1,
          updatedAt: new Date(),
        },
      })

      // Add back to queue for retry
      this.addToQueue({
        ...queuedTask,
        retryCount: retryCount + 1,
        scheduledAt: nextScheduledAt,
      })

      // Notify about retry
      this.webSocketService?.notifyTaskStatusChange(taskId, 'PENDING', {
        retrying: true,
        retryCount: retryCount + 1,
        nextRetryAt: nextScheduledAt,
        error: error.message,
      })

      logger.info('Task scheduled for retry', {
        taskId,
        retryCount: retryCount + 1,
        nextRetryAt: nextScheduledAt,
      })
    } else {
      // Mark as failed
      const taskError = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        retryCount,
      }

      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          error: JSON.stringify(taskError),
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Notify WebSocket clients
      this.webSocketService?.notifyTaskStatusChange(taskId, 'FAILED', {
        error: error.message,
        retryCount,
        maxRetriesExceeded: retryCount >= maxRetries,
      })

      this.webSocketService?.notifyTaskError(taskId, error.message, {
        retryCount,
        maxRetries,
        timestamp: new Date(),
      })

      // Emit failure event
      this.emit('taskFailed', {
        taskId,
        error: taskError,
        retryCount,
      })
    }
  }

  /**
   * Start the task scheduler
   */
  private startScheduler(): void {
    if (this.schedulerInterval) {
      return
    }

    this.schedulerInterval = setInterval(async () => {
      await this.processQueue()
    }, this.queueProcessingInterval)

    logger.info('Task scheduler started', {
      interval: this.queueProcessingInterval,
      maxConcurrentTasks: this.maxConcurrentTasks,
    })
  }

  /**
   * Stop the task scheduler
   */
  private stopScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval)
      this.schedulerInterval = undefined
      logger.info('Task scheduler stopped')
    }
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    if (
      this.isProcessing ||
      this.runningTasks.size >= this.maxConcurrentTasks
    ) {
      return
    }

    this.isProcessing = true

    try {
      while (this.runningTasks.size < this.maxConcurrentTasks) {
        const nextTask = this.getNextTask()
        if (!nextTask) {
          break // No more tasks to process
        }

        // Remove from queue
        this.taskQueue.delete(nextTask.id)

        // Start execution (don't await - run concurrently)
        this.executeTask(nextTask).catch(error => {
          logger.error('Unhandled task execution error', error, {
            taskId: nextTask.id,
          })
        })
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Cleanup - stop scheduler and cancel running tasks
   */
  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up task service')

      // Stop scheduler
      this.stopScheduler()

      // Cancel all running tasks
      const runningTaskIds = Array.from(this.runningTasks.keys())
      await Promise.all(runningTaskIds.map(taskId => this.cancelTask(taskId)))

      // Clear queues
      this.taskQueue.clear()
      this.runningTasks.clear()

      logger.info('Task service cleanup completed')
    } catch (error) {
      logger.error('Failed to cleanup task service', error as Error)
      throw error
    }
  }
}
