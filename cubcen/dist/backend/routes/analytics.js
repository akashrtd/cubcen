"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_1 = require("@/services/analytics");
const logger_1 = require("@/lib/logger");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
const exportSchema = zod_1.z.object({
    format: zod_1.z.enum(['csv', 'json']),
    dataType: zod_1.z.enum(['overview', 'agents', 'tasks', 'trends', 'errors']).optional(),
});
router.get('/', async (req, res) => {
    try {
        const query = dateRangeSchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid date range parameters',
                    details: query.error.errors,
                },
            });
        }
        let dateRange;
        if (query.data.startDate || query.data.endDate) {
            dateRange = {
                startDate: query.data.startDate ? new Date(query.data.startDate) : new Date(0),
                endDate: query.data.endDate ? new Date(query.data.endDate) : new Date(),
            };
        }
        const analyticsData = await analytics_1.analyticsService.getAnalyticsData(dateRange);
        res.json({
            success: true,
            data: analyticsData,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get analytics data', error);
        res.status(500).json({
            error: {
                code: 'ANALYTICS_ERROR',
                message: 'Failed to retrieve analytics data',
                timestamp: new Date().toISOString(),
            },
        });
    }
});
router.get('/kpis', async (req, res) => {
    try {
        const query = dateRangeSchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid date range parameters',
                    details: query.error.errors,
                },
            });
        }
        let dateRange;
        if (query.data.startDate || query.data.endDate) {
            dateRange = {
                startDate: query.data.startDate ? new Date(query.data.startDate) : new Date(0),
                endDate: query.data.endDate ? new Date(query.data.endDate) : new Date(),
            };
        }
        const analyticsData = await analytics_1.analyticsService.getAnalyticsData(dateRange);
        const kpis = {
            totalAgents: analyticsData.totalAgents,
            activeAgents: analyticsData.activeAgents,
            totalTasks: analyticsData.totalTasks,
            completedTasks: analyticsData.completedTasks,
            failedTasks: analyticsData.failedTasks,
            successRate: analyticsData.successRate,
            averageResponseTime: analyticsData.averageResponseTime,
        };
        res.json({
            success: true,
            data: kpis,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get KPI data', error);
        res.status(500).json({
            error: {
                code: 'ANALYTICS_ERROR',
                message: 'Failed to retrieve KPI data',
                timestamp: new Date().toISOString(),
            },
        });
    }
});
router.post('/export', async (req, res) => {
    try {
        const body = exportSchema.safeParse(req.body);
        if (!body.success) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid export parameters',
                    details: body.error.errors,
                },
            });
        }
        const { format, dataType = 'overview' } = body.data;
        const query = dateRangeSchema.safeParse(req.query);
        let dateRange;
        if (query.success && (query.data.startDate || query.data.endDate)) {
            dateRange = {
                startDate: query.data.startDate ? new Date(query.data.startDate) : new Date(0),
                endDate: query.data.endDate ? new Date(query.data.endDate) : new Date(),
            };
        }
        const analyticsData = await analytics_1.analyticsService.getAnalyticsData(dateRange);
        let exportData;
        switch (dataType) {
            case 'agents':
                exportData = analyticsData.agentPerformance;
                break;
            case 'tasks':
                exportData = {
                    tasksByStatus: analyticsData.tasksByStatus,
                    tasksByPriority: analyticsData.tasksByPriority,
                };
                break;
            case 'trends':
                exportData = analyticsData.dailyTaskTrends;
                break;
            case 'errors':
                exportData = analyticsData.errorPatterns;
                break;
            default:
                exportData = analyticsData;
        }
        const exportedData = await analytics_1.analyticsService.exportData(exportData, format);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `cubcen-analytics-${dataType}-${timestamp}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.send(exportedData);
    }
    catch (error) {
        logger_1.logger.error('Failed to export analytics data', error);
        res.status(500).json({
            error: {
                code: 'EXPORT_ERROR',
                message: 'Failed to export analytics data',
                timestamp: new Date().toISOString(),
            },
        });
    }
});
router.get('/trends', async (req, res) => {
    try {
        const query = dateRangeSchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid date range parameters',
                    details: query.error.errors,
                },
            });
        }
        let dateRange;
        if (query.data.startDate || query.data.endDate) {
            dateRange = {
                startDate: query.data.startDate ? new Date(query.data.startDate) : new Date(0),
                endDate: query.data.endDate ? new Date(query.data.endDate) : new Date(),
            };
        }
        const analyticsData = await analytics_1.analyticsService.getAnalyticsData(dateRange);
        res.json({
            success: true,
            data: {
                dailyTrends: analyticsData.dailyTaskTrends,
                tasksByStatus: analyticsData.tasksByStatus,
                tasksByPriority: analyticsData.tasksByPriority,
                platformDistribution: analyticsData.platformDistribution,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get trend data', error);
        res.status(500).json({
            error: {
                code: 'ANALYTICS_ERROR',
                message: 'Failed to retrieve trend data',
                timestamp: new Date().toISOString(),
            },
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map