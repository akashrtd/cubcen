"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const notification_1 = require("../../services/notification");
const notification_preferences_1 = require("../../services/notification-preferences");
const logger_1 = require("../../lib/logger");
const notification_2 = require("../../types/notification");
const router = express_1.default.Router();
const getNotificationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.nativeEnum(notification_2.NotificationStatus).optional(),
        eventType: zod_1.z.nativeEnum(notification_2.NotificationEventType).optional(),
        priority: zod_1.z.nativeEnum(notification_2.NotificationPriority).optional(),
        limit: zod_1.z.coerce.number().min(1).max(100).default(50),
        offset: zod_1.z.coerce.number().min(0).default(0),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional()
    })
});
const acknowledgeNotificationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
const markAsReadSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
const createNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventType: zod_1.z.nativeEnum(notification_2.NotificationEventType),
        title: zod_1.z.string().min(1).max(255),
        message: zod_1.z.string().min(1).max(2000),
        priority: zod_1.z.nativeEnum(notification_2.NotificationPriority).default(notification_2.NotificationPriority.MEDIUM),
        userId: zod_1.z.string().optional(),
        data: zod_1.z.record(zod_1.z.any()).optional(),
        channels: zod_1.z.array(zod_1.z.nativeEnum(notification_2.NotificationChannelType)).optional()
    })
});
const updatePreferenceSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventType: zod_1.z.nativeEnum(notification_2.NotificationEventType)
    }),
    body: zod_1.z.object({
        channels: zod_1.z.array(zod_1.z.nativeEnum(notification_2.NotificationChannelType)),
        enabled: zod_1.z.boolean(),
        escalationDelay: zod_1.z.number().min(0).max(1440).optional()
    })
});
const bulkUpdatePreferencesSchema = zod_1.z.object({
    body: zod_1.z.object({
        preferences: zod_1.z.array(zod_1.z.object({
            eventType: zod_1.z.nativeEnum(notification_2.NotificationEventType),
            channels: zod_1.z.array(zod_1.z.nativeEnum(notification_2.NotificationChannelType)),
            enabled: zod_1.z.boolean(),
            escalationDelay: zod_1.z.number().min(0).max(1440).optional()
        }))
    })
});
router.get('/', auth_1.authMiddleware, (0, validation_1.validateRequest)(getNotificationsSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, eventType, priority, limit, offset, startDate, endDate } = req.query;
        const options = {
            status,
            eventType,
            priority,
            limit,
            offset,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        };
        const notifications = await notification_1.notificationService.getNotifications(userId, options);
        res.json({
            success: true,
            data: notifications,
            pagination: {
                limit,
                offset,
                total: notifications.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get notifications', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to get notifications'
        });
    }
});
router.get('/in-app', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const unreadOnly = req.query.unreadOnly === 'true';
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('../../generated/prisma')));
        const prisma = new PrismaClient();
        const where = { userId };
        if (unreadOnly) {
            where.read = false;
        }
        const notifications = await prisma.inAppNotification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        const unreadCount = await prisma.inAppNotification.count({
            where: { userId, read: false }
        });
        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get in-app notifications', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to get in-app notifications'
        });
    }
});
router.post('/:id/acknowledge', auth_1.authMiddleware, (0, validation_1.validateRequest)(acknowledgeNotificationSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await notification_1.notificationService.acknowledge(id, userId);
        res.json({
            success: true,
            message: 'Notification acknowledged successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to acknowledge notification', error, {
            notificationId: req.params.id,
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to acknowledge notification'
        });
    }
});
router.post('/:id/read', auth_1.authMiddleware, (0, validation_1.validateRequest)(markAsReadSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await notification_1.notificationService.markAsRead(id, userId);
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to mark notification as read', error, {
            notificationId: req.params.id,
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, validation_1.validateRequest)(createNotificationSchema), async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }
        const { eventType, title, message, priority, userId, data, channels } = req.body;
        const notification = await notification_1.notificationService.createNotification(eventType, title, message, { priority, userId, data, channels });
        await notification_1.notificationService.send(notification);
        res.status(201).json({
            success: true,
            data: notification
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to create notification', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to create notification'
        });
    }
});
router.get('/preferences', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = await notification_preferences_1.notificationPreferencesService.getUserPreferences(userId);
        res.json({
            success: true,
            data: preferences
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get notification preferences', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to get notification preferences'
        });
    }
});
router.put('/preferences/:eventType', auth_1.authMiddleware, (0, validation_1.validateRequest)(updatePreferenceSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventType } = req.params;
        const { channels, enabled, escalationDelay } = req.body;
        const preference = await notification_preferences_1.notificationPreferencesService.updateUserPreference(userId, eventType, { channels, enabled, escalationDelay });
        res.json({
            success: true,
            data: preference
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to update notification preference', error, {
            userId: req.user?.id,
            eventType: req.params.eventType
        });
        res.status(500).json({
            success: false,
            error: 'Failed to update notification preference'
        });
    }
});
router.put('/preferences', auth_1.authMiddleware, (0, validation_1.validateRequest)(bulkUpdatePreferencesSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;
        await notification_preferences_1.notificationPreferencesService.bulkUpdatePreferences(userId, preferences);
        res.json({
            success: true,
            message: 'Preferences updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to bulk update preferences', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences'
        });
    }
});
router.get('/channels', auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }
        const channels = await notification_preferences_1.notificationPreferencesService.getNotificationChannels();
        res.json({
            success: true,
            data: channels
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get notification channels', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notification channels'
        });
    }
});
router.post('/test', auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }
        const { channel, message = 'Test notification from Cubcen' } = req.body;
        const notification = await notification_1.notificationService.createNotification(notification_2.NotificationEventType.SYSTEM_ERROR, 'Test Notification', message, {
            priority: notification_2.NotificationPriority.LOW,
            userId: req.user.id,
            channels: channel ? [channel] : [notification_2.NotificationChannelType.IN_APP]
        });
        await notification_1.notificationService.send(notification);
        res.json({
            success: true,
            message: 'Test notification sent successfully',
            data: notification
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to send test notification', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to send test notification'
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map