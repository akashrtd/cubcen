"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const logger_1 = require("@/lib/logger");
const database_1 = require("@/lib/database");
const PORT = process.env.PORT || 3001;
async function startServer() {
    try {
        await database_1.prisma.$connect();
        logger_1.logger.info('Database connection established');
        const server = server_1.default.listen(PORT, () => {
            logger_1.logger.info(`Cubcen server started successfully`, {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version
            });
        });
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}, shutting down gracefully`);
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