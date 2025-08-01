"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPerformanceMonitor = exports.DatabaseOptimizer = exports.OptimizedQueries = void 0;
const database_1 = require("./database");
const logger_1 = require("./logger");
class DatabasePerformanceMonitor {
    constructor() {
        this.queryMetrics = [];
        this.SLOW_QUERY_THRESHOLD = 1000;
        this.MAX_METRICS_HISTORY = 1000;
        this.setupQueryLogging();
    }
    setupQueryLogging() {
        database_1.prisma.$use(async (params, next) => {
            const start = Date.now();
            const result = await next(params);
            const duration = Date.now() - start;
            const metric = {
                query: `${params.model}.${params.action}`,
                duration,
                timestamp: new Date(),
                params: params.args,
            };
            this.recordQueryMetric(metric);
            if (duration > this.SLOW_QUERY_THRESHOLD) {
                logger_1.logger.warn('Slow query detected', {
                    query: metric.query,
                    duration,
                    params: params.args,
                });
            }
            return result;
        });
    }
    recordQueryMetric(metric) {
        this.queryMetrics.push(metric);
        if (this.queryMetrics.length > this.MAX_METRICS_HISTORY) {
            this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS_HISTORY);
        }
    }
    async getPerformanceStats() {
        const now = Date.now();
        const recentMetrics = this.queryMetrics.filter(m => now - m.timestamp.getTime() < 3600000);
        const totalQueries = recentMetrics.length;
        const averageQueryTime = totalQueries > 0
            ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries
            : 0;
        const slowQueries = recentMetrics
            .filter(m => m.duration > this.SLOW_QUERY_THRESHOLD)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);
        return {
            totalQueries,
            averageQueryTime: Math.round(averageQueryTime * 100) / 100,
            slowQueries,
            connectionPoolStats: {
                active: 0,
                idle: 0,
                total: 1,
            },
            cacheHitRate: 0,
            indexUsage: await this.getIndexUsageStats(),
        };
    }
    async getIndexUsageStats() {
        try {
            const indexStats = await database_1.prisma.$queryRaw `
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
      `;
            return indexStats.map(stat => ({
                table: stat.tbl_name,
                index: stat.name,
                usage: 0,
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to get index usage stats', error);
            return [];
        }
    }
    getSlowQueries(limit = 10) {
        return this.queryMetrics
            .filter(m => m.duration > this.SLOW_QUERY_THRESHOLD)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, limit);
    }
    clearMetrics() {
        this.queryMetrics = [];
    }
}
class OptimizedQueries {
    static async getAgentsWithPlatforms(limit = 50, offset = 0) {
        return database_1.prisma.agent.findMany({
            take: limit,
            skip: offset,
            include: {
                platform: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        status: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
    static async getTaskStatistics(agentId, dateRange) {
        const where = {
            ...(agentId && { agentId }),
            ...(dateRange && {
                createdAt: {
                    gte: dateRange.start,
                    lte: dateRange.end,
                },
            }),
        };
        const [statusStats, priorityStats, totalCount] = await Promise.all([
            database_1.prisma.task.groupBy({
                by: ['status'],
                where,
                _count: { status: true },
            }),
            database_1.prisma.task.groupBy({
                by: ['priority'],
                where,
                _count: { priority: true },
            }),
            database_1.prisma.task.count({ where }),
        ]);
        return {
            statusStats,
            priorityStats,
            totalCount,
        };
    }
    static async getAgentHealthMetrics(agentIds, limit = 100) {
        const where = agentIds ? { agentId: { in: agentIds } } : {};
        return database_1.prisma.agentHealth.findMany({
            where,
            take: limit,
            orderBy: {
                lastCheckAt: 'desc',
            },
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
            },
        });
    }
    static async getWorkflowStats(workflowId) {
        const where = workflowId ? { workflowId } : {};
        const [taskStats, avgExecutionTime] = await Promise.all([
            database_1.prisma.task.groupBy({
                by: ['status'],
                where,
                _count: { status: true },
            }),
            database_1.prisma.task.aggregate({
                where: {
                    ...where,
                    status: 'COMPLETED',
                    startedAt: { not: null },
                    completedAt: { not: null },
                },
                _avg: {},
            }),
        ]);
        return {
            taskStats,
            avgExecutionTime: 0,
        };
    }
    static async searchAgents(searchTerm, limit = 20) {
        return database_1.prisma.agent.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            take: limit,
            include: {
                platform: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
    static async getRecentLogs(level, source, limit = 100) {
        const where = {
            ...(level && { level: level }),
            ...(source && { source }),
        };
        return database_1.prisma.systemLog.findMany({
            where,
            take: limit,
            orderBy: {
                timestamp: 'desc',
            },
        });
    }
}
exports.OptimizedQueries = OptimizedQueries;
class DatabaseOptimizer {
    static async analyzePerformance() {
        const analysis = {
            tableStats: await this.getTableStats(),
            indexRecommendations: await this.getIndexRecommendations(),
            queryOptimizations: await this.getQueryOptimizations(),
        };
        logger_1.logger.info('Database performance analysis completed', analysis);
        return analysis;
    }
    static async getTableStats() {
        try {
            const tables = await database_1.prisma.$queryRaw `
        SELECT 
          name,
          (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=m.name) as count
        FROM sqlite_master m 
        WHERE type='table' AND name LIKE 'cubcen_%'
      `;
            return tables;
        }
        catch (error) {
            logger_1.logger.error('Failed to get table stats', error);
            return [];
        }
    }
    static async getIndexRecommendations() {
        const recommendations = [
            {
                table: 'cubcen_tasks',
                columns: ['agentId', 'status', 'createdAt'],
                reason: 'Frequently filtered by agent and status with date ordering',
            },
            {
                table: 'cubcen_agent_health',
                columns: ['agentId', 'lastCheckAt'],
                reason: 'Health monitoring queries by agent and time',
            },
            {
                table: 'cubcen_system_logs',
                columns: ['level', 'source', 'timestamp'],
                reason: 'Log filtering and time-based queries',
            },
            {
                table: 'cubcen_notifications',
                columns: ['userId', 'status', 'createdAt'],
                reason: 'User notification queries with status filtering',
            },
        ];
        return recommendations;
    }
    static async getQueryOptimizations() {
        return [
            {
                query: 'Agent list with task counts',
                optimization: 'Use _count relation instead of separate queries',
                impact: 'Reduces N+1 query problems',
            },
            {
                query: 'Task statistics by date range',
                optimization: 'Use groupBy with date functions',
                impact: 'Reduces data transfer and processing time',
            },
            {
                query: 'Health monitoring dashboard',
                optimization: 'Batch health checks and use aggregation',
                impact: 'Improves dashboard load time',
            },
        ];
    }
    static async createOptimalIndexes() {
        const indexQueries = [
            `CREATE INDEX IF NOT EXISTS idx_tasks_agent_status_date 
       ON cubcen_tasks(agentId, status, createdAt)`,
            `CREATE INDEX IF NOT EXISTS idx_agent_health_agent_date 
       ON cubcen_agent_health(agentId, lastCheckAt)`,
            `CREATE INDEX IF NOT EXISTS idx_system_logs_level_source_time 
       ON cubcen_system_logs(level, source, timestamp)`,
            `CREATE INDEX IF NOT EXISTS idx_notifications_user_status_date 
       ON cubcen_notifications(userId, status, createdAt)`,
            `CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_order 
       ON cubcen_workflow_steps(workflowId, stepOrder)`,
        ];
        for (const query of indexQueries) {
            try {
                await database_1.prisma.$executeRawUnsafe(query);
                logger_1.logger.info('Created database index', { query });
            }
            catch (error) {
                logger_1.logger.error('Failed to create index', { query, error });
            }
        }
    }
}
exports.DatabaseOptimizer = DatabaseOptimizer;
exports.dbPerformanceMonitor = new DatabasePerformanceMonitor();
//# sourceMappingURL=database-performance.js.map