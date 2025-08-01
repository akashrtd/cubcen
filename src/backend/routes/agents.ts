// Cubcen Agent Management API Routes
// Express routes for agent management endpoints

import { Router, Request, Response } from 'express'
import { logger } from '@/lib/logger'
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
import { AgentService } from '@/services/agent'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { z } from 'zod'

// Initialize adapter manager and agent service
const adapterManager = new AdapterManager()
const agentService = new AgentService(adapterManager)

const router = Router()

// Validation schemas
const createAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(100),
  platformId: z.string().min(1, 'Platform ID is required'),
  externalId: z.string().min(1, 'External ID is required'),
  capabilities: z.array(z.string()).default([]),
  configuration: z.record(z.string(), z.unknown()).default({}),
  description: z.string().optional(),
})

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  capabilities: z.array(z.string()).optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
})

const agentQuerySchema = paginationQuerySchema.extend({
  platformType: z.enum(['N8N', 'MAKE', 'ZAPIER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR', 'MAINTENANCE']).optional(),
  search: z.string().optional(),
})

const healthConfigSchema = z.object({
  interval: z.number().min(1000).max(300000).default(30000),
  timeout: z.number().min(1000).max(60000).default(10000),
  retries: z.number().min(0).max(5).default(3),
  enabled: z.boolean().default(true),
})

/**
 * @swagger
 * /api/cubcen/v1/agents:
 *   get:
 *     summary: Get all agents
 *     description: Retrieve all agents with optional filtering, sorting, and pagination
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, status]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: platformType
 *         schema:
 *           type: string
 *           enum: [N8N, MAKE, ZAPIER]
 *         description: Filter by platform type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ERROR, MAINTENANCE]
 *         description: Filter by agent status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search agents by name or description
 *     responses:
 *       200:
 *         description: Agents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     agents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Agent'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 message:
 *                   type: string
 *                   example: Agents retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  authenticate,
  requireAuth,
  validateQuery(agentQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const { page, limit, sortBy, sortOrder, platformType, status, search } =
        req.query

      logger.info('Get agents request', {
        userId: req.user!.id,
        filters: { platformType, status, search },
        pagination: { page, limit, sortBy, sortOrder },
      })

      const result = await agentService.getAgents({
        platformType: platformType as string,
        status: status as
          | 'ACTIVE'
          | 'INACTIVE'
          | 'ERROR'
          | 'MAINTENANCE'
          | undefined,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      })

      res.status(200).json({
        success: true,
        data: {
          agents: result.agents,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        message: 'Agents retrieved successfully',
      })
    } catch (error) {
      logger.error('Get agents failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve agents',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/agents/:id
 * Get agent by ID
 */
router.get(
  '/:id',
  authenticate,
  requireAuth,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      logger.info('Get agent by ID request', {
        userId: req.user!.id,
        agentId: id,
      })

      const agent = await agentService.getAgent(id)

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        })
      }

      res.status(200).json({
        success: true,
        data: { agent },
        message: 'Agent retrieved successfully',
      })
    } catch (error) {
      logger.error('Get agent by ID failed', error as Error, {
        userId: req.user?.id,
        agentId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve agent',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/agents
 * Create a new agent
 */
router.post(
  '/',
  authenticate,
  requireOperator,
  validateBody(createAgentSchema),
  async (req: Request, res: Response) => {
    try {
      const agentData = req.body

      logger.info('Create agent request', {
        userId: req.user!.id,
        agentData: { ...agentData, configuration: '[REDACTED]' },
      })

      const agent = await agentService.registerAgent(agentData)

      logger.info('Agent created successfully', {
        userId: req.user!.id,
        agentId: agent.id,
      })

      res.status(201).json({
        success: true,
        data: { agent },
        message: 'Agent created successfully',
      })
    } catch (error) {
      logger.error('Create agent failed', error as Error, {
        userId: req.user?.id,
      })

      // Handle specific error types
      if ((error as Error).message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'AGENT_ALREADY_EXISTS',
            message: (error as Error).message,
          },
        })
      }

      if ((error as Error).message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PLATFORM_NOT_FOUND',
            message: (error as Error).message,
          },
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create agent',
        },
      })
    }
  }
)

/**
 * PUT /api/cubcen/v1/agents/:id
 * Update agent by ID
 */
