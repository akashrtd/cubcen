"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const database_1 = require("@/lib/database");
const logger_1 = require("@/lib/logger");
const zod_1 = require("zod");
const agentRegistrationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    platformId: zod_1.z.string().min(1),
    externalId: zod_1.z.string().min(1),
    capabilities: zod_1.z.array(zod_1.z.string()).default([]),
    configuration: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
    description: zod_1.z.string().optional()
});
const agentUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    capabilities: zod_1.z.array(zod_1.z.string()).optional(),
    configuration: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional()
});
const healthCheckConfigSchema = zod_1.z.object({
    interval: zod_1.z.number().min(1000).max(300000).default(30000),
    timeout: zod_1.z.number().min(1000).max(60000).default(10000),
    retries: zod_1.z.number().min(0).max(5).default(3),
    enabled: zod_1.z.boolean().default(true)
});
class AgentService {
    constructor(adapterManager, webSocketService) {
        this.healthCheckIntervals = new Map();
        this.healthCheckConfigs = new Map();
        this.adapterManager = adapterManager;
        this.webSocketService = webSocketService;
    }
    setWebSocketService(webSocketService) {
        this.webSocketService = webSocketService;
    }
    async registerAgent(data) {
        try {
            const validatedData = agentRegistrationSchema.parse(data);
            logger_1.logger.info('Registering new agent', {
                name: validatedData.name,
                platformId: validatedData.platformId,
                externalId: validatedData.externalId
            });
            const platform = await database_1.prisma.platform.findUnique({
                where: { id: validatedData.platformId }
            });
            if (!platform) {
                throw new Error(`Platform with ID ${validatedData.platformId} not found`);
            }
            const existingAgent = await database_1.prisma.agent.findUnique({
                where: {
                    platformId_externalId: {
                        platformId: validatedData.platformId,
                        externalId: validatedData.externalId
                    }
                }
            });
            if (existingAgent) {
                throw new Error(`Agent with external ID ${validatedData.externalId} already exists on platform ${validatedData.platformId}`);
            }
            const agent = await database_1.prisma.agent.create({
                data: {
                    name: validatedData.name,
                    platformId: validatedData.platformId,
                    externalId: validatedData.externalId,
                    status: 'INACTIVE',
                    capabilities: JSON.stringify(validatedData.capabilities || []),
                    configuration: JSON.stringify(validatedData.configuration || {}),
                    healthStatus: JSON.stringify({ status: 'unknown', lastCheck: null }),
                    description: validatedData.description
                }
            });
            await this.startHealthMonitoring(agent.id);
            this.webSocketService?.notifyAgentStatusChange(agent.id, 'inactive', {
                name: agent.name,
                platformId: agent.platformId,
                registered: true
            });
            logger_1.logger.info('Agent registered successfully', {
                agentId: agent.id,
                name: agent.name,
                platformId: agent.platformId
            });
            return agent;
        }
        catch (error) {
            logger_1.logger.error('Failed to register agent', error, {
                platformId: data.platformId,
                externalId: data.externalId
            });
            throw error;
        }
    }
    async updateAgent(agentId, data) {
        try {
            const validatedData = agentUpdateSchema.parse(data);
            logger_1.logger.info('Updating agent', { agentId, updateData: validatedData });
            const existingAgent = await database_1.prisma.agent.findUnique({
                where: { id: agentId }
            });
            if (!existingAgent) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }
            const agent = await database_1.prisma.agent.update({
                where: { id: agentId },
                data: {
                    ...(validatedData.name && { name: validatedData.name }),
                    ...(validatedData.capabilities && { capabilities: JSON.stringify(validatedData.capabilities) }),
                    ...(validatedData.configuration && { configuration: JSON.stringify(validatedData.configuration) }),
                    ...(validatedData.description !== undefined && { description: validatedData.description }),
                    ...(validatedData.status && { status: validatedData.status }),
                    updatedAt: new Date()
                }
            });
            if (validatedData.status) {
                const wsStatus = this.mapAgentStatusToWebSocket(validatedData.status);
                this.webSocketService?.notifyAgentStatusChange(agentId, wsStatus, {
                    name: agent.name,
                    updated: true
                });
            }
            logger_1.logger.info('Agent updated successfully', { agentId, name: agent.name });
            return agent;
        }
        catch (error) {
            logger_1.logger.error('Failed to update agent', error, { agentId });
            throw error;
        }
    }
    async getAgent(agentId) {
        try {
            const agent = await database_1.prisma.agent.findUnique({
                where: { id: agentId },
                include: { platform: true }
            });
            if (!agent) {
                return null;
            }
            const healthStatus = await this.getAgentHealthStatus(agentId);
            return {
                ...agent,
                healthStatus
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get agent', error, { agentId });
            throw error;
        }
    }
    async getAgents(options = {}) {
        try {
            const { platformType, status, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
            const where = {};
            if (platformType) {
                where.platform = { type: platformType.toUpperCase() };
            }
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            const total = await database_1.prisma.agent.count({ where });
            const agents = await database_1.prisma.agent.findMany({
                where,
                include: { platform: true },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit
            });
            const agentsWithHealth = await Promise.all(agents.map(async (agent) => ({
                ...agent,
                healthStatus: await this.getAgentHealthStatus(agent.id)
            })));
            return {
                agents: agentsWithHealth,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get agents', error, options);
            throw error;
        }
    }
    async deleteAgent(agentId) {
        try {
            logger_1.logger.info('Deleting agent', { agentId });
            await this.stopHealthMonitoring(agentId);
            await database_1.prisma.agent.delete({
                where: { id: agentId }
            });
            logger_1.logger.info('Agent deleted successfully', { agentId });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete agent', error, { agentId });
            throw error;
        }
    }
    async discoverAgents(platformId) {
        try {
            logger_1.logger.info('Starting agent discovery', { platformId });
            const result = {
                discovered: 0,
                registered: 0,
                updated: 0,
                errors: []
            };
            const platforms = platformId
                ? await database_1.prisma.platform.findMany({ where: { id: platformId } })
                : await database_1.prisma.platform.findMany({ where: { status: 'CONNECTED' } });
            for (const platform of platforms) {
                try {
                    const adapter = this.adapterManager.getAdapter(platform.id);
                    if (!adapter) {
                        result.errors.push(`No adapter found for platform ${platform.name}`);
                        continue;
                    }
                    const platformAgents = await adapter.discoverAgents();
                    result.discovered += platformAgents.length;
                    for (const platformAgent of platformAgents) {
                        try {
                            const existingAgent = await database_1.prisma.agent.findUnique({
                                where: {
                                    platformId_externalId: {
                                        platformId: platform.id,
                                        externalId: platformAgent.id
                                    }
                                }
                            });
                            if (existingAgent) {
                                await this.updateAgent(existingAgent.id, {
                                    name: platformAgent.name,
                                    capabilities: platformAgent.capabilities,
                                    configuration: platformAgent.configuration
                                });
                                result.updated++;
                            }
                            else {
                                await this.registerAgent({
                                    name: platformAgent.name,
                                    platformId: platform.id,
                                    externalId: platformAgent.id,
                                    capabilities: platformAgent.capabilities,
                                    configuration: platformAgent.configuration
                                });
                                result.registered++;
                            }
                        }
                        catch (error) {
                            const errorMsg = `Failed to process agent ${platformAgent.name}: ${error.message}`;
                            result.errors.push(errorMsg);
                            logger_1.logger.error('Failed to process discovered agent', error, {
                                platformId: platform.id,
                                agentId: platformAgent.id
                            });
                        }
                    }
                }
                catch (error) {
                    const errorMsg = `Failed to discover agents from platform ${platform.name}: ${error.message}`;
                    result.errors.push(errorMsg);
                    logger_1.logger.error('Failed to discover agents from platform', error, {
                        platformId: platform.id
                    });
                }
            }
            logger_1.logger.info('Agent discovery completed', result);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Agent discovery failed', error, { platformId });
            throw error;
        }
    }
    async updateAgentStatus(agentId, status) {
        try {
            await database_1.prisma.agent.update({
                where: { id: agentId },
                data: {
                    status,
                    updatedAt: new Date()
                }
            });
            const wsStatus = this.mapAgentStatusToWebSocket(status);
            this.webSocketService?.notifyAgentStatusChange(agentId, wsStatus, {
                statusUpdate: true
            });
            logger_1.logger.info('Agent status updated', { agentId, status });
        }
        catch (error) {
            logger_1.logger.error('Failed to update agent status', error, { agentId, status });
            throw error;
        }
    }
    async getAgentHealthStatus(agentId) {
        try {
            const healthRecord = await database_1.prisma.agentHealth.findFirst({
                where: { agentId },
                orderBy: { lastCheckAt: 'desc' }
            });
            if (!healthRecord) {
                return {
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    details: { message: 'No health data available' }
                };
            }
            return JSON.parse(healthRecord.status);
        }
        catch (error) {
            logger_1.logger.error('Failed to get agent health status', error, { agentId });
            return {
                status: 'unhealthy',
                lastCheck: new Date(),
                error: error.message
            };
        }
    }
    async performHealthCheck(agentId) {
        try {
            const agent = await database_1.prisma.agent.findUnique({
                where: { id: agentId },
                include: { platform: true }
            });
            if (!agent) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }
            const adapter = this.adapterManager.getAdapter(agent.platformId);
            if (!adapter) {
                throw new Error(`No adapter found for platform ${agent.platformId}`);
            }
            const healthStatus = await adapter.healthCheck();
            await database_1.prisma.agentHealth.create({
                data: {
                    agentId,
                    status: JSON.stringify(healthStatus),
                    responseTime: healthStatus.responseTime,
                    lastCheckAt: new Date(),
                    errorCount: healthStatus.status === 'unhealthy' ? 1 : 0,
                    consecutiveErrors: healthStatus.status === 'unhealthy' ? 1 : 0
                }
            });
            this.webSocketService?.notifyAgentHealthChange(agentId, {
                status: healthStatus.status,
                lastCheck: new Date(),
                responseTime: healthStatus.responseTime,
                details: healthStatus.details
            });
            const newStatus = this.mapHealthToAgentStatus(healthStatus.status);
            if (agent.status !== newStatus) {
                await this.updateAgentStatus(agentId, newStatus);
            }
            return healthStatus;
        }
        catch (error) {
            logger_1.logger.error('Health check failed', error, { agentId });
            const errorHealthStatus = {
                status: 'unhealthy',
                lastCheck: new Date(),
                error: error.message
            };
            try {
                await database_1.prisma.agentHealth.create({
                    data: {
                        agentId,
                        status: JSON.stringify(errorHealthStatus),
                        lastCheckAt: new Date(),
                        errorCount: 1,
                        consecutiveErrors: 1
                    }
                });
            }
            catch (dbError) {
                logger_1.logger.error('Failed to store health check error', dbError, { agentId });
            }
            return errorHealthStatus;
        }
    }
    async configureHealthMonitoring(agentId, config) {
        try {
            const validatedConfig = healthCheckConfigSchema.parse(config);
            logger_1.logger.info('Configuring health monitoring', { agentId, config: validatedConfig });
            this.healthCheckConfigs.set(agentId, validatedConfig);
            await this.stopHealthMonitoring(agentId);
            if (validatedConfig.enabled) {
                await this.startHealthMonitoring(agentId);
            }
            logger_1.logger.info('Health monitoring configured', { agentId });
        }
        catch (error) {
            logger_1.logger.error('Failed to configure health monitoring', error, { agentId });
            throw error;
        }
    }
    async startHealthMonitoring(agentId) {
        try {
            const config = this.healthCheckConfigs.get(agentId) || {
                interval: 30000,
                timeout: 10000,
                retries: 3,
                enabled: true
            };
            if (!config.enabled) {
                return;
            }
            await this.stopHealthMonitoring(agentId);
            const interval = setInterval(async () => {
                try {
                    await this.performHealthCheck(agentId);
                }
                catch (error) {
                    logger_1.logger.error('Scheduled health check failed', error, { agentId });
                }
            }, config.interval);
            this.healthCheckIntervals.set(agentId, interval);
            logger_1.logger.info('Health monitoring started', { agentId, interval: config.interval });
        }
        catch (error) {
            logger_1.logger.error('Failed to start health monitoring', error, { agentId });
            throw error;
        }
    }
    async stopHealthMonitoring(agentId) {
        try {
            const interval = this.healthCheckIntervals.get(agentId);
            if (interval) {
                clearInterval(interval);
                this.healthCheckIntervals.delete(agentId);
                logger_1.logger.info('Health monitoring stopped', { agentId });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to stop health monitoring', error, { agentId });
            throw error;
        }
    }
    getHealthMonitoringStatus() {
        const status = [];
        for (const [agentId, config] of this.healthCheckConfigs.entries()) {
            status.push({
                agentId,
                enabled: config.enabled && this.healthCheckIntervals.has(agentId),
                interval: config.interval
            });
        }
        return status;
    }
    async cleanup() {
        try {
            logger_1.logger.info('Cleaning up agent service');
            for (const agentId of this.healthCheckIntervals.keys()) {
                await this.stopHealthMonitoring(agentId);
            }
            this.healthCheckConfigs.clear();
            logger_1.logger.info('Agent service cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup agent service', error);
            throw error;
        }
    }
    mapHealthToAgentStatus(healthStatus) {
        switch (healthStatus) {
            case 'healthy':
                return 'ACTIVE';
            case 'degraded':
                return 'ACTIVE';
            case 'unhealthy':
                return 'ERROR';
            default:
                return 'INACTIVE';
        }
    }
    mapAgentStatusToWebSocket(status) {
        switch (status) {
            case 'ACTIVE':
                return 'active';
            case 'INACTIVE':
                return 'inactive';
            case 'ERROR':
                return 'error';
            case 'MAINTENANCE':
                return 'maintenance';
            default:
                return 'inactive';
        }
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=agent.js.map