"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("@/lib/logger");
const auth_1 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const agent_1 = require("@/services/agent");
const adapter_factory_1 = require("@/backend/adapters/adapter-factory");
const zod_1 = require("zod");
const adapterManager = new adapter_factory_1.AdapterManager();
const agentService = new agent_1.AgentService(adapterManager);
const router = (0, express_1.Router)();
const createAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Agent name is required').max(100),
    platformId: zod_1.z.string().min(1, 'Platform ID is required'),
    externalId: zod_1.z.string().min(1, 'External ID is required'),
    capabilities: zod_1.z.array(zod_1.z.string()).default([]),
    configuration: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
    description: zod_1.z.string().optional()
});
const updateAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    capabilities: zod_1.z.array(zod_1.z.string()).optional(),
    configuration: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional()
});
const agentQuerySchema = validation_1.paginationQuerySchema.extend({
    platformType: zod_1.z.enum(['N8N', 'MAKE', 'ZAPIER']).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'ERROR', 'MAINTENANCE']).optional(),
    search: zod_1.z.string().optional()
});
const healthConfigSchema = zod_1.z.object({
    interval: zod_1.z.number().min(1000).max(300000).default(30000),
    timeout: zod_1.z.number().min(1000).max(60000).default(10000),
    retries: zod_1.z.number().min(0).max(5).default(3),
    enabled: zod_1.z.boolean().default(true)
});
router.get('/', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateQuery)(agentQuerySchema), async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, platformType, status, search } = req.query;
        logger_1.logger.info('Get agents request', {
            userId: req.user.id,
            filters: { platformType, status, search },
            pagination: { page, limit, sortBy, sortOrder }
        });
        const result = await agentService.getAgents({
            platformType: platformType,
            status: status,
            search: search,
            page: Number(page),
            limit: Number(limit),
            sortBy: sortBy,
            sortOrder: sortOrder
        });
        res.status(200).json({
            success: true,
            data: {
                agents: result.agents,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
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
        const agent = await agentService.getAgent(id);
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENT_NOT_FOUND',
                    message: 'Agent not found'
                }
            });
        }
        res.status(200).json({
            success: true,
            data: { agent },
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
        const agent = await agentService.registerAgent(agentData);
        logger_1.logger.info('Agent created successfully', {
            userId: req.user.id,
            agentId: agent.id
        });
        res.status(201).json({
            success: true,
            data: { agent },
            message: 'Agent created successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Create agent failed', error, { userId: req.user?.id });
        if (error.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'AGENT_ALREADY_EXISTS',
                    message: error.message
                }
            });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PLATFORM_NOT_FOUND',
                    message: error.message
                }
            });
        }
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
        const agent = await agentService.updateAgent(id, updateData);
        logger_1.logger.info('Agent updated successfully', {
            userId: req.user.id,
            agentId: id
        });
        res.status(200).json({
            success: true,
            data: { agent },
            message: 'Agent updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update agent failed', error, {
            userId: req.user?.id,
            agentId: req.params.id
        });
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENT_NOT_FOUND',
                    message: 'Agent not found'
                }
            });
        }
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
        await agentService.deleteAgent(id);
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
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENT_NOT_FOUND',
                    message: 'Agent not found'
                }
            });
        }
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
        const health = await agentService.getAgentHealthStatus(id);
        res.status(200).json({
            success: true,
            data: { health },
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
router.post('/:id/health-check', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Manual health check request', {
            userId: req.user.id,
            agentId: id
        });
        const health = await agentService.performHealthCheck(id);
        logger_1.logger.info('Manual health check completed', {
            userId: req.user.id,
            agentId: id,
            status: health.status
        });
        res.status(200).json({
            success: true,
            data: { health },
            message: 'Health check completed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Manual health check failed', error, {
            userId: req.user?.id,
            agentId: req.params.id
        });
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AGENT_NOT_FOUND',
                    message: 'Agent not found'
                }
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to perform health check'
            }
        });
    }
});
router.post('/:id/health-config', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), (0, validation_1.validateBody)(healthConfigSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const config = req.body;
        logger_1.logger.info('Configure health monitoring request', {
            userId: req.user.id,
            agentId: id,
            config
        });
        await agentService.configureHealthMonitoring(id, config);
        logger_1.logger.info('Health monitoring configured', {
            userId: req.user.id,
            agentId: id
        });
        res.status(200).json({
            success: true,
            message: 'Health monitoring configured successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Configure health monitoring failed', error, {
            userId: req.user?.id,
            agentId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to configure health monitoring'
            }
        });
    }
});
router.post('/discover', auth_1.authenticate, auth_1.requireOperator, async (req, res) => {
    try {
        const { platformId } = req.body;
        logger_1.logger.info('Agent discovery request', {
            userId: req.user.id,
            platformId
        });
        const result = await agentService.discoverAgents(platformId);
        logger_1.logger.info('Agent discovery completed', {
            userId: req.user.id,
            result
        });
        res.status(200).json({
            success: true,
            data: { discovery: result },
            message: 'Agent discovery completed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Agent discovery failed', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to discover agents'
            }
        });
    }
});
router.get('/health-monitoring/status', auth_1.authenticate, auth_1.requireAuth, async (req, res) => {
    try {
        logger_1.logger.info('Get health monitoring status request', {
            userId: req.user.id
        });
        const status = agentService.getHealthMonitoringStatus();
        res.status(200).json({
            success: true,
            data: { status },
            message: 'Health monitoring status retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get health monitoring status failed', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve health monitoring status'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=agents.js.map