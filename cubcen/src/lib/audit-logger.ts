// Cubcen Audit Logging System
// Comprehensive audit logging for user actions and system changes

import { logger } from '@/lib/logger'
import { prisma } from '@/lib/database'
import { Request } from 'express'
import crypto from 'crypto'

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication events
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',

  // User management events
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_PERMISSIONS_CHANGED = 'USER_PERMISSIONS_CHANGED',

  // Agent management events
  AGENT_CREATED = 'AGENT_CREATED',
  AGENT_UPDATED = 'AGENT_UPDATED',
  AGENT_DELETED = 'AGENT_DELETED',
  AGENT_STARTED = 'AGENT_STARTED',
  AGENT_STOPPED = 'AGENT_STOPPED',
  AGENT_CONFIGURED = 'AGENT_CONFIGURED',

  // Task management events
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_EXECUTED = 'TASK_EXECUTED',
  TASK_CANCELLED = 'TASK_CANCELLED',
  TASK_SCHEDULED = 'TASK_SCHEDULED',

  // Platform events
  PLATFORM_CONNECTED = 'PLATFORM_CONNECTED',
  PLATFORM_DISCONNECTED = 'PLATFORM_DISCONNECTED',
  PLATFORM_CONFIGURED = 'PLATFORM_CONFIGURED',
  PLATFORM_SYNC = 'PLATFORM_SYNC',

  // Workflow events
  WORKFLOW_CREATED = 'WORKFLOW_CREATED',
  WORKFLOW_UPDATED = 'WORKFLOW_UPDATED',
  WORKFLOW_DELETED = 'WORKFLOW_DELETED',
  WORKFLOW_EXECUTED = 'WORKFLOW_EXECUTED',

  // System events
  SYSTEM_BACKUP_CREATED = 'SYSTEM_BACKUP_CREATED',
  SYSTEM_BACKUP_RESTORED = 'SYSTEM_BACKUP_RESTORED',
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  SYSTEM_MAINTENANCE_START = 'SYSTEM_MAINTENANCE_START',
  SYSTEM_MAINTENANCE_END = 'SYSTEM_MAINTENANCE_END',

  // Security events
  SECURITY_BREACH_DETECTED = 'SECURITY_BREACH_DETECTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  CSRF_ATTACK_BLOCKED = 'CSRF_ATTACK_BLOCKED',

  // Data events
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_IMPORTED = 'DATA_IMPORTED',
  DATA_DELETED = 'DATA_DELETED',
  DATA_ACCESSED = 'DATA_ACCESSED'
}

/**
 * Audit event severity levels
 */
export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Audit event interface
 */
export interface AuditEvent {
  id?: string
  eventType: AuditEventType
  severity: AuditSeverity
  userId?: string
  userEmail?: string
  userRole?: string
  resourceType?: string
  resourceId?: string
  action: string
  description: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}

/**
 * Audit logger class
 */
export class AuditLogger {
  private static instance: AuditLogger
  private readonly tableName = 'audit_logs'

