"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.AuditLogger = exports.AuditSeverity = exports.AuditEventType = void 0;
const logger_1 = require("@/lib/logger");
const database_1 = require("@/lib/database");
const crypto_1 = __importDefault(require("crypto"));
var AuditEventType;
(function (AuditEventType) {
    AuditEventType["LOGIN"] = "LOGIN";
    AuditEventType["LOGOUT"] = "LOGOUT";
    AuditEventType["LOGIN_FAILED"] = "LOGIN_FAILED";
    AuditEventType["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    AuditEventType["TOKEN_REFRESHED"] = "TOKEN_REFRESHED";
    AuditEventType["USER_CREATED"] = "USER_CREATED";
    AuditEventType["USER_UPDATED"] = "USER_UPDATED";
    AuditEventType["USER_DELETED"] = "USER_DELETED";
    AuditEventType["USER_ROLE_CHANGED"] = "USER_ROLE_CHANGED";
    AuditEventType["USER_PERMISSIONS_CHANGED"] = "USER_PERMISSIONS_CHANGED";
    AuditEventType["AGENT_CREATED"] = "AGENT_CREATED";
    AuditEventType["AGENT_UPDATED"] = "AGENT_UPDATED";
    AuditEventType["AGENT_DELETED"] = "AGENT_DELETED";
    AuditEventType["AGENT_STARTED"] = "AGENT_STARTED";
    AuditEventType["AGENT_STOPPED"] = "AGENT_STOPPED";
    AuditEventType["AGENT_CONFIGURED"] = "AGENT_CONFIGURED";
    AuditEventType["TASK_CREATED"] = "TASK_CREATED";
    AuditEventType["TASK_UPDATED"] = "TASK_UPDATED";
    AuditEventType["TASK_DELETED"] = "TASK_DELETED";
    AuditEventType["TASK_EXECUTED"] = "TASK_EXECUTED";
    AuditEventType["TASK_CANCELLED"] = "TASK_CANCELLED";
    AuditEventType["TASK_SCHEDULED"] = "TASK_SCHEDULED";
    AuditEventType["PLATFORM_CONNECTED"] = "PLATFORM_CONNECTED";
    AuditEventType["PLATFORM_DISCONNECTED"] = "PLATFORM_DISCONNECTED";
    AuditEventType["PLATFORM_CONFIGURED"] = "PLATFORM_CONFIGURED";
    AuditEventType["PLATFORM_SYNC"] = "PLATFORM_SYNC";
    AuditEventType["WORKFLOW_CREATED"] = "WORKFLOW_CREATED";
    AuditEventType["WORKFLOW_UPDATED"] = "WORKFLOW_UPDATED";
    AuditEventType["WORKFLOW_DELETED"] = "WORKFLOW_DELETED";
    AuditEventType["WORKFLOW_EXECUTED"] = "WORKFLOW_EXECUTED";
    AuditEventType["SYSTEM_BACKUP_CREATED"] = "SYSTEM_BACKUP_CREATED";
    AuditEventType["SYSTEM_BACKUP_RESTORED"] = "SYSTEM_BACKUP_RESTORED";
    AuditEventType["SYSTEM_CONFIG_CHANGED"] = "SYSTEM_CONFIG_CHANGED";
    AuditEventType["SYSTEM_MAINTENANCE_START"] = "SYSTEM_MAINTENANCE_START";
    AuditEventType["SYSTEM_MAINTENANCE_END"] = "SYSTEM_MAINTENANCE_END";
    AuditEventType["SECURITY_BREACH_DETECTED"] = "SECURITY_BREACH_DETECTED";
    AuditEventType["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    AuditEventType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    AuditEventType["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
    AuditEventType["CSRF_ATTACK_BLOCKED"] = "CSRF_ATTACK_BLOCKED";
    AuditEventType["DATA_EXPORTED"] = "DATA_EXPORTED";
    AuditEventType["DATA_IMPORTED"] = "DATA_IMPORTED";
    AuditEventType["DATA_DELETED"] = "DATA_DELETED";
    AuditEventType["DATA_ACCESSED"] = "DATA_ACCESSED";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
var AuditSeverity;
(function (AuditSeverity) {
    AuditSeverity["LOW"] = "LOW";
    AuditSeverity["MEDIUM"] = "MEDIUM";
    AuditSeverity["HIGH"] = "HIGH";
    AuditSeverity["CRITICAL"] = "CRITICAL";
})(AuditSeverity || (exports.AuditSeverity = AuditSeverity = {}));
class AuditLogger {
    constructor() {
        this.tableName = 'audit_logs';
        this.initializeAuditTable();
    }
    static getInstance() {
        if (!AuditLogger.instance) {
            AuditLogger.instance = new AuditLogger();
        }
        return AuditLogger.instance;
    }
    async initializeAuditTable() {
        try {
            await database_1.prisma.$executeRaw `
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
      `;
            await database_1.prisma.$executeRaw `
        CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type)
      `;
            await database_1.prisma.$executeRaw `
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)
      `;
            await database_1.prisma.$executeRaw `
        CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)
      `;
            await database_1.prisma.$executeRaw `
        CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity)
      `;
            logger_1.logger.info('Audit logs table initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize audit logs table', error);
        }
    }
    async logEvent(event) {
        try {
            const auditId = event.id || crypto_1.default.randomUUID();
            await database_1.prisma.$executeRaw `
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
      `;
            logger_1.logger.info('Audit event logged', {
                auditId,
                eventType: event.eventType,
                severity: event.severity,
                userId: event.userId,
                action: event.action,
                success: event.success,
                timestamp: event.timestamp.toISOString()
            });
            if (event.severity === AuditSeverity.CRITICAL) {
                logger_1.logger.error('CRITICAL AUDIT EVENT', new Error(event.description), {
                    auditId,
                    eventType: event.eventType,
                    userId: event.userId,
                    metadata: event.metadata
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to log audit event', error, {
                eventType: event.eventType,
                userId: event.userId,
                action: event.action
            });
        }
    }
    async logAuthEvent(eventType, userId, userEmail, success, req, errorMessage) {
        const severity = success ? AuditSeverity.LOW : AuditSeverity.MEDIUM;
        await this.logEvent({
            eventType,
            severity,
            userId,
            userEmail,
            action: eventType,
            description: `User ${success ? 'successfully' : 'failed to'} ${eventType.toLowerCase()}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            requestId: req.headers['x-request-id'],
            timestamp: new Date(),
            success,
            errorMessage
        });
    }
    async logUserEvent(eventType, targetUserId, targetUserEmail, actorUserId, actorUserEmail, req, metadata) {
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
            requestId: req.headers['x-request-id'],
            timestamp: new Date(),
            success: true
        });
    }
    async logResourceEvent(eventType, resourceType, resourceId, userId, userEmail, req, metadata, success = true, errorMessage) {
        const severity = success ? AuditSeverity.LOW : AuditSeverity.MEDIUM;
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
            requestId: req.headers['x-request-id'],
            timestamp: new Date(),
            success,
            errorMessage
        });
    }
    async logSecurityEvent(eventType, description, req, userId, metadata) {
        await this.logEvent({
            eventType,
            severity: AuditSeverity.HIGH,
            userId,
            action: eventType,
            description,
            metadata,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            requestId: req.headers['x-request-id'],
            timestamp: new Date(),
            success: false
        });
    }
    async logSystemEvent(eventType, description, userId, metadata, success = true) {
        await this.logEvent({
            eventType,
            severity: AuditSeverity.MEDIUM,
            userId,
            action: eventType,
            description,
            metadata,
            timestamp: new Date(),
            success
        });
    }
    async getAuditLogs(filters) {
        try {
            const page = filters.page || 1;
            const limit = Math.min(filters.limit || 50, 100);
            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];
            if (filters.eventType) {
                whereClause += ` AND event_type = ?`;
                params.push(filters.eventType);
            }
            if (filters.userId) {
                whereClause += ` AND user_id = ?`;
                params.push(filters.userId);
            }
            if (filters.resourceType) {
                whereClause += ` AND resource_type = ?`;
                params.push(filters.resourceType);
            }
            if (filters.severity) {
                whereClause += ` AND severity = ?`;
                params.push(filters.severity);
            }
            if (filters.startDate) {
                whereClause += ` AND timestamp >= ?`;
                params.push(filters.startDate.toISOString());
            }
            if (filters.endDate) {
                whereClause += ` AND timestamp <= ?`;
                params.push(filters.endDate.toISOString());
            }
            if (filters.success !== undefined) {
                whereClause += ` AND success = ?`;
                params.push(filters.success);
            }
            const countResult = await database_1.prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM audit_logs ${whereClause}
      `, ...params);
            const total = countResult[0].count;
            const logs = await database_1.prisma.$queryRawUnsafe(`
        SELECT * FROM audit_logs ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `, ...params, limit, offset);
            const formattedLogs = logs.map(log => ({
                id: log.id,
                eventType: log.event_type,
                severity: log.severity,
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
            }));
            return { logs: formattedLogs, total };
        }
        catch (error) {
            logger_1.logger.error('Failed to retrieve audit logs', error, { filters });
            throw new Error('Failed to retrieve audit logs');
        }
    }
    async cleanupOldLogs(retentionDays = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            const result = await database_1.prisma.$executeRaw `
        DELETE FROM audit_logs WHERE timestamp < ${cutoffDate.toISOString()}
      `;
            logger_1.logger.info('Audit logs cleanup completed', {
                deletedCount: result,
                cutoffDate: cutoffDate.toISOString(),
                retentionDays
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup old audit logs', error, { retentionDays });
            throw new Error('Failed to cleanup old audit logs');
        }
    }
    async exportAuditLogs(filters) {
        try {
            const { logs } = await this.getAuditLogs({
                startDate: filters.startDate,
                endDate: filters.endDate,
                limit: 10000
            });
            if (filters.format === 'csv') {
                const headers = [
                    'ID', 'Event Type', 'Severity', 'User ID', 'User Email', 'Resource Type',
                    'Resource ID', 'Action', 'Description', 'IP Address', 'User Agent',
                    'Timestamp', 'Success', 'Error Message'
                ];
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
                ]);
                return [headers, ...csvRows].map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
            }
            return JSON.stringify(logs, null, 2);
        }
        catch (error) {
            logger_1.logger.error('Failed to export audit logs', error, { filters });
            throw new Error('Failed to export audit logs');
        }
    }
}
exports.AuditLogger = AuditLogger;
exports.auditLogger = AuditLogger.getInstance();
//# sourceMappingURL=audit-logger.js.map