"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceUtils = exports.PerformanceTestSuite = exports.LoadTester = exports.Benchmark = void 0;
const logger_1 = require("./logger");
const database_1 = require("./database");
const cache_1 = require("./cache");
class Benchmark {
    static async run(name, operation, iterations = 1000) {
        logger_1.logger.info(`Starting benchmark: ${name}`, { iterations });
        const memoryBefore = process.memoryUsage();
        const times = [];
        for (let i = 0; i < Math.min(10, iterations); i++) {
            await operation();
        }
        const startTime = Date.now();
        for (let i = 0; i < iterations; i++) {
            const opStart = Date.now();
            await operation();
            const opEnd = Date.now();
            times.push(opEnd - opStart);
        }
        const endTime = Date.now();
        const memoryAfter = process.memoryUsage();
        const duration = endTime - startTime;
        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const opsPerSecond = (iterations / duration) * 1000;
        const result = {
            name,
            duration,
            operations: iterations,
            opsPerSecond: Math.round(opsPerSecond * 100) / 100,
            averageTime: Math.round(averageTime * 100) / 100,
            minTime,
            maxTime,
            memoryUsage: {
                before: memoryBefore,
                after: memoryAfter,
                delta: memoryAfter.heapUsed - memoryBefore.heapUsed,
            },
            timestamp: new Date(),
        };
        logger_1.logger.info(`Benchmark completed: ${name}`, result);
        return result;
    }
    static async benchmarkDatabase() {
        const results = [];
        results.push(await this.run('Database: Simple Select', async () => {
            await database_1.prisma.user.findFirst();
        }, 100));
        results.push(await this.run('Database: Complex Query', async () => {
            await database_1.prisma.agent.findMany({
                include: {
                    platform: true,
                    tasks: {
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                take: 10,
            });
        }, 50));
        results.push(await this.run('Database: Insert', async () => {
            await database_1.prisma.systemLog.create({
                data: {
                    level: 'INFO',
                    message: 'Benchmark test log',
                    source: 'benchmark',
                },
            });
        }, 100));
        results.push(await this.run('Database: Aggregation', async () => {
            await database_1.prisma.task.groupBy({
                by: ['status'],
                _count: { status: true },
            });
        }, 50));
        return results;
    }
    static async benchmarkCache() {
        const results = [];
        results.push(await this.run('Cache: Write', async () => {
            const key = `benchmark-${Math.random()}`;
            const data = { test: 'data', timestamp: Date.now() };
            cache_1.cache.set(key, data);
        }, 1000));
        const testKey = 'benchmark-read-test';
        cache_1.cache.set(testKey, { test: 'data' });
        results.push(await this.run('Cache: Read Hit', async () => {
            cache_1.cache.get(testKey);
        }, 1000));
        results.push(await this.run('Cache: Read Miss', async () => {
            cache_1.cache.get(`nonexistent-${Math.random()}`);
        }, 1000));
        return results;
    }
    static async benchmarkAPI() {
        const results = [];
        results.push(await this.run('API: Agent List', async () => {
            await database_1.prisma.agent.findMany({ take: 20 });
        }, 100));
        results.push(await this.run('API: Task Statistics', async () => {
            await Promise.all([
                database_1.prisma.task.count(),
                database_1.prisma.task.count({ where: { status: 'COMPLETED' } }),
                database_1.prisma.task.count({ where: { status: 'FAILED' } }),
            ]);
        }, 100));
        return results;
    }
}
exports.Benchmark = Benchmark;
class LoadTester {
    static async run(config) {
        logger_1.logger.info(`Starting load test: ${config.name}`, {
            duration: config.duration,
            concurrency: config.concurrency,
        });
        const initialMemory = process.memoryUsage();
        let peakMemory = initialMemory;
        const errors = new Map();
        const responseTimes = [];
        let successfulOperations = 0;
        let failedOperations = 0;
        if (config.warmupRuns && config.warmupRuns > 0) {
            logger_1.logger.info(`Running ${config.warmupRuns} warmup operations`);
            for (let i = 0; i < config.warmupRuns; i++) {
                try {
                    await config.operation();
                }
                catch (error) {
                }
            }
        }
        const startTime = Date.now();
        const endTime = startTime + config.duration;
        const rampUpTime = config.rampUpTime || 0;
        const rampUpEnd = startTime + rampUpTime;
        const activeOperations = new Set();
        const memoryMonitor = setInterval(() => {
            const currentMemory = process.memoryUsage();
            if (currentMemory.heapUsed > peakMemory.heapUsed) {
                peakMemory = currentMemory;
            }
        }, 1000);
        while (Date.now() < endTime) {
            const now = Date.now();
            let currentConcurrency = config.concurrency;
            if (rampUpTime > 0 && now < rampUpEnd) {
                const rampUpProgress = (now - startTime) / rampUpTime;
                currentConcurrency = Math.ceil(config.concurrency * rampUpProgress);
            }
            while (activeOperations.size < currentConcurrency && Date.now() < endTime) {
                const operationPromise = this.runSingleOperation(config.operation, responseTimes, errors);
                operationPromise
                    .then(() => {
                    successfulOperations++;
                })
                    .catch(() => {
                    failedOperations++;
                })
                    .finally(() => {
                    activeOperations.delete(operationPromise);
                });
                activeOperations.add(operationPromise);
            }
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        await Promise.allSettled(Array.from(activeOperations));
        clearInterval(memoryMonitor);
        const finalMemory = process.memoryUsage();
        const totalOperations = successfulOperations + failedOperations;
        const actualDuration = Date.now() - startTime;
        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;
        const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
        const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
        const operationsPerSecond = (totalOperations / actualDuration) * 1000;
        const errorRate = totalOperations > 0 ? (failedOperations / totalOperations) * 100 : 0;
        const result = {
            config,
            totalOperations,
            successfulOperations,
            failedOperations,
            averageResponseTime: Math.round(averageResponseTime * 100) / 100,
            minResponseTime,
            maxResponseTime,
            operationsPerSecond: Math.round(operationsPerSecond * 100) / 100,
            errorRate: Math.round(errorRate * 100) / 100,
            errors: Array.from(errors.entries()).map(([error, count]) => ({ error, count })),
            memoryUsage: {
                initial: initialMemory,
                peak: peakMemory,
                final: finalMemory,
            },
            duration: actualDuration,
            timestamp: new Date(),
        };
        logger_1.logger.info(`Load test completed: ${config.name}`, result);
        return result;
    }
    static async runSingleOperation(operation, responseTimes, errors) {
        const startTime = Date.now();
        try {
            await operation();
            const responseTime = Date.now() - startTime;
            responseTimes.push(responseTime);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const currentCount = errors.get(errorMessage) || 0;
            errors.set(errorMessage, currentCount + 1);
            throw error;
        }
    }
    static async testDatabase(duration = 30000, concurrency = 10) {
        return this.run({
            name: 'Database Load Test',
            duration,
            concurrency,
            rampUpTime: 5000,
            warmupRuns: 10,
            operation: async () => {
                const operations = [
                    () => database_1.prisma.agent.findMany({ take: 10 }),
                    () => database_1.prisma.task.count(),
                    () => database_1.prisma.systemLog.create({
                        data: {
                            level: 'INFO',
                            message: 'Load test log',
                            source: 'load-test',
                        },
                    }),
                    () => database_1.prisma.user.findFirst(),
                ];
                const randomOperation = operations[Math.floor(Math.random() * operations.length)];
                await randomOperation();
            },
        });
    }
    static async testCache(duration = 30000, concurrency = 50) {
        return this.run({
            name: 'Cache Load Test',
            duration,
            concurrency,
            rampUpTime: 2000,
            operation: async () => {
                const key = `load-test-${Math.floor(Math.random() * 1000)}`;
                if (Math.random() > 0.3) {
                    cache_1.cache.get(key);
                }
                else {
                    cache_1.cache.set(key, { data: 'test', timestamp: Date.now() });
                }
            },
        });
    }
    static async testMemory(duration = 60000, concurrency = 5) {
        return this.run({
            name: 'Memory Stress Test',
            duration,
            concurrency,
            operation: async () => {
                const largeArray = new Array(10000).fill(0).map((_, i) => ({
                    id: i,
                    data: `test-data-${i}`,
                    timestamp: Date.now(),
                    nested: {
                        value: Math.random(),
                        array: new Array(100).fill(Math.random()),
                    },
                }));
                largeArray.sort((a, b) => a.nested.value - b.nested.value);
                largeArray.filter(item => item.nested.value > 0.5);
                await new Promise(resolve => setTimeout(resolve, 10));
            },
        });
    }
}
exports.LoadTester = LoadTester;
class PerformanceTestSuite {
    static async runAll() {
        logger_1.logger.info('Starting comprehensive performance test suite');
        const startTime = Date.now();
        const benchmarks = [];
        const loadTests = [];
        const criticalIssues = [];
        const recommendations = [];
        try {
            logger_1.logger.info('Running database benchmarks');
            benchmarks.push(...await Benchmark.benchmarkDatabase());
            logger_1.logger.info('Running cache benchmarks');
            benchmarks.push(...await Benchmark.benchmarkCache());
            logger_1.logger.info('Running API benchmarks');
            benchmarks.push(...await Benchmark.benchmarkAPI());
            logger_1.logger.info('Running database load test');
            loadTests.push(await LoadTester.testDatabase(30000, 10));
            logger_1.logger.info('Running cache load test');
            loadTests.push(await LoadTester.testCache(30000, 50));
            logger_1.logger.info('Running memory stress test');
            loadTests.push(await LoadTester.testMemory(60000, 5));
            this.analyzeResults(benchmarks, loadTests, criticalIssues, recommendations);
        }
        catch (error) {
            logger_1.logger.error('Performance test suite failed', error);
            criticalIssues.push(`Test suite execution failed: ${error}`);
        }
        const totalDuration = Date.now() - startTime;
        const summary = {
            totalTests: benchmarks.length + loadTests.length,
            totalDuration,
            criticalIssues,
            recommendations,
        };
        logger_1.logger.info('Performance test suite completed', summary);
        return {
            benchmarks,
            loadTests,
            summary,
        };
    }
    static analyzeResults(benchmarks, loadTests, criticalIssues, recommendations) {
        benchmarks.forEach(benchmark => {
            if (benchmark.averageTime > 1000) {
                criticalIssues.push(`Slow operation: ${benchmark.name} (${benchmark.averageTime}ms average)`);
            }
            if (benchmark.opsPerSecond < 10) {
                recommendations.push(`Consider optimizing ${benchmark.name} - only ${benchmark.opsPerSecond} ops/sec`);
            }
            if (benchmark.memoryUsage.delta > 50 * 1024 * 1024) {
                recommendations.push(`High memory usage in ${benchmark.name} - ${Math.round(benchmark.memoryUsage.delta / 1024 / 1024)}MB`);
            }
        });
        loadTests.forEach(loadTest => {
            if (loadTest.errorRate > 5) {
                criticalIssues.push(`High error rate in ${loadTest.config.name}: ${loadTest.errorRate}%`);
            }
            if (loadTest.averageResponseTime > 2000) {
                criticalIssues.push(`Slow response time in ${loadTest.config.name}: ${loadTest.averageResponseTime}ms`);
            }
            if (loadTest.operationsPerSecond < 10) {
                recommendations.push(`Low throughput in ${loadTest.config.name}: ${loadTest.operationsPerSecond} ops/sec`);
            }
            const memoryGrowth = loadTest.memoryUsage.final.heapUsed - loadTest.memoryUsage.initial.heapUsed;
            if (memoryGrowth > 100 * 1024 * 1024) {
                recommendations.push(`Potential memory leak in ${loadTest.config.name}: ${Math.round(memoryGrowth / 1024 / 1024)}MB growth`);
            }
        });
        if (criticalIssues.length === 0) {
            recommendations.push('Performance looks good! Consider monitoring in production.');
        }
        if (benchmarks.some(b => b.name.includes('Database') && b.averageTime > 100)) {
            recommendations.push('Consider adding database indexes for frequently queried fields');
        }
        if (loadTests.some(t => t.config.name.includes('Cache') && t.averageResponseTime > 10)) {
            recommendations.push('Cache performance could be improved - consider Redis for production');
        }
    }
}
exports.PerformanceTestSuite = PerformanceTestSuite;
exports.performanceUtils = {
    benchmark: Benchmark,
    loadTester: LoadTester,
    testSuite: PerformanceTestSuite,
};
//# sourceMappingURL=benchmark.js.map