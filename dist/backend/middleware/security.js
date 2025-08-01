"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedRateLimiter = void 0;
exports.sanitizeInput = sanitizeInput;
exports.csrfProtection = csrfProtection;
exports.generateCsrfToken = generateCsrfToken;
exports.securityHeaders = securityHeaders;
exports.requestSizeLimit = requestSizeLimit;
exports.ipWhitelist = ipWhitelist;
exports.suspiciousActivityDetection = suspiciousActivityDetection;
exports.fileUploadSecurity = fileUploadSecurity;
exports.honeypotProtection = honeypotProtection;
exports.geolocationFilter = geolocationFilter;
exports.requestSignatureValidation = requestSignatureValidation;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("@/lib/logger");
function sanitizeInput(req, res, next) {
    try {
        function sanitizeObject(obj) {
            if (typeof obj === 'string') {
                return obj
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/vbscript:/gi, '')
                    .replace(/data:(?!image\/)/gi, '')
                    .replace(/on\w+\s*=/gi, '')
                    .replace(/style\s*=\s*["'][^"']*expression\s*\([^"']*["']/gi, '')
                    .replace(/<(iframe|object|embed|form|input|textarea|select|option|button|link|meta|base|applet|frame|frameset|noframes|noscript)\b[^>]*>/gi, '')
                    .replace(/<!--[\s\S]*?-->/g, '')
                    .replace(/(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi, '')
                    .trim();
            }
            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }
            if (obj && typeof obj === 'object') {
                const sanitized = {};
                for (const [key, value] of Object.entries(obj)) {
                    const sanitizedKey = typeof key === 'string' ? sanitizeObject(key) : key;
                    sanitized[sanitizedKey] = sanitizeObject(value);
                }
                return sanitized;
            }
            return obj;
        }
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            const sanitizedQuery = sanitizeObject(req.query);
            req.query = sanitizedQuery;
        }
        if (req.params && typeof req.params === 'object') {
            const sanitizedParams = sanitizeObject(req.params);
            req.params = sanitizedParams;
        }
        const originalUrl = req.originalUrl;
        if (originalUrl.includes('<script') || originalUrl.includes('javascript:') || originalUrl.includes('union select')) {
            logger_1.logger.warn('Suspicious input detected and sanitized', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                originalUrl,
                timestamp: new Date().toISOString()
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Input sanitization error', error, {
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        res.status(500).json({
            error: {
                code: 'SANITIZATION_ERROR',
                message: 'Input sanitization failed',
                timestamp: new Date().toISOString()
            }
        });
    }
}
function csrfProtection(req, res, next) {
    try {
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return next();
        }
        const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
        const sessionCsrfToken = req.session?.csrfToken;
        if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken) {
            logger_1.logger.warn('CSRF token validation failed', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                hasToken: !!csrfToken,
                hasSessionToken: !!sessionCsrfToken,
                tokensMatch: csrfToken === sessionCsrfToken
            });
            return res.status(403).json({
                error: {
                    code: 'CSRF_TOKEN_INVALID',
                    message: 'CSRF token validation failed',
                    timestamp: new Date().toISOString()
                }
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('CSRF protection error', error, {
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        res.status(500).json({
            error: {
                code: 'CSRF_PROTECTION_ERROR',
                message: 'CSRF protection failed',
                timestamp: new Date().toISOString()
            }
        });
    }
}
function generateCsrfToken(req, res) {
    try {
        const token = crypto_1.default.randomBytes(32).toString('hex');
        if (req.session) {
            req.session.csrfToken = token;
        }
        res.json({
            csrfToken: token,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('CSRF token generation error', error);
        res.status(500).json({
            error: {
                code: 'CSRF_TOKEN_GENERATION_ERROR',
                message: 'Failed to generate CSRF token',
                timestamp: new Date().toISOString()
            }
        });
    }
}
function securityHeaders(req, res, next) {
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' ws: wss:",
        "media-src 'self'",
        "object-src 'none'",
        "child-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'"
    ].join('; '));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()'
    ].join(', '));
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    next();
}
function requestSizeLimit(maxSize = 10 * 1024 * 1024) {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);
        if (contentLength > maxSize) {
            logger_1.logger.warn('Request size limit exceeded', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                contentLength,
                maxSize
            });
            return res.status(413).json({
                error: {
                    code: 'REQUEST_TOO_LARGE',
                    message: `Request size exceeds limit of ${maxSize} bytes`,
                    timestamp: new Date().toISOString()
                }
            });
        }
        next();
    };
}
function ipWhitelist(allowedIPs = []) {
    return (req, res, next) => {
        if (allowedIPs.length === 0) {
            return next();
        }
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (!clientIP || !allowedIPs.includes(clientIP)) {
            logger_1.logger.warn('IP not in whitelist', {
                ip: clientIP,
                allowedIPs,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method
            });
            return res.status(403).json({
                error: {
                    code: 'IP_NOT_ALLOWED',
                    message: 'Access denied from this IP address',
                    timestamp: new Date().toISOString()
                }
            });
        }
        next();
    };
}
function suspiciousActivityDetection(req, res, next) {
    const suspiciousPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|where|into|values|set)\b)/i,
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/i,
        /vbscript:/i,
        /\.\.[\/\\]/,
        /[;&|`$(){}[\]]/,
        /[()=*!&|]/
    ];
    const requestString = JSON.stringify({
        url: req.originalUrl,
        body: req.body,
        query: req.query,
        params: req.params
    });
    const suspiciousActivity = suspiciousPatterns.some(pattern => pattern.test(requestString));
    if (suspiciousActivity) {
        logger_1.logger.warn('Suspicious activity detected', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
            requestData: requestString,
            timestamp: new Date().toISOString()
        });
        if (process.env.NODE_ENV === 'production') {
            return res.status(400).json({
                error: {
                    code: 'SUSPICIOUS_ACTIVITY',
                    message: 'Request contains suspicious patterns',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    next();
}
function fileUploadSecurity(req, res, next) {
    if (!req.file && !req.files) {
        return next();
    }
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'text/csv',
        'application/json',
        'application/pdf'
    ];
    const maxFileSize = 10 * 1024 * 1024;
    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
    for (const file of files) {
        if (!file)
            continue;
        if (file.size > maxFileSize) {
            logger_1.logger.warn('File size exceeds limit', {
                filename: file.originalname,
                size: file.size,
                maxSize: maxFileSize,
                ip: req.ip
            });
            return res.status(413).json({
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: `File size exceeds limit of ${maxFileSize} bytes`,
                    timestamp: new Date().toISOString()
                }
            });
        }
        if (!allowedMimeTypes.includes(file.mimetype)) {
            logger_1.logger.warn('Disallowed file type uploaded', {
                filename: file.originalname,
                mimetype: file.mimetype,
                allowedTypes: allowedMimeTypes,
                ip: req.ip
            });
            return res.status(400).json({
                error: {
                    code: 'INVALID_FILE_TYPE',
                    message: `File type ${file.mimetype} is not allowed`,
                    timestamp: new Date().toISOString()
                }
            });
        }
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.sh'];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (dangerousExtensions.includes(fileExtension)) {
            logger_1.logger.warn('Dangerous file extension detected', {
                filename: file.originalname,
                extension: fileExtension,
                ip: req.ip
            });
            return res.status(400).json({
                error: {
                    code: 'DANGEROUS_FILE_EXTENSION',
                    message: `File extension ${fileExtension} is not allowed`,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    next();
}
class AdvancedRateLimiter {
    constructor(options = {}) {
        this.attempts = new Map();
        this.maxAttempts = options.maxAttempts || 5;
        this.windowMs = options.windowMs || 15 * 60 * 1000;
        this.blockDurationMs = options.blockDurationMs || 60 * 1000;
        this.progressiveMultiplier = options.progressiveMultiplier || 2;
    }
    middleware() {
        return (req, res, next) => {
            const key = this.getKey(req);
            const now = new Date();
            const attempt = this.attempts.get(key);
            if (attempt?.blocked && attempt.blockUntil && now < attempt.blockUntil) {
                const remainingMs = attempt.blockUntil.getTime() - now.getTime();
                logger_1.logger.warn('Request blocked by advanced rate limiter', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path,
                    method: req.method,
                    remainingMs,
                    attemptCount: attempt.count
                });
                return res.status(429).json({
                    error: {
                        code: 'RATE_LIMIT_BLOCKED',
                        message: `Too many failed attempts. Blocked for ${Math.ceil(remainingMs / 1000)} seconds.`,
                        timestamp: new Date().toISOString(),
                        retryAfter: Math.ceil(remainingMs / 1000)
                    }
                });
            }
            if (attempt && (now.getTime() - attempt.firstAttempt.getTime()) > this.windowMs) {
                this.attempts.delete(key);
            }
            const currentAttempt = this.attempts.get(key);
            if (currentAttempt && currentAttempt.count >= this.maxAttempts) {
                const blockDuration = this.blockDurationMs * Math.pow(this.progressiveMultiplier, Math.floor(currentAttempt.count / this.maxAttempts));
                const blockUntil = new Date(now.getTime() + blockDuration);
                this.attempts.set(key, {
                    ...currentAttempt,
                    blocked: true,
                    blockUntil
                });
                logger_1.logger.warn('IP blocked by advanced rate limiter', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path,
                    method: req.method,
                    attemptCount: currentAttempt.count,
                    blockDurationMs: blockDuration
                });
                return res.status(429).json({
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: `Too many attempts. Blocked for ${Math.ceil(blockDuration / 1000)} seconds.`,
                        timestamp: new Date().toISOString(),
                        retryAfter: Math.ceil(blockDuration / 1000)
                    }
                });
            }
            next();
        };
    }
    recordAttempt(req, success) {
        const key = this.getKey(req);
        const now = new Date();
        const attempt = this.attempts.get(key);
        if (success) {
            this.attempts.delete(key);
        }
        else {
            if (attempt) {
                this.attempts.set(key, {
                    ...attempt,
                    count: attempt.count + 1
                });
            }
            else {
                this.attempts.set(key, {
                    count: 1,
                    firstAttempt: now,
                    blocked: false
                });
            }
        }
    }
    getKey(req) {
        return `${req.ip}:${req.path}`;
    }
    cleanup() {
        const now = new Date();
        for (const [key, attempt] of this.attempts.entries()) {
            if ((now.getTime() - attempt.firstAttempt.getTime()) > this.windowMs * 2) {
                this.attempts.delete(key);
            }
            if (attempt.blocked && attempt.blockUntil && now > attempt.blockUntil) {
                this.attempts.delete(key);
            }
        }
    }
}
exports.AdvancedRateLimiter = AdvancedRateLimiter;
function honeypotProtection(req, res, next) {
    if (req.body && req.body.honeypot && req.body.honeypot.trim() !== '') {
        logger_1.logger.warn('Honeypot field filled, likely bot detected', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
            honeypotValue: req.body.honeypot
        });
        return res.status(200).json({
            success: true,
            message: 'Request processed successfully'
        });
    }
    next();
}
function geolocationFilter(allowedCountries = []) {
    return (req, res, next) => {
        if (allowedCountries.length === 0) {
            return next();
        }
        const country = req.headers['cf-ipcountry'] || req.headers['x-country-code'] || 'unknown';
        if (typeof country === 'string' && !allowedCountries.includes(country.toUpperCase())) {
            logger_1.logger.warn('Request from restricted country', {
                ip: req.ip,
                country,
                allowedCountries,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method
            });
            return res.status(403).json({
                error: {
                    code: 'GEOGRAPHIC_RESTRICTION',
                    message: 'Access denied from this geographic location',
                    timestamp: new Date().toISOString()
                }
            });
        }
        next();
    };
}
function requestSignatureValidation(secretKey) {
    return (req, res, next) => {
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];
        if (!signature || !timestamp) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_SIGNATURE',
                    message: 'Request signature and timestamp required',
                    timestamp: new Date().toISOString()
                }
            });
        }
        const requestTime = parseInt(timestamp, 10);
        const now = Date.now();
        const maxAge = 5 * 60 * 1000;
        if (Math.abs(now - requestTime) > maxAge) {
            logger_1.logger.warn('Request timestamp too old or too far in future', {
                ip: req.ip,
                requestTime,
                currentTime: now,
                difference: Math.abs(now - requestTime),
                maxAge
            });
            return res.status(400).json({
                error: {
                    code: 'INVALID_TIMESTAMP',
                    message: 'Request timestamp is too old or too far in the future',
                    timestamp: new Date().toISOString()
                }
            });
        }
        const payload = `${req.method}${req.path}${timestamp}${JSON.stringify(req.body || {})}`;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', secretKey)
            .update(payload)
            .digest('hex');
        if (signature !== expectedSignature) {
            logger_1.logger.warn('Invalid request signature', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                providedSignature: signature,
                expectedSignature
            });
            return res.status(401).json({
                error: {
                    code: 'INVALID_SIGNATURE',
                    message: 'Request signature validation failed',
                    timestamp: new Date().toISOString()
                }
            });
        }
        next();
    };
}
//# sourceMappingURL=security.js.map