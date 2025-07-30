"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("@/lib/logger");
const auth_1 = __importDefault(require("@/backend/routes/auth"));
const agents_1 = __importDefault(require("@/backend/routes/agents"));
const platforms_1 = __importDefault(require("@/backend/routes/platforms"));
const tasks_1 = __importDefault(require("@/backend/routes/tasks"));
const users_1 = __importDefault(require("@/backend/routes/users"));
const health_1 = __importDefault(require("@/backend/routes/health"));
async function createTestApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use('/api/cubcen/v1/auth', auth_1.default);
    app.use('/api/cubcen/v1/agents', agents_1.default);
    app.use('/api/cubcen/v1/platforms', platforms_1.default);
    app.use('/api/cubcen/v1/tasks', tasks_1.default);
    app.use('/api/cubcen/v1/users', users_1.default);
    app.use('/health', health_1.default);
    app.use((error, req, res, next) => {
        logger_1.logger.error('Unhandled error in test app', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    });
    return app;
}
//# sourceMappingURL=test-helpers.js.map