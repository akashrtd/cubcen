// Cubcen Session Management System
// Secure session handling with Redis-like in-memory storage for MVP

import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/audit-logger'
import { Request } from 'express'

/**
 * Session data interface
 */
export interface SessionData {
  id: string
  userId: string
  userEmail: string
  userRole: string
  ipAddress: string
  userAgent: string
  createdAt: Date
  lastAccessedAt: Date
  expiresAt: Date
  csrfToken?: string
  metadata?: Record<string, unknown>
}

/**
 * Session configuration
 */
export interface SessionConfig {
  maxAge: number // Session duration in milliseconds
  cleanupInterval: number // Cleanup interval in milliseconds
  maxSessionsPerUser: number // Maximum concurrent sessions per user
  secureOnly: boolean // Only allow secure cookies
  sameSite: 'strict' | 'lax' | 'none' // SameSite cookie attribute
  httpOnly: boolean // HttpOnly cookie attribute
}

/**
 * Session manager class
 */
export class SessionManager {
  private static instance: SessionManager
  private sessions: Map<string, SessionData> = new Map()
  private userSessions: Map<string, Set<string>> = new Map()
  private cleanupTimer?: NodeJS.Timeout
  private config: SessionConfig

  private constructor(config?: Partial<SessionConfig>) {
    this.config = {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      maxSessionsPerUser: 5, // Max 5 concurrent sessions
      secureOnly: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: true,
      ...config,
    }

    this.startCleanupTimer()
  }

