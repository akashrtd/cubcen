"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadSchema = exports.searchQuerySchema = exports.paginationQuerySchema = exports.idParamSchema = exports.rateLimitSchema = void 0;
exports.validate = validate;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
exports.validateRequest = validateRequest;
exports.sanitizeInput = sanitizeInput;
const zod_1 = require("zod");
const logger_1 = require("@/lib/logger");
function validate(schema, source = 'body') {
    return (req, res, next) => {
        try {
            let dataToValidate;
            switch (source) {
                case 'body':
                    dataToValidate = req.body;
                    break;
                case 'query':
                    dataToValidate = req.query;
                    break;
                case 'params':
                    dataToValidate = req.params;
                    break;
                default:
                    dataToValidate = req.body;
            }
            const validatedData = schema.parse(dataToValidate);
            try {
                switch (source) {
                    case 'body':
                        req.body = validatedData;
                        break;
                    case 'query':
                        try {
                            req.query = validatedData;
                        }
                        catch {
                            Object.assign(req.query, validatedData);
                        }
                        break;
                    case 'params':
                        try {
                            req.params = validatedData;
                        }
                        catch {
                            Object.assign(req.params, validatedData);
                        }
                        break;
                }
            }
            catch (assignError) {
                logger_1.logger.debug('Could not assign validated data', {
                    source,
                    path: req.path,
                    method: req.method,
                    error: assignError.message
                });
            }
            logger_1.logger.debug('Validation successful', {
                source,
                path: req.path,
                method: req.method
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                logger_1.logger.warn('Validation failed', {
                    source,
                    path: req.path,
                    method: req.method,
                    errors: error.issues
                });
                const validationErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
                const response = {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Request validation failed',
                        details: validationErrors,
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(400).json(response);
                return;
            }
            logger_1.logger.error('Unexpected validation error', error, {
                source,
                path: req.path,
                method: req.method
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during validation',
                    timestamp: new Date().toISOString()
                }
            });
        }
    };
}
function validateBody(schema) {
    return validate(schema, 'body');
}
function validateQuery(schema) {
    return validate(schema, 'query');
}
function validateParams(schema) {
    return validate(schema, 'params');
}
function validateRequest(schemas) {
    return (req, res, next) => {
        try {
            const errors = [];
            if (schemas.body) {
                try {
                    req.body = schemas.body.parse(req.body);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        errors.push(...error.issues.map((err) => ({
                            source: 'body',
                            field: err.path.join('.'),
                            message: err.message,
                            code: err.code
                        })));
                    }
                }
            }
            if (schemas.query) {
                try {
                    req.query = schemas.query.parse(req.query);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        errors.push(...error.issues.map((err) => ({
                            source: 'query',
                            field: err.path.join('.'),
                            message: err.message,
                            code: err.code
                        })));
                    }
                }
            }
            if (schemas.params) {
                try {
                    req.params = schemas.params.parse(req.params);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        errors.push(...error.issues.map((err) => ({
                            source: 'params',
                            field: err.path.join('.'),
                            message: err.message,
                            code: err.code
                        })));
                    }
                }
            }
            if (errors.length > 0) {
                logger_1.logger.warn('Request validation failed', {
                    path: req.path,
                    method: req.method,
                    errors
                });
                const response = {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Request validation failed',
                        details: errors.map(err => ({
                            field: `${err.source}.${err.field}`,
                            message: err.message,
                            code: err.code
                        })),
                        timestamp: new Date().toISOString()
                    }
                };
                res.status(400).json(response);
                return;
            }
            logger_1.logger.debug('Request validation successful', {
                path: req.path,
                method: req.method
            });
            next();
        }
        catch (error) {
            logger_1.logger.error('Unexpected request validation error', error, {
                path: req.path,
                method: req.method
            });
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during validation',
                    timestamp: new Date().toISOString()
                }
            });
        }
    };
}
function sanitizeInput(req, res, next) {
    try {
        function sanitizeObject(obj) {
            if (typeof obj === 'string') {
                return obj
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '')
                    .trim();
            }
            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }
            if (obj && typeof obj === 'object') {
                const sanitized = {};
                for (const [key, value] of Object.entries(obj)) {
                    sanitized[key] = sanitizeObject(value);
                }
                return sanitized;
            }
            return obj;
        }
        if (req.body && typeof req.body === 'object') {
            try {
                req.body = sanitizeObject(req.body);
            }
            catch {
                logger_1.logger.debug('Body sanitization skipped - not modifiable', { path: req.path });
            }
        }
        if (req.query) {
            req.query = sanitizeObject(req.query);
        }
        if (req.params) {
            req.params = sanitizeObject(req.params);
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Input sanitization error', error, {
            path: req.path,
            method: req.method
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
exports.rateLimitSchema = zod_1.z.object({
    'x-forwarded-for': zod_1.z.string().optional(),
    'x-real-ip': zod_1.z.string().optional()
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required')
});
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
exports.searchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1, 'Search query is required'),
    ...exports.paginationQuerySchema.shape
});
exports.fileUploadSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1, 'Filename is required'),
    mimetype: zod_1.z.string().min(1, 'MIME type is required'),
    size: zod_1.z.number().min(1).max(10 * 1024 * 1024, 'File size must be less than 10MB')
});
//# sourceMappingURL=validation.js.map