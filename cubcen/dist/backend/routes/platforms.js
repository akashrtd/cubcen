"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("@/lib/logger");
const auth_1 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createPlatformSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Platform name is required').max(100),
    type: zod_1.z.enum(['n8n', 'make', 'zapier']),
    baseUrl: zod_1.z.string().url('Valid URL is required'),
    authConfig: zod_1.z.object({
        type: zod_1.z.enum(['api_key', 'oauth', 'basic']),
        credentials: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
    })
});
const updatePlatformSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    baseUrl: zod_1.z.string().url().optional(),
    authConfig: zod_1.z.object({
        type: zod_1.z.enum(['api_key', 'oauth', 'basic']),
        credentials: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
    }).optional(),
    status: zod_1.z.enum(['connected', 'disconnected', 'error']).optional()
});
const platformQuerySchema = validation_1.paginationQuerySchema.extend({
    type: zod_1.z.enum(['n8n', 'make', 'zapier']).optional(),
    status: zod_1.z.enum(['connected', 'disconnected', 'error']).optional()
});
const testConnectionSchema = zod_1.z.object({
    baseUrl: zod_1.z.string().url('Valid URL is required'),
    authConfig: zod_1.z.object({
        type: zod_1.z.enum(['api_key', 'oauth', 'basic']),
        credentials: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
    })
});
router.get('/', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateQuery)(platformQuerySchema), async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, type, status } = req.query;
        logger_1.logger.info('Get platforms request', {
            userId: req.user.id,
            filters: { type, status },
            pagination: { page, limit, sortBy, sortOrder }
        });
        const mockPlatforms = [
            {
                id: 'platform_1',
                name: 'Main n8n Instance',
                type: 'n8n',
                baseUrl: 'https://n8n.example.com',
                status: 'connected',
                authConfig: {
                    type: 'api_key',
                    credentials: { apiKey: '[REDACTED]' }
                },
                lastSyncAt: new Date(),
                agentCount: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'platform_2',
                name: 'Make.com Integration',
                type: 'make',
                baseUrl: 'https://api.make.com',
                status: 'connected',
                authConfig: {
                    type: 'oauth',
                    credentials: { clientId: '[REDACTED]', clientSecret: '[REDACTED]' }
                },
                lastSyncAt: new Date(),
                agentCount: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        res.status(200).json({
            success: true,
            data: {
                platforms: mockPlatforms,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: mockPlatforms.length,
                    totalPages: Math.ceil(mockPlatforms.length / Number(limit))
                }
            },
            message: 'Platforms retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get platforms failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve platforms'
            }
        });
    }
});
router.get('/:id', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Get platform by ID request', {
            userId: req.user.id,
            platformId: id
        });
        const mockPlatform = {
            id,
            name: 'Main n8n Instance',
            type: 'n8n',
            baseUrl: 'https://n8n.example.com',
            status: 'connected',
            authConfig: {
                type: 'api_key',
                credentials: { apiKey: '[REDACTED]' }
            },
            lastSyncAt: new Date(),
            agentCount: 5,
            healthStatus: {
                status: 'healthy',
                lastCheck: new Date(),
                responseTime: 200,
                version: '1.0.0'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        res.status(200).json({
            success: true,
            data: { platform: mockPlatform },
            message: 'Platform retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get platform by ID failed', error, {
            userId: req.user?.id,
            platformId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve platform'
            }
        });
    }
});
router.post('/', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateBody)(createPlatformSchema), async (req, res) => {
    try {
        const platformData = req.body;
        logger_1.logger.info('Create platform request', {
            userId: req.user.id,
            platformData: {
                ...platformData,
                authConfig: {
                    type: platformData.authConfig.type,
                    credentials: '[REDACTED]'
                }
            }
        });
        const mockPlatform = {
            id: `platform_${Date.now()}`,
            ...platformData,
            status: 'disconnected',
            lastSyncAt: null,
            agentCount: 0,
            authConfig: {
                ...platformData.authConfig,
                credentials: { '[REDACTED]': '[REDACTED]' }
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        logger_1.logger.info('Platform created successfully', {
            userId: req.user.id,
            platformId: mockPlatform.id
        });
        res.status(201).json({
            success: true,
            data: { platform: mockPlatform },
            message: 'Platform created successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Create platform failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to create platform'
            }
        });
    }
});
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateParams)(validation_1.idParamSchema), (0, validation_1.validateBody)(updatePlatformSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        logger_1.logger.info('Update platform request', {
            userId: req.user.id,
            platformId: id,
            updateData: {
                ...updateData,
                authConfig: updateData.authConfig ? {
                    type: updateData.authConfig.type,
                    credentials: '[REDACTED]'
                } : undefined
            }
        });
        const mockPlatform = {
            id,
            name: updateData.name || 'Main n8n Instance',
            type: 'n8n',
            baseUrl: updateData.baseUrl || 'https://n8n.example.com',
            status: updateData.status || 'connected',
            authConfig: updateData.authConfig || {
                type: 'api_key',
                credentials: { apiKey: '[REDACTED]' }
            },
            lastSyncAt: new Date(),
            agentCount: 5,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        };
        logger_1.logger.info('Platform updated successfully', {
            userId: req.user.id,
            platformId: id
        });
        res.status(200).json({
            success: true,
            data: { platform: mockPlatform },
            message: 'Platform updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update platform failed', error, {
            userId: req.user?.id,
            platformId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update platform'
            }
        });
    }
});
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Delete platform request', {
            userId: req.user.id,
            platformId: id
        });
        logger_1.logger.info('Platform deleted successfully', {
            userId: req.user.id,
            platformId: id
        });
        res.status(200).json({
            success: true,
            message: 'Platform deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete platform failed', error, {
            userId: req.user?.id,
            platformId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to delete platform'
            }
        });
    }
});
router.post('/test-connection', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateBody)(testConnectionSchema), async (req, res) => {
    try {
        const { baseUrl, authConfig } = req.body;
        logger_1.logger.info('Test platform connection request', {
            userId: req.user.id,
            baseUrl,
            authType: authConfig.type
        });
        const mockResult = {
            success: true,
            responseTime: 150,
            version: '1.0.0',
            capabilities: ['workflows', 'executions', 'webhooks'],
            agentCount: 5
        };
        logger_1.logger.info('Platform connection test successful', {
            userId: req.user.id,
            baseUrl,
            responseTime: mockResult.responseTime
        });
        res.status(200).json({
            success: true,
            data: { connectionTest: mockResult },
            message: 'Platform connection test successful'
        });
    }
    catch (error) {
        logger_1.logger.error('Platform connection test failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'CONNECTION_TEST_FAILED',
                message: 'Failed to test platform connection'
            }
        });
    }
});
router.post('/:id/sync', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Sync platform request', {
            userId: req.user.id,
            platformId: id
        });
        const mockResult = {
            syncedAt: new Date(),
            agentsDiscovered: 3,
            agentsUpdated: 1,
            agentsCreated: 2,
            errors: []
        };
        logger_1.logger.info('Platform sync completed', {
            userId: req.user.id,
            platformId: id,
            result: mockResult
        });
        res.status(200).json({
            success: true,
            data: { syncResult: mockResult },
            message: 'Platform sync completed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Platform sync failed', error, {
            userId: req.user?.id,
            platformId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'SYNC_FAILED',
                message: 'Failed to sync platform'
            }
        });
    }
});
router.get('/:id/health', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Get platform health request', {
            userId: req.user.id,
            platformId: id
        });
        const mockHealth = {
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: 200,
            uptime: 99.9,
            version: '1.0.0',
            capabilities: ['workflows', 'executions', 'webhooks'],
            metrics: {
                totalAgents: 5,
                activeAgents: 4,
                totalExecutions: 1250,
                successRate: 98.5,
                avgResponseTime: 180
            },
            errors: []
        };
        res.status(200).json({
            success: true,
            data: { health: mockHealth },
            message: 'Platform health retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get platform health failed', error, {
            userId: req.user?.id,
            platformId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve platform health'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=platforms.js.map