// Cubcen Notification System Types
// Defines types for email, Slack, and in-app notifications

export interface NotificationChannel {
  id: string
  type: NotificationChannelType
  name: string
  enabled: boolean
  configuration: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export enum NotificationChannelType {
  EMAIL = 'email',
  SLACK = 'slack',
  IN_APP = 'in_app'
}

export interface NotificationPreference {
  id: string
  userId: string
  eventType: NotificationEventType
  channels: NotificationChannelType[]
  enabled: boolean
  escalationDelay?: number // minutes before escalation
  createdAt: Date
  updatedAt: Date
}

export enum NotificationEventType {
  AGENT_DOWN = 'agent_down',
  AGENT_ERROR = 'agent_error',
  TASK_FAILED = 'task_failed',
  TASK_COMPLETED = 'task_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  WORKFLOW_COMPLETED = 'workflow_completed',
  SYSTEM_ERROR = 'system_error',
  HEALTH_CHECK_FAILED = 'health_check_failed',
  PLATFORM_DISCONNECTED = 'platform_disconnected'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  ACKNOWLEDGED = 'acknowledged'
}

export interface Notification {
  id: string
  eventType: NotificationEventType
  priority: NotificationPriority
  status: NotificationStatus
  title: string
  message: string
  data?: Record<string, unknown>
  userId?: string
  channels: NotificationChannelType[]
  sentAt?: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  retryCount: number
  maxRetries: number
  createdAt: Date
  updatedAt: Date
}

export interface NotificationTemplate {
  id: string
  eventType: NotificationEventType
  channelType: NotificationChannelType
  subject: string
  template: string
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

// Email specific types
export interface EmailNotificationConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

export interface EmailNotification {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

// Slack specific types
export interface SlackNotificationConfig {
  token: string
  defaultChannel: string
  username?: string
  iconEmoji?: string
}

export interface SlackNotification {
  channel: string
  text: string
  blocks?: SlackBlock[]
  attachments?: SlackAttachment[]
  username?: string
  iconEmoji?: string
  threadTs?: string
}

export interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
  }
  fields?: Array<{
    type: string
    text: string
  }>
}

export interface SlackAttachment {
  color?: string
  title?: string
  text?: string
  fields?: Array<{
    title: string
    value: string
    short?: boolean
  }>
}

// In-app notification types
export interface InAppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  actionUrl?: string
  actionText?: string
  createdAt: Date
  expiresAt?: Date
}

// Alert escalation types
export interface AlertEscalation {
  id: string
  notificationId: string
  level: number
  escalatedAt: Date
  escalatedTo: string[]
  acknowledged: boolean
  acknowledgedAt?: Date
  acknowledgedBy?: string
}

// Notification queue types
export interface NotificationQueueItem {
  id: string
  notification: Notification
  scheduledAt: Date
  attempts: number
  lastAttemptAt?: Date
  error?: string
}

// Service interfaces
export interface NotificationService {
  send(notification: Notification): Promise<void>
  sendEmail(email: EmailNotification): Promise<void>
  sendSlack(slack: SlackNotification): Promise<void>
  sendInApp(inApp: InAppNotification): Promise<void>
  acknowledge(notificationId: string, userId: string): Promise<void>
  escalate(notificationId: string): Promise<void>
  getNotifications(userId: string, options?: GetNotificationsOptions): Promise<Notification[]>
  markAsRead(notificationId: string, userId: string): Promise<void>
}

export interface GetNotificationsOptions {
  status?: NotificationStatus
  eventType?: NotificationEventType
  priority?: NotificationPriority
  limit?: number
  offset?: number
  startDate?: Date
  endDate?: Date
}

// Template rendering context
export interface NotificationContext {
  user?: {
    id: string
    name?: string
    email: string
  }
  agent?: {
    id: string
    name: string
    platform: string
  }
  task?: {
    id: string
    name: string
    status: string
  }
  workflow?: {
    id: string
    name: string
    status: string
  }
  error?: {
    message: string
    code?: string
    stack?: string
  }
  timestamp: Date
  [key: string]: unknown
}