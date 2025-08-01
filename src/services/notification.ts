// Cubcen Notification Service
// Handles email, Slack, and in-app notifications with escalation and acknowledgment

import nodemailer from 'nodemailer'
import { WebClient } from '@slack/web-api'
import { PrismaClient } from '../generated/prisma'
import { logger } from '../lib/logger'
import {
  NotificationService,
  Notification,
  EmailNotification,
  SlackNotification,
  InAppNotification,
  NotificationEventType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannelType,
  NotificationContext,
  GetNotificationsOptions,
  EmailNotificationConfig,
  SlackNotificationConfig,
} from '../types/notification'

export class CubcenNotificationService implements NotificationService {
  private prisma: PrismaClient
  private emailTransporter?: nodemailer.Transporter
  private slackClient?: WebClient
  private emailConfig?: EmailNotificationConfig
  private slackConfig?: SlackNotificationConfig

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.initializeEmailTransporter()
    this.initializeSlackClient()
  }

  private initializeEmailTransporter(): void {
    try {
      this.emailConfig = {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
        from: process.env.SMTP_FROM || 'noreply@cubcen.com',
      }

      if (this.emailConfig.auth.user && this.emailConfig.auth.pass) {
        this.emailTransporter = nodemailer.createTransport({
          host: this.emailConfig.host,
          port: this.emailConfig.port,
          secure: this.emailConfig.secure,
          auth: this.emailConfig.auth,
        })

        logger.info('Email transporter initialized', {
          host: this.emailConfig.host,
          port: this.emailConfig.port,
        })
      } else {
        logger.warn(
          'Email configuration incomplete, email notifications disabled'
        )
      }
    } catch (error) {
      logger.error('Failed to initialize email transporter', error as Error)
    }
  }

  private initializeSlackClient(): void {
    try {
      const slackToken = process.env.SLACK_BOT_TOKEN
      if (slackToken) {
        this.slackClient = new WebClient(slackToken)
        this.slackConfig = {
          token: slackToken,
          defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || '#alerts',
          username: process.env.SLACK_USERNAME || 'Cubcen Bot',
          iconEmoji: process.env.SLACK_ICON_EMOJI || ':robot_face:',
        }
        logger.info('Slack client initialized')
      } else {
        logger.warn('Slack token not configured, Slack notifications disabled')
      }
    } catch (error) {
      logger.error('Failed to initialize Slack client', error as Error)
    }
  }

  async send(notification: Notification): Promise<void> {
    try {
      logger.info('Sending notification', {
        id: notification.id,
        eventType: notification.eventType,
        priority: notification.priority,
        channels: notification.channels,
      })

      const channels = JSON.parse(
        notification.channels
      ) as NotificationChannelType[]
      const promises: Promise<void>[] = []

      for (const channel of channels) {
        switch (channel) {
          case NotificationChannelType.EMAIL:
            if (this.emailTransporter && notification.userId) {
              promises.push(this.sendEmailNotification(notification))
            }
            break
          case NotificationChannelType.SLACK:
            if (this.slackClient) {
              promises.push(this.sendSlackNotification(notification))
            }
            break
          case NotificationChannelType.IN_APP:
            if (notification.userId) {
              promises.push(this.sendInAppNotification(notification))
            }
            break
        }
      }

      await Promise.allSettled(promises)

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      })

      logger.info('Notification sent successfully', { id: notification.id })
    } catch (error) {
      logger.error('Failed to send notification', error as Error, {
        notificationId: notification.id,
      })

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          retryCount: { increment: 1 },
        },
      })

      throw error
    }
  }

  private async sendEmailNotification(
    notification: Notification
  ): Promise<void> {
    if (!this.emailTransporter || !notification.userId) return

    const user = await this.prisma.user.findUnique({
      where: { id: notification.userId },
    })

    if (!user) {
      throw new Error(`User not found: ${notification.userId}`)
    }

    const template = await this.getTemplate(
      notification.eventType,
      NotificationChannelType.EMAIL
    )
    const context = this.buildNotificationContext(notification)

    const emailContent = this.renderTemplate(template.template, context)
    const subject = this.renderTemplate(template.subject, context)

    const emailNotification: EmailNotification = {
      to: [user.email],
      subject,
      html: emailContent,
      text: notification.message,
    }

    await this.sendEmail(emailNotification)
  }

  private async sendSlackNotification(
    notification: Notification
  ): Promise<void> {
    if (!this.slackClient || !this.slackConfig) return

    const template = await this.getTemplate(
      notification.eventType,
      NotificationChannelType.SLACK
    )
    const context = this.buildNotificationContext(notification)

    const message = this.renderTemplate(template.template, context)
    const color = this.getSlackColorForPriority(notification.priority)

    const slackNotification: SlackNotification = {
      channel: this.slackConfig.defaultChannel,
      text: notification.title,
      username: this.slackConfig.username,
      iconEmoji: this.slackConfig.iconEmoji,
      attachments: [
        {
          color,
          title: notification.title,
          text: message,
          fields: [
            {
              title: 'Priority',
              value: notification.priority.toUpperCase(),
              short: true,
            },
            {
              title: 'Event Type',
              value: notification.eventType.replace('_', ' ').toUpperCase(),
              short: true,
            },
            {
              title: 'Time',
              value: new Date().toISOString(),
              short: true,
            },
          ],
        },
      ],
    }

    await this.sendSlack(slackNotification)
  }

  private async sendInAppNotification(
    notification: Notification
  ): Promise<void> {
    if (!notification.userId) return

    const inAppNotification: InAppNotification = {
      id: `in_app_${notification.id}`,
      userId: notification.userId!,
      title: notification.title,
      message: notification.message,
      type: this.getInAppTypeForPriority(notification.priority),
      read: false,
      createdAt: new Date(),
    };

    await this.sendInApp(inAppNotification)
  }

  async sendEmail(email: EmailNotification): Promise<void> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not configured')
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
        attachments: email.attachments,
      })

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: email.to,
      })
    } catch (error) {
      logger.error('Failed to send email', error as Error, {
        to: email.to,
        subject: email.subject,
      })
      throw error
    }
  }

  async sendSlack(slack: SlackNotification): Promise<void> {
    if (!this.slackClient) {
      throw new Error('Slack client not configured')
    }

    try {
      const result = await this.slackClient.chat.postMessage({
        channel: slack.channel,
        text: slack.text,
        blocks: slack.blocks,
        attachments: slack.attachments,
        username: slack.username,
        icon_emoji: slack.iconEmoji,
        thread_ts: slack.threadTs,
      })

      logger.info('Slack message sent successfully', {
        channel: slack.channel,
        ts: result.ts,
      })
    } catch (error) {
      logger.error('Failed to send Slack message', error as Error, {
        channel: slack.channel,
        text: slack.text,
      })
      throw error
    }
  }

  async sendInApp(inApp: InAppNotification): Promise<void> {
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
          expiresAt: inApp.expiresAt,
        },
      })

      logger.info('In-app notification created', {
        id: inApp.id,
        userId: inApp.userId,
      })
    } catch (error) {
      logger.error('Failed to create in-app notification', error as Error, {
        id: inApp.id,
        userId: inApp.userId,
      })
      throw error
    }
  }

  async acknowledge(notificationId: string, userId: string): Promise<void> {
    try {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.ACKNOWLEDGED,
          acknowledgedAt: new Date(),
          acknowledgedBy: userId,
        },
      })

      logger.info('Notification acknowledged', {
        notificationId,
        userId,
      })
    } catch (error) {
      logger.error('Failed to acknowledge notification', error as Error, {
        notificationId,
        userId,
      })
      throw error
    }
  }

  async escalate(notificationId: string): Promise<void> {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
        include: { user: true },
      })

      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`)
      }

      // Get escalation users (admins)
      const adminUsers = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
      })

      if (adminUsers.length === 0) {
        logger.warn('No admin users found for escalation', { notificationId })
        return
      }

      // Create escalation record
      await this.prisma.alertEscalation.create({
        data: {
          notificationId,
          level: 1,
          escalatedTo: JSON.stringify(adminUsers.map(u => u.id)),
        },
      })

      // Send escalation notifications
      for (const admin of adminUsers) {
        const escalationNotification: Notification = {
          id: `escalation_${notificationId}_${admin.id}`,
          eventType: NotificationEventType.SYSTEM_ERROR,
          priority: NotificationPriority.CRITICAL,
          status: NotificationStatus.PENDING,
          title: `ESCALATED: ${notification.title}`,
          message: `This alert has been escalated due to lack of acknowledgment.\n\nOriginal message: ${notification.message}`,
          userId: admin.id,
          channels: JSON.stringify([
            NotificationChannelType.EMAIL,
            NotificationChannelType.SLACK,
          ]),
          retryCount: 0,
          maxRetries: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await this.send(escalationNotification)
      }

      logger.info('Notification escalated', {
        notificationId,
        escalatedTo: adminUsers.length,
      })
    } catch (error) {
      logger.error('Failed to escalate notification', error as Error, {
        notificationId,
      })
      throw error
    }
  }

  async getNotifications(
    userId: string,
    options: GetNotificationsOptions = {}
  ): Promise<Notification[]> {
    try {
      const where: Record<string, unknown> = { userId }

      if (options.status) where.status = options.status
      if (options.eventType) where.eventType = options.eventType
      if (options.priority) where.priority = options.priority
      if (options.startDate || options.endDate) {
        where.createdAt = {}
        if (options.startDate) where.createdAt.gte = options.startDate
        if (options.endDate) where.createdAt.lte = options.endDate
      }

      const notifications = await this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
      })

      return notifications.map(n => ({
        ...n,
        channels: JSON.parse(n.channels),
        data: n.data ? JSON.parse(n.data) : undefined,
      }))
    } catch (error) {
      logger.error('Failed to get notifications', error as Error, { userId })
      throw error
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await this.prisma.inAppNotification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: { read: true },
      })

      logger.info('In-app notification marked as read', {
        notificationId,
        userId,
      })
    } catch (error) {
      logger.error('Failed to mark notification as read', error as Error, {
        notificationId,
        userId,
      })
      throw error
    }
  }

  private async getTemplate(
    eventType: NotificationEventType,
    channelType: NotificationChannelType
  ) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: {
        eventType_channelType: {
          eventType,
          channelType,
        },
      },
    })

    if (!template) {
      // Return default template
      return {
        subject: 'Cubcen Alert: {{title}}',
        template: '{{message}}',
        variables: ['title', 'message'],
      }
    }

    return {
      subject: template.subject,
      template: template.template,
      variables: JSON.parse(template.variables),
    }
  }

  private buildNotificationContext(
    notification: Notification
  ): NotificationContext {
    const context: NotificationContext = {
      timestamp: new Date(),
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      eventType: notification.eventType,
    }

    if (notification.data) {
      const data = JSON.parse(notification.data)
      Object.assign(context, data)
    }

    return context
  }

  private renderTemplate(
    template: string,
    context: NotificationContext
  ): string {
    let rendered = template

    Object.entries(context).forEach(([key, value]: [string, unknown]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(placeholder, String(value))
    })

    return rendered
  }

  private getSlackColorForPriority(priority: NotificationPriority): string {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return '#FF0000' // Red
      case NotificationPriority.HIGH:
        return '#FF8C00' // Orange
      case NotificationPriority.MEDIUM:
        return '#FFD700' // Yellow
      case NotificationPriority.LOW:
        return '#32CD32' // Green
      default:
        return '#808080' // Gray
    }
  }

  private getInAppTypeForPriority(
    priority: NotificationPriority
  ): 'info' | 'success' | 'warning' | 'error' {
    switch (priority) {
      case NotificationPriority.CRITICAL:
      case NotificationPriority.HIGH:
        return 'error'
      case NotificationPriority.MEDIUM:
        return 'warning'
      case NotificationPriority.LOW:
        return 'info'
      default:
        return 'info'
    }
  }

  // Utility method to create notifications
  async createNotification(
    eventType: NotificationEventType,
    title: string,
    message: string,
    options: {
      priority?: NotificationPriority
      userId?: string
      data?: Record<string, any>
      channels?: NotificationChannelType[]
    } = {}
  ): Promise<Notification> {
    const {
      priority = NotificationPriority.MEDIUM,
      userId,
      data,
      channels = [NotificationChannelType.IN_APP],
    } = options

    const notification = await this.prisma.notification.create({
      data: {
        eventType,
        priority,
        status: NotificationStatus.PENDING,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        userId,
        channels: JSON.stringify(channels),
        retryCount: 0,
        maxRetries: 3,
      },
    })

    return {
      ...notification,
      channels: channels as NotificationChannelType[],
      data: data as Record<string, unknown>,
    };
  }
}

// Export singleton instance
export const notificationService = new CubcenNotificationService(
  new PrismaClient()
)
