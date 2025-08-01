"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const database_1 = require("@/lib/database");
const logger_1 = require("@/lib/logger");
const cache_1 = require("@/lib/cache");
const database_performance_1 = require("@/lib/database-performance");
const pagination_1 = require("@/lib/pagination");
class AnalyticsService {
    async getAnalyticsData(dateRange) {
        const cacheKey = cache_1.AnalyticsCache.getCacheKey('analytics-data', { dateRange });
        return cache_1.AnalyticsCache.getOrSet(cacheKey, async () => {
            try {
                const whereClause = dateRange
                    ? {
                        createdAt: {
                            gte: dateRange.startDate,
                            lte: dateRange.endDate,
                        },
                    }
                    : {};
                const taskStats = await database_performance_1.OptimizedQueries.getTaskStatistics(undefined, dateRange);
                const [totalAgents, activeAgents] = await Promise.all([
                    database_1.prisma.agent.count(),
                    database_1.prisma.agent.count({ where: { status: 'ACTIVE' } }),
                ]);
                const totalTasks = taskStats.totalCount;
                const completedTasks = taskStats.statusStats.find(s => s.status === 'COMPLETED')?._count.status || 0;
                const failedTasks = taskStats.statusStats.find(s => s.status === 'FAILED')?._count.status || 0;
                const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                const tasksByStatus = taskStats.statusStats.map(item => ({
                    status: item.status,
                    count: item._count.status,
                }));
                const tasksByPriority = taskStats.priorityStats.map(item => ({
                    priority: item.priority,
                    count: item._count.priority,
                }));
                const agentPerformance = await this.getAgentPerformance(dateRange);
                const platformDistribution = await this.getPlatformDistribution();
                const dailyTaskTrends = await this.getDailyTaskTrends(dateRange);
                const errorPatterns = await this.getErrorPatterns(dateRange);
                const healthMetrics = await database_performance_1.OptimizedQueries.getAgentHealthMetrics();
                const averageResponseTime = healthMetrics.length > 0
                    ? healthMetrics.reduce((sum, h) => sum + (h.responseTime || 0), 0) / healthMetrics.length
                    : 0;
                return {
                    totalAgents,
                    activeAgents,
                    totalTasks,
                    completedTasks,
                    failedTasks,
                    successRate: Math.round(successRate * 100) / 100,
                    averageResponseTime: Math.round(averageResponseTime),
                    tasksByStatus,
                    tasksByPriority,
                    agentPerformance,
                    platformDistribution,
                    dailyTaskTrends,
                    errorPatterns,
                };
            }
            catch (error) {
                logger_1.logger.error('Failed to get analytics data', error);
                throw new Error('Failed to retrieve analytics data');
            }
        }, 10 * 60 * 1000);
    }
    async getAgentPerformance(dateRange) {
        const whereClause = dateRange
            ? {
                createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
            }
            : {};
        const agentTasks = await database_1.prisma.task.groupBy({
            by: ['agentId'],
            where: whereClause,
            _count: { id: true },
        });
        const agentSuccessRates = await database_1.prisma.task.groupBy({
            by: ['agentId'],
            where: { ...whereClause, status: 'COMPLETED' },
            _count: { id: true },
        });
        const agents = await database_1.prisma.agent.findMany({
            where: {
                id: { in: agentTasks.map((task) => task.agentId) },
            },
            select: { id: true, name: true },
        });
        const agentHealthData = await database_1.prisma.agentHealth.groupBy({
            by: ['agentId'],
            where: dateRange
                ? {
                    lastCheckAt: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate,
                    },
                }
                : {},
            _avg: { responseTime: true },
        });
        return agentTasks.map((agentTask) => {
            const agent = agents.find((a) => a.id === agentTask.agentId);
            const successCount = agentSuccessRates.find((a) => a.agentId === agentTask.agentId)?._count.id || 0;
            const successRate = (successCount / agentTask._count.id) * 100;
            const healthData = agentHealthData.find((h) => h.agentId === agentTask.agentId);
            return {
                agentId: agentTask.agentId,
                agentName: agent?.name || 'Unknown Agent',
                totalTasks: agentTask._count.id,
                successRate: Math.round(successRate * 100) / 100,
                averageResponseTime: Math.round(healthData?._avg.responseTime || 0),
            };
        });
    }
    async getPlatformDistribution() {
        const platformData = await database_1.prisma.agent.groupBy({
            by: ['platformId'],
            _count: { id: true },
        });
        const platforms = await database_1.prisma.platform.findMany({
            where: {
                id: { in: platformData.map((p) => p.platformId) },
            },
            select: { id: true, name: true, type: true },
        });
        return platformData.map((item) => {
            const platform = platforms.find((p) => p.id === item.platformId);
            return {
                platform: platform ? `${platform.name} (${platform.type})` : 'Unknown Platform',
                count: item._count.id,
            };
        });
    }
    async getDailyTaskTrends(dateRange) {
        const endDate = dateRange?.endDate || new Date();
        const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const completedTasks = await database_1.prisma.task.findMany({
            where: {
                status: 'COMPLETED',
                completedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { completedAt: true },
        });
        const failedTasks = await database_1.prisma.task.findMany({
            where: {
                status: 'FAILED',
                completedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { completedAt: true },
        });
        const dailyData = new Map();
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dailyData.set(dateStr, { completed: 0, failed: 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        completedTasks.forEach((task) => {
            if (task.completedAt) {
                const dateStr = task.completedAt.toISOString().split('T')[0];
                const existing = dailyData.get(dateStr);
                if (existing) {
                    existing.completed++;
                }
            }
        });
        failedTasks.forEach((task) => {
            if (task.completedAt) {
                const dateStr = task.completedAt.toISOString().split('T')[0];
                const existing = dailyData.get(dateStr);
                if (existing) {
                    existing.failed++;
                }
            }
        });
        return Array.from(dailyData.entries()).map(([date, data]) => ({
            date,
            completed: data.completed,
            failed: data.failed,
        }));
    }
    async getErrorPatterns(dateRange) {
        const whereClause = dateRange
            ? {
                createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
            }
            : {};
        const failedTasks = await database_1.prisma.task.findMany({
            where: {
                ...whereClause,
                status: 'FAILED',
                error: { not: null },
            },
            select: { error: true },
        });
        const errorCounts = new Map();
        failedTasks.forEach((task) => {
            if (task.error) {
                try {
                    const errorData = JSON.parse(task.error);
                    const errorMessage = errorData.message || errorData.error || 'Unknown error';
                    const count = errorCounts.get(errorMessage) || 0;
                    errorCounts.set(errorMessage, count + 1);
                }
                catch {
                    const count = errorCounts.get('Parse error') || 0;
                    errorCounts.set('Parse error', count + 1);
                }
            }
        });
        return Array.from(errorCounts.entries())
            .map(([error, count]) => ({ error, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    async exportData(data, format) {
        try {
            if (format === 'json') {
                return JSON.stringify(data, null, 2);
            }
            else if (format === 'csv') {
                return this.convertToCSV(data);
            }
            throw new Error('Unsupported export format');
        }
        catch (error) {
            logger_1.logger.error('Failed to export analytics data', error);
            throw new Error('Failed to export data');
        }
    }
    convertToCSV(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data for CSV conversion');
        }
        if (Array.isArray(data)) {
            if (data.length === 0)
                return '';
            const headers = Object.keys(data[0]);
            const csvRows = [headers.join(',')];
            data.forEach((row) => {
                const values = headers.map((header) => {
                    const value = row[header];
                    return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
                });
                csvRows.push(values.join(','));
            });
            return csvRows.join('\n');
        }
        else {
            const csvRows = ['Key,Value'];
            Object.entries(data).forEach(([key, value]) => {
                const csvValue = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
                csvRows.push(`"${key}",${csvValue}`);
            });
            return csvRows.join('\n');
        }
    }
    async getAgentPerformancePaginated(page = 1, limit = 20, dateRange, sortBy = 'totalTasks', sortOrder = 'desc') {
        const params = pagination_1.PaginationHelper.validateParams({ page, limit, sortBy, sortOrder });
        const offset = pagination_1.PaginationHelper.calculateOffset(params.page, params.limit);
        const whereClause = dateRange
            ? {
                createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
            }
            : {};
        const totalAgents = await database_1.prisma.agent.count();
        const agents = await database_1.prisma.agent.findMany({
            skip: offset,
            take: params.limit,
            include: {
                tasks: {
                    where: whereClause,
                    select: {
                        status: true,
                        createdAt: true,
                        completedAt: true,
                        startedAt: true,
                    },
                },
                _count: {
                    select: {
                        tasks: {
                            where: whereClause,
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        const agentPerformance = agents.map(agent => {
            const totalTasks = agent._count.tasks;
            const completedTasks = agent.tasks.filter(t => t.status === 'COMPLETED').length;
            const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const completedTasksWithTimes = agent.tasks.filter(t => t.status === 'COMPLETED' && t.startedAt && t.completedAt);
            const averageResponseTime = completedTasksWithTimes.length > 0
                ? completedTasksWithTimes.reduce((sum, task) => {
                    const responseTime = task.completedAt.getTime() - task.startedAt.getTime();
                    return sum + responseTime;
                }, 0) / completedTasksWithTimes.length
                : 0;
            return {
                agentId: agent.id,
                agentName: agent.name,
                totalTasks,
                successRate: Math.round(successRate * 100) / 100,
                averageResponseTime: Math.round(averageResponseTime),
            };
        });
        agentPerformance.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        });
        return pagination_1.PaginationHelper.createResult(agentPerformance, totalAgents, params);
    }
    async getTaskHistoryPaginated(page = 1, limit = 50, agentId, status, dateRange) {
        const params = pagination_1.PaginationHelper.validateParams({ page, limit });
        const offset = pagination_1.PaginationHelper.calculateOffset(params.page, params.limit);
        const whereClause = {};
        if (agentId)
            whereClause.agentId = agentId;
        if (status)
            whereClause.status = status;
        if (dateRange) {
            whereClause.createdAt = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const [tasks, total] = await Promise.all([
            database_1.prisma.task.findMany({
                where: whereClause,
                skip: offset,
                take: params.limit,
                include: {
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            platform: {
                                select: {
                                    name: true,
                                    type: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            database_1.prisma.task.count({ where: whereClause }),
        ]);
        return pagination_1.PaginationHelper.createResult(tasks, total, params);
    }
    invalidateCache(pattern) {
        if (pattern) {
            cache_1.AnalyticsCache.invalidatePattern(pattern);
        }
        else {
            cache_1.AnalyticsCache.invalidatePattern('analytics:');
        }
        logger_1.logger.info('Analytics cache invalidated', { pattern });
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=analytics.js.map