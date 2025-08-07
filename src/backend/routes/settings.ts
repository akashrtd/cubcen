// Cubcen Settings API Routes
// Express routes for user settings and preferences management

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { structuredLogger as logger } from '@/lib/logger'
import { auditLogger, AuditEventType } from '@/lib/audit-logger'
import {
  authenticate,
} from '@/backend/middleware/auth'
import {
  validateBody,
  validateParams,
} from '@/backend/middleware/validation'
import {
  asyncHandler,
  createSuccessResponse,
  APIError,
  APIErrorCode,
} from '@/lib/api-error-handler'
import { authService } from '@/services/auth'
import { notificationPreferencesService } from '@/services/notification-preferences'
import { NotificationEventType, NotificationChannelType } from '@/types/notification'

const router = Router()

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  email: z.string().email('Valid email is required').optional(),
  avatar: z.string().url('Valid avatar URL is required').optional(),
})

const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      slack: z.boolean().optional(),
      frequency: z.enum(['immediate', 'hourly', 'daily']).optional(),
    })
    .optional(),
  dashboard: z
    .object({
      defaultView: z.enum(['grid', 'list', 'kanban']).optional(),
      refreshInterval: z.number().min(5).max(300).optional(),
      showWelcome: z.boolean().optional(),
    })
    .optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const updateSecuritySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(15).max(1440).optional(), // 15 minutes to 24 hours
})

const updateNotificationPreferenceSchema = z.object({
  eventType: z.nativeEnum(NotificationEventType),
  channels: z.array(z.nativeEnum(NotificationChannelType)),
  enabled: z.boolean(),
  escalationDelay: z.number().min(0).max(1440).optional(), // max 24 hours
})

/**
 * GET /api/cubcen/v1/settings/profile
 * Get user profile settings
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id

    logger.info('Get profile settings request', { 
      userId,
      requestId: req.headers['x-request-id'],
    })

    try {
      // TODO: Implement user service to fetch profile from database
      // For now, return mock data based on current user
      const mockProfile = {
        id: userId,
        name: req.user!.name || 'User Name',
        email: req.user!.email || '[email]',
        avatar: null,
        role: req.user!.role,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      res.json(createSuccessResponse(
        { profile: mockProfile },
        'Profile settings retrieved successfully',
        req.headers['x-request-id'] as string
      ))
    } catch (error) {
      logger.error('Profile service error', error as Error, {
        userId,
        requestId: req.headers['x-request-id'],
      })

      throw new APIError(
        APIErrorCode.INTERNAL_ERROR,
        'Failed to retrieve profile settings'
      )
    }
  })
)

/**
 * PUT /api/cubcen/v1/settings/profile
 * Update user profile settings
 */
router.put(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const updateData = req.body

      logger.info('Update profile settings request', {
        userId,
        updateData: {
          ...updateData,
          email: updateData.email ? '[REDACTED]' : undefined,
        },
      })

      // TODO: Implement user service to update profile in database
      // For now, return mock updated profile
      const mockProfile = {
        id: userId,
        name: updateData.name || req.user!.name || 'User Name',
        email: updateData.email || req.user!.email || '[email]',
        avatar: updateData.avatar || null,
        role: req.user!.role,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      // Log audit trail
      await auditLogger.logUserEvent(
        AuditEventType.USER_UPDATED,
        userId,
        mockProfile.email,
        userId,
        mockProfile.email,
        req,
        {
          updatedFields: Object.keys(updateData),
          action: 'profile_update',
          selfUpdate: true,
        }
      )

      logger.info('Profile settings updated successfully', { userId })

      res.status(200).json({
        success: true,
        data: { profile: mockProfile },
        message: 'Profile settings updated successfully',
      })
    } catch (error) {
      logger.error('Update profile settings failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update profile settings',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/settings/preferences
 * Get user preferences (theme, dashboard, etc.)
 */
router.get(
  '/preferences',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id

      logger.info('Get user preferences request', { userId })

      // TODO: Implement preferences service to fetch from database
      // For now, return mock preferences
      const mockPreferences = {
        theme: 'system' as const,
        notifications: {
          email: true,
          push: true,
          slack: false,
          frequency: 'immediate' as const,
        },
        dashboard: {
          defaultView: 'grid' as const,
          refreshInterval: 30,
          showWelcome: true,
        },
      }

      res.status(200).json({
        success: true,
        data: { preferences: mockPreferences },
        message: 'User preferences retrieved successfully',
      })
    } catch (error) {
      logger.error('Get user preferences failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve user preferences',
        },
      })
    }
  }
)

