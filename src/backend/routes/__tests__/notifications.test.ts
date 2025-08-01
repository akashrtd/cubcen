// Cubcen Notification API Routes Tests
// Tests for notification management endpoints

import request from 'supertest'
import express from 'express'
import { PrismaClient } from '../../../generated/prisma'
import notificationRoutes from '../notifications'
import { authMiddleware } from '../../middleware/auth'
import {
  NotificationEventType,
  NotificationChannelType,
  NotificationPriority,
  NotificationStatus,
} from '../../../types/notification'

// Mock services
jest.mock('../../../services/notification')
jest.mock('../../../services/notification-preferences')

import { notificationService } from '../../../services/notification'
import { notificationPreferencesService } from '../../../services/notification-preferences'

// Mock the auth middleware
jest.mock('../../middleware/auth', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = {
      id: 'test-user-id',
      email: 'test@cubcen.com',
      role: 'ADMIN',
    }
    next()
  }),
}))

// Mock the notification services
jest.mock('../../../services/notification', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    acknowledge: jest.fn(),
    markAsRead: jest.fn(),
    createNotification: jest.fn(),
    send: jest.fn(),
  },
}))

jest.mock('../../../services/notification-preferences', () => ({
  notificationPreferencesService: {
    getUserPreferences: jest.fn(),
    updateUserPreference: jest.fn(),
    bulkUpdatePreferences: jest.fn(),
    getNotificationChannels: jest.fn(),
  },
}))

