// Cubcen User Management API Routes
// Express routes for user management endpoints (separate from auth)

import { Router, Request, Response } from 'express'
import { logger } from '@/lib/logger'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/audit-logger'
import {
  authenticate,
  requireAdmin,
  requireSelfOrAdmin,
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

// Validation schemas
const updateUserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  email: z.string().email('Valid email is required').optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          slack: z.boolean().optional(),
        })
        .optional(),
      dashboard: z
        .object({
          defaultView: z.enum(['grid', 'list', 'kanban']).optional(),
          refreshInterval: z.number().min(5).max(300).optional(),
        })
        .optional(),
    })
    .optional(),
})

const userQuerySchema = paginationQuerySchema.extend({
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  search: z.string().optional(),
})

const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string().optional(),
  auditTrail: z.boolean().optional(),
})

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).default('VIEWER'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  auditTrail: z.boolean().optional(),
  action: z.string().optional(),
})

/**
 * GET /api/cubcen/v1/users
 * Get all users with filtering and pagination (admin only)
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  validateQuery(userQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const { page, limit, sortBy, sortOrder, role, status, search } = req.query

      logger.info('Get users request', {
        userId: req.user!.id,
        filters: { role, status, search },
        pagination: { page, limit, sortBy, sortOrder },
      })

      // TODO: Implement user service to fetch users from database
      // For now, return mock data
      const mockUsers = [
        {
          id: 'user_1',
          name: 'Admin User',
          email: '[email]',
          role: 'ADMIN',
          status: 'active',
          lastLoginAt: new Date(),
          preferences: {
            theme: 'dark',
            notifications: { email: true, push: true, slack: false },
            dashboard: { defaultView: 'grid', refreshInterval: 30 },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user_2',
          name: 'Operator User',
          email: '[email]',
          role: 'OPERATOR',
          status: 'active',
          lastLoginAt: new Date(),
          preferences: {
            theme: 'light',
            notifications: { email: true, push: false, slack: true },
            dashboard: { defaultView: 'kanban', refreshInterval: 60 },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      res.status(200).json({
        success: true,
        data: {
          users: mockUsers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: mockUsers.length,
            totalPages: Math.ceil(mockUsers.length / Number(limit)),
          },
        },
        message: 'Users retrieved successfully',
      })
    } catch (error) {
      logger.error('Get users failed', error as Error, { userId: req.user?.id })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve users',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/users/:id
 * Get user by ID (self or admin)
 */
