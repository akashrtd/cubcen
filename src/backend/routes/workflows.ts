/**
 * Cubcen Workflow API Routes
 * RESTful API endpoints for workflow management and orchestration
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { WorkflowService } from '@/services/workflow'
import { authenticateToken } from '@/backend/middleware/auth'
import { validateRequest } from '@/backend/middleware/validation'
import { logger } from '@/lib/logger'
import {
  WorkflowCreationData,
  WorkflowUpdateData,
  WorkflowExecutionOptions,
  WorkflowListOptions,
  WorkflowStatus,
} from '@/types/workflow'

// Validation schemas
const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    steps: z
      .array(
        z.object({
          agentId: z.string().min(1),
          stepOrder: z.number().min(0),
          name: z.string().min(1).max(200),
          parameters: z.record(z.string(), z.unknown()).default({}),
          conditions: z
            .array(
              z.object({
                type: z.enum([
                  'always',
                  'on_success',
                  'on_failure',
                  'expression',
                ]),
                expression: z.string().optional(),
                dependsOn: z.array(z.string()).optional(),
              })
            )
            .default([{ type: 'always' }]),
          retryConfig: z
            .object({
              maxRetries: z.number().min(0).max(10).default(3),
              backoffMs: z.number().min(100).default(1000),
              backoffMultiplier: z.number().min(1).default(2),
              maxBackoffMs: z.number().min(1000).default(30000),
            })
            .optional(),
          timeoutMs: z.number().min(1000).max(300000).default(60000),
        })
      )
      .min(1),
  }),
})

const updateWorkflowSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
    steps: z
      .array(
        z.object({
          id: z.string().optional(),
          agentId: z.string().min(1),
          stepOrder: z.number().min(0),
          name: z.string().min(1).max(200),
          parameters: z.record(z.string(), z.unknown()).default({}),
          conditions: z
            .array(
              z.object({
                type: z.enum([
                  'always',
                  'on_success',
                  'on_failure',
                  'expression',
                ]),
                expression: z.string().optional(),
                dependsOn: z.array(z.string()).optional(),
              })
            )
            .default([{ type: 'always' }]),
          retryConfig: z
            .object({
              maxRetries: z.number().min(0).max(10).default(3),
              backoffMs: z.number().min(100).default(1000),
              backoffMultiplier: z.number().min(1).default(2),
              maxBackoffMs: z.number().min(1000).default(30000),
            })
            .optional(),
          timeoutMs: z.number().min(1000).max(300000).default(60000),
        })
      )
      .optional(),
  }),
})

const getWorkflowsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .default('10'),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
    createdBy: z.string().optional(),
    dateFrom: z
      .string()
      .datetime()
      .transform(str => new Date(str))
      .optional(),
    dateTo: z
      .string()
      .datetime()
      .transform(str => new Date(str))
      .optional(),
    search: z.string().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
})

const executeWorkflowSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    variables: z.record(z.string(), z.unknown()).default({}),
    metadata: z.record(z.string(), z.unknown()).default({}),
    dryRun: z.boolean().default(false),
  }),
})

const workflowIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
})

const executionIdSchema = z.object({
  params: z.object({
    executionId: z.string().min(1),
  }),
})

export function createWorkflowRoutes(workflowService: WorkflowService): Router {
  const router = Router()

  /**
   * @swagger
   * /api/cubcen/v1/workflows:
   *   post:
   *     summary: Create a new workflow
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - steps
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *               description:
   *                 type: string
   *               steps:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   type: object
   *                   required:
   *                     - agentId
   *                     - stepOrder
   *                     - name
   *                   properties:
   *                     agentId:
   *                       type: string
   *                     stepOrder:
   *                       type: number
   *                       minimum: 0
   *                     name:
   *                       type: string
   *                       maxLength: 200
   *                     parameters:
   *                       type: object
   *                     conditions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           type:
   *                             type: string
   *                             enum: [always, on_success, on_failure, expression]
   *                           expression:
   *                             type: string
   *                           dependsOn:
   *                             type: array
   *                             items:
   *                               type: string
   *                     retryConfig:
   *                       type: object
   *                       properties:
   *                         maxRetries:
   *                           type: number
   *                           minimum: 0
   *                           maximum: 10
   *                         backoffMs:
   *                           type: number
   *                           minimum: 100
   *                         backoffMultiplier:
   *                           type: number
   *                           minimum: 1
   *                         maxBackoffMs:
   *                           type: number
   *                           minimum: 1000
   *                     timeoutMs:
   *                       type: number
   *                       minimum: 1000
   *                       maximum: 300000
   *     responses:
   *       201:
   *         description: Workflow created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WorkflowDefinition'
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/',
    authenticate,
    validateRequest(createWorkflowSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { name, description, steps } = req.body
        const userId = req.user?.id

        if (!userId) {
          return res.status(401).json({
            error: {
              code: 'UNAUTHORIZED',
              message: 'User ID not found in token',
            },
          })
        }

        const workflowData: WorkflowCreationData = {
          name,
          description,
          steps,
          createdBy: userId,
        }

        const workflow = await workflowService.createWorkflow(workflowData)

        logger.info('Workflow created via API', {
          workflowId: workflow.id,
          name: workflow.name,
          userId,
          stepCount: workflow.steps.length,
        })

        res.status(201).json({
          success: true,
          data: workflow,
        })
      } catch (error) {
        logger.error('Failed to create workflow via API', error as Error, {
          userId: req.user?.id,
          body: req.body,
        })
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows:
   *   get:
   *     summary: Get workflows with filtering and pagination
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [DRAFT, ACTIVE, PAUSED, ARCHIVED]
   *       - in: query
   *         name: createdBy
   *         schema:
   *           type: string
   *       - in: query
   *         name: dateFrom
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: dateTo
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           default: createdAt
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Workflows retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     workflows:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/WorkflowDefinition'
   *                     total:
   *                       type: number
   *                     page:
   *                       type: number
   *                     limit:
   *                       type: number
   *                     totalPages:
   *                       type: number
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/',
    authenticate,
    validateRequest(getWorkflowsSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const options: WorkflowListOptions = {
          page: parseInt(req.query.page as string),
          limit: parseInt(req.query.limit as string),
          status: req.query.status as WorkflowStatus,
          createdBy: req.query.createdBy as string,
          dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
          dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
          search: req.query.search as string,
          sortBy: req.query.sortBy as string,
          sortOrder: req.query.sortOrder as 'asc' | 'desc',
        }

        const result = await workflowService.getWorkflows(options)

        res.json({
          success: true,
          data: result,
        })
      } catch (error) {
        logger.error('Failed to get workflows via API', error as Error, {
          userId: req.user?.id,
          query: req.query,
        })
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows/{id}:
   *   get:
   *     summary: Get workflow by ID
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Workflow retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/WorkflowDefinition'
   *       404:
   *         description: Workflow not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/:id',
    authenticate,
    validateRequest(workflowIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params

        const workflow = await workflowService.getWorkflow(id)

        if (!workflow) {
          return res.status(404).json({
            error: {
              code: 'WORKFLOW_NOT_FOUND',
              message: `Workflow with ID ${id} not found`,
            },
          })
        }

        res.json({
          success: true,
          data: workflow,
        })
      } catch (error) {
        logger.error('Failed to get workflow via API', error as Error, {
          userId: req.user?.id,
          workflowId: req.params.id,
        })
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows/{id}:
   *   put:
   *     summary: Update workflow
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [DRAFT, ACTIVE, PAUSED, ARCHIVED]
   *               steps:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - agentId
   *                     - stepOrder
   *                     - name
   *                   properties:
   *                     id:
   *                       type: string
   *                     agentId:
   *                       type: string
   *                     stepOrder:
   *                       type: number
   *                       minimum: 0
   *                     name:
   *                       type: string
   *                       maxLength: 200
   *                     parameters:
   *                       type: object
   *                     conditions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           type:
   *                             type: string
   *                             enum: [always, on_success, on_failure, expression]
   *                           expression:
   *                             type: string
   *                           dependsOn:
   *                             type: array
   *                             items:
   *                               type: string
   *                     retryConfig:
   *                       type: object
   *                       properties:
   *                         maxRetries:
   *                           type: number
   *                           minimum: 0
   *                           maximum: 10
   *                         backoffMs:
   *                           type: number
   *                           minimum: 100
   *                         backoffMultiplier:
   *                           type: number
   *                           minimum: 1
   *                         maxBackoffMs:
   *                           type: number
   *                           minimum: 1000
   *                     timeoutMs:
   *                       type: number
   *                       minimum: 1000
   *                       maximum: 300000
   *     responses:
   *       200:
   *         description: Workflow updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/WorkflowDefinition'
   *       400:
   *         description: Invalid request data
   *       404:
   *         description: Workflow not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/:id',
    authenticate,
    validateRequest(updateWorkflowSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params
        const updateData: WorkflowUpdateData = req.body

        const workflow = await workflowService.updateWorkflow(id, updateData)

        logger.info('Workflow updated via API', {
          workflowId: id,
          userId: req.user?.id,
          updateData,
        })

        res.json({
          success: true,
          data: workflow,
        })
      } catch (error) {
        logger.error('Failed to update workflow via API', error as Error, {
          userId: req.user?.id,
          workflowId: req.params.id,
          body: req.body,
        })
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows/{id}:
   *   delete:
   *     summary: Delete workflow
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Workflow deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       404:
   *         description: Workflow not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/:id',
    authenticate,
    validateRequest(workflowIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params

        await workflowService.deleteWorkflow(id)

        logger.info('Workflow deleted via API', {
          workflowId: id,
          userId: req.user?.id,
        })

        res.json({
          success: true,
          message: 'Workflow deleted successfully',
        })
      } catch (error) {
        logger.error('Failed to delete workflow via API', error as Error, {
          userId: req.user?.id,
          workflowId: req.params.id,
        })
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows/{id}/validate:
   *   post:
   *     summary: Validate workflow definition
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Workflow validation result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     valid:
   *                       type: boolean
   *                     errors:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           type:
   *                             type: string
   *                           stepId:
   *                             type: string
   *                           message:
   *                             type: string
   *                     warnings:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           type:
   *                             type: string
   *                           stepId:
   *                             type: string
   *                           message:
   *                             type: string
   *       404:
   *         description: Workflow not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/:id/validate',
    authenticate,
    validateRequest(workflowIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params

        const workflow = await workflowService.getWorkflow(id)
        if (!workflow) {
          return res.status(404).json({
            error: {
              code: 'WORKFLOW_NOT_FOUND',
              message: `Workflow with ID ${id} not found`,
            },
          })
        }

        const validation =
          await workflowService.validateWorkflowDefinition(workflow)

        res.json({
          success: true,
          data: validation,
        })
      } catch (error) {
        logger.error('Failed to validate workflow via API', error as Error, {
          userId: req.user?.id,
          workflowId: req.params.id,
        })
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows/{id}/execute:
   *   post:
   *     summary: Execute workflow
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               variables:
   *                 type: object
   *                 description: Variables to pass to workflow execution
   *               metadata:
   *                 type: object
   *                 description: Metadata for workflow execution
   *               dryRun:
   *                 type: boolean
   *                 default: false
   *                 description: Whether to perform a dry run (validation only)
   *     responses:
   *       200:
   *         description: Workflow execution started
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     executionId:
   *                       type: string
   *                     workflowId:
   *                       type: string
   *                     status:
   *                       type: string
   *                       enum: [PENDING, RUNNING, COMPLETED, FAILED, CANCELLED]
   *                     startedAt:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Invalid request data or workflow validation failed
   *       404:
   *         description: Workflow not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/:id/execute',
    authenticate,
    validateRequest(executeWorkflowSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params
        const { variables, metadata, dryRun } = req.body
        const userId = req.user?.id

        if (!userId) {
          return res.status(401).json({
            error: {
              code: 'UNAUTHORIZED',
              message: 'User ID not found in token',
            },
          })
        }

        const options: WorkflowExecutionOptions = {
          variables,
          metadata,
          dryRun,
        }

        const executionId = await workflowService.executeWorkflow(
          id,
          options,
          userId
        )

        logger.info('Workflow execution started via API', {
          workflowId: id,
          executionId,
          userId,
          dryRun,
        })

        res.json({
          success: true,
          data: {
            executionId,
            workflowId: id,
            status: 'PENDING',
            startedAt: new Date().toISOString(),
          },
        })
      } catch (error) {
        logger.error('Failed to execute workflow via API', error as Error, {
          userId: req.user?.id,
          workflowId: req.params.id,
          body: req.body,
        })
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows/executions/{executionId}:
   *   get:
   *     summary: Get workflow execution status
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: executionId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Workflow execution status retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     workflowId:
   *                       type: string
   *                     status:
   *                       type: string
   *                       enum: [PENDING, RUNNING, COMPLETED, FAILED, CANCELLED]
   *                     startedAt:
   *                       type: string
   *                       format: date-time
   *                     completedAt:
   *                       type: string
   *                       format: date-time
   *                     error:
   *                       type: string
   *                     stepExecutions:
   *                       type: array
   *                       items:
   *                         type: object
   *       404:
   *         description: Execution not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/executions/:executionId',
    authenticate,
    validateRequest(executionIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { executionId } = req.params

        const execution = workflowService.getWorkflowExecution(executionId)

        if (!execution) {
          return res.status(404).json({
            error: {
              code: 'EXECUTION_NOT_FOUND',
              message: `Workflow execution with ID ${executionId} not found`,
            },
          })
        }

        res.json({
          success: true,
          data: execution,
        })
      } catch (error) {
        logger.error(
          'Failed to get workflow execution via API',
          error as Error,
          {
            userId: req.user?.id,
            executionId: req.params.executionId,
          }
        )
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows/executions/{executionId}/cancel:
   *   post:
   *     summary: Cancel workflow execution
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: executionId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Workflow execution cancelled
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       404:
   *         description: Execution not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/executions/:executionId/cancel',
    authenticate,
    validateRequest(executionIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { executionId } = req.params

        await workflowService.cancelWorkflowExecution(executionId)

        logger.info('Workflow execution cancelled via API', {
          executionId,
          userId: req.user?.id,
        })

        res.json({
          success: true,
          message: 'Workflow execution cancelled successfully',
        })
      } catch (error) {
        logger.error(
          'Failed to cancel workflow execution via API',
          error as Error,
          {
            userId: req.user?.id,
            executionId: req.params.executionId,
          }
        )
        next(error)
      }
    }
  )

  /**
   * @swagger
   * /api/cubcen/v1/workflows/executions/{executionId}/progress:
   *   get:
   *     summary: Get workflow execution progress
   *     tags: [Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: executionId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Workflow execution progress retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     workflowExecutionId:
   *                       type: string
   *                     totalSteps:
   *                       type: number
   *                     completedSteps:
   *                       type: number
   *                     failedSteps:
   *                       type: number
   *                     currentStep:
   *                       type: string
   *                     progress:
   *                       type: number
   *                       minimum: 0
   *                       maximum: 100
   *                     estimatedTimeRemaining:
   *                       type: number
   *       404:
   *         description: Execution not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/executions/:executionId/progress',
    authenticate,
    validateRequest(executionIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { executionId } = req.params

        const progress = workflowService.getWorkflowProgress(executionId)

        if (!progress) {
          return res.status(404).json({
            error: {
              code: 'EXECUTION_NOT_FOUND',
              message: `Workflow execution with ID ${executionId} not found`,
            },
          })
        }

        res.json({
          success: true,
          data: progress,
        })
      } catch (error) {
        logger.error(
          'Failed to get workflow execution progress via API',
          error as Error,
          {
            userId: req.user?.id,
            executionId: req.params.executionId,
          }
        )
        next(error)
      }
    }
  )

  return router
}