  private constructor() {
    this.initializeAuditTable()
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  /**
   * Initialize audit logs table if it doesn't exist
   */
  private async initializeAuditTable(): Promise<void> {
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          event_type TEXT NOT NULL,
          severity TEXT NOT NULL,
          user_id TEXT,
          user_email TEXT,
          user_role TEXT,
          resource_type TEXT,
          resource_id TEXT,
          action TEXT NOT NULL,
          description TEXT NOT NULL,
          metadata TEXT,
          ip_address TEXT,
          user_agent TEXT,
          session_id TEXT,
          request_id TEXT,
          timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          success BOOLEAN NOT NULL DEFAULT 1,
          error_message TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create indexes for better query performance
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type)
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity)
      `

      logger.info('Audit logs table initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize audit logs table', error as Error)
    }
  }

  /**
   * Log an audit event
   */
  public async logEvent(event: AuditEvent): Promise<void> {
    try {
      const auditId = event.id || crypto.randomUUID()
      
      await prisma.$executeRaw`
        INSERT INTO audit_logs (
          id, event_type, severity, user_id, user_email, user_role,
          resource_type, resource_id, action, description, metadata,
          ip_address, user_agent, session_id, request_id, timestamp,
          success, error_message
        ) VALUES (
          ${auditId}, ${event.eventType}, ${event.severity}, ${event.userId},
          ${event.userEmail}, ${event.userRole}, ${event.resourceType},
          ${event.resourceId}, ${event.action}, ${event.description},
          ${JSON.stringify(event.metadata)}, ${event.ipAddress},
          ${event.userAgent}, ${event.sessionId}, ${event.requestId},
          ${event.timestamp.toISOString()}, ${event.success}, ${event.errorMessage}
        )
      `

      // Also log to application logger for immediate visibility
      logger.info('Audit event logged', {
        auditId,
        eventType: event.eventType,
        severity: event.severity,
        userId: event.userId,
        action: event.action,
        success: event.success,
        timestamp: event.timestamp.toISOString()
      })

      // Log critical events to separate critical log
      if (event.severity === AuditSeverity.CRITICAL) {
        logger.error('CRITICAL AUDIT EVENT', new Error(event.description), {
          auditId,
          eventType: event.eventType,
          userId: event.userId,
          metadata: event.metadata
        })
      }

    } catch (error) {
      logger.error('Failed to log audit event', error as Error, {
        eventType: event.eventType,
        userId: event.userId,
        action: event.action
      })
    }
  }

  /**
   * Log authentication event
   */
  public async logAuthEvent(
    eventType: AuditEventType,
    userId: string | undefined,
    userEmail: string | undefined,
    success: boolean,
    req: Request,
    errorMessage?: string
  ): Promise<void> {
    const severity = success ? AuditSeverity.LOW : AuditSeverity.MEDIUM
    
    await this.logEvent({
      eventType,
      severity,
      userId,
      userEmail,
      action: eventType,
      description: `User ${success ? 'successfully' : 'failed to'} ${eventType.toLowerCase()}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date(),
      success,
      errorMessage
    })
  }

  /**
   * Log user management event
   */
  public async logUserEvent(
    eventType: AuditEventType,
    targetUserId: string,
    targetUserEmail: string,
    actorUserId: string,
    actorUserEmail: string,
    req: Request,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      eventType,
      severity: AuditSeverity.MEDIUM,
      userId: actorUserId,
      userEmail: actorUserEmail,
      resourceType: 'user',
      resourceId: targetUserId,
      action: eventType,
      description: `User ${actorUserEmail} performed ${eventType} on user ${targetUserEmail}`,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date(),
      success: true
    })
  }

  /**
   * Log resource management event
   */
  public async logResourceEvent(
    eventType: AuditEventType,
    resourceType: string,
    resourceId: string,
    userId: string,
    userEmail: string,
    req: Request,
    metadata?: Record<string, unknown>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    const severity = success ? AuditSeverity.LOW : AuditSeverity.MEDIUM

    await this.logEvent({
      eventType,
      severity,
      userId,
      userEmail,
      resourceType,
      resourceId,
      action: eventType,
      description: `User ${userEmail} ${success ? 'successfully' : 'failed to'} ${eventType.toLowerCase()} ${resourceType} ${resourceId}`,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date(),
      success,
      errorMessage
    })
  }

  /**
   * Log security event
   */
  public async logSecurityEvent(
    eventType: AuditEventType,
    description: string,
    req: Request,
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      eventType,
      severity: AuditSeverity.HIGH,
      userId,
      action: eventType,
      description,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date(),
      success: false
    })
  }

  /**
   * Log system event
   */
  public async logSystemEvent(
    eventType: AuditEventType,
    description: string,
    userId?: string,
    metadata?: Record<string, unknown>,
    success: boolean = true
  ): Promise<void> {
    await this.logEvent({
      eventType,
      severity: AuditSeverity.MEDIUM,
      userId,
      action: eventType,
      description,
      metadata,
      timestamp: new Date(),
      success
    })
  }

  /**
   * Get audit logs with filtering and pagination
   */
  public async getAuditLogs(filters: {
    eventType?: AuditEventType
    userId?: string
    resourceType?: string
    severity?: AuditSeverity
    startDate?: Date
    endDate?: Date
    success?: boolean
    page?: number
    limit?: number
  }): Promise<{ logs: AuditEvent[], total: number }> {
    try {
      const page = filters.page || 1
      const limit = Math.min(filters.limit || 50, 100) // Max 100 records per page
      const offset = (page - 1) * limit

      let whereClause = 'WHERE 1=1'
      const params: unknown[] = []

      if (filters.eventType) {
        whereClause += ` AND event_type = ?`
        params.push(filters.eventType)
      }

      if (filters.userId) {
        whereClause += ` AND user_id = ?`
        params.push(filters.userId)
      }

      if (filters.resourceType) {
        whereClause += ` AND resource_type = ?`
        params.push(filters.resourceType)
      }

      if (filters.severity) {
        whereClause += ` AND severity = ?`
        params.push(filters.severity)
      }

      if (filters.startDate) {
        whereClause += ` AND timestamp >= ?`
        params.push(filters.startDate.toISOString())
      }

      if (filters.endDate) {
        whereClause += ` AND timestamp <= ?`
        params.push(filters.endDate.toISOString())
      }

      if (filters.success !== undefined) {
        whereClause += ` AND success = ?`
        params.push(filters.success)
      }

      // Get total count
      const countResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM audit_logs ${whereClause}
      `, ...params) as [{ count: number }]

      const total = countResult[0].count

      // Get paginated results
      const logs = await prisma.$queryRawUnsafe(`
        SELECT * FROM audit_logs ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `, ...params, limit, offset) as unknown[]

      const formattedLogs: AuditEvent[] = (logs as any[]).map(log => ({
        id: log.id,
        eventType: log.event_type as AuditEventType,
        severity: log.severity as AuditSeverity,
        userId: log.user_id,
        userEmail: log.user_email,
        userRole: log.user_role,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        action: log.action,
        description: log.description,
        metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        sessionId: log.session_id,
        requestId: log.request_id,
        timestamp: new Date(log.timestamp),
        success: Boolean(log.success),
        errorMessage: log.error_message
      }))

      return { logs: formattedLogs, total }

    } catch (error) {
      logger.error('Failed to retrieve audit logs', error as Error, { filters })
      throw new Error('Failed to retrieve audit logs')
    }
  }

  /**
   * Delete old audit logs (for compliance and storage management)
   */
  public async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const result = await prisma.$executeRaw`
        DELETE FROM audit_logs WHERE timestamp < ${cutoffDate.toISOString()}
      `

      logger.info('Audit logs cleanup completed', {
        deletedCount: result,
        cutoffDate: cutoffDate.toISOString(),
        retentionDays
      })

      return result as number
    } catch (error) {
      logger.error('Failed to cleanup old audit logs', error as Error, { retentionDays })
      throw new Error('Failed to cleanup old audit logs')
    }
  }

  /**
   * Export audit logs for compliance
   */
  public async exportAuditLogs(filters: {
    startDate: Date
    endDate: Date
    format?: 'json' | 'csv'
  }): Promise<string> {
    try {
      const { logs } = await this.getAuditLogs({
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 10000 // Large limit for export
      })

      if (filters.format === 'csv') {
        const headers = [
          'ID', 'Event Type', 'Severity', 'User ID', 'User Email', 'Resource Type',
          'Resource ID', 'Action', 'Description', 'IP Address', 'User Agent',
          'Timestamp', 'Success', 'Error Message'
        ]

        const csvRows = logs.map(log => [
          log.id,
          log.eventType,
          log.severity,
          log.userId || '',
          log.userEmail || '',
          log.resourceType || '',
          log.resourceId || '',
          log.action,
          log.description,
          log.ipAddress || '',
          log.userAgent || '',
          log.timestamp.toISOString(),
          log.success.toString(),
          log.errorMessage || ''
        ])

        return [headers, ...csvRows].map(row => 
          row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n')
      }

      return JSON.stringify(logs, null, 2)

    } catch (error) {
      logger.error('Failed to export audit logs', error as Error, { filters })
      throw new Error('Failed to export audit logs')
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()