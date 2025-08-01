"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const server_1 = __importDefault(require("./server"));
const logger_1 = require("@/lib/logger");
const database_1 = require("@/lib/database");
const websocket_1 = require("@/services/websocket");
const agent_1 = require("@/services/agent");
const task_1 = require("@/services/task");
const workflow_1 = require("@/services/workflow");
const adapter_factory_1 = require("@/backend/adapters/adapter-factory");
const tasks_1 = require("@/backend/routes/tasks");
const workflows_1 = require("@/backend/routes/workflows");
const backup_1 = require("@/lib/backup");
const config_1 = __importDefault(require("@/lib/config"));
const PORT = process.env.PORT || 3001;
async function startServer() {
    try {
        await database_1.prisma.$connect();
        logger_1.logger.info('Database connection established');
        const httpServer = (0, http_1.createServer)(server_1.default);
        const adapterManager = new adapter_factory_1.AdapterManager();
        const agentService = new agent_1.AgentService(adapterManager);
        const webSocketService = (0, websocket_1.initializeWebSocketService)(httpServer, agentService);
        const taskService = new task_1.TaskService(adapterManager, webSocketService);
        const workflowService = new workflow_1.WorkflowService(adapterManager, taskService, webSocketService);
        agentService.setWebSocketService(webSocketService);
        (0, tasks_1.initializeTaskService)(adapterManager, webSocketService);
        server_1.default.use('/api/cubcen/v1/workflows', (0, workflows_1.createWorkflowRoutes)(workflowService));
        const backupConfig = config_1.default.getBackupConfig();
        if (backupConfig.enabled) {
            backup_1.scheduledBackupService.start();
            logger_1.logger.info('Scheduled backup service started', {
                intervalHours: backupConfig.intervalHours,
                retentionDays: backupConfig.retentionDays
            });
        }
        logger_1.logger.info('Services initialized', {
            webSocket: true,
            agentService: true,
            taskService: true,
            workflowService: true,
            scheduledBackup: backupConfig.enabled
        });
        const server = httpServer.listen(PORT, () => {
            logger_1.logger.info(`Cubcen server started successfully`, {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                websocket: true
            });
        });
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}, shutting down gracefully`);
            try {
                backup_1.scheduledBackupService.stop();
                logger_1.logger.info('Scheduled backup service stopped');
            }
            catch (error) {
                logger_1.logger.error('Error stopping scheduled backup service', error);
            }
            try {
                await workflowService.cleanup();
                logger_1.logger.info('Workflow service cleaned up');
            }
            catch (error) {
                logger_1.logger.error('Error cleaning up workflow service', error);
            }
            try {
                await taskService.cleanup();
                logger_1.logger.info('Task service cleaned up');
            }
            catch (error) {
                logger_1.logger.error('Error cleaning up task service', error);
            }
            try {
                await agentService.cleanup();
                logger_1.logger.info('Agent service cleaned up');
            }
            catch (error) {
                logger_1.logger.error('Error cleaning up agent service', error);
            }
            try {
                await webSocketService.shutdown();
                logger_1.logger.info('WebSocket service closed');
            }
            catch (error) {
                logger_1.logger.error('Error closing WebSocket service', error);
            }
            server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                try {
                    await database_1.prisma.$disconnect();
                    logger_1.logger.info('Database connection closed');
                }
                catch (error) {
                    logger_1.logger.error('Error closing database connection', error);
                }
                process.exit(0);
            });
            setTimeout(() => {
                logger_1.logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', error);
        process.exit(1);
    }
}
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled promise rejection', new Error(String(reason)), {
        promise: promise.toString()
    });
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception', error);
    process.exit(1);
});
startServer();
//# sourceMappingURL=index.js.map