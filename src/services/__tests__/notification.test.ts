// Cubcen Notification Service Tests
// Tests for email, Slack, and in-app notification functionality

import { PrismaClient } from '../../generated/prisma'
import { CubcenNotificationService } from '../notification'
import {
  NotificationEventType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannelType,
} from '../../types/notification'

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}))

// Mock Slack WebClient
jest.mock('@slack/web-api', () => ({
  WebClient: jest.fn(() => ({
    chat: {
      postMessage: jest.fn().mockResolvedValue({ ts: '1234567890.123456' }),
    },
  })),
}))

// Mock environment variables
const originalEnv = process.env
beforeAll(() => {
  process.env = {
    ...originalEnv,
    DATABASE_URL: 'file:./test-notification.db',
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: '587',
    SMTP_USER: 'test@cubcen.com',
    SMTP_PASS: 'testpass',
    SMTP_FROM: 'noreply@cubcen.com',
    SLACK_BOT_TOKEN: 'xoxb-test-token',
    SLACK_DEFAULT_CHANNEL: '#test-alerts',
  }
})

afterAll(() => {
  process.env = originalEnv
})

describe('CubcenNotificationService', () => {
  let prisma: PrismaClient
  let notificationService: CubcenNotificationService
  let mockUser: any
  let mockNotification: any

  beforeEach(async () => {
    prisma = new PrismaClient()
    notificationService = new CubcenNotificationService(prisma)

    // Clean up existing data
    await prisma.inAppNotification.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.notificationTemplate.deleteMany()
    await prisma.user.deleteMany()

    // Create test user with unique email
    const uniqueEmail = `test-${Date.now()}@cubcen.com`
    mockUser = await prisma.user.create({
      data: {
        email: uniqueEmail,
        password: 'hashedpassword',
        role: 'ADMIN',
        name: 'Test User',
      },
    })

    // Create test notification
    mockNotification = {
      id: `test-notification-${Date.now()}`,
      eventType: NotificationEventType.AGENT_ERROR,
      priority: NotificationPriority.HIGH,
      status: NotificationStatus.PENDING,
      title: 'Test Notification',
      message: 'This is a test notification',
      userId: mockUser.id,
      channels: JSON.stringify([
        NotificationChannelType.EMAIL,
        NotificationChannelType.IN_APP,
      ]),
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  afterEach(async () => {
    try {
      await prisma.inAppNotification.deleteMany()
      await prisma.notification.deleteMany()
      await prisma.notificationTemplate.deleteMany()
      await prisma.user.deleteMany()
    } catch (error) {
      // Ignore cleanup errors
    } finally {
      await prisma.$disconnect()
    }
  })

  describe('createNotification', () => {
    it('should create a notification with default values', async () => {
      const notification = await notificationService.createNotification(
        NotificationEventType.TASK_FAILED,
        'Task Failed',
        'A task has failed to complete'
      )

      expect(notification).toMatchObject({
        eventType: NotificationEventType.TASK_FAILED,
        title: 'Task Failed',
        message: 'A task has failed to complete',
        priority: NotificationPriority.MEDIUM,
        status: NotificationStatus.PENDING,
        channels: [NotificationChannelType.IN_APP],
      })
    })

    it('should create a notification with custom options', async () => {
      const notification = await notificationService.createNotification(
        NotificationEventType.AGENT_DOWN,
        'Agent Down',
        'An agent has gone offline',
        {
          priority: NotificationPriority.CRITICAL,
          userId: mockUser.id,
          channels: [
            NotificationChannelType.EMAIL,
            NotificationChannelType.SLACK,
          ],
          data: { agentId: 'agent-123', agentName: 'Test Agent' },
        }
      )

      expect(notification).toMatchObject({
        eventType: NotificationEventType.AGENT_DOWN,
        title: 'Agent Down',
        message: 'An agent has gone offline',
        priority: NotificationPriority.CRITICAL,
        userId: mockUser.id,
        channels: [
          NotificationChannelType.EMAIL,
          NotificationChannelType.SLACK,
        ],
        data: { agentId: 'agent-123', agentName: 'Test Agent' },
      })
    })
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailNotification = {
        to: ['test@example.com'],
        subject: 'Test Email',
        html: '<p>Test message</p>',
        text: 'Test message',
      }

      await expect(
        notificationService.sendEmail(emailNotification)
      ).resolves.not.toThrow()
    })

    it('should handle email sending errors', async () => {
      // Mock email transporter to throw error
      const nodemailer = require('nodemailer')
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: jest
          .fn()
          .mockRejectedValue(new Error('SMTP connection failed')),
      })

      const service = new CubcenNotificationService(prisma)
      const emailNotification = {
        to: ['test@example.com'],
        subject: 'Test Email',
        html: '<p>Test message</p>',
      }

      await expect(service.sendEmail(emailNotification)).rejects.toThrow(
        'SMTP connection failed'
      )
    })
  })

  describe('sendSlack', () => {
    it('should send Slack message successfully', async () => {
      const slackNotification = {
        channel: '#test',
        text: 'Test message',
        attachments: [
          {
            color: '#ff0000',
            title: 'Test Alert',
            text: 'This is a test alert',
          },
        ],
      }

      await expect(
        notificationService.sendSlack(slackNotification)
      ).resolves.not.toThrow()
    })

    it('should handle Slack API errors', async () => {
      // Mock Slack client to throw error
      const { WebClient } = require('@slack/web-api')
      WebClient.mockImplementationOnce(() => ({
        chat: {
          postMessage: jest
            .fn()
            .mockRejectedValue(new Error('Slack API error')),
        },
      }))

      const service = new CubcenNotificationService(prisma)
      const slackNotification = {
        channel: '#test',
        text: 'Test message',
      }

      await expect(service.sendSlack(slackNotification)).rejects.toThrow(
        'Slack API error'
      )
    })
  })

  describe('sendInApp', () => {
    it('should create in-app notification successfully', async () => {
      const inAppNotification = {
        id: 'in-app-test-1',
        userId: mockUser.id,
        title: 'Test In-App',
        message: 'This is a test in-app notification',
        type: 'info' as const,
        read: false,
        createdAt: new Date(),
      }

      await notificationService.sendInApp(inAppNotification)

      const created = await prisma.inAppNotification.findUnique({
        where: { id: 'in-app-test-1' },
      })

      expect(created).toMatchObject({
        id: 'in-app-test-1',
        userId: mockUser.id,
        title: 'Test In-App',
        message: 'This is a test in-app notification',
        type: 'info',
        read: false,
      })
    })

    it('should handle database errors when creating in-app notification', async () => {
      const inAppNotification = {
        id: 'in-app-test-1',
        userId: 'non-existent-user',
        title: 'Test In-App',
        message: 'This is a test in-app notification',
        type: 'info' as const,
        read: false,
        createdAt: new Date(),
      }

      await expect(
        notificationService.sendInApp(inAppNotification)
      ).rejects.toThrow()
    })
  })

  describe('acknowledge', () => {
    it('should acknowledge notification successfully', async () => {
      const notification = await prisma.notification.create({
        data: mockNotification,
      })

      await notificationService.acknowledge(notification.id, mockUser.id)

      const updated = await prisma.notification.findUnique({
        where: { id: notification.id },
      })

      expect(updated?.status).toBe(NotificationStatus.ACKNOWLEDGED)
      expect(updated?.acknowledgedBy).toBe(mockUser.id)
      expect(updated?.acknowledgedAt).toBeDefined()
    })

    it('should handle acknowledgment of non-existent notification', async () => {
      await expect(
        notificationService.acknowledge('non-existent', mockUser.id)
      ).rejects.toThrow()
    })
  })

  describe('escalate', () => {
    it('should escalate notification to admin users', async () => {
      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@cubcen.com',
          password: 'hashedpassword',
          role: 'ADMIN',
          name: 'Admin User',
        },
      })

      const notification = await prisma.notification.create({
        data: mockNotification,
      })

      await notificationService.escalate(notification.id)

      const escalation = await prisma.alertEscalation.findFirst({
        where: { notificationId: notification.id },
      })

      expect(escalation).toBeDefined()
      expect(escalation?.level).toBe(1)
      expect(JSON.parse(escalation?.escalatedTo || '[]')).toContain(
        adminUser.id
      )
    })

    it('should handle escalation when no admin users exist', async () => {
      const notification = await prisma.notification.create({
        data: mockNotification,
      })

      // No admin users exist, should not throw but log warning
      await expect(
        notificationService.escalate(notification.id)
      ).resolves.not.toThrow()
    })
  })

  describe('getNotifications', () => {
    it('should retrieve user notifications with filters', async () => {
      await prisma.notification.create({
        data: mockNotification,
      })

      const notifications = await notificationService.getNotifications(
        mockUser.id,
        {
          status: NotificationStatus.PENDING,
          limit: 10,
        }
      )

      expect(notifications).toHaveLength(1)
      expect(notifications[0]).toMatchObject({
        eventType: NotificationEventType.AGENT_ERROR,
        title: 'Test Notification',
        status: NotificationStatus.PENDING,
      })
    })

    it('should handle empty results', async () => {
      const notifications =
        await notificationService.getNotifications('non-existent-user')
      expect(notifications).toHaveLength(0)
    })
  })

  describe('markAsRead', () => {
    it('should mark in-app notification as read', async () => {
      await prisma.inAppNotification.create({
        data: {
          id: 'in-app-test-1',
          userId: mockUser.id,
          title: 'Test',
          message: 'Test message',
          type: 'info',
          read: false,
        },
      })

      await notificationService.markAsRead('in-app-test-1', mockUser.id)

      const updated = await prisma.inAppNotification.findUnique({
        where: { id: 'in-app-test-1' },
      })

      expect(updated?.read).toBe(true)
    })
  })

  describe('error scenarios', () => {
    it('should handle notification queue overflow', async () => {
      // Create many notifications to simulate queue overflow
      const notifications = Array.from({ length: 100 }, (_, i) => ({
        ...mockNotification,
        id: `notification-${i}`,
        title: `Notification ${i}`,
      }))

      await prisma.notification.createMany({
        data: notifications,
      })

      // Should handle large number of notifications gracefully
      const retrieved = await notificationService.getNotifications(
        mockUser.id,
        { limit: 50 }
      )
      expect(retrieved.length).toBeLessThanOrEqual(50)
    })

    it('should validate notification preferences', async () => {
      // Test with invalid channel type
      const invalidNotification = {
        ...mockNotification,
        channels: JSON.stringify(['INVALID_CHANNEL']),
      }

      const notification = await prisma.notification.create({
        data: invalidNotification,
      })

      // Should handle invalid channels gracefully
      await expect(
        notificationService.send(notification)
      ).resolves.not.toThrow()
    })

    it('should handle email delivery failures', async () => {
      // Mock email transporter to fail
      const nodemailer = require('nodemailer')
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: jest
          .fn()
          .mockRejectedValue(new Error('Email delivery failed')),
      })

      const service = new CubcenNotificationService(prisma)
      const notification = await prisma.notification.create({
        data: {
          ...mockNotification,
          channels: JSON.stringify([NotificationChannelType.EMAIL]),
        },
      })

      await expect(service.send(notification)).rejects.toThrow()

      // Check that notification status was updated to failed
      const updated = await prisma.notification.findUnique({
        where: { id: notification.id },
      })
      expect(updated?.status).toBe(NotificationStatus.FAILED)
      expect(updated?.retryCount).toBe(1)
    })

    it('should handle Slack API errors', async () => {
      // Mock Slack client to fail
      const { WebClient } = require('@slack/web-api')
      WebClient.mockImplementationOnce(() => ({
        chat: {
          postMessage: jest
            .fn()
            .mockRejectedValue(new Error('Slack API error')),
        },
      }))

      const service = new CubcenNotificationService(prisma)
      const notification = await prisma.notification.create({
        data: {
          ...mockNotification,
          channels: JSON.stringify([NotificationChannelType.SLACK]),
        },
      })

      await expect(service.send(notification)).rejects.toThrow()
    })
  })

  describe('integration scenarios', () => {
    it('should send multi-channel notification successfully', async () => {
      const notification = await prisma.notification.create({
        data: {
          ...mockNotification,
          channels: JSON.stringify([
            NotificationChannelType.EMAIL,
            NotificationChannelType.SLACK,
            NotificationChannelType.IN_APP,
          ]),
        },
      })

      await notificationService.send(notification)

      const updated = await prisma.notification.findUnique({
        where: { id: notification.id },
      })
      expect(updated?.status).toBe(NotificationStatus.SENT)
      expect(updated?.sentAt).toBeDefined()

      // Check in-app notification was created
      const inAppNotification = await prisma.inAppNotification.findFirst({
        where: { userId: mockUser.id },
      })
      expect(inAppNotification).toBeDefined()
    })

    it('should handle partial failures in multi-channel sending', async () => {
      // Mock email to fail but Slack to succeed
      const nodemailer = require('nodemailer')
      nodemailer.createTransporter.mockReturnValueOnce({
        sendMail: jest.fn().mockRejectedValue(new Error('Email failed')),
      })

      const service = new CubcenNotificationService(prisma)
      const notification = await prisma.notification.create({
        data: {
          ...mockNotification,
          channels: JSON.stringify([
            NotificationChannelType.EMAIL,
            NotificationChannelType.SLACK,
          ]),
        },
      })

      // Should handle partial failures gracefully
      await expect(service.send(notification)).rejects.toThrow()
    })
  })
})
