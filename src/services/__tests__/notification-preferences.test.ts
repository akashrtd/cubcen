// Cubcen Notification Preferences Service Tests
// Tests for notification preference management

import { PrismaClient } from '../../generated/prisma'
import { NotificationPreferencesService } from '../notification-preferences'
import {
  NotificationEventType,
  NotificationChannelType
} from '../../types/notification'

describe('NotificationPreferencesService', () => {
  let prisma: PrismaClient
  let preferencesService: NotificationPreferencesService
  let mockUser: any

  beforeEach(async () => {
    prisma = new PrismaClient()
    preferencesService = new NotificationPreferencesService(prisma)

    // Clean up existing data
    await prisma.notificationPreference.deleteMany()
    await prisma.notificationChannel.deleteMany()
    await prisma.user.deleteMany()

    // Create test user with unique email
    const uniqueEmail = `test-${Date.now()}@cubcen.com`
    mockUser = await prisma.user.create({
      data: {
        email: uniqueEmail,
        password: 'hashedpassword',
        role: 'ADMIN',
        name: 'Test User'
      }
    })
  })

  afterEach(async () => {
    try {
      await prisma.notificationPreference.deleteMany()
      await prisma.notificationChannel.deleteMany()
      await prisma.user.deleteMany()
    } catch (error) {
      // Ignore cleanup errors
    } finally {
      await prisma.$disconnect()
    }
  })

  describe('getUserPreferences', () => {
    it('should return empty array for user with no preferences', async () => {
      const preferences = await preferencesService.getUserPreferences(mockUser.id)
      expect(preferences).toEqual([])
    })

    it('should return user preferences', async () => {
      await prisma.notificationPreference.create({
        data: {
          userId: mockUser.id,
          eventType: NotificationEventType.AGENT_DOWN,
          channels: JSON.stringify([NotificationChannelType.EMAIL, NotificationChannelType.SLACK]),
          enabled: true,
          escalationDelay: 15
        }
      })

      const preferences = await preferencesService.getUserPreferences(mockUser.id)
      
      expect(preferences).toHaveLength(1)
      expect(preferences[0]).toMatchObject({
        userId: mockUser.id,
        eventType: NotificationEventType.AGENT_DOWN,
        channels: [NotificationChannelType.EMAIL, NotificationChannelType.SLACK],
        enabled: true,
        escalationDelay: 15
      })
    })
  })

  describe('updateUserPreference', () => {
    it('should create new preference if none exists', async () => {
      const preference = await preferencesService.updateUserPreference(
        mockUser.id,
        NotificationEventType.TASK_FAILED,
        {
          channels: [NotificationChannelType.IN_APP],
          enabled: true
        }
      )

      expect(preference).toMatchObject({
        userId: mockUser.id,
        eventType: NotificationEventType.TASK_FAILED,
        channels: [NotificationChannelType.IN_APP],
        enabled: true
      })
    })

    it('should update existing preference', async () => {
      // Create initial preference
      await prisma.notificationPreference.create({
        data: {
          userId: mockUser.id,
          eventType: NotificationEventType.AGENT_ERROR,
          channels: JSON.stringify([NotificationChannelType.EMAIL]),
          enabled: true
        }
      })

      // Update preference
      const updated = await preferencesService.updateUserPreference(
        mockUser.id,
        NotificationEventType.AGENT_ERROR,
        {
          channels: [NotificationChannelType.EMAIL, NotificationChannelType.SLACK],
          enabled: false,
          escalationDelay: 30
        }
      )

      expect(updated).toMatchObject({
        userId: mockUser.id,
        eventType: NotificationEventType.AGENT_ERROR,
        channels: [NotificationChannelType.EMAIL, NotificationChannelType.SLACK],
        enabled: false,
        escalationDelay: 30
      })
    })
  })

  describe('getDefaultPreferences', () => {
    it('should return default preferences for all event types', async () => {
      const defaults = await preferencesService.getDefaultPreferences()
      
      expect(defaults).toHaveProperty(NotificationEventType.AGENT_DOWN)
      expect(defaults).toHaveProperty(NotificationEventType.TASK_FAILED)
      expect(defaults).toHaveProperty(NotificationEventType.SYSTEM_ERROR)
      
      expect(defaults[NotificationEventType.AGENT_DOWN]).toContain(NotificationChannelType.EMAIL)
      expect(defaults[NotificationEventType.AGENT_DOWN]).toContain(NotificationChannelType.SLACK)
    })
  })

  describe('initializeUserPreferences', () => {
    it('should create default preferences for new user', async () => {
      await preferencesService.initializeUserPreferences(mockUser.id)
      
      const preferences = await preferencesService.getUserPreferences(mockUser.id)
      
      expect(preferences.length).toBeGreaterThan(0)
      expect(preferences.some(p => p.eventType === NotificationEventType.AGENT_DOWN)).toBe(true)
      expect(preferences.some(p => p.eventType === NotificationEventType.SYSTEM_ERROR)).toBe(true)
    })

    it('should not duplicate existing preferences', async () => {
      // Create one preference manually
      await prisma.notificationPreference.create({
        data: {
          userId: mockUser.id,
          eventType: NotificationEventType.AGENT_DOWN,
          channels: JSON.stringify([NotificationChannelType.EMAIL]),
          enabled: true
        }
      })

      await preferencesService.initializeUserPreferences(mockUser.id)
      
      const preferences = await preferencesService.getUserPreferences(mockUser.id)
      const agentDownPrefs = preferences.filter(p => p.eventType === NotificationEventType.AGENT_DOWN)
      
      expect(agentDownPrefs).toHaveLength(1)
    })
  })

  describe('getNotificationChannels', () => {
    it('should return empty array when no channels exist', async () => {
      const channels = await preferencesService.getNotificationChannels()
      expect(channels).toEqual([])
    })

    it('should return notification channels', async () => {
      await prisma.notificationChannel.create({
        data: {
          type: NotificationChannelType.EMAIL,
          name: 'Email Channel',
          enabled: true,
          configuration: JSON.stringify({
            host: 'smtp.test.com',
            port: 587
          })
        }
      })

      const channels = await preferencesService.getNotificationChannels()
      
      expect(channels).toHaveLength(1)
      expect(channels[0]).toMatchObject({
        type: NotificationChannelType.EMAIL,
        name: 'Email Channel',
        enabled: true,
        configuration: {
          host: 'smtp.test.com',
          port: 587
        }
      })
    })
  })

  describe('updateNotificationChannel', () => {
    it('should update notification channel', async () => {
      const channel = await prisma.notificationChannel.create({
        data: {
          type: NotificationChannelType.SLACK,
          name: 'Slack Channel',
          enabled: true,
          configuration: JSON.stringify({
            defaultChannel: '#alerts'
          })
        }
      })

      const updated = await preferencesService.updateNotificationChannel(channel.id, {
        name: 'Updated Slack Channel',
        enabled: false,
        configuration: {
          defaultChannel: '#notifications',
          username: 'Cubcen Bot'
        }
      })

      expect(updated).toMatchObject({
        name: 'Updated Slack Channel',
        enabled: false,
        configuration: {
          defaultChannel: '#notifications',
          username: 'Cubcen Bot'
        }
      })
    })

    it('should handle non-existent channel', async () => {
      await expect(
        preferencesService.updateNotificationChannel('non-existent', {
          name: 'Test'
        })
      ).rejects.toThrow()
    })
  })

  describe('createNotificationChannel', () => {
    it('should create new notification channel', async () => {
      const channel = await preferencesService.createNotificationChannel({
        type: NotificationChannelType.IN_APP,
        name: 'In-App Channel',
        enabled: true,
        configuration: {
          maxNotifications: 100
        }
      })

      expect(channel).toMatchObject({
        type: NotificationChannelType.IN_APP,
        name: 'In-App Channel',
        enabled: true,
        configuration: {
          maxNotifications: 100
        }
      })
    })
  })

  describe('getUserPreferencesForEvent', () => {
    it('should return channels for enabled preference', async () => {
      await prisma.notificationPreference.create({
        data: {
          userId: mockUser.id,
          eventType: NotificationEventType.WORKFLOW_FAILED,
          channels: JSON.stringify([NotificationChannelType.EMAIL, NotificationChannelType.SLACK]),
          enabled: true
        }
      })

      const channels = await preferencesService.getUserPreferencesForEvent(
        mockUser.id,
        NotificationEventType.WORKFLOW_FAILED
      )

      expect(channels).toEqual([NotificationChannelType.EMAIL, NotificationChannelType.SLACK])
    })

    it('should return empty array for disabled preference', async () => {
      await prisma.notificationPreference.create({
        data: {
          userId: mockUser.id,
          eventType: NotificationEventType.TASK_COMPLETED,
          channels: JSON.stringify([NotificationChannelType.IN_APP]),
          enabled: false
        }
      })

      const channels = await preferencesService.getUserPreferencesForEvent(
        mockUser.id,
        NotificationEventType.TASK_COMPLETED
      )

      expect(channels).toEqual([])
    })

    it('should return default channels for non-existent preference', async () => {
      const channels = await preferencesService.getUserPreferencesForEvent(
        mockUser.id,
        NotificationEventType.AGENT_DOWN
      )

      expect(channels).toContain(NotificationChannelType.EMAIL)
      expect(channels).toContain(NotificationChannelType.SLACK)
    })
  })

  describe('bulkUpdatePreferences', () => {
    it('should update multiple preferences', async () => {
      const preferences = [
        {
          eventType: NotificationEventType.AGENT_DOWN,
          channels: [NotificationChannelType.EMAIL],
          enabled: true,
          escalationDelay: 15
        },
        {
          eventType: NotificationEventType.TASK_FAILED,
          channels: [NotificationChannelType.IN_APP, NotificationChannelType.EMAIL],
          enabled: true
        }
      ]

      await preferencesService.bulkUpdatePreferences(mockUser.id, preferences)

      const userPrefs = await preferencesService.getUserPreferences(mockUser.id)
      
      expect(userPrefs).toHaveLength(2)
      
      const agentDownPref = userPrefs.find(p => p.eventType === NotificationEventType.AGENT_DOWN)
      expect(agentDownPref).toMatchObject({
        channels: [NotificationChannelType.EMAIL],
        enabled: true,
        escalationDelay: 15
      })

      const taskFailedPref = userPrefs.find(p => p.eventType === NotificationEventType.TASK_FAILED)
      expect(taskFailedPref).toMatchObject({
        channels: [NotificationChannelType.IN_APP, NotificationChannelType.EMAIL],
        enabled: true
      })
    })

    it('should handle database transaction errors', async () => {
      // Create invalid preferences to trigger transaction failure
      const preferences = [
        {
          eventType: 'INVALID_EVENT_TYPE' as NotificationEventType,
          channels: [NotificationChannelType.EMAIL],
          enabled: true
        }
      ]

      await expect(
        preferencesService.bulkUpdatePreferences(mockUser.id, preferences)
      ).rejects.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Close the database connection to simulate error
      await prisma.$disconnect()

      await expect(
        preferencesService.getUserPreferences(mockUser.id)
      ).rejects.toThrow()
    })

    it('should handle invalid JSON in channels field', async () => {
      // Manually insert invalid JSON
      await prisma.$executeRaw`
        INSERT INTO cubcen_notification_preferences (id, userId, eventType, channels, enabled)
        VALUES ('test-pref', ${mockUser.id}, 'AGENT_DOWN', 'invalid-json', true)
      `

      await expect(
        preferencesService.getUserPreferences(mockUser.id)
      ).rejects.toThrow()
    })
  })
})