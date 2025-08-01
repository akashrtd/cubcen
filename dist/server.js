"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflowRoutes = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_session_1 = __importDefault(require("express-session"));
const logger_1 = require("@/lib/logger");
const security_1 = require("@/backend/middleware/security");
const audit_logger_1 = require("@/lib/audit-logger");
const auth_1 = __importDefault(require("@/backend/routes/auth"));
const agents_1 = __importDefault(require("@/backend/routes/agents"));
const tasks_1 = __importDefault(require("@/backend/routes/tasks"));
const platforms_1 = __importDefault(require("@/backend/routes/platforms"));
const users_1 = __importDefault(require("@/backend/routes/users"));
const health_1 = __importDefault(require("@/backend/routes/health"));
const websocket_1 = __importDefault(require("@/backend/routes/websocket"));
const analytics_1 = __importDefault(require("@/backend/routes/analytics"));
const errors_1 = __importDefault(require("@/backend/routes/errors"));
const notifications_1 = __importDefault(require("@/backend/routes/notifications"));
const backup_1 = __importDefault(require("@/backend/routes/backup"));
const performance_1 = __importDefault(require("@/backend/routes/performance"));
const workflows_1 = require("@/backend/routes/workflows");
Object.defineProperty(exports, "createWorkflowRoutes", { enumerable: true, get: function () { return workflows_1.createWorkflowRoutes; } });
const swagger_1 = require("@/lib/swagger");
const api_versioning_1 = require("@/lib/api-versioning");
const performance_monitor_1 = require("@/lib/performance-monitor");
const cache_1 = require("@/lib/cache");
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'cubcen-session-secret-change-in-production',
    name: 'cubcen.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    }
}));
app.use(security_1.securityHeaders);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://cubcen.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    const requestId = generateRequestId();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
});
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const isError = res.statusCode >= 400;
        performance_monitor_1.performanceMonitor.recordAPIRequest(responseTime, isError);
    });
    next();
});
app.use('/api', async (req, res, next) => {
    const startTime = Date.now();
    if (req.user) {
        await audit_logger_1.auditLogger.logEvent({
            eventType: audit_logger_1.AuditEventType.DATA_ACCESSED,
            severity: 'LOW',
            userId: req.user.id,
            userEmail: req.user.email,
            action: `${req.method} ${req.path}`,
            description: `User ${req.user.email} accessed ${req.method} ${req.path}`,
            metadata: {
                query: req.query,
                userAgent: req.get('User-Agent'),
                requestId: req.headers['x-request-id']
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            requestId: req.headers['x-request-id'],
            timestamp: new Date(),
            success: true
        });
    }
    res.on('finish', async () => {
        const duration = Date.now() - startTime;
        if (res.statusCode >= 400) {
            await audit_logger_1.auditLogger.logEvent({
                eventType: audit_logger_1.AuditEventType.SUSPICIOUS_ACTIVITY,
                severity: res.statusCode >= 500 ? 'HIGH' : 'MEDIUM',
                userId: req.user?.id,
                userEmail: req.user?.email,
                action: `${req.method} ${req.path}`,
                description: `Request failed with status ${res.statusCode}`,
                metadata: {
                    statusCode: res.statusCode,
                    duration,
                    query: req.query,
                    body: req.body,
                    userAgent: req.get('User-Agent')
                },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.headers['x-request-id'],
                timestamp: new Date(),
                success: false
            });
        }
    });
    next();
});
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => {
            logger_1.logger.info(message.trim(), { source: 'http' });
        }
    }
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.logger.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests from this IP, please try again later.',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id']
            }
        });
    }
});
app.use('/api', limiter);
app.use('/api/cubcen', api_versioning_1.validateApiVersion);
app.use('/api/cubcen', api_versioning_1.handleVersionTransforms);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        logger_1.logger.warn('Auth rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            error: {
                code: 'AUTH_RATE_LIMIT_EXCEEDED',
                message: 'Too many authentication attempts, please try again later.',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id']
            }
        });
    }
});
app.use(security_1.sanitizeInput);
app.use(security_1.suspiciousActivityDetection);
app.use(security_1.honeypotProtection);
const authRateLimiter = new security_1.AdvancedRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 60 * 1000,
    progressiveMultiplier: 2
});
(0, swagger_1.setupSwagger)(app);
app.use('/health', health_1.default);
app.get('/api/cubcen/v1/csrf-token', security_1.generateCsrfToken);
app.use('/api/cubcen/v1/auth', authLimiter, authRateLimiter.middleware(), auth_1.default);
app.use('/api/cubcen/v1/agents', agents_1.default);
app.use('/api/cubcen/v1/tasks', tasks_1.default);
app.use('/api/cubcen/v1/platforms', platforms_1.default);
app.use('/api/cubcen/v1/users', users_1.default);
app.use('/api/cubcen/v1/websocket', websocket_1.default);
app.use('/api/cubcen/v1/analytics', analytics_1.default);
app.use('/api/cubcen/v1/errors', errors_1.default);
app.use('/api/cubcen/v1/notifications', notifications_1.default);
app.use('/api/cubcen/v1/backup', backup_1.default);
app.use('/api/cubcen/v1/performance', performance_1.default);
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        logger_1.logger.warn('API endpoint not found', {
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(404).json({
            error: {
                code: 'ENDPOINT_NOT_FOUND',
                message: `API endpoint ${req.method} ${req.path} not found`,
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id']
            }
        });
    }
    else {
        next();
    }
});
app.use((error, req, res, next) => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    logger_1.logger.error('Unhandled server error', error, {
        requestId,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query,
        params: req.params
    });
    let statusCode = error.statusCode || 500;
    let errorCode = error.code || 'INTERNAL_SERVER_ERROR';
    let message = error.message || 'Internal server error';
    if (error.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        errorCode = 'UNAUTHORIZED';
    }
    else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        errorCode = 'FORBIDDEN';
    }
    else if (error.name === 'NotFoundError') {
        statusCode = 404;
        errorCode = 'NOT_FOUND';
    }
    else if (error.name === 'ConflictError') {
        statusCode = 409;
        errorCode = 'CONFLICT';
    }
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal server error';
    }
    const errorResponse = {
        error: {
            code: errorCode,
            message,
            timestamp: new Date().toISOString(),
            requestId
        }
    };
    if (process.env.NODE_ENV === 'development' && error.stack) {
        errorResponse.error.details = {
            stack: error.stack,
            name: error.name
        };
    }
    res.status(statusCode).json(errorResponse);
});
if (process.env.NODE_ENV === 'production') {
    cache_1.CacheWarmer.warmCache().catch(error => {
        logger_1.logger.warn('Cache warming failed on startup', error);
    });
}
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    performance_monitor_1.performanceMonitor.stopMonitoring();
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    performance_monitor_1.performanceMonitor.stopMonitoring();
    process.exit(0);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled promise rejection', new Error(String(reason)), {
        promise: promise.toString()
    });
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map