"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/services/auth");
const logger_1 = require("@/lib/logger");
const auth_2 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const auth_3 = require("@/lib/validation/auth");
const validation_2 = require("@/backend/middleware/validation");
const auth_4 = require("@/types/auth");
const router = (0, express_1.Router)();
router.post('/login', (0, validation_1.validateBody)(auth_3.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        logger_1.logger.info('Login attempt', { email });
        const result = await auth_1.authService.login({ email, password });
        logger_1.logger.info('Login successful', {
            userId: result.user.id,
            email: result.user.email,
            role: result.user.role
        });
        res.status(200).json({
            success: true,
            data: result,
            message: 'Login successful'
        });
    }
    catch (error) {
        logger_1.logger.error('Login failed', error, { email: req.body.email });
        if (error instanceof auth_4.AuthenticationError) {
            res.status(401).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.post('/register', (0, validation_1.validateBody)(auth_3.registerSchema), async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        logger_1.logger.info('Registration attempt', { email });
        const result = await auth_1.authService.register({
            email,
            password,
            name,
            role
        });
        logger_1.logger.info('Registration successful', {
            userId: result.user.id,
            email: result.user.email,
            role: result.user.role
        });
        res.status(201).json({
            success: true,
            data: result,
            message: 'Registration successful'
        });
    }
    catch (error) {
        logger_1.logger.error('Registration failed', error, { email: req.body.email });
        if (error instanceof auth_4.AuthenticationError) {
            res.status(400).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.post('/refresh', (0, validation_1.validateBody)(auth_3.refreshTokenSchema), async (req, res) => {
    try {
        const { refreshToken } = req.body;
        logger_1.logger.info('Token refresh attempt');
        const tokens = await auth_1.authService.refreshToken(refreshToken);
        logger_1.logger.info('Token refresh successful');
        res.status(200).json({
            success: true,
            data: { tokens },
            message: 'Token refreshed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Token refresh failed', error);
        if (error instanceof auth_4.AuthenticationError) {
            res.status(401).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.get('/me', auth_2.authenticate, async (req, res) => {
    try {
        const user = req.user;
        logger_1.logger.debug('User info request', { userId: user.id });
        res.status(200).json({
            success: true,
            data: { user },
            message: 'User information retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get user info failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.post('/change-password', auth_2.authenticate, (0, validation_1.validateBody)(auth_3.changePasswordSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        logger_1.logger.info('Password change attempt', { userId });
        await auth_1.authService.changePassword(userId, currentPassword, newPassword);
        logger_1.logger.info('Password change successful', { userId });
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Password change failed', error, { userId: req.user?.id });
        if (error instanceof auth_4.AuthenticationError) {
            res.status(400).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.get('/users', auth_2.authenticate, auth_2.requireAdmin, async (req, res) => {
    try {
        logger_1.logger.info('Get all users request', { requestedBy: req.user.id });
        const users = await auth_1.authService.getAllUsers();
        res.status(200).json({
            success: true,
            data: { users },
            message: 'Users retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get all users failed', error, { requestedBy: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.get('/users/:id', auth_2.authenticate, (0, auth_2.requireSelfOrAdmin)('id'), (0, validation_1.validateParams)(validation_2.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Get user by ID request', { userId: id, requestedBy: req.user.id });
        const user = await auth_1.authService.getUserById(id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { user },
            message: 'User retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get user by ID failed', error, {
            userId: req.params.id,
            requestedBy: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.put('/users/:id/role', auth_2.authenticate, auth_2.requireAdmin, (0, validation_1.validateParams)(validation_2.idParamSchema), (0, validation_1.validateBody)(auth_3.updateUserRoleSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        logger_1.logger.info('Update user role request', {
            userId: id,
            newRole: role,
            requestedBy: req.user.id
        });
        const updatedUser = await auth_1.authService.updateUserRole(id, role);
        logger_1.logger.info('User role updated successfully', {
            userId: id,
            newRole: role,
            updatedBy: req.user.id
        });
        res.status(200).json({
            success: true,
            data: { user: updatedUser },
            message: 'User role updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update user role failed', error, {
            userId: req.params.id,
            requestedBy: req.user?.id
        });
        if (error instanceof auth_4.AuthenticationError) {
            res.status(400).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.delete('/users/:id', auth_2.authenticate, auth_2.requireAdmin, (0, validation_1.validateParams)(validation_2.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user.id) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_DELETE_SELF',
                    message: 'Cannot delete your own account'
                }
            });
            return;
        }
        logger_1.logger.info('Delete user request', {
            userId: id,
            requestedBy: req.user.id
        });
        await auth_1.authService.deleteUser(id);
        logger_1.logger.info('User deleted successfully', {
            userId: id,
            deletedBy: req.user.id
        });
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete user failed', error, {
            userId: req.params.id,
            requestedBy: req.user?.id
        });
        if (error instanceof auth_4.AuthenticationError) {
            res.status(400).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
router.post('/logout', auth_2.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        logger_1.logger.info('User logout', { userId });
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Logout failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map