/**
 * PUT /api/cubcen/v1/settings/preferences
 * Update user preferences
 */
router.put(
  '/preferences',
  authenticate,
  validateBody(updatePreferencesSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const updateData = req.body

      logger.info('Update user preferences request', {
        userId,
        updateData,
      })

      // TODO: Implement preferences service to update in database
      // For now, return mock updated preferences
      const mockPreferences = {
        theme: updateData.theme || 'system',
        notifications: {
          email: updateData.notifications?.email ?? true,
          push: updateData.notifications?.push ?? true,
          slack: updateData.notifications?.slack ?? false,
          frequency: updateData.notifications?.frequency || 'immediate',
        },
        dashboard: {
          defaultView: updateData.dashboard?.defaultView || 'grid',
          refreshInterval: updateData.dashboard?.refreshInterval || 30,
          showWelcome: updateData.dashboard?.showWelcome ?? true,
        },
      }

      logger.info('User preferences updated successfully', { userId })

      res.status(200).json({
        success: true,
        data: { preferences: mockPreferences },
        message: 'User preferences updated successfully',
      })
    } catch (error) {
      logger.error('Update user preferences failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user preferences',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/settings/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const { currentPassword, newPassword } = req.body

      logger.info('Change password request', { userId })

      // Use existing auth service to change password
      await authService.changePassword(userId, currentPassword, newPassword)

      // Log audit trail
      await auditLogger.logUserEvent(
        AuditEventType.USER_UPDATED,
        userId,
        req.user!.email || 'user@cubcen.com',
        userId,
        req.user!.email || 'user@cubcen.com',
        req,
        {
          action: 'password_change',
          selfUpdate: true,
        }
      )

      logger.info('Password changed successfully', { userId })

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      })
    } catch (error) {
      logger.error('Change password failed', error as Error, {
        userId: req.user?.id,
      })

      // Check if it's an authentication error (wrong current password)
      if (error instanceof Error && error.message.includes('Invalid')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Current password is incorrect',
          },
        })
        return
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to change password',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/settings/security
 * Get user security settings
 */
router.get(
  '/security',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id

      logger.info('Get security settings request', { userId })

      // TODO: Implement security service to fetch from database
      // For now, return mock security settings
      const mockSecuritySettings = {
        twoFactorEnabled: false,
        lastPasswordChange: new Date('2024-01-15'),
        activeSessions: 1,
        sessionTimeout: 60, // minutes
        loginHistory: [
          {
            id: 'login_1',
            timestamp: new Date(),
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            success: true,
          },
          {
            id: 'login_2',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            success: true,
          },
        ],
      }

      res.status(200).json({
        success: true,
        data: { security: mockSecuritySettings },
        message: 'Security settings retrieved successfully',
      })
    } catch (error) {
      logger.error('Get security settings failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve security settings',
        },
      })
    }
  }
)

/**
 * PUT /api/cubcen/v1/settings/security
 * Update user security settings
 */
router.put(
  '/security',
  authenticate,
  validateBody(updateSecuritySettingsSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const updateData = req.body

      logger.info('Update security settings request', {
        userId,
        updateData,
      })

      // TODO: Implement security service to update in database
      // For now, return mock updated security settings
      const mockSecuritySettings = {
        twoFactorEnabled: updateData.twoFactorEnabled ?? false,
        lastPasswordChange: new Date('2024-01-15'),
        activeSessions: 1,
        sessionTimeout: updateData.sessionTimeout || 60,
        loginHistory: [
          {
            id: 'login_1',
            timestamp: new Date(),
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            success: true,
          },
        ],
      }

      // Log audit trail for security changes
      await auditLogger.logUserEvent(
        AuditEventType.USER_UPDATED,
        userId,
        req.user!.email || 'user@cubcen.com',
        userId,
        req.user!.email || 'user@cubcen.com',
        req,
        {
          updatedFields: Object.keys(updateData),
          action: 'security_settings_update',
          selfUpdate: true,
        }
      )

      logger.info('Security settings updated successfully', { userId })

      res.status(200).json({
        success: true,
        data: { security: mockSecuritySettings },
        message: 'Security settings updated successfully',
      })
    } catch (error) {
      logger.error('Update security settings failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update security settings',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/settings/notifications
 * Get user notification preferences
 */
router.get(
  '/notifications',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id

      logger.info('Get notification preferences request', { userId })

      // Use existing notification preferences service
      const preferences = await notificationPreferencesService.getUserPreferences(userId)

      res.status(200).json({
        success: true,
        data: { preferences },
        message: 'Notification preferences retrieved successfully',
      })
    } catch (error) {
      logger.error('Get notification preferences failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve notification preferences',
        },
      })
    }
  }
)

