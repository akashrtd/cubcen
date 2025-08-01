"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CubcenTimeoutError = exports.CubcenNetworkError = exports.CubcenServerError = exports.CubcenRateLimitError = exports.CubcenConflictError = exports.CubcenNotFoundError = exports.CubcenValidationError = exports.CubcenAuthorizationError = exports.CubcenAuthenticationError = exports.CubcenError = void 0;
exports.createCubcenError = createCubcenError;
class CubcenError extends Error {
    constructor(message, code = 'CUBCEN_ERROR', statusCode, requestId, details) {
        super(message);
        this.name = 'CubcenError';
        this.code = code;
        this.statusCode = statusCode;
        this.requestId = requestId;
        this.details = details;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CubcenError);
        }
    }
}
exports.CubcenError = CubcenError;
class CubcenAuthenticationError extends CubcenError {
    constructor(message = 'Authentication failed', requestId, details) {
        super(message, 'AUTHENTICATION_ERROR', 401, requestId, details);
        this.name = 'CubcenAuthenticationError';
    }
}
exports.CubcenAuthenticationError = CubcenAuthenticationError;
class CubcenAuthorizationError extends CubcenError {
    constructor(message = 'Access denied', requestId, details) {
        super(message, 'AUTHORIZATION_ERROR', 403, requestId, details);
        this.name = 'CubcenAuthorizationError';
    }
}
exports.CubcenAuthorizationError = CubcenAuthorizationError;
class CubcenValidationError extends CubcenError {
    constructor(message = 'Validation failed', requestId, details) {
        super(message, 'VALIDATION_ERROR', 400, requestId, details);
        this.name = 'CubcenValidationError';
    }
}
exports.CubcenValidationError = CubcenValidationError;
class CubcenNotFoundError extends CubcenError {
    constructor(message = 'Resource not found', requestId, details) {
        super(message, 'NOT_FOUND_ERROR', 404, requestId, details);
        this.name = 'CubcenNotFoundError';
    }
}
exports.CubcenNotFoundError = CubcenNotFoundError;
class CubcenConflictError extends CubcenError {
    constructor(message = 'Resource conflict', requestId, details) {
        super(message, 'CONFLICT_ERROR', 409, requestId, details);
        this.name = 'CubcenConflictError';
    }
}
exports.CubcenConflictError = CubcenConflictError;
class CubcenRateLimitError extends CubcenError {
    constructor(message = 'Rate limit exceeded', requestId, details) {
        super(message, 'RATE_LIMIT_ERROR', 429, requestId, details);
        this.name = 'CubcenRateLimitError';
    }
}
exports.CubcenRateLimitError = CubcenRateLimitError;
class CubcenServerError extends CubcenError {
    constructor(message = 'Internal server error', requestId, details) {
        super(message, 'SERVER_ERROR', 500, requestId, details);
        this.name = 'CubcenServerError';
    }
}
exports.CubcenServerError = CubcenServerError;
class CubcenNetworkError extends CubcenError {
    constructor(message = 'Network error', requestId, details) {
        super(message, 'NETWORK_ERROR', undefined, requestId, details);
        this.name = 'CubcenNetworkError';
    }
}
exports.CubcenNetworkError = CubcenNetworkError;
class CubcenTimeoutError extends CubcenError {
    constructor(message = 'Request timeout', requestId, details) {
        super(message, 'TIMEOUT_ERROR', 408, requestId, details);
        this.name = 'CubcenTimeoutError';
    }
}
exports.CubcenTimeoutError = CubcenTimeoutError;
function createCubcenError(statusCode, message, code, requestId, details) {
    switch (statusCode) {
        case 400:
            return new CubcenValidationError(message, requestId, details);
        case 401:
            return new CubcenAuthenticationError(message, requestId, details);
        case 403:
            return new CubcenAuthorizationError(message, requestId, details);
        case 404:
            return new CubcenNotFoundError(message, requestId, details);
        case 409:
            return new CubcenConflictError(message, requestId, details);
        case 429:
            return new CubcenRateLimitError(message, requestId, details);
        case 500:
        case 502:
        case 503:
        case 504:
            return new CubcenServerError(message, requestId, details);
        default:
            return new CubcenError(message, code, statusCode, requestId, details);
    }
}
//# sourceMappingURL=errors.js.map