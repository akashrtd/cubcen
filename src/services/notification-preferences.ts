// Cubcen Notification Preferences Service
// Manages user notification preferences and channel configurations

import { PrismaClient } from '../generated/prisma'
import { logger } from '../lib/logger'
import {
  NotificationChannelType,
  NotificationEventType,
  NotificationPreference,
  NotificationChannel,
} from '../types/notification'

export class NotificationPreferencesService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    try {
      const preferences = await this.prisma.notificationPreference.findMany({
        where: { userId },
        orderBy: { eventType: 'asc' },
      })

      return preferences.map(p => ({
        ...p,
        channels: JSON.parse(p.channels) as NotificationChannelType[],
      }))
    } catch (error) {
      logger.error('Failed to get user preferences', error as Error, { userId })
      throw error
    }
  }

  async updateUserPreference(
    userId: string,
    eventType: NotificationEventType,
    preference: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    try {
      const channels = preference.channels
        ? JSON.stringify(preference.channels)
        : undefined

      const updated = await this.prisma.notificationPreference.upsert({
        where: {
          userId_eventType: {
            userId,
            eventType,
          },
        },
        update: {
          channels: channels || undefined,
          enabled: preference.enabled,
          escalationDelay: preference.escalationDelay,
        },
        create: {
          userId,
          eventType,
          channels:
            channels || JSON.stringify([NotificationChannelType.IN_APP]),
          enabled: preference.enabled ?? true,
          escalationDelay: preference.escalationDelay,
        },
      })

      return {
        ...updated,
        channels: JSON.parse(updated.channels) as NotificationChannelType[],
      }
    } catch (error) {
      logger.error('Failed to update user preference', error as Error, {
        userId,
        eventType,
      })
      throw error
    }
  }

  async getDefaultPreferences(): Promise<
    Record<NotificationEventType, NotificationChannelType[]>
  > {
    return {
      [NotificationEventType.AGENT_DOWN]: [
        NotificationChannelType.EMAIL,
        NotificationChannelType.SLACK,
      ],
      [NotificationEventType.AGENT_ERROR]: [
        NotificationChannelType.IN_APP,
        NotificationChannelType.EMAIL,
      ],
      [NotificationEventType.TASK_FAILED]: [NotificationChannelType.IN_APP],
      [NotificationEventType.TASK_COMPLETED]: [NotificationChannelType.IN_APP],
      [NotificationEventType.WORKFLOW_FAILED]: [
        NotificationChannelType.EMAIL,
        NotificationChannelType.SLACK,
      ],
      [NotificationEventType.WORKFLOW_COMPLETED]: [
        NotificationChannelType.IN_APP,
      ],
      [NotificationEventType.SYSTEM_ERROR]: [
        NotificationChannelType.EMAIL,
        NotificationChannelType.SLACK,
      ],
      [NotificationEventType.HEALTH_CHECK_FAILED]: [
        NotificationChannelType.EMAIL,
      ],
      [NotificationEventType.PLATFORM_DISCONNECTED]: [
        NotificationChannelType.EMAIL,
        NotificationChannelType.SLACK,
      ],
    }
  }

  async initializeUserPreferences(userId: string): Promise<void> {
    try {
      const defaults = await this.getDefaultPreferences()
      const existingPreferences =
        await this.prisma.notificationPreference.findMany({
          where: { userId },
        })

      const existingEventTypes = new Set(
        existingPreferences.map(p => p.eventType)
      )

      const preferencesToCreate = Object.entries(defaults)
        .filter(
          ([eventType]) =>
            !existingEventTypes.has(eventType as NotificationEventType)
        )
        .map(([eventType, channels]) => ({
          userId,
          eventType: eventType as NotificationEventType,
          channels: JSON.stringify(channels),
          enabled: true,
        }))

      if (preferencesToCreate.length > 0) {
        await this.prisma.notificationPreference.createMany({
          data: preferencesToCreate,
        })

        logger.info('Initialized user notification preferences', {
          userId,
          count: preferencesToCreate.length,
        })
      }
    } catch (error) {
      logger.error('Failed to initialize user preferences', error as Error, {
        userId,
      })
      throw error
    }
  }

  async getNotificationChannels(): Promise<NotificationChannel[]> {
    try {
      const channels = await this.prisma.notificationChannel.findMany({
        orderBy: { name: 'asc' },
      })

      return channels.map(c => ({
        ...c,
        configuration: JSON.parse(c.configuration),
      }))
    } catch (error) {
      logger.error('Failed to get notification channels', error as Error)
      throw error
    }
  }

  async updateNotificationChannel(
    channelId: string,
    updates: Partial<NotificationChannel>
  ): Promise<NotificationChannel> {
    try {
      const configuration = updates.configuration
        ? JSON.stringify(updates.configuration)
        : undefined

      const updated = await this.prisma.notificationChannel.update({
        where: { id: channelId },
        data: {
          name: updates.name,
          enabled: updates.enabled,
          configuration,
        },
      })

      return {
        ...updated,
        configuration: JSON.parse(updated.configuration),
      }
    } catch (error) {
      logger.error('Failed to update notification channel', error as Error, {
        channelId,
      })
      throw error
    }
  }

  async createNotificationChannel(
    channel: Omit<NotificationChannel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NotificationChannel> {
    try {
      const created = await this.prisma.notificationChannel.create({
        data: {
          type: channel.type,
          name: channel.name,
          enabled: channel.enabled,
          configuration: JSON.stringify(channel.configuration),
        },
      })

      return {
        ...created,
        configuration: JSON.parse(created.configuration),
      }
    } catch (error) {
      logger.error('Failed to create notification channel', error as Error, {
        type: channel.type,
        name: channel.name,
      })
      throw error
    }
  }

  async getUserPreferencesForEvent(
    userId: string,
    eventType: NotificationEventType
  ): Promise<NotificationChannelType[]> {
    try {
      const preference = await this.prisma.notificationPreference.findUnique({
        where: {
          userId_eventType: {
            userId,
            eventType,
          },
        },
      })

      if (!preference || !preference.enabled) {
        return []
      }

      return JSON.parse(
        preference.channels as string
      ) as NotificationChannelType[]
    } catch (error) {
      logger.error('Failed to get user preferences for event', error as Error, {
        userId,
        eventType,
      })

      // Return default channels on error
      const defaults = await this.getDefaultPreferences()
      return defaults[eventType] || [NotificationChannelType.IN_APP]
    }
  }

  async bulkUpdatePreferences(
    userId: string,
    preferences: Array<{
      eventType: NotificationEventType
      channels: NotificationChannelType[]
      enabled: boolean
      escalationDelay?: number
    }>
  ): Promise<void> {
    try {
      const operations = preferences.map(pref =>
        this.prisma.notificationPreference.upsert({
          where: {
            userId_eventType: {
              userId,
              eventType: pref.eventType,
            },
          },
          update: {
            channels: JSON.stringify(pref.channels),
            enabled: pref.enabled,
            escalationDelay: pref.escalationDelay,
          },
          create: {
            userId,
            eventType: pref.eventType,
            channels: JSON.stringify(pref.channels),
            enabled: pref.enabled,
            escalationDelay: pref.escalationDelay,
          },
        })
      )

      await this.prisma.$transaction(operations)

      logger.info('Bulk updated user preferences', {
        userId,
        count: preferences.length,
      })
    } catch (error) {
      logger.error('Failed to bulk update preferences', error as Error, {
        userId,
        count: preferences.length,
      })
      throw error
    }
  }
}

// Export singleton instance
export const notificationPreferencesService =
  new NotificationPreferencesService(new PrismaClient())