/**
 * PUT /api/cubcen/v1/settings/notifications
 * Update user notification preference
 */
router.put(
  '/notifications',
  authenticate,
  validateBody(updateNotificationPreferenceSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const { eventType, channels, enabled, escalationDelay } = req.body

      logger.info('Update notification preference request', {
        userId,
        eventType,
        channels,
        enabled,
        escalationDelay,
      })

      // Use existing notification preferences service
      const preference = await notificationPreferencesService.updateUserPreference(
        userId,
        eventType,
        { channels, enabled, escalationDelay }
      )

      logger.info('Notification preference updated successfully', {
        userId,
        eventType,
      })

      res.status(200).json({
        success: true,
        data: { preference },
        message: 'Notification preference updated successfully',
      })
    } catch (error) {
      logger.error('Update notification preference failed', error as Error, {
        userId: req.user?.id,
        eventType: req.body.eventType,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update notification preference',
        },
      })
    }
  }
)

/**
 * POST /api/cubcen/v1/settings/notifications/bulk
 * Bulk update notification preferences
 */
router.post(
  '/notifications/bulk',
  authenticate,
  validateBody(z.object({
    preferences: z.array(updateNotificationPreferenceSchema.omit({ eventType: true }).extend({
      eventType: z.nativeEnum(NotificationEventType),
    })),
  })),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const { preferences } = req.body

      logger.info('Bulk update notification preferences request', {
        userId,
        count: preferences.length,
      })

      // Use existing notification preferences service
      await notificationPreferencesService.bulkUpdatePreferences(userId, preferences)

      logger.info('Notification preferences bulk updated successfully', {
        userId,
        count: preferences.length,
      })

      res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
      })
    } catch (error) {
      logger.error('Bulk update notification preferences failed', error as Error, {
        userId: req.user?.id,
        count: req.body.preferences?.length,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update notification preferences',
        },
      })
    }
  }
)

/**
 * GET /api/cubcen/v1/settings/sessions
 * Get user active sessions
 */
router.get(
  '/sessions',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id

      logger.info('Get active sessions request', { userId })

      // TODO: Implement session service to fetch from database/cache
      // For now, return mock session data
      const mockSessions = [
        {
          id: 'session_1',
          userId,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          createdAt: new Date(),
          lastActivity: new Date(),
          current: true,
        },
        {
          id: 'session_2',
          userId,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 30 * 60 * 1000),
          current: false,
        },
      ]

      res.status(200).json({
        success: true,
        data: { sessions: mockSessions },
        message: 'Active sessions retrieved successfully',
      })
    } catch (error) {
      logger.error('Get active sessions failed', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve active sessions',
        },
      })
    }
  }
)

/**
 * DELETE /api/cubcen/v1/settings/sessions/:sessionId
 * Revoke a specific session
 */
router.delete(
  '/sessions/:sessionId',
  authenticate,
  validateParams(z.object({ sessionId: z.string().min(1) })),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const { sessionId } = req.params

      // Prevent user from revoking their current session
      if (sessionId === 'session_1') { // In real implementation, check against current session
        res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_REVOKE_CURRENT_SESSION',
            message: 'Cannot revoke your current session',
          },
        })
        return
      }

      logger.info('Revoke session request', { userId, sessionId })

      // TODO: Implement session service to revoke session
      // For now, just log the action

      // Log audit trail
      await auditLogger.logUserEvent(
        AuditEventType.USER_UPDATED,
        userId,
        req.user!.email || 'user@cubcen.com',
        userId,
        req.user!.email || 'user@cubcen.com',
        req,
        {
          action: 'session_revoked',
          sessionId,
          selfUpdate: true,
        }
      )

      logger.info('Session revoked successfully', { userId, sessionId })

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
      })
    } catch (error) {
      logger.error('Revoke session failed', error as Error, {
        userId: req.user?.id,
        sessionId: req.params.sessionId,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to revoke session',
        },
      })
    }
  }
)

export default router