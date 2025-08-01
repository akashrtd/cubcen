"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_1 = require("@/services/error");
const health_1 = require("@/lib/health");
const logger_1 = require("@/lib/logger");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const errorService = new error_1.ErrorService();
const errorFilterSchema = zod_1.z.object({
    level: zod_1.z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']).optional(),
    source: zod_1.z.string().optional(),
    agentId: zod_1.z.string().optional(),
    taskId: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.string().regex(/^\d+$/).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).optional()
});
const timeRangeSchema = zod_1.z.object({
    from: zod_1.z.string().datetime(),
    to: zod_1.z.string().datetime()
});
const bulkRetrySchema = zod_1.z.object({
    taskIds: zod_1.z.array(zod_1.z.string().min(1)).min(1).max(50)
});
router.get('/logs', async (req, res) => {
    try {
        const validatedQuery = errorFilterSchema.parse(req.query);
        const filter = {
            ...(validatedQuery.level && { level: validatedQuery.level }),
            ...(validatedQuery.source && { source: validatedQuery.source }),
            ...(validatedQuery.agentId && { agentId: validatedQuery.agentId }),
            ...(validatedQuery.taskId && { taskId: validatedQuery.taskId }),
            ...(validatedQuery.dateFrom && { dateFrom: new Date(validatedQuery.dateFrom) }),
            ...(validatedQuery.dateTo && { dateTo: new Date(validatedQuery.dateTo) }),
            ...(validatedQuery.search && { search: validatedQuery.search })
        };
        const page = validatedQuery.page ? parseInt(validatedQuery.page) : 1;
        const limit = validatedQuery.limit ? parseInt(validatedQuery.limit) : 50;
        const result = await errorService.getErrorLogs({
            filter,
            page,
            limit,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });
        res.json(result);
    }
    catch (error) {
        logger_1.logger.error('Failed to get error logs', error, {
            query: req.query,
            endpoint: '/errors/logs'
        });
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Invalid query parameters',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'Failed to fetch error logs'
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const defaultTimeRange = {
            from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString()
        };
        const timeRangeQuery = {
            from: req.query.from || defaultTimeRange.from,
            to: req.query.to || defaultTimeRange.to
        };
        const validatedTimeRange = timeRangeSchema.parse(timeRangeQuery);
        const timeRange = {
            from: new Date(validatedTimeRange.from),
            to: new Date(validatedTimeRange.to)
        };
        const stats = await errorService.getErrorStats(timeRange);
        res.json({ stats });
    }
    catch (error) {
        logger_1.logger.error('Failed to get error statistics', error, {
            query: req.query,
            endpoint: '/errors/stats'
        });
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Invalid time range parameters',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'Failed to fetch error statistics'
        });
    }
});
router.get('/patterns', async (req, res) => {
    try {
        const defaultTimeRange = {
            from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString()
        };
        const timeRangeQuery = {
            from: req.query.from || defaultTimeRange.from,
            to: req.query.to || defaultTimeRange.to
        };
        const validatedTimeRange = timeRangeSchema.parse(timeRangeQuery);
        const timeRange = {
            from: new Date(validatedTimeRange.from),
            to: new Date(validatedTimeRange.to)
        };
        const patterns = await errorService.detectErrorPatterns(timeRange);
        res.json({ patterns });
    }
    catch (error) {
        logger_1.logger.error('Failed to detect error patterns', error, {
            query: req.query,
            endpoint: '/errors/patterns'
        });
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Invalid time range parameters',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'Failed to detect error patterns'
        });
    }
});
router.get('/retryable-tasks', async (req, res) => {
    try {
        const tasks = await errorService.getRetryableTasks();
        res.json({ tasks });
    }
    catch (error) {
        logger_1.logger.error('Failed to get retryable tasks', error, {
            endpoint: '/errors/retryable-tasks'
        });
        res.status(500).json({
            error: 'Failed to fetch retryable tasks'
        });
    }
});
router.post('/retry-task/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        if (!taskId) {
            return res.status(400).json({
                error: 'Task ID is required'
            });
        }
        await errorService.retryTask(taskId);
        res.json({
            message: 'Task retry initiated successfully',
            taskId
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to retry task', error, {
            taskId: req.params.taskId,
            endpoint: '/errors/retry-task'
        });
        res.status(500).json({
            error: error.message || 'Failed to retry task'
        });
    }
});
router.post('/bulk-retry-tasks', async (req, res) => {
    try {
        const validatedBody = bulkRetrySchema.parse(req.body);
        const result = await errorService.bulkRetryTasks(validatedBody.taskIds);
        res.json(result);
    }
    catch (error) {
        logger_1.logger.error('Failed to bulk retry tasks', error, {
            body: req.body,
            endpoint: '/errors/bulk-retry-tasks'
        });
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request body',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'Failed to retry tasks'
        });
    }
});
router.get('/health/indicators', async (req, res) => {
    try {
        const healthStatus = await health_1.healthMonitoring.runAllHealthChecks();
        const indicators = healthStatus.checks.map(check => ({
            name: check.name,
            status: check.status,
            value: check.details?.value || check.responseTime,
            threshold: check.details?.threshold,
            unit: check.details?.unit || (check.responseTime ? 'ms' : undefined),
            lastCheck: check.lastCheck,
            details: check.details,
            trend: check.details?.trend || 'stable'
        }));
        res.json({
            indicators,
            overallStatus: healthStatus.status,
            timestamp: healthStatus.timestamp
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get health indicators', error, {
            endpoint: '/health/indicators'
        });
        res.status(500).json({
            error: 'Failed to fetch health indicators'
        });
    }
});
exports.default = router;
//# sourceMappingURL=errors.js.map