"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("@/lib/logger");
const auth_1 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Agent name is required').max(100),
    platformId: zod_1.z.string().min(1, 'Platform ID is required'),
    platformType: zod_1.z.enum(['n8n', 'make', 'zapier']),
    capabilities: zod_1.z.array(zod_1.z.string()).default([]),
    configuration: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({})
});
const updateAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    capabilities: zod_1.z.array(zod_1.z.string()).optional(),
    configuration: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'maintenance']).optional()
});
const agentQuerySchema = validation_1.paginationQuerySchema.extend({
    platformType: zod_1.z.enum(['n8n', 'make', 'zapier']).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'error', 'maintenance']).optional(),
    search: zod_1.z.string().optional()
});
router.get('/', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateQuery)(agentQuerySchema), async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, platformType, status, search } = req.query;
        logger_1.logger.info('Get agents request', {
            userId: req.user.id,
            filters: { platformType, status, search },
            pagination: { page, limit, sortBy, sortOrder }
        });
        const mockAgents = [
            {
                id: 'agent_1',
                name: 'Email Automation Agent',
                platformId: 'platform_n8n_1',
                platformType: 'n8n',
                status: 'active',
                capabilities: ['email', 'automation'],
                configuration: { emailProvider: 'smtp' },
                healthStatus: {
                    status: 'healthy',
                    lastCheck: new Date(),
                    responseTime: 150
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        res.status(200).json({
            success: true,
            data: {
                agents: mockAgents,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: mockAgents.length,
                    totalPages: Math.ceil(mockAgents.length / Number(limit))
                }
            },
            message: 'Agents retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get agents failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve agents'
            }
        });
    }
});
router.get('/:id', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Get agent by ID request', {
            userId: req.user.id,
            agentId: id
        });
        const mockAgent = {
            id,
            name: 'Email Automation Agent',
            platformId: 'platform_n8n_1',
            platformType: 'n8n',
            status: 'active',
            capabilities: ['email', 'automation'],
            configuration: { emailProvider: 'smtp' },
            healthStatus: {
                status: 'healthy',
                lastCheck: new Date(),
                responseTime: 150
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        res.status(200).json({
            success: true,
            data: { agent: mockAgent },
            message: 'Agent retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get agent by ID failed', error, {
            userId: req.user?.id,
            agentId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve agent'
            }
        });
    }
});
router.post('/', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateBody)(createAgentSchema), async (req, res) => {
    try {
        const agentData = req.body;
        logger_1.logger.info('Create agent request', {
            userId: req.user.id,
            agentData: { ...agentData, configuration: '[REDACTED]' }
        });
        const mockAgent = {
            id: `agent_${Date.now()}`,
            ...agentData,
            status: 'inactive',
            healthStatus: {
                status: 'unknown',
                lastCheck: null,
                responseTime: null
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        logger_1.logger.info('Agent created successfully', {
            userId: req.user.id,
            agentId: mockAgent.id
        });
        res.status(201).json({
            success: true,
            data: { agent: mockAgent },
            message: 'Agent created successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Create agent failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to create agent'
            }
        });
    }
});
router.put('/:id', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), (0, validation_1.validateBody)(updateAgentSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        logger_1.logger.info('Update agent request', {
            userId: req.user.id,
            agentId: id,
            updateData: { ...updateData, configuration: updateData.configuration ? '[REDACTED]' : undefined }
        });
        const mockAgent = {
            id,
            name: updateData.name || 'Email Automation Agent',
            platformId: 'platform_n8n_1',
            platformType: 'n8n',
            status: updateData.status || 'active',
            capabilities: updateData.capabilities || ['email', 'automation'],
            configuration: updateData.configuration || { emailProvider: 'smtp' },
            healthStatus: {
                status: 'healthy',
                lastCheck: new Date(),
                responseTime: 150
            },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        };
        logger_1.logger.info('Agent updated successfully', {
            userId: req.user.id,
            agentId: id
        });
        res.status(200).json({
            success: true,
            data: { agent: mockAgent },
            message: 'Agent updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update agent failed', error, {
            userId: req.user?.id,
            agentId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update agent'
            }
        });
    }
});
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Delete agent request', {
            userId: req.user.id,
            agentId: id
        });
        logger_1.logger.info('Agent deleted successfully', {
            userId: req.user.id,
            agentId: id
        });
        res.status(200).json({
            success: true,
            message: 'Agent deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete agent failed', error, {
            userId: req.user?.id,
            agentId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to delete agent'
            }
        });
    }
});
router.get('/:id/health', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Get agent health request', {
            userId: req.user.id,
            agentId: id
        });
        const mockHealth = {
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: 150,
            uptime: 99.9,
            errors: [],
            metrics: {
                cpu: 25.5,
                memory: 128.5,
                requests: 1250,
                successRate: 98.5
            }
        };
        res.status(200).json({
            success: true,
            data: { health: mockHealth },
            message: 'Agent health retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get agent health failed', error, {
            userId: req.user?.id,
            agentId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve agent health'
            }
        });
    }
});
router.post('/:id/restart', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Restart agent request', {
            userId: req.user.id,
            agentId: id
        });
        logger_1.logger.info('Agent restart initiated', {
            userId: req.user.id,
            agentId: id
        });
        res.status(200).json({
            success: true,
            message: 'Agent restart initiated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Restart agent failed', error, {
            userId: req.user?.id,
            agentId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to restart agent'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=agents.js.map