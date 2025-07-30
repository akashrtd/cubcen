"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("@/lib/logger");
const auth_1 = __importDefault(require("@/backend/routes/auth"));
const agents_1 = __importDefault(require("@/backend/routes/agents"));
const tasks_1 = __importDefault(require("@/backend/routes/tasks"));
const platforms_1 = __importDefault(require("@/backend/routes/platforms"));
const users_1 = __importDefault(require("@/backend/routes/users"));
const health_1 = __importDefault(require("@/backend/routes/health"));
const websocket_1 = __importDefault(require("@/backend/routes/websocket"));
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
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
app.use('/health', health_1.default);
app.use('/api/cubcen/v1/auth', authLimiter, auth_1.default);
app.use('/api/cubcen/v1/agents', agents_1.default);
app.use('/api/cubcen/v1/tasks', tasks_1.default);
app.use('/api/cubcen/v1/platforms', platforms_1.default);
app.use('/api/cubcen/v1/users', users_1.default);
app.use('/api/cubcen/v1/websocket', websocket_1.default);
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
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
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