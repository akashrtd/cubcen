"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationPreferencesService = exports.NotificationPreferencesService = void 0;
const prisma_1 = require("../generated/prisma");
const logger_1 = require("../lib/logger");
const notification_1 = require("../types/notification");
class NotificationPreferencesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserPreferences(userId) {
        try {
            const preferences = await this.prisma.notificationPreference.findMany({
                where: { userId },
                orderBy: { eventType: 'asc' }
            });
            return preferences.map(p => ({
                ...p,
                channels: JSON.parse(p.channels)
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to get user preferences', error, { userId });
            throw error;
        }
    }
    async updateUserPreference(userId, eventType, preference) {
        try {
            const channels = preference.channels ? JSON.stringify(preference.channels) : undefined;
            const updated = await this.prisma.notificationPreference.upsert({
                where: {
                    userId_eventType: {
                        userId,
                        eventType
                    }
                },
                update: {
                    channels: channels || undefined,
                    enabled: preference.enabled,
                    escalationDelay: preference.escalationDelay
                },
                create: {
                    userId,
                    eventType,
                    channels: channels || JSON.stringify([notification_1.NotificationChannelType.IN_APP]),
                    enabled: preference.enabled ?? true,
                    escalationDelay: preference.escalationDelay
                }
            });
            return {
                ...updated,
                channels: JSON.parse(updated.channels)
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to update user preference', error, {
                userId,
                eventType
            });
            throw error;
        }
    }
    async getDefaultPreferences() {
        return {
            [notification_1.NotificationEventType.AGENT_DOWN]: [notification_1.NotificationChannelType.EMAIL, notification_1.NotificationChannelType.SLACK],
            [notification_1.NotificationEventType.AGENT_ERROR]: [notification_1.NotificationChannelType.IN_APP, notification_1.NotificationChannelType.EMAIL],
            [notification_1.NotificationEventType.TASK_FAILED]: [notification_1.NotificationChannelType.IN_APP],
            [notification_1.NotificationEventType.TASK_COMPLETED]: [notification_1.NotificationChannelType.IN_APP],
            [notification_1.NotificationEventType.WORKFLOW_FAILED]: [notification_1.NotificationChannelType.EMAIL, notification_1.NotificationChannelType.SLACK],
            [notification_1.NotificationEventType.WORKFLOW_COMPLETED]: [notification_1.NotificationChannelType.IN_APP],
            [notification_1.NotificationEventType.SYSTEM_ERROR]: [notification_1.NotificationChannelType.EMAIL, notification_1.NotificationChannelType.SLACK],
            [notification_1.NotificationEventType.HEALTH_CHECK_FAILED]: [notification_1.NotificationChannelType.EMAIL],
            [notification_1.NotificationEventType.PLATFORM_DISCONNECTED]: [notification_1.NotificationChannelType.EMAIL, notification_1.NotificationChannelType.SLACK]
        };
    }
    async initializeUserPreferences(userId) {
        try {
            const defaults = await this.getDefaultPreferences();
            const existingPreferences = await this.prisma.notificationPreference.findMany({
                where: { userId }
            });
            const existingEventTypes = new Set(existingPreferences.map(p => p.eventType));
            const preferencesToCreate = Object.entries(defaults)
                .filter(([eventType]) => !existingEventTypes.has(eventType))
                .map(([eventType, channels]) => ({
                userId,
                eventType: eventType,
                channels: JSON.stringify(channels),
                enabled: true
            }));
            if (preferencesToCreate.length > 0) {
                await this.prisma.notificationPreference.createMany({
                    data: preferencesToCreate
                });
                logger_1.logger.info('Initialized user notification preferences', {
                    userId,
                    count: preferencesToCreate.length
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize user preferences', error, { userId });
            throw error;
        }
    }
    async getNotificationChannels() {
        try {
            const channels = await this.prisma.notificationChannel.findMany({
                orderBy: { name: 'asc' }
            });
            return channels.map(c => ({
                ...c,
                configuration: JSON.parse(c.configuration)
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to get notification channels', error);
            throw error;
        }
    }
    async updateNotificationChannel(channelId, updates) {
        try {
            const configuration = updates.configuration
                ? JSON.stringify(updates.configuration)
                : undefined;
            const updated = await this.prisma.notificationChannel.update({
                where: { id: channelId },
                data: {
                    name: updates.name,
                    enabled: updates.enabled,
                    configuration
                }
            });
            return {
                ...updated,
                configuration: JSON.parse(updated.configuration)
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to update notification channel', error, {
                channelId
            });
            throw error;
        }
    }
    async createNotificationChannel(channel) {
        try {
            const created = await this.prisma.notificationChannel.create({
                data: {
                    type: channel.type,
                    name: channel.name,
                    enabled: channel.enabled,
                    configuration: JSON.stringify(channel.configuration)
                }
            });
            return {
                ...created,
                configuration: JSON.parse(created.configuration)
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to create notification channel', error, {
                type: channel.type,
                name: channel.name
            });
            throw error;
        }
    }
    async getUserPreferencesForEvent(userId, eventType) {
        try {
            const preference = await this.prisma.notificationPreference.findUnique({
                where: {
                    userId_eventType: {
                        userId,
                        eventType
                    }
                }
            });
            if (!preference || !preference.enabled) {
                return [];
            }
            return JSON.parse(preference.channels);
        }
        catch (error) {
            logger_1.logger.error('Failed to get user preferences for event', error, {
                userId,
                eventType
            });
            const defaults = await this.getDefaultPreferences();
            return defaults[eventType] || [notification_1.NotificationChannelType.IN_APP];
        }
    }
    async bulkUpdatePreferences(userId, preferences) {
        try {
            const operations = preferences.map(pref => this.prisma.notificationPreference.upsert({
                where: {
                    userId_eventType: {
                        userId,
                        eventType: pref.eventType
                    }
                },
                update: {
                    channels: JSON.stringify(pref.channels),
                    enabled: pref.enabled,
                    escalationDelay: pref.escalationDelay
                },
                create: {
                    userId,
                    eventType: pref.eventType,
                    channels: JSON.stringify(pref.channels),
                    enabled: pref.enabled,
                    escalationDelay: pref.escalationDelay
                }
            }));
            await this.prisma.$transaction(operations);
            logger_1.logger.info('Bulk updated user preferences', {
                userId,
                count: preferences.length
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to bulk update preferences', error, {
                userId,
                count: preferences.length
            });
            throw error;
        }
    }
}
exports.NotificationPreferencesService = NotificationPreferencesService;
exports.notificationPreferencesService = new NotificationPreferencesService(new prisma_1.PrismaClient());
//# sourceMappingURL=notification-preferences.js.map