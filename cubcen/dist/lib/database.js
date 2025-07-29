"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.disconnectDatabase = disconnectDatabase;
exports.withTransaction = withTransaction;
const prisma_1 = require("../generated/prisma");
const logger_1 = require("./logger");
function createPrismaClient() {
    return new prisma_1.PrismaClient({
        log: [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'info', emit: 'event' },
            { level: 'warn', emit: 'event' },
        ],
    });
}
exports.prisma = globalThis.__prisma || createPrismaClient();
if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = exports.prisma;
}
async function checkDatabaseHealth() {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        const userCount = await exports.prisma.user.count();
        const agentCount = await exports.prisma.agent.count();
        const taskCount = await exports.prisma.task.count();
        const platformCount = await exports.prisma.platform.count();
        return {
            status: 'healthy',
            details: {
                connected: true,
                userCount,
                agentCount,
                taskCount,
                platformCount,
                lastChecked: new Date().toISOString(),
            },
        };
    }
    catch (error) {
        logger_1.logger.error('Database health check failed', error);
        return {
            status: 'unhealthy',
            details: {
                connected: false,
                error: error.message,
                lastChecked: new Date().toISOString(),
            },
        };
    }
}
async function disconnectDatabase() {
    try {
        await exports.prisma.$disconnect();
        logger_1.logger.info('Database disconnected successfully');
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from database', error);
        throw error;
    }
}
async function withTransaction(callback) {
    try {
        return await exports.prisma.$transaction(callback);
    }
    catch (error) {
        logger_1.logger.error('Database transaction failed', error);
        throw error;
    }
}
//# sourceMappingURL=database.js.map