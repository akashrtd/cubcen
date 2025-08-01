"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = void 0;
const logger_1 = require("./logger");
const cache_1 = require("./cache");
const database_1 = require("./database");
const database_performance_1 = require("./database-performance");
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.alerts = [];
        this.monitoringInterval = null;
        this.MAX_METRICS_HISTORY = 10000;
        this.MONITORING_INTERVAL = 30000;
        this.thresholds = [
            { metric: 'cpu_usage', warning: 70, critical: 90, unit: '%', comparison: 'greater' },
            { metric: 'memory_usage', warning: 80, critical: 95, unit: '%', comparison: 'greater' },
            { metric: 'database_query_time', warning: 1000, critical: 5000, unit: 'ms', comparison: 'greater' },
            { metric: 'api_response_time', warning: 2000, critical: 5000, unit: 'ms', comparison: 'greater' },
            { metric: 'api_error_rate', warning: 5, critical: 10, unit: '%', comparison: 'greater' },
            { metric: 'cache_hit_rate', warning: 70, critical: 50, unit: '%', comparison: 'less' },
            { metric: 'agent_error_rate', warning: 10, critical: 25, unit: '%', comparison: 'greater' },
        ];
        this.apiMetrics = {
            requestCount: 0,
            totalResponseTime: 0,
            errorCount: 0,
        };
        this.startMonitoring();
    }
    startMonitoring() {
        if (this.monitoringInterval) {
            return;
        }
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.collectMetrics();
                await this.checkThresholds();
            }
            catch (error) {
                logger_1.logger.error('Performance monitoring error', error);
            }
        }, this.MONITORING_INTERVAL);
        logger_1.logger.info('Performance monitoring started');
    }
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            logger_1.logger.info('Performance monitoring stopped');
        }
    }
    async collectMetrics() {
        const timestamp = new Date();
        const cpuUsage = process.cpuUsage();
        const cpuPercent = this.calculateCPUPercentage(cpuUsage);
        this.recordMetric('cpu_usage', cpuPercent, '%', timestamp);
        const memoryUsage = process.memoryUsage();
        const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        this.recordMetric('memory_usage', memoryPercent, '%', timestamp);
        this.recordMetric('heap_used', memoryUsage.heapUsed / 1024 / 1024, 'MB', timestamp);
        const dbStats = await database_performance_1.dbPerformanceMonitor.getPerformanceStats();
        this.recordMetric('database_query_count', dbStats.totalQueries, 'count', timestamp);
        this.recordMetric('database_query_time', dbStats.averageQueryTime, 'ms', timestamp);
        this.recordMetric('database_slow_queries', dbStats.slowQueries.length, 'count', timestamp);
        const cacheStats = cache_1.cache.getStats();
        this.recordMetric('cache_hit_rate', cacheStats.hitRate, '%', timestamp);
        this.recordMetric('cache_memory_usage', cacheStats.memoryUsage / 1024 / 1024, 'MB', timestamp);
        this.recordMetric('cache_entry_count', cacheStats.totalEntries, 'count', timestamp);
        const apiErrorRate = this.apiMetrics.requestCount > 0
            ? (this.apiMetrics.errorCount / this.apiMetrics.requestCount) * 100
            : 0;
        const avgResponseTime = this.apiMetrics.requestCount > 0
            ? this.apiMetrics.totalResponseTime / this.apiMetrics.requestCount
            : 0;
        this.recordMetric('api_request_count', this.apiMetrics.requestCount, 'count', timestamp);
        this.recordMetric('api_response_time', avgResponseTime, 'ms', timestamp);
        this.recordMetric('api_error_rate', apiErrorRate, '%', timestamp);
        await this.collectAgentMetrics(timestamp);
        this.cleanupMetrics();
    }
    async collectAgentMetrics(timestamp) {
        try {
            const [totalAgents, activeAgents, recentErrors, healthMetrics] = await Promise.all([
                database_1.prisma.agent.count(),
                database_1.prisma.agent.count({ where: { status: 'ACTIVE' } }),
                database_1.prisma.task.count({
                    where: {
                        status: 'FAILED',
                        createdAt: {
                            gte: new Date(Date.now() - 3600000),
                        },
                    },
                }),
                database_1.prisma.agentHealth.aggregate({
                    _avg: { responseTime: true },
                    where: {
                        lastCheckAt: {
                            gte: new Date(Date.now() - 3600000),
                        },
                    },
                }),
            ]);
            this.recordMetric('agent_total_count', totalAgents, 'count', timestamp);
            this.recordMetric('agent_active_count', activeAgents, 'count', timestamp);
            this.recordMetric('agent_error_count', recentErrors, 'count', timestamp);
            const avgResponseTime = healthMetrics._avg.responseTime || 0;
            this.recordMetric('agent_response_time', avgResponseTime, 'ms', timestamp);
            const totalTasks = await database_1.prisma.task.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 3600000),
                    },
                },
            });
            const agentErrorRate = totalTasks > 0 ? (recentErrors / totalTasks) * 100 : 0;
            this.recordMetric('agent_error_rate', agentErrorRate, '%', timestamp);
        }
        catch (error) {
            logger_1.logger.error('Failed to collect agent metrics', error);
        }
    }
    recordMetric(name, value, unit, timestamp, tags) {
        const metric = {
            name,
            value,
            unit,
            timestamp,
            tags,
        };
        this.metrics.push(metric);
        this.storeMetricInDatabase(metric).catch(error => {
            logger_1.logger.error('Failed to store metric in database', error);
        });
    }
    async storeMetricInDatabase(metric) {
        try {
            await database_1.prisma.metric.create({
                data: {
                    type: 'GAUGE',
                    name: metric.name,
                    value: metric.value,
                    tags: metric.tags ? JSON.stringify(metric.tags) : null,
                    timestamp: metric.timestamp,
                },
            });
        }
        catch (error) {
            logger_1.logger.warn('Failed to store metric in database', { metric: metric.name, error });
        }
    }
    async checkThresholds() {
        const recentMetrics = this.getRecentMetrics(5 * 60 * 1000);
        for (const threshold of this.thresholds) {
            const metricValues = recentMetrics
                .filter(m => m.name === threshold.metric)
                .map(m => m.value);
            if (metricValues.length === 0)
                continue;
            const avgValue = metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length;
            const isWarning = this.isThresholdExceeded(avgValue, threshold.warning, threshold.comparison);
            const isCritical = this.isThresholdExceeded(avgValue, threshold.critical, threshold.comparison);
            if (isCritical || isWarning) {
                const severity = isCritical ? 'critical' : 'warning';
                const thresholdValue = isCritical ? threshold.critical : threshold.warning;
                await this.generateAlert(threshold.metric, thresholdValue, avgValue, severity);
            }
        }
    }
    isThresholdExceeded(value, threshold, comparison) {
        return comparison === 'greater' ? value > threshold : value < threshold;
    }
    async generateAlert(metric, threshold, currentValue, severity) {
        const alertId = `${metric}-${Date.now()}`;
        const existingAlert = this.alerts.find(a => a.metric === metric && !a.resolved &&
            Date.now() - a.timestamp.getTime() < 300000);
        if (existingAlert) {
            return;
        }
        const alert = {
            id: alertId,
            metric,
            threshold,
            currentValue,
            severity,
            message: this.generateAlertMessage(metric, threshold, currentValue, severity),
            timestamp: new Date(),
            resolved: false,
        };
        this.alerts.push(alert);
        logger_1.logger.warn('Performance alert generated', alert);
        try {
            await database_1.prisma.notification.create({
                data: {
                    eventType: 'SYSTEM_ERROR',
                    priority: severity.toUpperCase(),
                    title: `Performance Alert: ${metric}`,
                    message: alert.message,
                    data: JSON.stringify({
                        metric,
                        threshold,
                        currentValue,
                        severity,
                    }),
                    channels: JSON.stringify(['EMAIL', 'IN_APP']),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to store performance alert', error);
        }
    }
    generateAlertMessage(metric, threshold, currentValue, severity) {
        const metricName = metric.replace(/_/g, ' ').toUpperCase();
        return `${severity.toUpperCase()} ALERT: ${metricName} is ${currentValue.toFixed(2)} (threshold: ${threshold})`;
    }
    getRecentMetrics(timeWindow) {
        const cutoff = Date.now() - timeWindow;
        return this.metrics.filter(m => m.timestamp.getTime() > cutoff);
    }
    cleanupMetrics() {
        if (this.metrics.length > this.MAX_METRICS_HISTORY) {
            this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
        }
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        this.alerts = this.alerts.filter(a => a.timestamp.getTime() > cutoff);
    }
    calculateCPUPercentage(cpuUsage) {
        const totalUsage = cpuUsage.user + cpuUsage.system;
        return Math.min(100, (totalUsage / 1000000) * 100);
    }
    recordAPIRequest(responseTime, isError) {
        this.apiMetrics.requestCount++;
        this.apiMetrics.totalResponseTime += responseTime;
        if (isError) {
            this.apiMetrics.errorCount++;
        }
    }
    async getCurrentStats() {
        const recentMetrics = this.getRecentMetrics(5 * 60 * 1000);
        const getLatestMetric = (name) => {
            const metrics = recentMetrics.filter(m => m.name === name);
            return metrics.length > 0 ? metrics[metrics.length - 1].value : 0;
        };
        const memoryUsage = process.memoryUsage();
        const cacheStats = cache_1.cache.getStats();
        const dbStats = await database_performance_1.dbPerformanceMonitor.getPerformanceStats();
        return {
            cpu: {
                usage: getLatestMetric('cpu_usage'),
                loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
            },
            memory: {
                used: memoryUsage.heapUsed,
                total: memoryUsage.heapTotal,
                percentage: getLatestMetric('memory_usage'),
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal,
            },
            database: {
                connectionCount: 1,
                queryCount: dbStats.totalQueries,
                averageQueryTime: dbStats.averageQueryTime,
                slowQueries: dbStats.slowQueries.length,
            },
            cache: {
                hitRate: cacheStats.hitRate,
                memoryUsage: cacheStats.memoryUsage,
                entryCount: cacheStats.totalEntries,
            },
            api: {
                requestCount: this.apiMetrics.requestCount,
                averageResponseTime: this.apiMetrics.requestCount > 0
                    ? this.apiMetrics.totalResponseTime / this.apiMetrics.requestCount
                    : 0,
                errorRate: this.apiMetrics.requestCount > 0
                    ? (this.apiMetrics.errorCount / this.apiMetrics.requestCount) * 100
                    : 0,
            },
            agents: {
                totalCount: getLatestMetric('agent_total_count'),
                activeCount: getLatestMetric('agent_active_count'),
                errorCount: getLatestMetric('agent_error_count'),
                averageResponseTime: getLatestMetric('agent_response_time'),
            },
        };
    }
    getMetrics(metricName, timeRange) {
        let filteredMetrics = this.metrics;
        if (metricName) {
            filteredMetrics = filteredMetrics.filter(m => m.name === metricName);
        }
        if (timeRange) {
            filteredMetrics = filteredMetrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
        }
        return filteredMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    getActiveAlerts() {
        return this.alerts.filter(a => !a.resolved);
    }
    resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            logger_1.logger.info('Performance alert resolved', { alertId });
            return true;
        }
        return false;
    }
    resetAPIMetrics() {
        this.apiMetrics = {
            requestCount: 0,
            totalResponseTime: 0,
            errorCount: 0,
        };
    }
    destroy() {
        this.stopMonitoring();
        this.metrics = [];
        this.alerts = [];
    }
}
exports.performanceMonitor = new PerformanceMonitor();
process.on('SIGTERM', () => {
    exports.performanceMonitor.destroy();
});
process.on('SIGINT', () => {
    exports.performanceMonitor.destroy();
});
//# sourceMappingURL=performance-monitor.js.map