// Cubcen Notification API Routes
// Handles notification management, preferences, and acknowledgments

import express from 'express'
import { z } from 'zod'
import { authenticate } from "../middleware/auth"
import { validateRequest } from '../middleware/validation'
import { notificationService } from '../../services/notification'
import { notificationPreferencesService } from '../../services/notification-preferences'
import { logger } from '../../lib/logger'
import {
  NotificationEventType,
  NotificationChannelType,
  NotificationPriority,
  NotificationStatus,
} from '../../types/notification'

const router = express.Router()

// Validation schemas
const getNotificationsSchema = z.object({
  query: z.object({
    status: z.nativeEnum(NotificationStatus).optional(),
    eventType: z.nativeEnum(NotificationEventType).optional(),
    priority: z.nativeEnum(NotificationPriority).optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
})

const acknowledgeNotificationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
})

const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
})

const createNotificationSchema = z.object({
  body: z.object({
    eventType: z.nativeEnum(NotificationEventType),
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(2000),
    priority: z
      .nativeEnum(NotificationPriority)
      .default(NotificationPriority.MEDIUM),
    userId: z.string().optional(),
    data: z.record(z.any()).optional(),
    channels: z.array(z.nativeEnum(NotificationChannelType)).optional(),
  }),
})

const updatePreferenceSchema = z.object({
  params: z.object({
    eventType: z.nativeEnum(NotificationEventType),
  }),
  body: z.object({
    channels: z.array(z.nativeEnum(NotificationChannelType)),
    enabled: z.boolean(),
    escalationDelay: z.number().min(0).max(1440).optional(), // max 24 hours
  }),
})

const bulkUpdatePreferencesSchema = z.object({
  body: z.object({
    preferences: z.array(
      z.object({
        eventType: z.nativeEnum(NotificationEventType),
        channels: z.array(z.nativeEnum(NotificationChannelType)),
        enabled: z.boolean(),
        escalationDelay: z.number().min(0).max(1440).optional(),
      })
    ),
  }),
})

// Get user notifications
router.get(
  '/',
  authMiddleware,
  validateRequest(getNotificationsSchema),
  async (req, res) => {
    try {
      const userId = req.user!.id
      const { status, eventType, priority, limit, offset, startDate, endDate } =
        req.query

      const options = {
        status: status as NotificationStatus,
        eventType: eventType as NotificationEventType,
        priority: priority as NotificationPriority,
        limit: limit as number,
        offset: offset as number,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      }

      const notifications = await notificationService.getNotifications(
        userId,
        options
      )

      res.json({
        success: true,
        data: notifications,
        pagination: {
          limit,
          offset,
          total: notifications.length,
        },
      })
    } catch (error) {
      logger.error('Failed to get notifications', error as Error, {
        userId: req.user?.id,
      })
      res.status(500).json({
        success: false,
        error: 'Failed to get notifications',
      })
    }
  }
)

// Get in-app notifications
router.get('/in-app', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id
    const limit = parseInt(req.query.limit as string) || 20
    const unreadOnly = req.query.unreadOnly === 'true'

    const { PrismaClient } = await import('../../generated/prisma')
    const prisma = new PrismaClient()

    const where: Record<string, unknown> = { userId }
    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.inAppNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const unreadCount = await prisma.inAppNotification.count({
      where: { userId, read: false },
    })

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    })
  } catch (error) {
    logger.error('Failed to get in-app notifications', error as Error, {
      userId: req.user?.id,
    })
    res.status(500).json({
      success: false,
      error: 'Failed to get in-app notifications',
    })
  }
})

// Acknowledge notification
router.post(
  '/:id/acknowledge',
  authMiddleware,
  validateRequest(acknowledgeNotificationSchema),
  async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user!.id

      await notificationService.acknowledge(id, userId)

      res.json({
        success: true,
        message: 'Notification acknowledged successfully',
      })
    } catch (error) {
      logger.error('Failed to acknowledge notification', error as Error, {
        notificationId: req.params.id,
        userId: req.user?.id,
      })
      res.status(500).json({
        success: false,
        error: 'Failed to acknowledge notification',
      })
    }
  }
)

