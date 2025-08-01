"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.requireOperator = exports.requireAdmin = void 0;
exports.authenticate = authenticate;
exports.optionalAuthenticate = optionalAuthenticate;
exports.requireRole = requireRole;
exports.requirePermission = requirePermission;
exports.requireResourcePermission = requireResourcePermission;
exports.requireSelfOrAdmin = requireSelfOrAdmin;
const auth_1 = require("@/types/auth");
const auth_2 = require("@/services/auth");
const auth_3 = require("@/types/auth");
const rbac_1 = require("@/lib/rbac");
const logger_1 = require("@/lib/logger");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const user = await auth_2.authService.validateAuthHeader(authHeader);
        req.user = user;
        logger_1.logger.debug('User authenticated', {
            userId: user.id,
            email: user.email,
            role: user.role,
            path: req.path,
            method: req.method
        });
        next();
    }
    catch (error) {
        logger_1.logger.warn('Authentication failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            path: req.path,
            method: req.method,
            authHeader: req.headers.authorization ? 'present' : 'missing'
        });
        if (error instanceof auth_3.AuthenticationError) {
            res.status(401).json({
                error: {
                    code: error.code,
                    message: error.message,
                    timestamp: new Date().toISOString()
                }
            });
            return;
        }
        res.status(401).json({
            error: {
                code: 'AUTHENTICATION_FAILED',
                message: 'Authentication required',
                timestamp: new Date().toISOString()
            }
        });
    }
}
async function optionalAuthenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const user = await auth_2.authService.validateAuthHeader(authHeader);
            req.user = user;
            logger_1.logger.debug('Optional authentication successful', {
                userId: user.id,
                email: user.email,
                role: user.role
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.debug('Optional authentication failed, continuing without user', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        next();
    }
}
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new auth_3.AuthorizationError('Authentication required', 'NOT_AUTHENTICATED');
            }
            if (!allowedRoles.includes(req.user.role)) {
                logger_1.logger.warn('Authorization failed: Insufficient role', {
                    userId: req.user.id,
                    userRole: req.user.role,
                    requiredRoles: allowedRoles,
                    path: req.path,
                    method: req.method
                });
                throw new auth_3.AuthorizationError(`Access denied. Required role: ${allowedRoles.join(' or ')}`, 'INSUFFICIENT_ROLE');
            }
            logger_1.logger.debug('Role authorization successful', {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: allowedRoles
            });
            next();
        }
        catch (error) {
            if (error instanceof auth_3.AuthorizationError) {
                res.status(403).json({
                    error: {
                        code: error.code,
                        message: error.message,
                        timestamp: new Date().toISOString()
                    }
                });
                return;
            }
            res.status(403).json({
                error: {
                    code: 'AUTHORIZATION_FAILED',
                    message: 'Access denied',
                    timestamp: new Date().toISOString()
                }
            });
        }
    };
}
function requirePermission(permission) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new auth_3.AuthorizationError('Authentication required', 'NOT_AUTHENTICATED');
            }
            (0, rbac_1.requirePermission)(req.user.role, permission);
            logger_1.logger.debug('Permission authorization successful', {
                userId: req.user.id,
                userRole: req.user.role,
                permission: permission
            });
            next();
        }
        catch (error) {
            logger_1.logger.warn('Permission authorization failed', {
                userId: req.user?.id,
                userRole: req.user?.role,
                permission: permission,
                error: error instanceof Error ? error.message : 'Unknown error',
                path: req.path,
                method: req.method
            });
            if (error instanceof auth_3.AuthorizationError) {
                res.status(403).json({
                    error: {
                        code: error.code,
                        message: error.message,
                        timestamp: new Date().toISOString()
                    }
                });
                return;
            }
            res.status(403).json({
                error: {
                    code: 'AUTHORIZATION_FAILED',
                    message: 'Access denied',
                    timestamp: new Date().toISOString()
                }
            });
        }
    };
}
function requireResourcePermission(resource, action) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new auth_3.AuthorizationError('Authentication required', 'NOT_AUTHENTICATED');
            }
            (0, rbac_1.requireResourcePermission)(req.user.role, resource, action);
            logger_1.logger.debug('Resource permission authorization successful', {
                userId: req.user.id,
                userRole: req.user.role,
                resource,
                action
            });
            next();
        }
        catch (error) {
            logger_1.logger.warn('Resource permission authorization failed', {
                userId: req.user?.id,
                userRole: req.user?.role,
                resource,
                action,
                error: error instanceof Error ? error.message : 'Unknown error',
                path: req.path,
                method: req.method
            });
            if (error instanceof auth_3.AuthorizationError) {
                res.status(403).json({
                    error: {
                        code: error.code,
                        message: error.message,
                        timestamp: new Date().toISOString()
                    }
                });
                return;
            }
            res.status(403).json({
                error: {
                    code: 'AUTHORIZATION_FAILED',
                    message: 'Access denied',
                    timestamp: new Date().toISOString()
                }
            });
        }
    };
}
exports.requireAdmin = requireRole(auth_1.UserRole.ADMIN);
exports.requireOperator = requireRole(auth_1.UserRole.ADMIN, auth_1.UserRole.OPERATOR);
exports.requireAuth = requireRole(auth_1.UserRole.ADMIN, auth_1.UserRole.OPERATOR, auth_1.UserRole.VIEWER);
function requireSelfOrAdmin(userIdParam = 'userId') {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new auth_3.AuthorizationError('Authentication required', 'NOT_AUTHENTICATED');
            }
            const targetUserId = req.params[userIdParam];
            const isAdmin = req.user.role === auth_1.UserRole.ADMIN;
            const isSelf = req.user.id === targetUserId;
            if (!isAdmin && !isSelf) {
                logger_1.logger.warn('Self or admin authorization failed', {
                    userId: req.user.id,
                    userRole: req.user.role,
                    targetUserId,
                    path: req.path,
                    method: req.method
                });
                throw new auth_3.AuthorizationError('Access denied. You can only access your own resources.', 'INSUFFICIENT_PERMISSIONS');
            }
            logger_1.logger.debug('Self or admin authorization successful', {
                userId: req.user.id,
                userRole: req.user.role,
                targetUserId,
                isAdmin,
                isSelf
            });
            next();
        }
        catch (error) {
            if (error instanceof auth_3.AuthorizationError) {
                res.status(403).json({
                    error: {
                        code: error.code,
                        message: error.message,
                        timestamp: new Date().toISOString()
                    }
                });
                return;
            }
            res.status(403).json({
                error: {
                    code: 'AUTHORIZATION_FAILED',
                    message: 'Access denied',
                    timestamp: new Date().toISOString()
                }
            });
        }
    };
}
//# sourceMappingURL=auth.js.map