router.put(
  '/:id',
  authenticate,
  requireOperator,
  validateParams(idParamSchema),
  validateBody(updateAgentSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updateData = req.body

      logger.info('Update agent request', {
        userId: req.user!.id,
        agentId: id,
        updateData: {
          ...updateData,
          configuration: updateData.configuration ? '[REDACTED]' : undefined,
        },
      })

      const agent = await agentService.updateAgent(id, updateData)

      logger.info('Agent updated successfully', {
        userId: req.user!.id,
        agentId: id,
      })

      res.status(200).json({
        success: true,
        data: { agent },
        message: 'Agent updated successfully',
      })
    } catch (error) {
      logger.error('Update agent failed', error as Error, {
        userId: req.user?.id,
        agentId: req.params.id,
      })

      if ((error as Error).message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update agent',
        },
      })
    }
  }
)

/**
 * DELETE /api/cubcen/v1/agents/:id
 * Delete agent by ID
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      logger.info('Delete agent request', {
        userId: req.user!.id,
        agentId: id,
      })

      await agentService.deleteAgent(id)

      logger.info('Agent deleted successfully', {
        userId: req.user!.id,
        agentId: id,
      })

      res.status(200).json({
        success: true,
        message: 'Agent deleted successfully',
      })
    } catch (error) {
      logger.error('Delete agent failed', error as Error, {
        userId: req.user?.id,
        agentId: req.params.id,
      })

      if ((error as Error).message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete agent',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/agents/:id/health
 * Get agent health status
 */
router.get(
  '/:id/health',
  authenticate,
  requireAuth,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      logger.info('Get agent health request', {
        userId: req.user!.id,
        agentId: id,
      })

      const health = await agentService.getAgentHealthStatus(id)

      res.status(200).json({
        success: true,
        data: { health },
        message: 'Agent health retrieved successfully',
      })
    } catch (error) {
      logger.error('Get agent health failed', error as Error, {
        userId: req.user?.id,
        agentId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve agent health',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/agents/:id/health-check
 * Perform manual health check
 */
router.post(
  '/:id/health-check',
  authenticate,
  requireOperator,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      logger.info('Manual health check request', {
        userId: req.user!.id,
        agentId: id,
      })

      const health = await agentService.performHealthCheck(id)

      logger.info('Manual health check completed', {
        userId: req.user!.id,
        agentId: id,
        status: health.status,
      })

      res.status(200).json({
        success: true,
        data: { health },
        message: 'Health check completed successfully',
      })
    } catch (error) {
      logger.error('Manual health check failed', error as Error, {
        userId: req.user?.id,
        agentId: req.params.id,
      })

      if ((error as Error).message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: 'Agent not found',
          },
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to perform health check',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/agents/:id/health-config
 * Configure health monitoring
 */
router.post(
  '/:id/health-config',
  authenticate,
  requireOperator,
  validateParams(idParamSchema),
  validateBody(healthConfigSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const config = req.body

      logger.info('Configure health monitoring request', {
        userId: req.user!.id,
        agentId: id,
        config,
      })

      await agentService.configureHealthMonitoring(id, config)

      logger.info('Health monitoring configured', {
        userId: req.user!.id,
        agentId: id,
      })

      res.status(200).json({
        success: true,
        message: 'Health monitoring configured successfully',
      })
    } catch (error) {
      logger.error('Configure health monitoring failed', error as Error, {
        userId: req.user?.id,
        agentId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to configure health monitoring',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/agents/discover
 * Discover agents from connected platforms
 */
router.post(
  '/discover',
  authenticate,
  requireOperator,
  async (req: Request, res: Response) => {
    try {
      const { platformId } = req.body

      logger.info('Agent discovery request', {
        userId: req.user!.id,
        platformId,
      })

      const result = await agentService.discoverAgents(platformId)

      logger.info('Agent discovery completed', {
        userId: req.user!.id,
        result,
      })

      res.status(200).json({
        success: true,
        data: { discovery: result },
        message: 'Agent discovery completed successfully',
      })
    } catch (error) {
      logger.error('Agent discovery failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to discover agents',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/agents/health-monitoring/status
 * Get health monitoring status for all agents
 */
router.get(
  '/health-monitoring/status',
  authenticate,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      logger.info('Get health monitoring status request', {
        userId: req.user!.id,
      })

      const status = agentService.getHealthMonitoringStatus()

      res.status(200).json({
        success: true,
        data: { status },
        message: 'Health monitoring status retrieved successfully',
      })
    } catch (error) {
      logger.error('Get health monitoring status failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve health monitoring status',
        },
      })
    }
  }
)

export default router
