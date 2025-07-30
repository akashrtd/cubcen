"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_1 = __importDefault(require("../../lib/health"));
const logger_1 = __importDefault(require("../../lib/logger"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const healthStatus = await health_1.default.runAllHealthChecks();
        const statusCode = healthStatus.status === 'healthy' ? 200 :
            healthStatus.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json({
            success: true,
            data: healthStatus
        });
    }
    catch (error) {
        logger_1.default.error('Health check endpoint failed', error, {
            endpoint: '/health'
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'HEALTH_CHECK_FAILED',
                message: 'Failed to perform health check',
                details: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
});
router.get('/live', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '0.1.0'
        }
    });
});
router.get('/ready', async (req, res) => {
    try {
        const databaseCheck = await health_1.default.checkDatabase();
        const memoryCheck = await health_1.default.checkMemory();
        const isReady = databaseCheck.status !== 'unhealthy' &&
            memoryCheck.status !== 'unhealthy';
        const statusCode = isReady ? 200 : 503;
        res.status(statusCode).json({
            success: true,
            data: {
                status: isReady ? 'ready' : 'not_ready',
                timestamp: new Date().toISOString(),
                checks: {
                    database: databaseCheck.status,
                    memory: memoryCheck.status
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Readiness check failed', error, {
            endpoint: '/health/ready'
        });
        res.status(503).json({
            success: false,
            error: {
                code: 'READINESS_CHECK_FAILED',
                message: 'Application is not ready',
                details: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
});
router.get('/checks/:name', async (req, res) => {
    const { name } = req.params;
    try {
        let check;
        switch (name) {
            case 'database':
                check = await health_1.default.checkDatabase();
                break;
            case 'memory':
                check = await health_1.default.checkMemory();
                break;
            case 'disk':
                check = await health_1.default.checkDiskSpace();
                break;
            case 'application':
                check = await health_1.default.checkApplication();
                break;
            default:
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'HEALTH_CHECK_NOT_FOUND',
                        message: `Health check '${name}' not found`,
                        availableChecks: ['database', 'memory', 'disk', 'application']
                    }
                });
        }
        if (!check) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'HEALTH_CHECK_NOT_FOUND',
                    message: `Health check '${name}' not found`
                }
            });
        }
        const statusCode = check.status === 'healthy' ? 200 :
            check.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json({
            success: true,
            data: check
        });
    }
    catch (error) {
        logger_1.default.error(`Health check '${name}' failed`, error, {
            endpoint: `/health/checks/${name}`,
            checkName: name
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'HEALTH_CHECK_FAILED',
                message: `Failed to perform health check '${name}'`,
                details: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
});
router.get('/metrics', async (req, res) => {
    try {
        const metrics = await health_1.default.collectSystemMetrics();
        res.status(200).json({
            success: true,
            data: metrics
        });
    }
    catch (error) {
        logger_1.default.error('Metrics collection failed', error, {
            endpoint: '/health/metrics'
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'METRICS_COLLECTION_FAILED',
                message: 'Failed to collect system metrics',
                details: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
});
router.get('/metrics/history', (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const history = health_1.default.getMetricsHistory(limit);
        res.status(200).json({
            success: true,
            data: {
                metrics: history,
                count: history.length,
                limit: limit || 'none'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Metrics history retrieval failed', error, {
            endpoint: '/health/metrics/history'
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'METRICS_HISTORY_FAILED',
                message: 'Failed to retrieve metrics history',
                details: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.js.map