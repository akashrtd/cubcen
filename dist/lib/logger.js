"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.winstonLogger = exports.structuredLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
};
const logColors = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
};
winston_1.default.addColors(logColors);
const logsDir = path_1.default.join(process.cwd(), 'logs');
exports.logger = winston_1.default.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'cubcen.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'exceptions.log'),
        }),
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'rejections.log'),
        }),
    ],
});
exports.winstonLogger = exports.logger;
exports.structuredLogger = {
    debug(message, context) {
        exports.logger.debug(message, context);
    },
    info(message, context) {
        exports.logger.info(message, context);
    },
    warn(message, context) {
        exports.logger.warn(message, context);
    },
    error(message, error, context) {
        const logData = {
            ...context,
            ...(error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }),
        };
        exports.logger.error(message, logData);
    },
    fatal(message, error, context) {
        const logData = {
            ...context,
            ...(error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }),
        };
        exports.logger.log('fatal', message, logData);
    },
};
exports.default = exports.structuredLogger;
//# sourceMappingURL=logger.js.map