"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.CacheWarmer = exports.TaskCache = exports.AgentCache = exports.AnalyticsCache = void 0;
exports.cached = cached;
const logger_1 = require("./logger");
class InMemoryCache {
    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
        };
        this.defaultTTL = 5 * 60 * 1000;
        this.maxSize = 1000;
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60 * 1000);
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }
        entry.hits++;
        this.stats.hits++;
        return entry.data;
    }
    set(key, data, options = {}) {
        const ttl = options.ttl || this.defaultTTL;
        const maxSize = options.maxSize || this.maxSize;
        if (this.cache.size >= maxSize) {
            this.evictOldest();
        }
        const entry = {
            data,
            timestamp: Date.now(),
            ttl,
            hits: 0,
        };
        this.cache.set(key, entry);
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
        this.stats.hits = 0;
        this.stats.misses = 0;
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
        const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;
        const topKeys = Array.from(this.cache.entries())
            .map(([key, entry]) => ({ key, hits: entry.hits }))
            .sort((a, b) => b.hits - a.hits)
            .slice(0, 10);
        return {
            totalEntries: this.cache.size,
            totalHits: this.stats.hits,
            totalMisses: this.stats.misses,
            hitRate: Math.round(hitRate * 100) / 100,
            memoryUsage,
            topKeys,
        };
    }
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger_1.logger.debug('Cache cleanup completed', { cleanedCount, remainingEntries: this.cache.size });
        }
    }
    evictOldest() {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
        for (let i = 0; i < toRemove; i++) {
            this.cache.delete(entries[i][0]);
        }
    }
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clear();
    }
}
function cached(ttl = 5 * 60 * 1000) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
            const cached = exports.cache.get(cacheKey);
            if (cached !== null) {
                return cached;
            }
            const result = await method.apply(this, args);
            exports.cache.set(cacheKey, result, { ttl });
            return result;
        };
    };
}
class AnalyticsCache {
    static getCacheKey(method, params) {
        return `${this.CACHE_PREFIX}${method}:${JSON.stringify(params)}`;
    }
    static async getOrSet(key, fetcher, ttl = 10 * 60 * 1000) {
        const cached = exports.cache.get(key);
        if (cached !== null) {
            return cached;
        }
        const data = await fetcher();
        exports.cache.set(key, data, { ttl });
        return data;
    }
    static invalidatePattern(pattern) {
        const keys = Array.from(exports.cache.cache.keys());
        const matchingKeys = keys.filter(key => key.includes(pattern));
        matchingKeys.forEach(key => exports.cache.delete(key));
        logger_1.logger.debug('Cache invalidation completed', { pattern, invalidatedKeys: matchingKeys.length });
    }
}
exports.AnalyticsCache = AnalyticsCache;
AnalyticsCache.CACHE_PREFIX = 'analytics:';
class AgentCache {
    static getCacheKey(agentId, method) {
        return `${this.CACHE_PREFIX}${agentId}:${method}`;
    }
    static async getAgentData(agentId, method, fetcher) {
        const key = this.getCacheKey(agentId, method);
        return AnalyticsCache.getOrSet(key, fetcher, this.TTL);
    }
    static invalidateAgent(agentId) {
        AnalyticsCache.invalidatePattern(`${this.CACHE_PREFIX}${agentId}`);
    }
    static invalidateAll() {
        AnalyticsCache.invalidatePattern(this.CACHE_PREFIX);
    }
}
exports.AgentCache = AgentCache;
AgentCache.CACHE_PREFIX = 'agent:';
AgentCache.TTL = 2 * 60 * 1000;
class TaskCache {
    static getCacheKey(taskId, method) {
        return `${this.CACHE_PREFIX}${taskId}:${method}`;
    }
    static async getTaskData(taskId, method, fetcher) {
        const key = this.getCacheKey(taskId, method);
        return AnalyticsCache.getOrSet(key, fetcher, this.TTL);
    }
    static invalidateTask(taskId) {
        AnalyticsCache.invalidatePattern(`${this.CACHE_PREFIX}${taskId}`);
    }
    static invalidateAll() {
        AnalyticsCache.invalidatePattern(this.CACHE_PREFIX);
    }
}
exports.TaskCache = TaskCache;
TaskCache.CACHE_PREFIX = 'task:';
TaskCache.TTL = 1 * 60 * 1000;
class CacheWarmer {
    static async warmCache() {
        logger_1.logger.info('Starting cache warm-up process');
        try {
            await this.warmAnalyticsCache();
            await this.warmAgentCache();
            await this.warmHealthCache();
            logger_1.logger.info('Cache warm-up completed successfully');
        }
        catch (error) {
            logger_1.logger.error('Cache warm-up failed', error);
        }
    }
    static async warmAnalyticsCache() {
        const commonQueries = [
            'dashboard-stats',
            'agent-performance',
            'task-trends',
            'error-patterns',
        ];
        for (const query of commonQueries) {
            try {
                exports.cache.set(`analytics:${query}`, { warmed: true, timestamp: Date.now() });
            }
            catch (error) {
                logger_1.logger.warn('Failed to warm analytics cache', { query, error });
            }
        }
    }
    static async warmAgentCache() {
        try {
            exports.cache.set('agent:active-list', { warmed: true, timestamp: Date.now() });
            exports.cache.set('agent:health-summary', { warmed: true, timestamp: Date.now() });
        }
        catch (error) {
            logger_1.logger.warn('Failed to warm agent cache', error);
        }
    }
    static async warmHealthCache() {
        try {
            exports.cache.set('health:system-status', { warmed: true, timestamp: Date.now() });
            exports.cache.set('health:performance-metrics', { warmed: true, timestamp: Date.now() });
        }
        catch (error) {
            logger_1.logger.warn('Failed to warm health cache', error);
        }
    }
}
exports.CacheWarmer = CacheWarmer;
exports.cache = new InMemoryCache();
process.on('SIGTERM', () => {
    exports.cache.destroy();
});
process.on('SIGINT', () => {
    exports.cache.destroy();
});
//# sourceMappingURL=cache.js.map