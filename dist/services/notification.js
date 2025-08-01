"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.CubcenNotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const web_api_1 = require("@slack/web-api");
const prisma_1 = require("../generated/prisma");
const logger_1 = require("../lib/logger");
const notification_1 = require("../types/notification");
class CubcenNotificationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.initializeEmailTransporter();
        this.initializeSlackClient();
    }
    initializeEmailTransporter() {
        try {
            this.emailConfig = {
                host: process.env.SMTP_HOST || 'localhost',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || ''
                },
                from: process.env.SMTP_FROM || 'noreply@cubcen.com'
            };
            if (this.emailConfig.auth.user && this.emailConfig.auth.pass) {
                this.emailTransporter = nodemailer_1.default.createTransport({
                    host: this.emailConfig.host,
                    port: this.emailConfig.port,
                    secure: this.emailConfig.secure,
                    auth: this.emailConfig.auth
                });
                logger_1.logger.info('Email transporter initialized', {
                    host: this.emailConfig.host,
                    port: this.emailConfig.port
                });
            }
            else {
                logger_1.logger.warn('Email configuration incomplete, email notifications disabled');
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize email transporter', error);
        }
    }
    initializeSlackClient() {
        try {
            const slackToken = process.env.SLACK_BOT_TOKEN;
            if (slackToken) {
                this.slackClient = new web_api_1.WebClient(slackToken);
                this.slackConfig = {
                    token: slackToken,
                    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || '#alerts',
                    username: process.env.SLACK_USERNAME || 'Cubcen Bot',
                    iconEmoji: process.env.SLACK_ICON_EMOJI || ':robot_face:'
                };
                logger_1.logger.info('Slack client initialized');
            }
            else {
                logger_1.logger.warn('Slack token not configured, Slack notifications disabled');
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Slack client', error);
        }
    }
    async send(notification) {
        try {
            logger_1.logger.info('Sending notification', {
                id: notification.id,
                eventType: notification.eventType,
                priority: notification.priority,
                channels: notification.channels
            });
            const channels = JSON.parse(notification.channels);
            const promises = [];
            for (const channel of channels) {
                switch (channel) {
                    case notification_1.NotificationChannelType.EMAIL:
                        if (this.emailTransporter && notification.userId) {
                            promises.push(this.sendEmailNotification(notification));
                        }
                        break;
                    case notification_1.NotificationChannelType.SLACK:
                        if (this.slackClient) {
                            promises.push(this.sendSlackNotification(notification));
                        }
                        break;
                    case notification_1.NotificationChannelType.IN_APP:
                        if (notification.userId) {
                            promises.push(this.sendInAppNotification(notification));
                        }
                        break;
                }
            }
            await Promise.allSettled(promises);
            await this.prisma.notification.update({
                where: { id: notification.id },
                data: {
                    status: notification_1.NotificationStatus.SENT,
                    sentAt: new Date()
                }
            });
            logger_1.logger.info('Notification sent successfully', { id: notification.id });
        }
        catch (error) {
            logger_1.logger.error('Failed to send notification', error, {
                notificationId: notification.id
            });
            await this.prisma.notification.update({
                where: { id: notification.id },
                data: {
                    status: notification_1.NotificationStatus.FAILED,
                    retryCount: { increment: 1 }
                }
            });
            throw error;
        }
    }
    async sendEmailNotification(notification) {
        if (!this.emailTransporter || !notification.userId)
            return;
        const user = await this.prisma.user.findUnique({
            where: { id: notification.userId }
        });
        if (!user) {
            throw new Error(`User not found: ${notification.userId}`);
        }
        const template = await this.getTemplate(notification.eventType, notification_1.NotificationChannelType.EMAIL);
        const context = this.buildNotificationContext(notification);
        const emailContent = this.renderTemplate(template.template, context);
        const subject = this.renderTemplate(template.subject, context);
        const emailNotification = {
            to: [user.email],
            subject,
            html: emailContent,
            text: notification.message
        };
        await this.sendEmail(emailNotification);
    }
    async sendSlackNotification(notification) {
        if (!this.slackClient || !this.slackConfig)
            return;
        const template = await this.getTemplate(notification.eventType, notification_1.NotificationChannelType.SLACK);
        const context = this.buildNotificationContext(notification);
        const message = this.renderTemplate(template.template, context);
        const color = this.getSlackColorForPriority(notification.priority);
        const slackNotification = {
            channel: this.slackConfig.defaultChannel,
            text: notification.title,
            username: this.slackConfig.username,
            iconEmoji: this.slackConfig.iconEmoji,
            attachments: [{
                    color,
                    title: notification.title,
                    text: message,
                    fields: [
                        {
                            title: 'Priority',
                            value: notification.priority.toUpperCase(),
                            short: true
                        },
                        {
                            title: 'Event Type',
                            value: notification.eventType.replace('_', ' ').toUpperCase(),
                            short: true
                        },
                        {
                            title: 'Time',
                            value: new Date().toISOString(),
                            short: true
                        }
                    ]
                }]
        };
        await this.sendSlack(slackNotification);
    }
    async sendInAppNotification(notification) {
        if (!notification.userId)
            return;
        const inAppNotification = {
            id: `in_app_${notification.id}`,
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            type: this.getInAppTypeForPriority(notification.priority),
            read: false,
            createdAt: new Date()
        };
        await this.sendInApp(inAppNotification);
    }
    async sendEmail(email) {
        if (!this.emailTransporter) {
            throw new Error('Email transporter not configured');
        }
        try {
            const info = await this.emailTransporter.sendMail({
                from: this.emailConfig?.from,
                to: email.to.join(', '),
                cc: email.cc?.join(', '),
                bcc: email.bcc?.join(', '),
                subject: email.subject,
                html: email.html,
                text: email.text,
                attachments: email.attachments
            });
            logger_1.logger.info('Email sent successfully', {
                messageId: info.messageId,
                to: email.to
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send email', error, {
                to: email.to,
                subject: email.subject
            });
            throw error;
        }
    }
    async sendSlack(slack) {
        if (!this.slackClient) {
            throw new Error('Slack client not configured');
        }
        try {
            const result = await this.slackClient.chat.postMessage({
                channel: slack.channel,
                text: slack.text,
                blocks: slack.blocks,
                attachments: slack.attachments,
                username: slack.username,
                icon_emoji: slack.iconEmoji,
                thread_ts: slack.threadTs
            });
            logger_1.logger.info('Slack message sent successfully', {
                channel: slack.channel,
                ts: result.ts
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send Slack message', error, {
                channel: slack.channel,
                text: slack.text
            });
            throw error;
        }
    }
    async sendInApp(inApp) {
        try {
            await this.prisma.inAppNotification.create({
                data: {
                    id: inApp.id,
                    userId: inApp.userId,
                    title: inApp.title,
                    message: inApp.message,
                    type: inApp.type,
                    read: inApp.read,
                    actionUrl: inApp.actionUrl,
                    actionText: inApp.actionText,
                    expiresAt: inApp.expiresAt
                }
            });
            logger_1.logger.info('In-app notification created', {
                id: inApp.id,
                userId: inApp.userId
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to create in-app notification', error, {
                id: inApp.id,
                userId: inApp.userId
            });
            throw error;
        }
    }
    async acknowledge(notificationId, userId) {
        try {
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: notification_1.NotificationStatus.ACKNOWLEDGED,
                    acknowledgedAt: new Date(),
                    acknowledgedBy: userId
                }
            });
            logger_1.logger.info('Notification acknowledged', {
                notificationId,
                userId
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to acknowledge notification', error, {
                notificationId,
                userId
            });
            throw error;
        }
    }
    async escalate(notificationId) {
        try {
            const notification = await this.prisma.notification.findUnique({
                where: { id: notificationId },
                include: { user: true }
            });
            if (!notification) {
                throw new Error(`Notification not found: ${notificationId}`);
            }
            const adminUsers = await this.prisma.user.findMany({
                where: { role: 'ADMIN' }
            });
            if (adminUsers.length === 0) {
                logger_1.logger.warn('No admin users found for escalation', { notificationId });
                return;
            }
            await this.prisma.alertEscalation.create({
                data: {
                    notificationId,
                    level: 1,
                    escalatedTo: JSON.stringify(adminUsers.map(u => u.id))
                }
            });
            for (const admin of adminUsers) {
                const escalationNotification = {
                    id: `escalation_${notificationId}_${admin.id}`,
                    eventType: notification_1.NotificationEventType.SYSTEM_ERROR,
                    priority: notification_1.NotificationPriority.CRITICAL,
                    status: notification_1.NotificationStatus.PENDING,
                    title: `ESCALATED: ${notification.title}`,
                    message: `This alert has been escalated due to lack of acknowledgment.\n\nOriginal message: ${notification.message}`,
                    userId: admin.id,
                    channels: JSON.stringify([notification_1.NotificationChannelType.EMAIL, notification_1.NotificationChannelType.SLACK]),
                    retryCount: 0,
                    maxRetries: 3,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await this.send(escalationNotification);
            }
            logger_1.logger.info('Notification escalated', {
                notificationId,
                escalatedTo: adminUsers.length
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to escalate notification', error, {
                notificationId
            });
            throw error;
        }
    }
    async getNotifications(userId, options = {}) {
        try {
            const where = { userId };
            if (options.status)
                where.status = options.status;
            if (options.eventType)
                where.eventType = options.eventType;
            if (options.priority)
                where.priority = options.priority;
            if (options.startDate || options.endDate) {
                where.createdAt = {};
                if (options.startDate)
                    where.createdAt.gte = options.startDate;
                if (options.endDate)
                    where.createdAt.lte = options.endDate;
            }
            const notifications = await this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: options.limit || 50,
                skip: options.offset || 0
            });
            return notifications.map(n => ({
                ...n,
                channels: JSON.parse(n.channels),
                data: n.data ? JSON.parse(n.data) : undefined
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to get notifications', error, { userId });
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            await this.prisma.inAppNotification.updateMany({
                where: {
                    id: notificationId,
                    userId
                },
                data: { read: true }
            });
            logger_1.logger.info('In-app notification marked as read', {
                notificationId,
                userId
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to mark notification as read', error, {
                notificationId,
                userId
            });
            throw error;
        }
    }
    async getTemplate(eventType, channelType) {
        const template = await this.prisma.notificationTemplate.findUnique({
            where: {
                eventType_channelType: {
                    eventType,
                    channelType
                }
            }
        });
        if (!template) {
            return {
                subject: 'Cubcen Alert: {{title}}',
                template: '{{message}}',
                variables: ['title', 'message']
            };
        }
        return {
            subject: template.subject,
            template: template.template,
            variables: JSON.parse(template.variables)
        };
    }
    buildNotificationContext(notification) {
        const context = {
            timestamp: new Date(),
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            eventType: notification.eventType
        };
        if (notification.data) {
            const data = JSON.parse(notification.data);
            Object.assign(context, data);
        }
        return context;
    }
    renderTemplate(template, context) {
        let rendered = template;
        Object.entries(context).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(placeholder, String(value));
        });
        return rendered;
    }
    getSlackColorForPriority(priority) {
        switch (priority) {
            case notification_1.NotificationPriority.CRITICAL:
                return '#FF0000';
            case notification_1.NotificationPriority.HIGH:
                return '#FF8C00';
            case notification_1.NotificationPriority.MEDIUM:
                return '#FFD700';
            case notification_1.NotificationPriority.LOW:
                return '#32CD32';
            default:
                return '#808080';
        }
    }
    getInAppTypeForPriority(priority) {
        switch (priority) {
            case notification_1.NotificationPriority.CRITICAL:
            case notification_1.NotificationPriority.HIGH:
                return 'error';
            case notification_1.NotificationPriority.MEDIUM:
                return 'warning';
            case notification_1.NotificationPriority.LOW:
                return 'info';
            default:
                return 'info';
        }
    }
    async createNotification(eventType, title, message, options = {}) {
        const { priority = notification_1.NotificationPriority.MEDIUM, userId, data, channels = [notification_1.NotificationChannelType.IN_APP] } = options;
        const notification = await this.prisma.notification.create({
            data: {
                eventType,
                priority,
                status: notification_1.NotificationStatus.PENDING,
                title,
                message,
                data: data ? JSON.stringify(data) : null,
                userId,
                channels: JSON.stringify(channels),
                retryCount: 0,
                maxRetries: 3
            }
        });
        return {
            ...notification,
            channels,
            data
        };
    }
}
exports.CubcenNotificationService = CubcenNotificationService;
exports.notificationService = new CubcenNotificationService(new prisma_1.PrismaClient());
//# sourceMappingURL=notification.js.map