// Cubcen Task Management API Routes
// Express routes for task management endpoints

import { Router, Request, Response } from 'express'
import { logger } from '@/lib/logger'
import { TaskService } from '@/services/task'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { TaskStatus, TaskPriority } from '@/lib/database'
import {
  authenticate,
  requireAuth,
  requireOperator,
  requireAdmin,
} from '@/backend/middleware/auth'
import {
  validateBody,
  validateParams,
  validateQuery,
  idParamSchema,
  paginationQuerySchema,
} from '@/backend/middleware/validation'
import { z } from 'zod'

const router = Router()

// Task service instance (will be injected)
let taskService: TaskService

// Validation schemas
// Initialize task service
export function initializeTaskService(
  adapterManager: AdapterManager,
  webSocketService?: unknown
): void {
  taskService = new TaskService(
    adapterManager,
    webSocketService as WebSocketService
  )
}

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
const createTaskSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  workflowId: z.string().optional(),
  name: z.string().min(1, 'Task name is required').max(200),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  scheduledAt: z.string().datetime().optional(),
  parameters: z.record(z.string(), z.unknown()).default({}),
  maxRetries: z.number().min(0).max(10).default(3),
  timeoutMs: z.number().min(1000).max(300000).default(30000),
})

const updateTaskSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  scheduledAt: z.string().datetime().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  maxRetries: z.number().min(0).max(10).optional(),
  timeoutMs: z.number().min(1000).max(300000).optional(),
})

const taskQuerySchema = paginationQuerySchema.extend({
  agentId: z.string().optional(),
  workflowId: z.string().optional(),
  status: z
    .enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  createdBy: z.string().optional(),
})

/**
 * GET /api/cubcen/v1/tasks
 * Get all tasks with filtering and pagination
 */
router.get(
  '/',
  authenticate,
  requireAuth,
  validateQuery(taskQuerySchema),
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      const {
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        agentId,
        workflowId,
        status,
        priority,
        dateFrom,
        dateTo,
        search,
        createdBy,
      } = req.query

      logger.info('Get tasks request', {
        userId: req.user!.id,
        filters: {
          agentId,
          workflowId,
          status,
          priority,
          dateFrom,
          dateTo,
          search,
          createdBy,
        },
        pagination: { page, limit, sortBy, sortOrder },
      })

      const result = await taskService.getTasks({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        agentId: agentId as string,
        workflowId: workflowId as string,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        search: search as string,
        createdBy: createdBy as string,
      })

      res.status(200).json({
        success: true,
        data: {
          tasks: result.tasks,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        message: 'Tasks retrieved successfully',
      })
    } catch (error) {
      logger.error('Get tasks failed', error as Error, { userId: req.user?.id })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve tasks',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/tasks/:id
 * Get task by ID
 */
router.get(
  '/:id',
  authenticate,
  requireAuth,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      const { id } = req.params

      logger.info('Get task by ID request', {
        userId: req.user!.id,
        taskId: id,
      })

      const task = await taskService.getTask(id)

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found',
          },
        })
      }

      res.status(200).json({
        success: true,
        data: { task },
        message: 'Task retrieved successfully',
      })
    } catch (error) {
      logger.error('Get task by ID failed', error as Error, {
        userId: req.user?.id,
        taskId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve task',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/tasks
 * Create a new task
 */
router.post(
  '/',
  authenticate,
  requireOperator,
  validateBody(createTaskSchema),
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      const taskData = req.body

      logger.info('Create task request', {
        userId: req.user!.id,
        taskData: { ...taskData, parameters: '[REDACTED]' },
      })

      const task = await taskService.createTask({
        ...taskData,
        scheduledAt: taskData.scheduledAt
          ? new Date(taskData.scheduledAt)
          : undefined,
        createdBy: req.user!.id,
      })

      logger.info('Task created successfully', {
        userId: req.user!.id,
        taskId: task.id,
      })

      res.status(201).json({
        success: true,
        data: { task },
        message: 'Task created successfully',
      })
    } catch (error) {
      logger.error('Create task failed', error as Error, {
        userId: req.user?.id,
      })

      const statusCode =
        (error as Error).message.includes('not found') ||
        (error as Error).message.includes('not active')
          ? 400
          : 500

      res.status(statusCode).json({
        success: false,
        error: {
          code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
          message: (error as Error).message,
        },
      })
    }
  }
)

/**
 * PUT /api/cubcen/v1/tasks/:id
 * Update task by ID
 */
router.put(
  '/:id',
  authenticate,
  requireOperator,
  validateParams(idParamSchema),
  validateBody(updateTaskSchema),
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      const { id } = req.params
      const updateData = req.body

      logger.info('Update task request', {
        userId: req.user!.id,
        taskId: id,
        updateData: {
          ...updateData,
          parameters: updateData.parameters ? '[REDACTED]' : undefined,
        },
      })

      const task = await taskService.updateTask(id, {
        ...updateData,
        scheduledAt: updateData.scheduledAt
          ? new Date(updateData.scheduledAt)
          : undefined,
      })

      logger.info('Task updated successfully', {
        userId: req.user!.id,
        taskId: id,
      })

      res.status(200).json({
        success: true,
        data: { task },
        message: 'Task updated successfully',
      })
    } catch (error) {
      logger.error('Update task failed', error as Error, {
        userId: req.user?.id,
        taskId: req.params.id,
      })

      const statusCode =
        (error as Error).message.includes('not found') ||
        (error as Error).message.includes('Cannot update')
          ? 400
          : 500

      res.status(statusCode).json({
        success: false,
        error: {
          code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
          message: (error as Error).message,
        },
      })
    }
  }
)

