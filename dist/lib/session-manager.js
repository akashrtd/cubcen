"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionManager = exports.SessionManager = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("@/lib/logger");
const audit_logger_1 = require("@/lib/audit-logger");
class SessionManager {
    constructor(config) {
        this.sessions = new Map();
        this.userSessions = new Map();
        this.config = {
            maxAge: 24 * 60 * 60 * 1000,
            cleanupInterval: 60 * 60 * 1000,
            maxSessionsPerUser: 5,
            secureOnly: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            httpOnly: true,
            ...config
        };
        this.startCleanupTimer();
    }
    static getInstance(config) {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager(config);
        }
        return SessionManager.instance;
    }
    async createSession(userId, userEmail, userRole, req) {
        try {
            const sessionId = this.generateSessionId();
            const now = new Date();
            const expiresAt = new Date(now.getTime() + this.config.maxAge);
            const csrfToken = crypto_1.default.randomBytes(32).toString('hex');
            const sessionData = {
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
                    loginMethod: 'password',
                    deviceFingerprint: this.generateDeviceFingerprint(req)
                }
            };
            await this.enforceMaxSessionsPerUser(userId);
            this.sessions.set(sessionId, sessionData);
            if (!this.userSessions.has(userId)) {
                this.userSessions.set(userId, new Set());
            }
            this.userSessions.get(userId).add(sessionId);
            await audit_logger_1.auditLogger.logEvent({
                eventType: audit_logger_1.AuditEventType.LOGIN,
                severity: audit_logger_1.AuditSeverity.LOW,
                userId,
                userEmail,
                action: 'SESSION_CREATED',
                description: `New session created for user ${userEmail}`,
                metadata: {
                    sessionId,
                    ipAddress: sessionData.ipAddress,
                    userAgent: sessionData.userAgent,
                    deviceFingerprint: sessionData.metadata?.deviceFingerprint
                },
                ipAddress: sessionData.ipAddress,
                userAgent: sessionData.userAgent,
                sessionId,
                timestamp: now,
                success: true
            });
            logger_1.logger.info('Session created', {
                sessionId,
                userId,
                userEmail,
                ipAddress: sessionData.ipAddress,
                expiresAt: expiresAt.toISOString()
            });
            return sessionData;
        }
        catch (error) {
            logger_1.logger.error('Failed to create session', error, { userId, userEmail });
            throw new Error('Failed to create session');
        }
    }
    async getSession(sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                return null;
            }
            if (session.expiresAt < new Date()) {
                await this.destroySession(sessionId);
                return null;
            }
            session.lastAccessedAt = new Date();
            this.sessions.set(sessionId, session);
            return session;
        }
        catch (error) {
            logger_1.logger.error('Failed to get session', error, { sessionId });
            return null;
        }
    }
    async updateSession(sessionId, updates) {
        try {
            const session = this.sessions.get(sessionId);
            if (!session || session.expiresAt < new Date()) {
                return false;
            }
            const updatedSession = {
                ...session,
                ...updates,
                lastAccessedAt: new Date()
            };
            this.sessions.set(sessionId, updatedSession);
            logger_1.logger.debug('Session updated', { sessionId, updates });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to update session', error, { sessionId, updates });
            return false;
        }
    }
    async destroySession(sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                return false;
            }
            this.sessions.delete(sessionId);
            const userSessions = this.userSessions.get(session.userId);
            if (userSessions) {
                userSessions.delete(sessionId);
                if (userSessions.size === 0) {
                    this.userSessions.delete(session.userId);
                }
            }
            await audit_logger_1.auditLogger.logEvent({
                eventType: audit_logger_1.AuditEventType.LOGOUT,
                severity: audit_logger_1.AuditSeverity.LOW,
                userId: session.userId,
                userEmail: session.userEmail,
                action: 'SESSION_DESTROYED',
                description: `Session destroyed for user ${session.userEmail}`,
                metadata: {
                    sessionId,
                    sessionDuration: new Date().getTime() - session.createdAt.getTime()
                },
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                sessionId,
                timestamp: new Date(),
                success: true
            });
            logger_1.logger.info('Session destroyed', {
                sessionId,
                userId: session.userId,
                userEmail: session.userEmail
            });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to destroy session', error, { sessionId });
            return false;
        }
    }
    async destroyUserSessions(userId) {
        try {
            const userSessions = this.userSessions.get(userId);
            if (!userSessions) {
                return 0;
            }
            let destroyedCount = 0;
            for (const sessionId of userSessions) {
                const success = await this.destroySession(sessionId);
                if (success) {
                    destroyedCount++;
                }
            }
            logger_1.logger.info('All user sessions destroyed', { userId, destroyedCount });
            return destroyedCount;
        }
        catch (error) {
            logger_1.logger.error('Failed to destroy user sessions', error, { userId });
            return 0;
        }
    }
    async validateSession(sessionId, req) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                return { valid: false, reason: 'Session not found or expired' };
            }
            const currentIP = req.ip || 'unknown';
            if (process.env.ENFORCE_IP_CONSISTENCY === 'true' && session.ipAddress !== currentIP) {
                logger_1.logger.warn('Session IP address mismatch detected', {
                    sessionId,
                    userId: session.userId,
                    originalIP: session.ipAddress,
                    currentIP,
                    userAgent: req.get('User-Agent')
                });
                await audit_logger_1.auditLogger.logSecurityEvent(audit_logger_1.AuditEventType.SUSPICIOUS_ACTIVITY, `Session IP address mismatch for user ${session.userEmail}`, req, session.userId, {
                    sessionId,
                    originalIP: session.ipAddress,
                    currentIP,
                    originalUserAgent: session.userAgent,
                    currentUserAgent: req.get('User-Agent')
                });
                return { valid: false, reason: 'IP address mismatch' };
            }
            const currentUserAgent = req.get('User-Agent') || 'unknown';
            if (session.userAgent !== currentUserAgent) {
                logger_1.logger.warn('Session user agent mismatch detected', {
                    sessionId,
                    userId: session.userId,
                    originalUserAgent: session.userAgent,
                    currentUserAgent
                });
            }
            return { valid: true, session };
        }
        catch (error) {
            logger_1.logger.error('Failed to validate session', error, { sessionId });
            return { valid: false, reason: 'Validation error' };
        }
    }
    async getUserSessions(userId) {
        try {
            const userSessions = this.userSessions.get(userId);
            if (!userSessions) {
                return [];
            }
            const sessions = [];
            for (const sessionId of userSessions) {
                const session = await this.getSession(sessionId);
                if (session) {
                    sessions.push(session);
                }
            }
            return sessions;
        }
        catch (error) {
            logger_1.logger.error('Failed to get user sessions', error, { userId });
            return [];
        }
    }
    async cleanupExpiredSessions() {
        try {
            const now = new Date();
            let cleanedCount = 0;
            for (const [sessionId, session] of this.sessions.entries()) {
                if (session.expiresAt < now) {
                    await this.destroySession(sessionId);
                    cleanedCount++;
                }
            }
            if (cleanedCount > 0) {
                logger_1.logger.info('Expired sessions cleaned up', { cleanedCount });
            }
            return cleanedCount;
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup expired sessions', error);
            return 0;
        }
    }
    getSessionStats() {
        const totalSessions = this.sessions.size;
        const totalUsers = this.userSessions.size;
        const averageSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0;
        let oldestSession;
        let newestSession;
        for (const session of this.sessions.values()) {
            if (!oldestSession || session.createdAt < oldestSession) {
                oldestSession = session.createdAt;
            }
            if (!newestSession || session.createdAt > newestSession) {
                newestSession = session.createdAt;
            }
        }
        return {
            totalSessions,
            totalUsers,
            averageSessionsPerUser,
            oldestSession,
            newestSession
        };
    }
    generateSessionId() {
        return `sess_${crypto_1.default.randomBytes(32).toString('hex')}`;
    }
    generateDeviceFingerprint(req) {
        const components = [
            req.get('User-Agent') || '',
            req.get('Accept-Language') || '',
            req.get('Accept-Encoding') || '',
            req.ip || ''
        ];
        return crypto_1.default
            .createHash('sha256')
            .update(components.join('|'))
            .digest('hex')
            .substring(0, 16);
    }
    async enforceMaxSessionsPerUser(userId) {
        const userSessions = this.userSessions.get(userId);
        if (!userSessions || userSessions.size < this.config.maxSessionsPerUser) {
            return;
        }
        let oldestSessionId = null;
        let oldestDate = null;
        for (const sessionId of userSessions) {
            const session = this.sessions.get(sessionId);
            if (session && (!oldestDate || session.createdAt < oldestDate)) {
                oldestDate = session.createdAt;
                oldestSessionId = sessionId;
            }
        }
        if (oldestSessionId) {
            logger_1.logger.info('Removing oldest session due to max sessions limit', {
                userId,
                removedSessionId: oldestSessionId,
                maxSessions: this.config.maxSessionsPerUser
            });
            await this.destroySession(oldestSessionId);
        }
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(async () => {
            await this.cleanupExpiredSessions();
        }, this.config.cleanupInterval);
        logger_1.logger.info('Session cleanup timer started', {
            cleanupInterval: this.config.cleanupInterval
        });
    }
    stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
            logger_1.logger.info('Session cleanup timer stopped');
        }
    }
    async shutdown() {
        this.stopCleanupTimer();
        const stats = this.getSessionStats();
        logger_1.logger.info('Session manager shutting down', stats);
        this.sessions.clear();
        this.userSessions.clear();
    }
}
exports.SessionManager = SessionManager;
exports.sessionManager = SessionManager.getInstance();
//# sourceMappingURL=session-manager.js.map