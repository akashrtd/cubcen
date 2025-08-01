"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const logger_1 = require("@/lib/logger");
const performance_monitor_1 = require("@/lib/performance-monitor");
const database_performance_1 = require("@/lib/database-performance");
const cache_1 = require("@/lib/cache");
const benchmark_1 = require("@/lib/benchmark");
const auth_1 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
const benchmarkSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    iterations: zod_1.z.number().min(1).max(10000).optional(),
});
const loadTestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    duration: zod_1.z.number().min(1000).max(300000),
    concurrency: zod_1.z.number().min(1).max(100),
    rampUpTime: zod_1.z.number().min(0).optional(),
    warmupRuns: zod_1.z.number().min(0).max(100).optional(),
});
const metricsQuerySchema = zod_1.z.object({
    metric: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(1000).optional(),
});
router.get('/metrics', async (req, res) => {
    try {
        const stats = await performance_monitor_1.performanceMonitor.getCurrentStats();
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get performance metrics', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve performance metrics',
        });
    }
});
router.get('/metrics/history', (0, validation_1.validateRequest)(metricsQuerySchema, 'query'), async (req, res) => {
    try {
        const { metric, startDate, endDate, limit } = req.query;
        const timeRange = startDate && endDate ? {
            start: new Date(startDate),
            end: new Date(endDate),
        } : undefined;
        const metrics = performance_monitor_1.performanceMonitor.getMetrics(metric, timeRange);
        const limitedMetrics = limit ? metrics.slice(-limit) : metrics;
        res.json({
            success: true,
            data: limitedMetrics,
            meta: {
                total: metrics.length,
                returned: limitedMetrics.length,
                metric,
                timeRange,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get metrics history', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve metrics history',
        });
    }
});
router.get('/alerts', async (req, res) => {
    try {
        const alerts = performance_monitor_1.performanceMonitor.getActiveAlerts();
        res.json({
            success: true,
            data: alerts,
            count: alerts.length,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get performance alerts', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve performance alerts',
        });
    }
});
router.post('/alerts/:alertId/resolve', async (req, res) => {
    try {
        const { alertId } = req.params;
        const resolved = performance_monitor_1.performanceMonitor.resolveAlert(alertId);
        if (resolved) {
            res.json({
                success: true,
                message: 'Alert resolved successfully',
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Alert not found',
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to resolve alert', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resolve alert',
        });
    }
});
router.get('/database', async (req, res) => {
    try {
        const stats = await database_performance_1.dbPerformanceMonitor.getPerformanceStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get database performance stats', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve database performance statistics',
        });
    }
});
router.post('/database/optimize', async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin role required for database optimization',
            });
        }
        await database_performance_1.DatabaseOptimizer.createOptimalIndexes();
        const analysis = await database_performance_1.DatabaseOptimizer.analyzePerformance();
        res.json({
            success: true,
            message: 'Database optimization completed',
            data: analysis,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to optimize database', error);
        res.status(500).json({
            success: false,
            error: 'Failed to optimize database',
        });
    }
});
router.get('/cache', async (req, res) => {
    try {
        const stats = cache_1.cache.getStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get cache stats', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve cache statistics',
        });
    }
});
router.post('/cache/clear', async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin role required for cache operations',
            });
        }
        cache_1.cache.clear();
        res.json({
            success: true,
            message: 'Cache cleared successfully',
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to clear cache', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cache',
        });
    }
});
router.post('/benchmark', (0, validation_1.validateRequest)(benchmarkSchema), async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin role required for performance benchmarks',
            });
        }
        const { name, iterations = 100 } = req.body;
        let result;
        switch (name) {
            case 'database':
                result = await benchmark_1.Benchmark.benchmarkDatabase();
                break;
            case 'cache':
                result = await benchmark_1.Benchmark.benchmarkCache();
                break;
            case 'api':
                result = await benchmark_1.Benchmark.benchmarkAPI();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid benchmark name. Use: database, cache, or api',
                });
        }
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to run benchmark', error);
        res.status(500).json({
            success: false,
            error: 'Failed to run benchmark',
        });
    }
});
router.post('/load-test', (0, validation_1.validateRequest)(loadTestSchema), async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin role required for load tests',
            });
        }
        const { name, duration, concurrency, rampUpTime, warmupRuns } = req.body;
        let result;
        switch (name) {
            case 'database':
                result = await benchmark_1.LoadTester.testDatabase(duration, concurrency);
                break;
            case 'cache':
                result = await benchmark_1.LoadTester.testCache(duration, concurrency);
                break;
            case 'memory':
                result = await benchmark_1.LoadTester.testMemory(duration, concurrency);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid load test name. Use: database, cache, or memory',
                });
        }
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to run load test', error);
        res.status(500).json({
            success: false,
            error: 'Failed to run load test',
        });
    }
});
router.post('/test-suite', async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin role required for performance test suite',
            });
        }
        const result = await benchmark_1.PerformanceTestSuite.runAll();
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to run performance test suite', error);
        res.status(500).json({
            success: false,
            error: 'Failed to run performance test suite',
        });
    }
});
router.post('/monitoring/start', async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin role required for monitoring control',
            });
        }
        performance_monitor_1.performanceMonitor.startMonitoring();
        res.json({
            success: true,
            message: 'Performance monitoring started',
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start performance monitoring', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start performance monitoring',
        });
    }
});
router.post('/monitoring/stop', async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin role required for monitoring control',
            });
        }
        performance_monitor_1.performanceMonitor.stopMonitoring();
        res.json({
            success: true,
            message: 'Performance monitoring stopped',
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to stop performance monitoring', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stop performance monitoring',
        });
    }
});
exports.default = router;
//# sourceMappingURL=performance.js.map