/**
 * DELETE /api/cubcen/v1/tasks/:id
 * Delete task by ID
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      const { id } = req.params

      logger.info('Delete task request', {
        userId: req.user!.id,
        taskId: id,
      })

      await taskService.deleteTask(id)

      logger.info('Task deleted successfully', {
        userId: req.user!.id,
        taskId: id,
      })

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      })
    } catch (error) {
      logger.error('Delete task failed', error as Error, {
        userId: req.user?.id,
        taskId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete task',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/tasks/:id/cancel
 * Cancel task by ID
 */
router.post(
  '/:id/cancel',
  authenticate,
  requireOperator,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      const { id } = req.params

      logger.info('Cancel task request', {
        userId: req.user!.id,
        taskId: id,
      })

      await taskService.cancelTask(id)

      logger.info('Task cancellation initiated', {
        userId: req.user!.id,
        taskId: id,
      })

      res.status(200).json({
        success: true,
        message: 'Task cancellation initiated successfully',
      })
    } catch (error) {
      logger.error('Cancel task failed', error as Error, {
        userId: req.user?.id,
        taskId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel task',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/tasks/:id/retry
 * Retry failed task by ID
 */
router.post(
  '/:id/retry',
  authenticate,
  requireOperator,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      const { id } = req.params

      logger.info('Retry task request', {
        userId: req.user!.id,
        taskId: id,
      })

      await taskService.retryTask(id)

      logger.info('Task retry initiated', {
        userId: req.user!.id,
        taskId: id,
      })

      res.status(200).json({
        success: true,
        message: 'Task retry initiated successfully',
      })
    } catch (error) {
      logger.error('Retry task failed', error as Error, {
        userId: req.user?.id,
        taskId: req.params.id,
      })

      const statusCode =
        (error as Error).message.includes('not found') ||
        (error as Error).message.includes('not in failed state')
          ? 400
          : 500

      res.status(statusCode).json({
        success: false,
        error: {
          code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
          message: (error as Error).message,
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/tasks/queue/status
 * Get task queue status
 */
router.get(
  '/queue/status',
  authenticate,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      logger.info('Get queue status request', {
        userId: req.user!.id,
      })

      const queueStatus = taskService.getQueueStatus()

      res.status(200).json({
        success: true,
        data: { queueStatus },
        message: 'Queue status retrieved successfully',
      })
    } catch (error) {
      logger.error('Get queue status failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve queue status',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/tasks/queue/configure
 * Configure task execution settings
 */
router.post(
  '/queue/configure',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      if (!taskService) {
        throw new Error('Task service not initialized')
      }

      const { maxConcurrentTasks, queueProcessingInterval } = req.body

      logger.info('Configure task execution request', {
        userId: req.user!.id,
        config: { maxConcurrentTasks, queueProcessingInterval },
      })

      taskService.configureExecution({
        maxConcurrentTasks,
        queueProcessingInterval,
      })

      res.status(200).json({
        success: true,
        message: 'Task execution configuration updated successfully',
      })
    } catch (error) {
      logger.error('Configure task execution failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to configure task execution',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/tasks/:id/logs
 * Get task execution logs
 */
router.get(
  '/:id/logs',
  authenticate,
  requireAuth,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      logger.info('Get task logs request', {
        userId: req.user!.id,
        taskId: id,
      })

      // TODO: Implement task logs service with database integration
      // For now, return mock logs based on task status
      const mockLogs = [
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Task started',
          context: { taskId: id },
        },
        {
          timestamp: new Date(),
          level: 'debug',
          message: 'Processing parameters',
          context: { paramCount: 3 },
        },
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Executing agent workflow',
          context: { agentId: 'agent_1' },
        },
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Task completed successfully',
          context: { duration: 1500, result: 'success' },
        },
      ]

      res.status(200).json({
        success: true,
        data: { logs: mockLogs },
        message: 'Task logs retrieved successfully',
      })
    } catch (error) {
      logger.error('Get task logs failed', error as Error, {
        userId: req.user?.id,
        taskId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve task logs',
        },
      })
    }
  }
)

export default router
