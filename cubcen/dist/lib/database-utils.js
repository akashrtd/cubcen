"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = resetDatabase;
exports.getDatabaseStats = getDatabaseStats;
exports.validateDatabaseSchema = validateDatabaseSchema;
exports.createTestData = createTestData;
const database_1 = require("./database");
const logger_1 = require("./logger");
async function resetDatabase() {
    try {
        logger_1.logger.info('Resetting database...');
        await database_1.prisma.agentHealth.deleteMany();
        await database_1.prisma.metric.deleteMany();
        await database_1.prisma.systemLog.deleteMany();
        await database_1.prisma.workflowStep.deleteMany();
        await database_1.prisma.task.deleteMany();
        await database_1.prisma.workflow.deleteMany();
        await database_1.prisma.agent.deleteMany();
        await database_1.prisma.platform.deleteMany();
        await database_1.prisma.user.deleteMany();
        logger_1.logger.info('Database reset completed');
    }
    catch (error) {
        logger_1.logger.error('Failed to reset database', error);
        throw error;
    }
}
async function getDatabaseStats() {
    try {
        const [users, platforms, agents, tasks, workflows, systemLogs] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.platform.count(),
            database_1.prisma.agent.count(),
            database_1.prisma.task.count(),
            database_1.prisma.workflow.count(),
            database_1.prisma.systemLog.count(),
        ]);
        return {
            users,
            platforms,
            agents,
            tasks,
            workflows,
            systemLogs,
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to get database statistics', error);
        throw error;
    }
}
async function validateDatabaseSchema() {
    const errors = [];
    try {
        await database_1.prisma.user.findFirst();
        await database_1.prisma.platform.findFirst();
        await database_1.prisma.agent.findFirst();
        await database_1.prisma.task.findFirst();
        await database_1.prisma.workflow.findFirst();
        await database_1.prisma.user.findFirst({
            include: { createdWorkflows: true }
        });
        await database_1.prisma.agent.findFirst({
            include: { tasks: true }
        });
        await database_1.prisma.platform.findFirst({
            include: { agents: true }
        });
        logger_1.logger.info('Database schema validation completed successfully');
        return { isValid: true, errors: [] };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(errorMessage);
        logger_1.logger.error('Database schema validation failed', error);
        return { isValid: false, errors };
    }
}
async function createTestData() {
    try {
        logger_1.logger.info('Creating test data...');
        await database_1.prisma.user.upsert({
            where: { email: 'test@cubcen.com' },
            update: {},
            create: {
                email: 'test@cubcen.com',
                password: 'test123',
                role: 'ADMIN',
                name: 'Test User',
            },
        });
        const testPlatform = await database_1.prisma.platform.upsert({
            where: { name_type: { name: 'Test Platform', type: 'N8N' } },
            update: {},
            create: {
                name: 'Test Platform',
                type: 'N8N',
                baseUrl: 'http://localhost:5678',
                status: 'CONNECTED',
                authConfig: JSON.stringify({ apiKey: 'test-key' }),
            },
        });
        await database_1.prisma.agent.upsert({
            where: { platformId_externalId: { platformId: testPlatform.id, externalId: 'test-agent-001' } },
            update: {},
            create: {
                name: 'Test Agent',
                platformId: testPlatform.id,
                externalId: 'test-agent-001',
                status: 'ACTIVE',
                capabilities: JSON.stringify(['test', 'automation']),
                configuration: JSON.stringify({ testMode: true }),
                healthStatus: JSON.stringify({ status: 'healthy' }),
                description: 'Test agent for development',
            },
        });
        logger_1.logger.info('Test data created successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to create test data', error);
        throw error;
    }
}
//# sourceMappingURL=database-utils.js.map