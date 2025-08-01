"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("@/lib/logger");
const auth_1 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const updateUserProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100).optional(),
    email: zod_1.z.string().email('Valid email is required').optional(),
    preferences: zod_1.z.object({
        theme: zod_1.z.enum(['light', 'dark', 'system']).optional(),
        notifications: zod_1.z.object({
            email: zod_1.z.boolean().optional(),
            push: zod_1.z.boolean().optional(),
            slack: zod_1.z.boolean().optional()
        }).optional(),
        dashboard: zod_1.z.object({
            defaultView: zod_1.z.enum(['grid', 'list', 'kanban']).optional(),
            refreshInterval: zod_1.z.number().min(5).max(300).optional()
        }).optional()
    }).optional()
});
const userQuerySchema = validation_1.paginationQuerySchema.extend({
    role: zod_1.z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']).optional(),
    search: zod_1.z.string().optional()
});
const updateUserStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'inactive', 'suspended'])
});
router.get('/', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateQuery)(userQuerySchema), async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, role, status, search } = req.query;
        logger_1.logger.info('Get users request', {
            userId: req.user.id,
            filters: { role, status, search },
            pagination: { page, limit, sortBy, sortOrder }
        });
        const mockUsers = [
            {
                id: 'user_1',
                name: 'Admin User',
                email: '[email]',
                role: 'ADMIN',
                status: 'active',
                lastLoginAt: new Date(),
                preferences: {
                    theme: 'dark',
                    notifications: { email: true, push: true, slack: false },
                    dashboard: { defaultView: 'grid', refreshInterval: 30 }
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'user_2',
                name: 'Operator User',
                email: '[email]',
                role: 'OPERATOR',
                status: 'active',
                lastLoginAt: new Date(),
                preferences: {
                    theme: 'light',
                    notifications: { email: true, push: false, slack: true },
                    dashboard: { defaultView: 'kanban', refreshInterval: 60 }
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        res.status(200).json({
            success: true,
            data: {
                users: mockUsers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: mockUsers.length,
                    totalPages: Math.ceil(mockUsers.length / Number(limit))
                }
            },
            message: 'Users retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get users failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve users'
            }
        });
    }
});
router.get('/:id', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('id'), (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Get user by ID request', {
            userId: req.user.id,
            targetUserId: id
        });
        const mockUser = {
            id,
            name: 'User Name',
            email: '[email]',
            role: 'OPERATOR',
            status: 'active',
            lastLoginAt: new Date(),
            preferences: {
                theme: 'light',
                notifications: { email: true, push: false, slack: true },
                dashboard: { defaultView: 'kanban', refreshInterval: 60 }
            },
            activityStats: {
                totalLogins: 45,
                lastLogin: new Date(),
                tasksCreated: 23,
                agentsManaged: 5
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        res.status(200).json({
            success: true,
            data: { user: mockUser },
            message: 'User retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get user by ID failed', error, {
            userId: req.user?.id,
            targetUserId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve user'
            }
        });
    }
});
router.put('/:id/profile', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('id'), (0, validation_1.validateParams)(validation_1.idParamSchema), (0, validation_1.validateBody)(updateUserProfileSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        logger_1.logger.info('Update user profile request', {
            userId: req.user.id,
            targetUserId: id,
            updateData: { ...updateData, email: updateData.email ? '[REDACTED]' : undefined }
        });
        const mockUser = {
            id,
            name: updateData.name || 'User Name',
            email: updateData.email || '[email]',
            role: 'OPERATOR',
            status: 'active',
            lastLoginAt: new Date(),
            preferences: updateData.preferences || {
                theme: 'light',
                notifications: { email: true, push: false, slack: true },
                dashboard: { defaultView: 'kanban', refreshInterval: 60 }
            },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        };
        logger_1.logger.info('User profile updated successfully', {
            userId: req.user.id,
            targetUserId: id
        });
        res.status(200).json({
            success: true,
            data: { user: mockUser },
            message: 'User profile updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update user profile failed', error, {
            userId: req.user?.id,
            targetUserId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update user profile'
            }
        });
    }
});
router.put('/:id/status', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateParams)(validation_1.idParamSchema), (0, validation_1.validateBody)(updateUserStatusSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (id === req.user.id && status === 'suspended') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_SUSPEND_SELF',
                    message: 'Cannot suspend your own account'
                }
            });
            return;
        }
        logger_1.logger.info('Update user status request', {
            userId: req.user.id,
            targetUserId: id,
            newStatus: status
        });
        const mockUser = {
            id,
            name: 'User Name',
            email: '[email]',
            role: 'OPERATOR',
            status,
            lastLoginAt: new Date(),
            preferences: {
                theme: 'light',
                notifications: { email: true, push: false, slack: true },
                dashboard: { defaultView: 'kanban', refreshInterval: 60 }
            },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        };
        logger_1.logger.info('User status updated successfully', {
            userId: req.user.id,
            targetUserId: id,
            newStatus: status
        });
        res.status(200).json({
            success: true,
            data: { user: mockUser },
            message: 'User status updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update user status failed', error, {
            userId: req.user?.id,
            targetUserId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update user status'
            }
        });
    }
});
router.get('/:id/activity', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('id'), (0, validation_1.validateParams)(validation_1.idParamSchema), (0, validation_1.validateQuery)(validation_1.paginationQuerySchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { page, limit, sortBy, sortOrder } = req.query;
        logger_1.logger.info('Get user activity request', {
            userId: req.user.id,
            targetUserId: id,
            pagination: { page, limit, sortBy, sortOrder }
        });
        const mockActivity = [
            {
                id: 'activity_1',
                type: 'login',
                description: 'User logged in',
                timestamp: new Date(),
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                metadata: {}
            },
            {
                id: 'activity_2',
                type: 'task_created',
                description: 'Created new task: Email Campaign',
                timestamp: new Date(),
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                metadata: { taskId: 'task_123', agentId: 'agent_456' }
            },
            {
                id: 'activity_3',
                type: 'agent_updated',
                description: 'Updated agent configuration',
                timestamp: new Date(),
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                metadata: { agentId: 'agent_456', changes: ['name', 'configuration'] }
            }
        ];
        res.status(200).json({
            success: true,
            data: {
                activities: mockActivity,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: mockActivity.length,
                    totalPages: Math.ceil(mockActivity.length / Number(limit))
                }
            },
            message: 'User activity retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get user activity failed', error, {
            userId: req.user?.id,
            targetUserId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve user activity'
            }
        });
    }
});
router.get('/:id/stats', auth_1.authenticate, (0, auth_1.requireSelfOrAdmin)('id'), (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Get user stats request', {
            userId: req.user.id,
            targetUserId: id
        });
        const mockStats = {
            overview: {
                totalLogins: 45,
                lastLogin: new Date(),
                accountAge: 90,
                status: 'active'
            },
            activity: {
                tasksCreated: 23,
                tasksCompleted: 20,
                tasksSuccessRate: 87.0,
                agentsManaged: 5,
                platformsConnected: 2
            },
            performance: {
                avgTaskDuration: 1500,
                mostUsedAgent: 'Email Automation Agent',
                mostUsedPlatform: 'n8n',
                peakActivityHour: 14
            },
            trends: {
                tasksThisWeek: 8,
                tasksLastWeek: 6,
                successRateThisWeek: 90.0,
                successRateLastWeek: 85.0
            }
        };
        res.status(200).json({
            success: true,
            data: { stats: mockStats },
            message: 'User statistics retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get user stats failed', error, {
            userId: req.user?.id,
            targetUserId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve user statistics'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map