// Mark in-app notification as read
router.post(
  '/:id/read',
  authMiddleware,
  validateRequest(markAsReadSchema),
  async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user!.id

      await notificationService.markAsRead(id, userId)

      res.json({
        success: true,
        message: 'Notification marked as read',
      })
    } catch (error) {
      logger.error('Failed to mark notification as read', error as Error, {
        notificationId: req.params.id,
        userId: req.user?.id,
      })
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
      })
    }
  }
)

// Create notification (admin only)
router.post(
  '/',
  authMiddleware,
  validateRequest(createNotificationSchema),
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        })
      }

      const { eventType, title, message, priority, userId, data, channels } =
        req.body

      const notification = await notificationService.createNotification(
        eventType,
        title,
        message,
        { priority, userId, data, channels }
      )

      // Send the notification
      await notificationService.send(notification)

      res.status(201).json({
        success: true,
        data: notification,
      })
    } catch (error) {
      logger.error('Failed to create notification', error as Error, {
        userId: req.user?.id,
      })
      res.status(500).json({
        success: false,
        error: 'Failed to create notification',
      })
    }
  }
)

// Get user notification preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id
    const preferences =
      await notificationPreferencesService.getUserPreferences(userId)

    res.json({
      success: true,
      data: preferences,
    })
  } catch (error) {
    logger.error('Failed to get notification preferences', error as Error, {
      userId: req.user?.id,
    })
    res.status(500).json({
      success: false,
      error: 'Failed to get notification preferences',
    })
  }
})

// Update notification preference
router.put(
  '/preferences/:eventType',
  authMiddleware,
  validateRequest(updatePreferenceSchema),
  async (req, res) => {
    try {
      const userId = req.user!.id
      const { eventType } = req.params
      const { channels, enabled, escalationDelay } = req.body

      const preference =
        await notificationPreferencesService.updateUserPreference(
          userId,
          eventType as NotificationEventType,
          { channels, enabled, escalationDelay }
        )

      res.json({
        success: true,
        data: preference,
      })
    } catch (error) {
      logger.error('Failed to update notification preference', error as Error, {
        userId: req.user?.id,
        eventType: req.params.eventType,
      })
      res.status(500).json({
        success: false,
        error: 'Failed to update notification preference',
      })
    }
  }
)

// Bulk update notification preferences
router.put(
  '/preferences',
  authenticate,
  validateRequest(bulkUpdatePreferencesSchema),
  async (req, res) => {
    try {
      const userId = req.user!.id
      const { preferences } = req.body

      await notificationPreferencesService.bulkUpdatePreferences(
        userId,
        preferences
      )

      res.json({
        success: true,
        message: 'Preferences updated successfully',
      })
    } catch (error) {
      logger.error('Failed to bulk update preferences', error as Error, {
        userId: req.user?.id,
      })
      res.status(500).json({
        success: false,
        error: 'Failed to update preferences',
      })
    }
  }
)

// Get notification channels (admin only)
router.get('/channels', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      })
    }

    const channels =
      await notificationPreferencesService.getNotificationChannels()

    res.json({
      success: true,
      data: channels,
    })
  } catch (error) {
    logger.error('Failed to get notification channels', error as Error)
    res.status(500).json({
      success: false,
      error: 'Failed to get notification channels',
    })
  }
})

// Test notification endpoint (admin only)
router.post('/test', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      })
    }

    const { channel, message = 'Test notification from Cubcen' } = req.body;

    const notification = await notificationService.createNotification(
      NotificationEventType.SYSTEM_ERROR,
      'Test Notification',
      message,
      {
        priority: NotificationPriority.LOW,
        userId: req.user!.id,
        channels: channel ? [channel] : [NotificationChannelType.IN_APP],
      }
    )

    await notificationService.send(notification)

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: notification,
    })
  } catch (error) {
    logger.error('Failed to send test notification', error as Error, {
      userId: req.user?.id,
    })
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification',
    })
  }
})

export default router
