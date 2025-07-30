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
const adapter_factory_1 = require("@/backend/adapters/adapter-factory");
const PORT = process.env.PORT || 3001;
async function startServer() {
    try {
        await database_1.prisma.$connect();
        logger_1.logger.info('Database connection established');
        const httpServer = (0, http_1.createServer)(server_1.default);
        const adapterManager = new adapter_factory_1.AdapterManager();
        const agentService = new agent_1.AgentService(adapterManager);
        const webSocketService = (0, websocket_1.initializeWebSocketService)(httpServer, agentService);
        agentService.setWebSocketService(webSocketService);
        logger_1.logger.info('WebSocket service initialized with agent integration');
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