  public static getInstance(config?: Partial<SessionConfig>): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(config)
    }
    return SessionManager.instance
  }

  /**
   * Create a new session
   */
  public async createSession(
    userId: string,
    userEmail: string,
    userRole: string,
    req: Request
  ): Promise<SessionData> {
    try {
      const sessionId = this.generateSessionId()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + this.config.maxAge)
      const csrfToken = crypto.randomBytes(32).toString('hex')

      const sessionData: SessionData = {
        id: sessionId,
        userId,
        userEmail,
        userRole,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        createdAt: now,
        lastAccessedAt: now,
        expiresAt,
        csrfToken,
        metadata: {
          loginMethod: 'password', // Could be extended for OAuth, etc.
          deviceFingerprint: this.generateDeviceFingerprint(req),
        },
      }

      // Enforce max sessions per user
      await this.enforceMaxSessionsPerUser(userId)

      // Store session
      this.sessions.set(sessionId, sessionData)

      // Track user sessions
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, new Set())
      }
      this.userSessions.get(userId)!.add(sessionId)

      // Log session creation
      await auditLogger.logEvent({
        eventType: AuditEventType.LOGIN,
        severity: AuditSeverity.LOW,
        userId,
        userEmail,
        action: 'SESSION_CREATED',
        description: `New session created for user ${userEmail}`,
        metadata: {
          sessionId,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          deviceFingerprint: sessionData.metadata?.deviceFingerprint,
        },
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        sessionId,
        timestamp: now,
        success: true,
      })

      logger.info('Session created', {
        sessionId,
        userId,
        userEmail,
        ipAddress: sessionData.ipAddress,
        expiresAt: expiresAt.toISOString(),
      })

      return sessionData
    } catch (error) {
      logger.error('Failed to create session', error as Error, {
        userId,
        userEmail,
      })
      throw new Error('Failed to create session')
    }
  }

  /**
   * Get session by ID
   */
  public async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const session = this.sessions.get(sessionId)

      if (!session) {
        return null
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.destroySession(sessionId)
        return null
      }

      // Update last accessed time
      session.lastAccessedAt = new Date()
      this.sessions.set(sessionId, session)

      return session
    } catch (error) {
      logger.error('Failed to get session', error as Error, { sessionId })
      return null
    }
  }

  /**
   * Update session data
   */
  public async updateSession(
    sessionId: string,
    updates: Partial<Pick<SessionData, 'metadata' | 'csrfToken'>>
  ): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId)

      if (!session || session.expiresAt < new Date()) {
        return false
      }

      // Update session data
      const updatedSession = {
        ...session,
        ...updates,
        lastAccessedAt: new Date(),
      }

      this.sessions.set(sessionId, updatedSession)

      logger.debug('Session updated', { sessionId, updates })
      return true
    } catch (error) {
      logger.error('Failed to update session', error as Error, {
        sessionId,
        updates,
      })
      return false
    }
  }

  /**
   * Destroy a session
   */
  public async destroySession(sessionId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId)

      if (!session) {
        return false
      }

      // Remove from sessions map
      this.sessions.delete(sessionId)

      // Remove from user sessions tracking
      const userSessions = this.userSessions.get(session.userId)
      if (userSessions) {
        userSessions.delete(sessionId)
        if (userSessions.size === 0) {
          this.userSessions.delete(session.userId)
        }
      }

      // Log session destruction
      await auditLogger.logEvent({
        eventType: AuditEventType.LOGOUT,
        severity: AuditSeverity.LOW,
        userId: session.userId,
        userEmail: session.userEmail,
        action: 'SESSION_DESTROYED',
        description: `Session destroyed for user ${session.userEmail}`,
        metadata: {
          sessionId,
          sessionDuration: new Date().getTime() - session.createdAt.getTime(),
        },
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        sessionId,
        timestamp: new Date(),
        success: true,
      })

      logger.info('Session destroyed', {
        sessionId,
        userId: session.userId,
        userEmail: session.userEmail,
      })

      return true
    } catch (error) {
      logger.error('Failed to destroy session', error as Error, { sessionId })
      return false
    }
  }

  /**
   * Destroy all sessions for a user
   */
  public async destroyUserSessions(userId: string): Promise<number> {
    try {
      const userSessions = this.userSessions.get(userId)

      if (!userSessions) {
        return 0
      }

      let destroyedCount = 0
      for (const sessionId of userSessions) {
        const success = await this.destroySession(sessionId)
        if (success) {
          destroyedCount++
        }
      }

      logger.info('All user sessions destroyed', { userId, destroyedCount })
      return destroyedCount
    } catch (error) {
      logger.error('Failed to destroy user sessions', error as Error, {
        userId,
      })
      return 0
    }
  }

  /**
   * Validate session and check for suspicious activity
   */
  public async validateSession(
    sessionId: string,
    req: Request
  ): Promise<{ valid: boolean; session?: SessionData; reason?: string }> {
    try {
      const session = await this.getSession(sessionId)

      if (!session) {
        return { valid: false, reason: 'Session not found or expired' }
      }

      // Check IP address consistency (optional - can be disabled for mobile users)
      const currentIP = req.ip || 'unknown'
      if (
        process.env.ENFORCE_IP_CONSISTENCY === 'true' &&
        session.ipAddress !== currentIP
      ) {
        logger.warn('Session IP address mismatch detected', {
          sessionId,
          userId: session.userId,
          originalIP: session.ipAddress,
          currentIP,
          userAgent: req.get('User-Agent'),
        })

        // Log security event
        await auditLogger.logSecurityEvent(
          AuditEventType.SUSPICIOUS_ACTIVITY,
          `Session IP address mismatch for user ${session.userEmail}`,
          req,
          session.userId,
          {
            sessionId,
            originalIP: session.ipAddress,
            currentIP,
            originalUserAgent: session.userAgent,
            currentUserAgent: req.get('User-Agent'),
          }
        )

        return { valid: false, reason: 'IP address mismatch' }
      }

      // Check user agent consistency (warning only, don't invalidate)
      const currentUserAgent = req.get('User-Agent') || 'unknown'
      if (session.userAgent !== currentUserAgent) {
        logger.warn('Session user agent mismatch detected', {
          sessionId,
          userId: session.userId,
          originalUserAgent: session.userAgent,
          currentUserAgent,
        })
      }

      return { valid: true, session }
    } catch (error) {
      logger.error('Failed to validate session', error as Error, { sessionId })
      return { valid: false, reason: 'Validation error' }
    }
  }

  /**
   * Get active sessions for a user
   */
  public async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const userSessions = this.userSessions.get(userId)

      if (!userSessions) {
        return []
      }

      const sessions: SessionData[] = []
      for (const sessionId of userSessions) {
        const session = await this.getSession(sessionId)
        if (session) {
          sessions.push(session)
        }
      }

      return sessions
    } catch (error) {
      logger.error('Failed to get user sessions', error as Error, { userId })
      return []
    }
  }

  /**
   * Clean up expired sessions
   */
  public async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date()
      let cleanedCount = 0

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.expiresAt < now) {
          await this.destroySession(sessionId)
          cleanedCount++
        }
      }

      if (cleanedCount > 0) {
        logger.info('Expired sessions cleaned up', { cleanedCount })
      }

      return cleanedCount
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', error as Error)
      return 0
    }
  }

  /**
   * Get session statistics
   */
  public getSessionStats(): {
    totalSessions: number
    totalUsers: number
    averageSessionsPerUser: number
    oldestSession?: Date
    newestSession?: Date
  } {
    const totalSessions = this.sessions.size
    const totalUsers = this.userSessions.size
    const averageSessionsPerUser =
      totalUsers > 0 ? totalSessions / totalUsers : 0

    let oldestSession: Date | undefined
    let newestSession: Date | undefined

    for (const session of this.sessions.values()) {
      if (!oldestSession || session.createdAt < oldestSession) {
        oldestSession = session.createdAt
      }
      if (!newestSession || session.createdAt > newestSession) {
        newestSession = session.createdAt
      }
    }

    return {
      totalSessions,
      totalUsers,
      averageSessionsPerUser,
      oldestSession,
      newestSession,
    }
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return `sess_${crypto.randomBytes(32).toString('hex')}`
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(req: Request): string {
    const components = [
      req.get('User-Agent') || '',
      req.get('Accept-Language') || '',
      req.get('Accept-Encoding') || '',
      req.ip || '',
    ]

    return crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 16)
  }

  /**
   * Enforce maximum sessions per user
   */
  private async enforceMaxSessionsPerUser(userId: string): Promise<void> {
    const userSessions = this.userSessions.get(userId)

    if (!userSessions || userSessions.size < this.config.maxSessionsPerUser) {
      return
    }

    // Find oldest session to remove
    let oldestSessionId: string | null = null
    let oldestDate: Date | null = null

    for (const sessionId of userSessions) {
      const session = this.sessions.get(sessionId)
      if (session && (!oldestDate || session.createdAt < oldestDate)) {
        oldestDate = session.createdAt
        oldestSessionId = sessionId
      }
    }

    if (oldestSessionId) {
      logger.info('Removing oldest session due to max sessions limit', {
        userId,
        removedSessionId: oldestSessionId,
        maxSessions: this.config.maxSessionsPerUser,
      })

      await this.destroySession(oldestSessionId)
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanupExpiredSessions()
    }, this.config.cleanupInterval)

    logger.info('Session cleanup timer started', {
      cleanupInterval: this.config.cleanupInterval,
    })
  }

  /**
   * Stop cleanup timer
   */
  public stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
      logger.info('Session cleanup timer stopped')
    }
  }

  /**
   * Shutdown session manager
   */
  public async shutdown(): Promise<void> {
    this.stopCleanupTimer()

    // Log all active sessions before shutdown
    const stats = this.getSessionStats()
    logger.info('Session manager shutting down', stats)

    // Clear all sessions
    this.sessions.clear()
    this.userSessions.clear()
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()