describe('Notification Routes', () => {
  let app: express.Application
  let prisma: PrismaClient

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/notifications', notificationRoutes)

    prisma = new PrismaClient()

    // Reset mocks
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await prisma.$disconnect()
  })

  describe('GET /api/notifications', () => {
    it('should get user notifications with default parameters', async () => {
      const mockNotifications = [
        {
          id: 'notification-1',
          eventType: NotificationEventType.AGENT_ERROR,
          title: 'Test Notification',
          message: 'Test message',
          priority: NotificationPriority.HIGH,
          status: NotificationStatus.SENT,
          createdAt: new Date(),
        },
      ]

      // Using imported notificationService
      ;(notificationService.getNotifications as jest.Mock).mockResolvedValue(
        mockNotifications
      )

      const response = await request(app).get('/api/notifications').expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: mockNotifications,
        pagination: {
          limit: 50,
          offset: 0,
          total: 1,
        },
      })

      expect(notificationService.getNotifications).toHaveBeenCalledWith(
        'test-user-id',
        {
          limit: 50,
          offset: 0,
        }
      )
    })

    it('should get notifications with query parameters', async () => {
      // Using imported notificationService
      ;(notificationService.getNotifications as jest.Mock).mockResolvedValue([])

      await request(app)
        .get('/api/notifications')
        .query({
          status: NotificationStatus.PENDING,
          eventType: NotificationEventType.TASK_FAILED,
          priority: NotificationPriority.HIGH,
          limit: 10,
          offset: 20,
        })
        .expect(200)

      expect(notificationService.getNotifications).toHaveBeenCalledWith(
        'test-user-id',
        {
          status: NotificationStatus.PENDING,
          eventType: NotificationEventType.TASK_FAILED,
          priority: NotificationPriority.HIGH,
          limit: 10,
          offset: 20,
        }
      )
    })

    it('should handle service errors', async () => {
      const { notificationService } = require('../../../services/notification')
      notificationService.getNotifications.mockRejectedValue(
        new Error('Database error')
      )

      const response = await request(app).get('/api/notifications').expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Failed to get notifications',
      })
    })
  })

  describe('GET /api/notifications/in-app', () => {
    it('should get in-app notifications', async () => {
      // Mock PrismaClient
      const mockPrisma = {
        inAppNotification: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 'in-app-1',
              title: 'Test In-App',
              message: 'Test message',
              type: 'info',
              read: false,
              createdAt: new Date(),
            },
          ]),
          count: jest.fn().mockResolvedValue(1),
        },
      }

      // Mock the PrismaClient import
      jest.doMock('../../../generated/prisma', () => ({
        PrismaClient: jest.fn(() => mockPrisma),
      }))

      const response = await request(app)
        .get('/api/notifications/in-app')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        unreadCount: expect.any(Number),
      })
    })

    it('should filter unread notifications only', async () => {
      const mockPrisma = {
        inAppNotification: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
      }

      jest.doMock('../../../generated/prisma', () => ({
        PrismaClient: jest.fn(() => mockPrisma),
      }))

      await request(app)
        .get('/api/notifications/in-app')
        .query({ unreadOnly: 'true' })
        .expect(200)

      expect(mockPrisma.inAppNotification.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id', read: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    })
  })

  describe('POST /api/notifications/:id/acknowledge', () => {
    it('should acknowledge notification', async () => {
      const { notificationService } = require('../../../services/notification')
      notificationService.acknowledge.mockResolvedValue(undefined)

      const response = await request(app)
        .post('/api/notifications/notification-123/acknowledge')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notification acknowledged successfully',
      })

      expect(notificationService.acknowledge).toHaveBeenCalledWith(
        'notification-123',
        'test-user-id'
      )
    })

    it('should handle acknowledgment errors', async () => {
      const { notificationService } = require('../../../services/notification')
      notificationService.acknowledge.mockRejectedValue(
        new Error('Notification not found')
      )

      const response = await request(app)
        .post('/api/notifications/non-existent/acknowledge')
        .expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Failed to acknowledge notification',
      })
    })
  })

  describe('POST /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const { notificationService } = require('../../../services/notification')
      notificationService.markAsRead.mockResolvedValue(undefined)

      const response = await request(app)
        .post('/api/notifications/notification-123/read')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notification marked as read',
      })

      expect(notificationService.markAsRead).toHaveBeenCalledWith(
        'notification-123',
        'test-user-id'
      )
    })
  })

  describe('POST /api/notifications', () => {
    it('should create notification (admin only)', async () => {
      const { notificationService } = require('../../../services/notification')
      const mockNotification = {
        id: 'new-notification',
        eventType: NotificationEventType.SYSTEM_ERROR,
        title: 'Test Alert',
        message: 'Test message',
      }

      notificationService.createNotification.mockResolvedValue(mockNotification)
      notificationService.send.mockResolvedValue(undefined)

      const response = await request(app)
        .post('/api/notifications')
        .send({
          eventType: NotificationEventType.SYSTEM_ERROR,
          title: 'Test Alert',
          message: 'Test message',
          priority: NotificationPriority.HIGH,
        })
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        data: mockNotification,
      })

      expect(notificationService.createNotification).toHaveBeenCalledWith(
        NotificationEventType.SYSTEM_ERROR,
        'Test Alert',
        'Test message',
        { priority: NotificationPriority.HIGH }
      )
      expect(notificationService.send).toHaveBeenCalledWith(mockNotification)
    })

    it('should reject non-admin users', async () => {
      // Mock non-admin user
      const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
        typeof authMiddleware
      >
      mockAuthMiddleware.mockImplementationOnce((req, res, next) => {
        req.user = {
          id: 'test-user-id',
          email: 'test@cubcen.com',
          role: 'VIEWER',
        }
        next()
      })

      const response = await request(app)
        .post('/api/notifications')
        .send({
          eventType: NotificationEventType.SYSTEM_ERROR,
          title: 'Test Alert',
          message: 'Test message',
        })
        .expect(403)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Insufficient permissions',
      })
    })

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .send({
          // Missing required fields
          title: 'Test Alert',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/notifications/preferences', () => {
    it('should get user notification preferences', async () => {
      const mockPreferences = [
        {
          id: 'pref-1',
          eventType: NotificationEventType.AGENT_DOWN,
          channels: [NotificationChannelType.EMAIL],
          enabled: true,
        },
      ]

      const {
        notificationPreferencesService,
      } = require('../../../services/notification-preferences')
      notificationPreferencesService.getUserPreferences.mockResolvedValue(
        mockPreferences
      )

      const response = await request(app)
        .get('/api/notifications/preferences')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: mockPreferences,
      })

      expect(
        notificationPreferencesService.getUserPreferences
      ).toHaveBeenCalledWith('test-user-id')
    })
  })

  describe('PUT /api/notifications/preferences/:eventType', () => {
    it('should update notification preference', async () => {
      const mockPreference = {
        id: 'pref-1',
        eventType: NotificationEventType.TASK_FAILED,
        channels: [
          NotificationChannelType.IN_APP,
          NotificationChannelType.EMAIL,
        ],
        enabled: true,
      }

      const {
        notificationPreferencesService,
      } = require('../../../services/notification-preferences')
      notificationPreferencesService.updateUserPreference.mockResolvedValue(
        mockPreference
      )

      const response = await request(app)
        .put('/api/notifications/preferences/TASK_FAILED')
        .send({
          channels: [
            NotificationChannelType.IN_APP,
            NotificationChannelType.EMAIL,
          ],
          enabled: true,
          escalationDelay: 30,
        })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: mockPreference,
      })

      expect(
        notificationPreferencesService.updateUserPreference
      ).toHaveBeenCalledWith(
        'test-user-id',
        NotificationEventType.TASK_FAILED,
        {
          channels: [
            NotificationChannelType.IN_APP,
            NotificationChannelType.EMAIL,
          ],
          enabled: true,
          escalationDelay: 30,
        }
      )
    })

    it('should validate request body', async () => {
      const response = await request(app)
        .put('/api/notifications/preferences/TASK_FAILED')
        .send({
          // Missing required fields
          enabled: true,
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/notifications/preferences', () => {
    it('should bulk update preferences', async () => {
      const {
        notificationPreferencesService,
      } = require('../../../services/notification-preferences')
      notificationPreferencesService.bulkUpdatePreferences.mockResolvedValue(
        undefined
      )

      const preferences = [
        {
          eventType: NotificationEventType.AGENT_DOWN,
          channels: [NotificationChannelType.EMAIL],
          enabled: true,
        },
        {
          eventType: NotificationEventType.TASK_FAILED,
          channels: [NotificationChannelType.IN_APP],
          enabled: false,
        },
      ]

      const response = await request(app)
        .put('/api/notifications/preferences')
        .send({ preferences })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Preferences updated successfully',
      })

      expect(
        notificationPreferencesService.bulkUpdatePreferences
      ).toHaveBeenCalledWith('test-user-id', preferences)
    })
  })

  describe('GET /api/notifications/channels', () => {
    it('should get notification channels (admin only)', async () => {
      const mockChannels = [
        {
          id: 'channel-1',
          type: NotificationChannelType.EMAIL,
          name: 'Email Channel',
          enabled: true,
        },
      ]

      const {
        notificationPreferencesService,
      } = require('../../../services/notification-preferences')
      notificationPreferencesService.getNotificationChannels.mockResolvedValue(
        mockChannels
      )

      const response = await request(app)
        .get('/api/notifications/channels')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: mockChannels,
      })
    })

    it('should reject non-admin users', async () => {
      const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
        typeof authMiddleware
      >
      mockAuthMiddleware.mockImplementationOnce((req, res, next) => {
        req.user = {
          id: 'test-user-id',
          email: 'test@cubcen.com',
          role: 'VIEWER',
        }
        next()
      })

      const response = await request(app)
        .get('/api/notifications/channels')
        .expect(403)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Insufficient permissions',
      })
    })
  })

  describe('POST /api/notifications/test', () => {
    it('should send test notification (admin only)', async () => {
      const { notificationService } = require('../../../services/notification')
      const mockNotification = {
        id: 'test-notification',
        title: 'Test Notification',
        message: 'Test notification from Cubcen',
      }

      notificationService.createNotification.mockResolvedValue(mockNotification)
      notificationService.send.mockResolvedValue(undefined)

      const response = await request(app)
        .post('/api/notifications/test')
        .send({
          channel: NotificationChannelType.EMAIL,
          message: 'Custom test message',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Test notification sent successfully',
        data: mockNotification,
      })

      expect(notificationService.createNotification).toHaveBeenCalledWith(
        NotificationEventType.SYSTEM_ERROR,
        'Test Notification',
        'Custom test message',
        {
          priority: NotificationPriority.LOW,
          userId: 'test-user-id',
          channels: [NotificationChannelType.EMAIL],
        }
      )
    })

    it('should use default test message', async () => {
      const { notificationService } = require('../../../services/notification')
      notificationService.createNotification.mockResolvedValue({})
      notificationService.send.mockResolvedValue(undefined)

      await request(app).post('/api/notifications/test').send({}).expect(200)

      expect(notificationService.createNotification).toHaveBeenCalledWith(
        NotificationEventType.SYSTEM_ERROR,
        'Test Notification',
        'Test notification from Cubcen',
        expect.any(Object)
      )
    })
  })

  describe('error handling', () => {
    it('should handle validation errors', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({ limit: 'invalid' })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should handle service unavailable errors', async () => {
      const { notificationService } = require('../../../services/notification')
      notificationService.getNotifications.mockRejectedValue(
        new Error('Service unavailable')
      )

      const response = await request(app).get('/api/notifications').expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Failed to get notifications',
      })
    })
  })
})
