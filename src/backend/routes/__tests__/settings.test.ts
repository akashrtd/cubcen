// Cubcen Settings API Routes Tests
// Tests for settings API endpoints

import request from 'supertest'
import express from 'express'
import settingsRouter from '../settings'
import { authenticate } from '../../middleware/auth'
import { authService } from '@/services/auth'
import { notificationPreferencesService } from '@/services/notification-preferences'
import { auditLogger } from '@/lib/audit-logger'
import {
  NotificationEventType,
  NotificationChannelType,
} from '@/types/notification'

// Mock dependencies
jest.mock('../../middleware/auth')
jest.mock('@/services/auth')
jest.mock('@/services/notification-preferences')
jest.mock('@/lib/audit-logger')
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}))

const mockAuthenticate = authenticate as jest.MockedFunction<
  typeof authenticate
>
const mockAuthService = authService as jest.Mocked<typeof authService>
const mockNotificationPreferencesService =
  notificationPreferencesService as jest.Mocked<
    typeof notificationPreferencesService
  >
const mockAuditLogger = auditLogger as jest.Mocked<typeof auditLogger>

describe('Settings API Routes', () => {
  let app: express.Application

  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'OPERATOR' as const,
  }

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/settings', settingsRouter)

    // Mock authentication middleware
    mockAuthenticate.mockImplementation(async (req, res, next) => {
      req.user = { ...mockUser, createdAt: new Date(), updatedAt: new Date() };
      next()
    })

    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('GET /api/settings/profile', () => {
    it('should get user profile settings successfully', async () => {
      const response = await request(app)
        .get('/api/settings/profile')
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          profile: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            avatar: null,
            role: mockUser.role,
            isActive: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
        message: 'Profile settings retrieved successfully',
        timestamp: expect.any(String),
      })
    })

    it('should handle authentication failure', async () => {
      mockAuthenticate.mockImplementation(async (req, res, next) => {
        res.status(401).json({
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Authentication required',
          },
        })
      })

      await request(app).get('/api/settings/profile').expect(401)
    })
  })

  describe('PUT /api/settings/profile', () => {
    it('should update profile settings successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        avatar: 'https://example.com/avatar.jpg',
      }

      mockAuditLogger.logUserEvent.mockResolvedValue(undefined)

      const response = await request(app)
        .put('/api/settings/profile')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          profile: {
            id: mockUser.id,
            name: updateData.name,
            email: updateData.email,
            avatar: updateData.avatar,
            role: mockUser.role,
            isActive: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
        message: 'Profile settings updated successfully',
      })

      expect(mockAuditLogger.logUserEvent).toHaveBeenCalledWith(
        'USER_UPDATED',
        mockUser.id,
        updateData.email,
        mockUser.id,
        updateData.email,
        expect.any(Object),
        {
          updatedFields: ['name', 'email', 'avatar'],
          action: 'profile_update',
          selfUpdate: true,
        }
      )
    })

    it('should validate profile update data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: not a valid email
      }

      const response = await request(app)
        .put('/api/settings/profile')
        .send(invalidData)
        .expect(400)

      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.details).toHaveLength(2)
    })

    it('should handle partial updates', async () => {
      const updateData = {
        name: 'Only Name Updated',
      }

      mockAuditLogger.logUserEvent.mockResolvedValue(undefined)

      const response = await request(app)
        .put('/api/settings/profile')
        .send(updateData)
        .expect(200)

      expect(response.body.data.profile.name).toBe(updateData.name)
      expect(response.body.data.profile.email).toBe(mockUser.email)
    })
  })

  describe('GET /api/settings/preferences', () => {
    it('should get user preferences successfully', async () => {
      const response = await request(app)
        .get('/api/settings/preferences')
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          preferences: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
              slack: false,
              frequency: 'immediate',
            },
            dashboard: {
              defaultView: 'grid',
              refreshInterval: 30,
              showWelcome: true,
            },
          },
        },
        message: 'User preferences retrieved successfully',
      })
    })
  })

  describe('PUT /api/settings/preferences', () => {
    it('should update user preferences successfully', async () => {
      const updateData = {
        theme: 'dark' as const,
        notifications: {
          email: false,
          push: true,
          slack: true,
          frequency: 'hourly' as const,
        },
        dashboard: {
          defaultView: 'kanban' as const,
          refreshInterval: 60,
          showWelcome: false,
        },
      }

      const response = await request(app)
        .put('/api/settings/preferences')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          preferences: updateData,
        },
        message: 'User preferences updated successfully',
      })
    })

    it('should validate preferences data', async () => {
      const invalidData = {
        theme: 'invalid-theme',
        dashboard: {
          refreshInterval: 5000, // Invalid: too high
        },
      }

      const response = await request(app)
        .put('/api/settings/preferences')
        .send(invalidData)
        .expect(400)

      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/settings/change-password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'currentPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }

      mockAuthService.changePassword.mockResolvedValue(undefined)
      mockAuditLogger.logUserEvent.mockResolvedValue(undefined)

      const response = await request(app)
        .post('/api/settings/change-password')
        .send(passwordData)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        message: 'Password changed successfully',
      })

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        passwordData.currentPassword,
        passwordData.newPassword
      )

      expect(mockAuditLogger.logUserEvent).toHaveBeenCalledWith(
        'USER_UPDATED',
        mockUser.id,
        mockUser.email,
        mockUser.id,
        mockUser.email,
        expect.any(Object),
        {
          action: 'password_change',
          selfUpdate: true,
        }
      )
    })

    it('should validate password requirements', async () => {
      const invalidData = {
        currentPassword: 'current',
        newPassword: 'weak', // Invalid: too short, no uppercase, no number
        confirmPassword: 'weak',
      }

      const response = await request(app)
        .post('/api/settings/change-password')
        .send(invalidData)
        .expect(400)

      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should validate password confirmation match', async () => {
      const mismatchData = {
        currentPassword: 'currentPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      }

      const response = await request(app)
        .post('/api/settings/change-password')
        .send(mismatchData)
        .expect(400)

      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(
        response.body.error.details.some(
          (d: any) => d.message === "Passwords don't match"
        )
      ).toBe(true)
    })

    it('should handle invalid current password', async () => {
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }

      mockAuthService.changePassword.mockRejectedValue(
        new Error('Invalid current password')
      )

      const response = await request(app)
        .post('/api/settings/change-password')
        .send(passwordData)
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect',
        },
      })
    })
  })

  describe('GET /api/settings/security', () => {
    it('should get security settings successfully', async () => {
      const response = await request(app)
        .get('/api/settings/security')
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          security: {
            twoFactorEnabled: false,
            lastPasswordChange: expect.any(String),
            activeSessions: 1,
            sessionTimeout: 60,
            loginHistory: expect.any(Array),
          },
        },
        message: 'Security settings retrieved successfully',
      })

      expect(response.body.data.security.loginHistory).toHaveLength(2)
    })
  })

  describe('PUT /api/settings/security', () => {
    it('should update security settings successfully', async () => {
      const updateData = {
        twoFactorEnabled: true,
        sessionTimeout: 120,
      }

      mockAuditLogger.logUserEvent.mockResolvedValue(undefined)

      const response = await request(app)
        .put('/api/settings/security')
        .send(updateData)
        .expect(200)

      expect(response.body.data.security.twoFactorEnabled).toBe(true)
      expect(response.body.data.security.sessionTimeout).toBe(120)

      expect(mockAuditLogger.logUserEvent).toHaveBeenCalledWith(
        'USER_UPDATED',
        mockUser.id,
        mockUser.email,
        mockUser.id,
        mockUser.email,
        expect.any(Object),
        {
          updatedFields: ['twoFactorEnabled', 'sessionTimeout'],
          action: 'security_settings_update',
          selfUpdate: true,
        }
      )
    })

    it('should validate security settings data', async () => {
      const invalidData = {
        sessionTimeout: 5, // Invalid: too low
      }

      const response = await request(app)
        .put('/api/settings/security')
        .send(invalidData)
        .expect(400)

      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/settings/notifications', () => {
    it('should get notification preferences successfully', async () => {
      const mockPreferences = [
        {
          id: 'pref_1',
          userId: mockUser.id,
          eventType: NotificationEventType.AGENT_ERROR,
          channels: [
            NotificationChannelType.EMAIL,
            NotificationChannelType.IN_APP,
          ],
          enabled: true,
          escalationDelay: 30,
        },
      ]

      mockNotificationPreferencesService.getUserPreferences.mockResolvedValue(
        mockPreferences
      )

      const response = await request(app)
        .get('/api/settings/notifications')
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: { preferences: mockPreferences },
        message: 'Notification preferences retrieved successfully',
      })

      expect(
        mockNotificationPreferencesService.getUserPreferences
      ).toHaveBeenCalledWith(mockUser.id)
    })

    it('should handle service errors', async () => {
      mockNotificationPreferencesService.getUserPreferences.mockRejectedValue(
        new Error('Database error')
      )

      const response = await request(app)
        .get('/api/settings/notifications')
        .expect(500)

      expect(response.body.error.code).toBe('INTERNAL_ERROR')
    })
  })

  describe('PUT /api/settings/notifications', () => {
    it('should update notification preference successfully', async () => {
      const updateData = {
        eventType: NotificationEventType.AGENT_ERROR,
        channels: [
          NotificationChannelType.EMAIL,
          NotificationChannelType.SLACK,
        ],
        enabled: true,
        escalationDelay: 60,
      }

      const mockPreference = {
        id: 'pref_1',
        userId: mockUser.id,
        ...updateData,
      }

      mockNotificationPreferencesService.updateUserPreference.mockResolvedValue(
        mockPreference
      )

      const response = await request(app)
        .put('/api/settings/notifications')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: { preference: mockPreference },
        message: 'Notification preference updated successfully',
      })

      expect(
        mockNotificationPreferencesService.updateUserPreference
      ).toHaveBeenCalledWith(mockUser.id, updateData.eventType, {
        channels: updateData.channels,
        enabled: updateData.enabled,
        escalationDelay: updateData.escalationDelay,
      })
    })

    it('should validate notification preference data', async () => {
      const invalidData = {
        eventType: 'INVALID_EVENT',
        channels: ['INVALID_CHANNEL'],
        enabled: 'not-boolean',
      }

      const response = await request(app)
        .put('/api/settings/notifications')
        .send(invalidData)
        .expect(400)

      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/settings/notifications/bulk', () => {
    it('should bulk update notification preferences successfully', async () => {
      const bulkData = {
        preferences: [
          {
            eventType: NotificationEventType.AGENT_ERROR,
            channels: [NotificationChannelType.EMAIL],
            enabled: true,
          },
          {
            eventType: NotificationEventType.TASK_FAILED,
            channels: [NotificationChannelType.SLACK],
            enabled: false,
          },
        ],
      }

      mockNotificationPreferencesService.bulkUpdatePreferences.mockResolvedValue(
        undefined
      )

      const response = await request(app)
        .post('/api/settings/notifications/bulk')
        .send(bulkData)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        message: 'Notification preferences updated successfully',
      })

      expect(
        mockNotificationPreferencesService.bulkUpdatePreferences
      ).toHaveBeenCalledWith(mockUser.id, bulkData.preferences)
    })
  })

  describe('GET /api/settings/sessions', () => {
    it('should get active sessions successfully', async () => {
      const response = await request(app)
        .get('/api/settings/sessions')
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          sessions: expect.any(Array),
        },
        message: 'Active sessions retrieved successfully',
      })

      expect(response.body.data.sessions).toHaveLength(2)
      expect(response.body.data.sessions[0]).toHaveProperty('current', true)
    })
  })

  describe('DELETE /api/settings/sessions/:sessionId', () => {
    it('should revoke session successfully', async () => {
      const sessionId = 'session_2'

      mockAuditLogger.logUserEvent.mockResolvedValue(undefined)

      const response = await request(app)
        .delete(`/api/settings/sessions/${sessionId}`)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        message: 'Session revoked successfully',
      })

      expect(mockAuditLogger.logUserEvent).toHaveBeenCalledWith(
        'USER_UPDATED',
        mockUser.id,
        mockUser.email,
        mockUser.id,
        mockUser.email,
        expect.any(Object),
        {
          action: 'session_revoked',
          sessionId,
          selfUpdate: true,
        }
      )
    })

    it('should prevent revoking current session', async () => {
      const sessionId = 'session_1' // Current session

      const response = await request(app)
        .delete(`/api/settings/sessions/${sessionId}`)
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'CANNOT_REVOKE_CURRENT_SESSION',
          message: 'Cannot revoke your current session',
        },
      })
    })

    it('should validate session ID parameter', async () => {
      const response = await request(app)
        .delete('/api/settings/sessions/')
        .expect(404) // Route not found for empty sessionId
    })
  })
})