router.get(
  '/:id',
  authenticate,
  requireSelfOrAdmin('id'),
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      logger.info('Get user by ID request', {
        userId: req.user!.id,
        targetUserId: id,
      })

      // TODO: Implement user service to fetch user by ID
      // For now, return mock data
      const mockUser = {
        id,
        name: 'User Name',
        email: '[email]',
        role: 'OPERATOR',
        status: 'active',
        lastLoginAt: new Date(),
        preferences: {
          theme: 'light',
          notifications: { email: true, push: false, slack: true },
          dashboard: { defaultView: 'kanban', refreshInterval: 60 },
        },
        activityStats: {
          totalLogins: 45,
          lastLogin: new Date(),
          tasksCreated: 23,
          agentsManaged: 5,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      res.status(200).json({
        success: true,
        data: { user: mockUser },
        message: 'User retrieved successfully',
      })
    } catch (error) {
      logger.error('Get user by ID failed', error as Error, {
        userId: req.user?.id,
        targetUserId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve user',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/users
 * Create new user (admin only) with audit trail logging
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(createUserSchema),
  async (req: Request, res: Response) => {
    try {
      const userData = req.body

      logger.info('Create user request', {
        userId: req.user!.id,
        userData: {
          ...userData,
          email: '[REDACTED]',
        },
      })

      // TODO: Implement user service to create user
      // For now, return mock response
      const mockUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        lastLoginAt: null,
        preferences: {
          theme: 'system' as const,
          notifications: { email: true, push: true, slack: false },
          dashboard: { defaultView: 'grid' as const, refreshInterval: 30 },
        },
        activityStats: {
          totalLogins: 0,
          lastLogin: null,
          tasksCreated: 0,
          agentsManaged: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Log audit trail if requested
      if (userData.auditTrail) {
        await auditLogger.logUserEvent(
          AuditEventType.USER_CREATED,
          mockUser.id,
          mockUser.email,
          req.user!.id,
          req.user!.email || 'admin@cubcen.com',
          req,
          {
            role: userData.role,
            status: userData.status,
            action: userData.action || 'create',
            adminAction: true,
          }
        )

        logger.info('User creation logged to audit trail', {
          userId: req.user!.id,
          newUserId: mockUser.id,
          eventType: AuditEventType.USER_CREATED,
        })
      }

      logger.info('User created successfully', {
        userId: req.user!.id,
        newUserId: mockUser.id,
      })

      res.status(201).json({
        success: true,
        data: { user: mockUser },
        message: 'User created successfully',
      })
    } catch (error) {
      logger.error('Create user failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create user',
        },
      })
    }
  }
)

/**
 * PUT /api/cubcen/v1/users/:id/profile
 * Update user profile (self or admin) with audit trail logging
 */
router.put(
  '/:id/profile',
  authenticate,
  requireSelfOrAdmin('id'),
  validateParams(idParamSchema),
  validateBody(updateUserProfileSchema.extend({
    auditTrail: z.boolean().optional(),
    action: z.string().optional(),
  })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { auditTrail, action, ...updateData } = req.body

      logger.info('Update user profile request', {
        userId: req.user!.id,
        targetUserId: id,
        updateData: {
          ...updateData,
          email: updateData.email ? '[REDACTED]' : undefined,
        },
        auditTrail,
        action,
      })

      // TODO: Implement user service to update user profile
      // For now, return mock response
      const mockUser = {
        id,
        name: updateData.name || 'User Name',
        email: updateData.email || '[email]',
        role: 'OPERATOR' as const,
        status: 'active' as const,
        lastLoginAt: new Date(),
        preferences: updateData.preferences || {
          theme: 'light' as const,
          notifications: { email: true, push: false, slack: true },
          dashboard: { defaultView: 'kanban' as const, refreshInterval: 60 },
        },
        activityStats: {
          totalLogins: 45,
          lastLogin: new Date(),
          tasksCreated: 23,
          agentsManaged: 5,
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      // Log audit trail if requested
      if (auditTrail) {
        await auditLogger.logUserEvent(
          AuditEventType.USER_UPDATED,
          id,
          mockUser.email,
          req.user!.id,
          req.user!.email || 'admin@cubcen.com',
          req,
          {
            updatedFields: Object.keys(updateData),
            action: action || 'update',
            selfUpdate: id === req.user!.id,
          }
        )

        logger.info('User profile update logged to audit trail', {
          userId: req.user!.id,
          targetUserId: id,
          eventType: AuditEventType.USER_UPDATED,
        })
      }

      logger.info('User profile updated successfully', {
        userId: req.user!.id,
        targetUserId: id,
      })

      res.status(200).json({
        success: true,
        data: { user: mockUser },
        message: 'User profile updated successfully',
      })
    } catch (error) {
      logger.error('Update user profile failed', error as Error, {
        userId: req.user?.id,
        targetUserId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user profile',
        },
      })
    }
  }
)

/**
 * PUT /api/cubcen/v1/users/:id/status
 * Update user status (admin only) with audit trail logging
 */
router.put(
  '/:id/status',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateUserStatusSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { status, reason, auditTrail } = req.body

      // Prevent admin from suspending themselves
      if (id === req.user!.id && status === 'suspended') {
        res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_SUSPEND_SELF',
            message: 'Cannot suspend your own account',
          },
        })
        return
      }

      logger.info('Update user status request', {
        userId: req.user!.id,
        targetUserId: id,
        newStatus: status,
        reason,
        auditTrail,
      })

      // TODO: Implement user service to update user status
      // For now, return mock response
      const mockUser = {
        id,
        name: 'User Name',
        email: '[email]',
        role: 'OPERATOR' as const,
        status,
        lastLoginAt: new Date(),
        preferences: {
          theme: 'light' as const,
          notifications: { email: true, push: false, slack: true },
          dashboard: { defaultView: 'kanban' as const, refreshInterval: 60 },
        },
        activityStats: {
          totalLogins: 45,
          lastLogin: new Date(),
          tasksCreated: 23,
          agentsManaged: 5,
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      // Log audit trail if requested
      if (auditTrail) {
        const eventType = status === 'suspended' 
          ? AuditEventType.USER_DELETED 
          : status === 'active' 
            ? AuditEventType.USER_UPDATED 
            : AuditEventType.USER_UPDATED

        await auditLogger.logUserEvent(
          eventType,
          id,
          mockUser.email,
          req.user!.id,
          req.user!.email || 'admin@cubcen.com',
          req,
          {
            previousStatus: 'active', // In real implementation, get from database
            newStatus: status,
            reason: reason || `User status changed to ${status}`,
            adminAction: true,
          }
        )

        logger.info('User status change logged to audit trail', {
          userId: req.user!.id,
          targetUserId: id,
          eventType,
          newStatus: status,
        })
      }

      logger.info('User status updated successfully', {
        userId: req.user!.id,
        targetUserId: id,
        newStatus: status,
      })

      res.status(200).json({
        success: true,
        data: { user: mockUser },
        message: 'User status updated successfully',
      })
    } catch (error) {
      logger.error('Update user status failed', error as Error, {
        userId: req.user?.id,
        targetUserId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user status',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/users/:id/activity
 * Get user activity logs (self or admin)
 */
router.get(
  '/:id/activity',
  authenticate,
  requireSelfOrAdmin('id'),
  validateParams(idParamSchema),
  validateQuery(paginationQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { page, limit, sortBy, sortOrder } = req.query

      logger.info('Get user activity request', {
        userId: req.user!.id,
        targetUserId: id,
        pagination: { page, limit, sortBy, sortOrder },
      })

      // TODO: Implement user activity service
      // For now, return mock activity data
      const mockActivity = [
        {
          id: 'activity_1',
          type: 'login',
          description: 'User logged in',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          metadata: {},
        },
        {
          id: 'activity_2',
          type: 'task_created',
          description: 'Created new task: Email Campaign',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          metadata: { taskId: 'task_123', agentId: 'agent_456' },
        },
        {
          id: 'activity_3',
          type: 'agent_updated',
          description: 'Updated agent configuration',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          metadata: {
            agentId: 'agent_456',
            changes: ['name', 'configuration'],
          },
        },
      ]

      res.status(200).json({
        success: true,
        data: {
          activities: mockActivity,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: mockActivity.length,
            totalPages: Math.ceil(mockActivity.length / Number(limit)),
          },
        },
        message: 'User activity retrieved successfully',
      })
    } catch (error) {
      logger.error('Get user activity failed', error as Error, {
        userId: req.user?.id,
        targetUserId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve user activity',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/users/:id/stats
 * Get user statistics (self or admin)
 */
router.get(
  '/:id/stats',
  authenticate,
  requireSelfOrAdmin('id'),
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      logger.info('Get user stats request', {
        userId: req.user!.id,
        targetUserId: id,
      })

      // TODO: Implement user statistics service
      // For now, return mock stats
      const mockStats = {
        overview: {
          totalLogins: 45,
          lastLogin: new Date(),
          accountAge: 90, // days
          status: 'active',
        },
        activity: {
          tasksCreated: 23,
          tasksCompleted: 20,
          tasksSuccessRate: 87.0,
          agentsManaged: 5,
          platformsConnected: 2,
        },
        performance: {
          avgTaskDuration: 1500, // seconds
          mostUsedAgent: 'Email Automation Agent',
          mostUsedPlatform: 'n8n',
          peakActivityHour: 14, // 2 PM
        },
        trends: {
          tasksThisWeek: 8,
          tasksLastWeek: 6,
          successRateThisWeek: 90.0,
          successRateLastWeek: 85.0,
        },
      }

      res.status(200).json({
        success: true,
        data: { stats: mockStats },
        message: 'User statistics retrieved successfully',
      })
    } catch (error) {
      logger.error('Get user stats failed', error as Error, {
        userId: req.user?.id,
        targetUserId: req.params.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve user statistics',
        },
      })
    }
  }
)

export default router
