"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthMonitoring = void 0;
const database_1 = require("./database");
const logger_1 = __importDefault(require("./logger"));
const os_1 = __importDefault(require("os"));
const promises_1 = __importDefault(require("fs/promises"));
class HealthMonitoringService {
    constructor() {
        this.healthChecks = new Map();
        this.metricsHistory = [];
        this.maxHistorySize = 100;
    }
    async checkDatabase() {
        const startTime = Date.now();
        const check = {
            name: 'database',
            status: 'healthy',
            lastCheck: new Date(),
        };
        try {
            await database_1.prisma.user.findFirst({
                select: { id: true }
            });
            const responseTime = Date.now() - startTime;
            check.responseTime = responseTime;
            check.details = {
                connectionStatus: 'connected',
                queryTime: responseTime,
                testQuery: 'SELECT id FROM User LIMIT 1'
            };
            if (responseTime > 1000) {
                check.status = 'degraded';
                check.details.warning = 'Database response time is slow';
            }
        }
        catch (error) {
            check.status = 'unhealthy';
            check.error = error instanceof Error ? error.message : 'Unknown database error';
            check.details = {
                connectionStatus: 'failed',
                error: check.error
            };
            logger_1.default.error('Database health check failed', error, {
                healthCheck: 'database'
            });
        }
        this.healthChecks.set('database', check);
        return check;
    }
    async checkMemory() {
        const check = {
            name: 'memory',
            status: 'healthy',
            lastCheck: new Date(),
        };
        try {
            const memoryUsage = process.memoryUsage();
            const systemMemory = {
                free: os_1.default.freemem(),
                total: os_1.default.totalmem()
            };
            const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
            const systemUsagePercent = ((systemMemory.total - systemMemory.free) / systemMemory.total) * 100;
            check.details = {
                heap: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                    usagePercent: Math.round(heapUsagePercent)
                },
                system: {
                    free: Math.round(systemMemory.free / 1024 / 1024),
                    total: Math.round(systemMemory.total / 1024 / 1024),
                    usagePercent: Math.round(systemUsagePercent)
                },
                external: Math.round(memoryUsage.external / 1024 / 1024)
            };
            if (heapUsagePercent > 90 || systemUsagePercent > 95) {
                check.status = 'unhealthy';
                check.error = 'Memory usage critically high';
            }
            else if (heapUsagePercent > 75 || systemUsagePercent > 85) {
                check.status = 'degraded';
                check.details.warning = 'Memory usage is high';
            }
        }
        catch (error) {
            check.status = 'unhealthy';
            check.error = error instanceof Error ? error.message : 'Memory check failed';
            logger_1.default.error('Memory health check failed', error, {
                healthCheck: 'memory'
            });
        }
        this.healthChecks.set('memory', check);
        return check;
    }
    async checkDiskSpace() {
        const check = {
            name: 'disk',
            status: 'healthy',
            lastCheck: new Date(),
        };
        try {
            const stats = await promises_1.default.statfs(process.cwd());
            const free = stats.bavail * stats.bsize;
            const total = stats.blocks * stats.bsize;
            const usagePercent = ((total - free) / total) * 100;
            check.details = {
                free: Math.round(free / 1024 / 1024 / 1024),
                total: Math.round(total / 1024 / 1024 / 1024),
                usagePercent: Math.round(usagePercent)
            };
            if (usagePercent > 95) {
                check.status = 'unhealthy';
                check.error = 'Disk space critically low';
            }
            else if (usagePercent > 85) {
                check.status = 'degraded';
                check.details.warning = 'Disk space is running low';
            }
        }
        catch (error) {
            check.status = 'unhealthy';
            check.error = error instanceof Error ? error.message : 'Disk check failed';
            logger_1.default.error('Disk health check failed', error, {
                healthCheck: 'disk'
            });
        }
        this.healthChecks.set('disk', check);
        return check;
    }
    async checkApplication() {
        const check = {
            name: 'application',
            status: 'healthy',
            lastCheck: new Date(),
        };
        try {
            const uptime = process.uptime();
            const loadAverage = os_1.default.loadavg();
            const cpuCount = os_1.default.cpus().length;
            check.details = {
                uptime: Math.round(uptime),
                uptimeFormatted: this.formatUptime(uptime),
                loadAverage: loadAverage.map(load => Math.round(load * 100) / 100),
                cpuCount,
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            };
            const avgLoad = loadAverage[0];
            if (avgLoad > cpuCount * 2) {
                check.status = 'unhealthy';
                check.error = 'System load is critically high';
            }
            else if (avgLoad > cpuCount) {
                check.status = 'degraded';
                check.details.warning = 'System load is high';
            }
        }
        catch (error) {
            check.status = 'unhealthy';
            check.error = error instanceof Error ? error.message : 'Application check failed';
            logger_1.default.error('Application health check failed', error, {
                healthCheck: 'application'
            });
        }
        this.healthChecks.set('application', check);
        return check;
    }
    async collectSystemMetrics() {
        try {
            const memoryUsage = process.memoryUsage();
            const systemMemory = {
                free: os_1.default.freemem(),
                total: os_1.default.totalmem()
            };
            let diskStats = { free: 0, total: 0 };
            try {
                const stats = await promises_1.default.statfs(process.cwd());
                diskStats = {
                    free: stats.bavail * stats.bsize,
                    total: stats.blocks * stats.bsize
                };
            }
            catch (error) {
                logger_1.default.warn('Failed to get disk stats', { error });
            }
            const metrics = {
                timestamp: new Date(),
                cpu: {
                    usage: await this.getCPUUsage(),
                    loadAverage: os_1.default.loadavg()
                },
                memory: {
                    used: systemMemory.total - systemMemory.free,
                    free: systemMemory.free,
                    total: systemMemory.total,
                    heapUsed: memoryUsage.heapUsed,
                    heapTotal: memoryUsage.heapTotal,
                    external: memoryUsage.external
                },
                disk: diskStats,
                uptime: process.uptime()
            };
            this.metricsHistory.push(metrics);
            if (this.metricsHistory.length > this.maxHistorySize) {
                this.metricsHistory.shift();
            }
            return metrics;
        }
        catch (error) {
            logger_1.default.error('Failed to collect system metrics', error);
            throw error;
        }
    }
    async runAllHealthChecks() {
        const startTime = Date.now();
        try {
            const [databaseCheck, memoryCheck, diskCheck, applicationCheck] = await Promise.all([
                this.checkDatabase(),
                this.checkMemory(),
                this.checkDiskSpace(),
                this.checkApplication()
            ]);
            const checks = [databaseCheck, memoryCheck, diskCheck, applicationCheck];
            const metrics = await this.collectSystemMetrics();
            const hasUnhealthy = checks.some(check => check.status === 'unhealthy');
            const hasDegraded = checks.some(check => check.status === 'degraded');
            let overallStatus = 'healthy';
            if (hasUnhealthy) {
                overallStatus = 'unhealthy';
            }
            else if (hasDegraded) {
                overallStatus = 'degraded';
            }
            const healthStatus = {
                status: overallStatus,
                timestamp: new Date(),
                checks,
                metrics,
                version: process.env.npm_package_version || '0.1.0'
            };
            const duration = Date.now() - startTime;
            logger_1.default.info('Health check completed', {
                status: overallStatus,
                duration,
                checksCount: checks.length
            });
            return healthStatus;
        }
        catch (error) {
            logger_1.default.error('Health check failed', error);
            throw error;
        }
    }
    getMetricsHistory(limit) {
        const history = [...this.metricsHistory];
        return limit ? history.slice(-limit) : history;
    }
    getHealthCheck(name) {
        return this.healthChecks.get(name);
    }
    clearMetricsHistory() {
        this.metricsHistory = [];
    }
    async getCPUUsage() {
        return new Promise((resolve) => {
            const startUsage = process.cpuUsage();
            const startTime = Date.now();
            setTimeout(() => {
                const currentUsage = process.cpuUsage(startUsage);
                const currentTime = Date.now();
                const timeDiff = currentTime - startTime;
                const totalUsage = (currentUsage.user + currentUsage.system) / 1000;
                const usage = (totalUsage / timeDiff) * 100;
                resolve(Math.min(100, Math.max(0, usage)));
            }, 100);
        });
    }
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const parts = [];
        if (days > 0)
            parts.push(`${days}d`);
        if (hours > 0)
            parts.push(`${hours}h`);
        if (minutes > 0)
            parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0)
            parts.push(`${secs}s`);
        return parts.join(' ');
    }
}
exports.healthMonitoring = new HealthMonitoringService();
exports.default = exports.healthMonitoring;
//# sourceMappingURL=health.js.map