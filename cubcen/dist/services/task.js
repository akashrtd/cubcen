"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const database_1 = require("@/lib/database");
const logger_1 = require("@/lib/logger");
const zod_1 = require("zod");
const events_1 = require("events");
const taskCreationSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    workflowId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
    scheduledAt: zod_1.z.date().optional(),
    maxRetries: zod_1.z.number().min(0).max(10).default(3),
    timeoutMs: zod_1.z.number().min(1000).max(300000).default(30000),
    createdBy: zod_1.z.string().min(1)
});
const taskUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    scheduledAt: zod_1.z.date().optional(),
    maxRetries: zod_1.z.number().min(0).max(10).optional(),
    timeoutMs: zod_1.z.number().min(1000).max(300000).optional()
});
class TaskService extends events_1.EventEmitter {
    constructor(adapterManager, webSocketService) {
        super();
        this.taskQueue = new Map();
        this.runningTasks = new Map();
        this.maxConcurrentTasks = 10;
        this.queueProcessingInterval = 1000;
        this.isProcessing = false;
        this.adapterManager = adapterManager;
        this.webSocketService = webSocketService;
        this.startScheduler();
    }
    setWebSocketService(webSocketService) {
        this.webSocketService = webSocketService;
    }
    async createTask(data) {
        try {
            const validatedData = taskCreationSchema.parse({
                ...data,
                scheduledAt: data.scheduledAt || new Date()
            });
            logger_1.logger.info('Creating new task', {
                name: validatedData.name,
                agentId: validatedData.agentId,
                priority: validatedData.priority,
                scheduledAt: validatedData.scheduledAt
            });
            const agent = await database_1.prisma.agent.findUnique({
                where: { id: validatedData.agentId }
            });
            if (!agent) {
                throw new Error(`Agent with ID ${validatedData.agentId} not found`);
            }
            if (agent.status !== 'ACTIVE') {
                throw new Error(`Agent ${agent.name} is not active (status: ${agent.status})`);
            }
            const task = await database_1.prisma.task.create({
                data: {
                    name: validatedData.name,
                    description: validatedData.description,
                    agentId: validatedData.agentId,
                    workflowId: validatedData.workflowId,
                    status: 'PENDING',
                    priority: validatedData.priority,
                    parameters: JSON.stringify(validatedData.parameters),
                    scheduledAt: validatedData.scheduledAt || new Date(),
                    maxRetries: validatedData.maxRetries,
                    createdBy: validatedData.createdBy
                }
            });
            this.addToQueue({
                id: task.id,
                priority: task.priority,
                scheduledAt: task.scheduledAt,
                retryCount: 0,
                maxRetries: validatedData.maxRetries,
                timeoutMs: validatedData.timeoutMs,
                createdAt: task.createdAt
            });
            this.webSocketService?.notifyTaskStatusChange(task.id, 'PENDING', {
                name: task.name,
                agentId: task.agentId,
                priority: task.priority,
                scheduledAt: task.scheduledAt
            });
            logger_1.logger.info('Task created successfully', {
                taskId: task.id,
                name: task.name,
                agentId: task.agentId
            });
            return task;
        }
        catch (error) {
            logger_1.logger.error('Failed to create task', error, {
                agentId: data.agentId,
                name: data.name
            });
            throw error;
        }
    }
    async updateTask(taskId, data) {
        try {
            const validatedData = taskUpdateSchema.parse(data);
            logger_1.logger.info('Updating task', { taskId, updateData: validatedData });
            const existingTask = await database_1.prisma.task.findUnique({
                where: { id: taskId }
            });
            if (!existingTask) {
                throw new Error(`Task with ID ${taskId} not found`);
            }
            if (existingTask.status === 'RUNNING') {
                throw new Error('Cannot update a running task');
            }
            const task = await database_1.prisma.task.update({
                where: { id: taskId },
                data: {
                    ...(validatedData.name && { name: validatedData.name }),
                    ...(validatedData.description !== undefined && { description: validatedData.description }),
                    ...(validatedData.priority && { priority: validatedData.priority }),
                    ...(validatedData.parameters && { parameters: JSON.stringify(validatedData.parameters) }),
                    ...(validatedData.scheduledAt && { scheduledAt: validatedData.scheduledAt }),
                    ...(validatedData.maxRetries !== undefined && { maxRetries: validatedData.maxRetries }),
                    updatedAt: new Date()
                }
            });
            const queuedTask = this.taskQueue.get(taskId);
            if (queuedTask) {
                this.taskQueue.set(taskId, {
                    ...queuedTask,
                    priority: validatedData.priority || queuedTask.priority,
                    scheduledAt: validatedData.scheduledAt || queuedTask.scheduledAt,
                    maxRetries: validatedData.maxRetries !== undefined ? validatedData.maxRetries : queuedTask.maxRetries
                });
            }
            logger_1.logger.info('Task updated successfully', { taskId, name: task.name });
            return task;
        }
        catch (error) {
            logger_1.logger.error('Failed to update task', error, { taskId });
            throw error;
        }
    }
    async getTask(taskId) {
        try {
            const task = await database_1.prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    agent: true,
                    workflow: true,
                    creator: {
                        select: { id: true, email: true, name: true }
                    }
                }
            });
            return task;
        }
        catch (error) {
            logger_1.logger.error('Failed to get task', error, { taskId });
            throw error;
        }
    }
    async getTasks(options = {}) {
        try {
            const { agentId, workflowId, status, priority, createdBy, dateFrom, dateTo, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
            const where = {};
            if (agentId)
                where.agentId = agentId;
            if (workflowId)
                where.workflowId = workflowId;
            if (status)
                where.status = status;
            if (priority)
                where.priority = priority;
            if (createdBy)
                where.createdBy = createdBy;
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = dateFrom;
                if (dateTo)
                    where.createdAt.lte = dateTo;
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            const total = await database_1.prisma.task.count({ where });
            const tasks = await database_1.prisma.task.findMany({
                where,
                include: {
                    agent: {
                        select: { id: true, name: true, platformId: true }
                    },
                    workflow: {
                        select: { id: true, name: true }
                    },
                    creator: {
                        select: { id: true, email: true, name: true }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit
            });
            return {
                tasks,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get tasks', error, options);
            throw error;
        }
    }
    async cancelTask(taskId) {
        try {
            logger_1.logger.info('Cancelling task', { taskId });
            const runningTask = this.runningTasks.get(taskId);
            if (runningTask) {
                clearTimeout(runningTask.timeout);
                runningTask.abortController.abort();
                this.runningTasks.delete(taskId);
                logger_1.logger.info('Running task cancelled', { taskId });
            }
            this.taskQueue.delete(taskId);
            await database_1.prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'CANCELLED',
                    completedAt: new Date(),
                    updatedAt: new Date()
                }
            });
            this.webSocketService?.notifyTaskStatusChange(taskId, 'CANCELLED', {
                cancelled: true,
                timestamp: new Date()
            });
            logger_1.logger.info('Task cancelled successfully', { taskId });
        }
        catch (error) {
            logger_1.logger.error('Failed to cancel task', error, { taskId });
            throw error;
        }
    }
    async retryTask(taskId) {
        try {
            logger_1.logger.info('Retrying task', { taskId });
            const task = await database_1.prisma.task.findUnique({
                where: { id: taskId }
            });
            if (!task) {
                throw new Error(`Task with ID ${taskId} not found`);
            }
            if (task.status !== 'FAILED') {
                throw new Error(`Task ${taskId} is not in failed state (status: ${task.status})`);
            }
            await database_1.prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'PENDING',
                    startedAt: null,
                    completedAt: null,
                    result: null,
                    error: null,
                    updatedAt: new Date()
                }
            });
            this.addToQueue({
                id: task.id,
                priority: task.priority,
                scheduledAt: new Date(),
                retryCount: task.retryCount,
                maxRetries: task.maxRetries,
                timeoutMs: 30000,
                createdAt: task.createdAt
            });
            this.webSocketService?.notifyTaskStatusChange(taskId, 'PENDING', {
                retried: true,
                retryCount: task.retryCount
            });
            logger_1.logger.info('Task retry initiated', { taskId });
        }
        catch (error) {
            logger_1.logger.error('Failed to retry task', error, { taskId });
            throw error;
        }
    }
    async deleteTask(taskId) {
        try {
            logger_1.logger.info('Deleting task', { taskId });
            await this.cancelTask(taskId);
            await database_1.prisma.task.delete({
                where: { id: taskId }
            });
            logger_1.logger.info('Task deleted successfully', { taskId });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete task', error, { taskId });
            throw error;
        }
    }
    getQueueStatus() {
        return {
            queueSize: this.taskQueue.size,
            runningTasks: this.runningTasks.size,
            maxConcurrentTasks: this.maxConcurrentTasks,
            isProcessing: this.isProcessing,
            queuedTasks: Array.from(this.taskQueue.values()).map(task => ({
                id: task.id,
                priority: task.priority,
                scheduledAt: task.scheduledAt,
                retryCount: task.retryCount
            }))
        };
    }
    configureExecution(config) {
        if (config.maxConcurrentTasks !== undefined) {
            this.maxConcurrentTasks = Math.max(1, Math.min(100, config.maxConcurrentTasks));
        }
        if (config.queueProcessingInterval !== undefined) {
            this.queueProcessingInterval = Math.max(100, Math.min(10000, config.queueProcessingInterval));
            this.stopScheduler();
            this.startScheduler();
        }
        logger_1.logger.info('Task execution configuration updated', {
            maxConcurrentTasks: this.maxConcurrentTasks,
            queueProcessingInterval: this.queueProcessingInterval
        });
    }
    addToQueue(task) {
        this.taskQueue.set(task.id, task);
        logger_1.logger.debug('Task added to queue', {
            taskId: task.id,
            priority: task.priority,
            scheduledAt: task.scheduledAt,
            queueSize: this.taskQueue.size
        });
    }
    getNextTask() {
        const now = new Date();
        const availableTasks = Array.from(this.taskQueue.values())
            .filter(task => task.scheduledAt <= now)
            .sort((a, b) => {
            const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            return a.scheduledAt.getTime() - b.scheduledAt.getTime();
        });
        return availableTasks[0] || null;
    }
    async executeTask(queuedTask) {
        const { id: taskId, timeoutMs } = queuedTask;
        try {
            logger_1.logger.info('Starting task execution', {
                taskId,
                retryCount: queuedTask.retryCount,
                timeout: timeoutMs
            });
            const task = await database_1.prisma.task.findUnique({
                where: { id: taskId },
                include: { agent: { include: { platform: true } } }
            });
            if (!task) {
                throw new Error(`Task ${taskId} not found in database`);
            }
            await database_1.prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'RUNNING',
                    startedAt: new Date(),
                    updatedAt: new Date()
                }
            });
            this.webSocketService?.notifyTaskStatusChange(taskId, 'RUNNING', {
                startedAt: new Date(),
                retryCount: queuedTask.retryCount
            });
            const abortController = new AbortController();
            const startTime = new Date();
            const timeout = setTimeout(() => {
                abortController.abort();
            }, timeoutMs);
            const executionPromise = this.performTaskExecution(task, abortController.signal);
            const taskExecution = {
                taskId,
                startTime,
                timeout,
                abortController,
                promise: executionPromise
            };
            this.runningTasks.set(taskId, taskExecution);
            await executionPromise;
            clearTimeout(timeout);
            this.runningTasks.delete(taskId);
            logger_1.logger.info('Task execution completed successfully', {
                taskId,
                executionTime: Date.now() - startTime.getTime()
            });
        }
        catch (error) {
            const execution = this.runningTasks.get(taskId);
            if (execution) {
                clearTimeout(execution.timeout);
                this.runningTasks.delete(taskId);
            }
            await this.handleTaskError(queuedTask, error);
        }
    }
    async performTaskExecution(task, signal) {
        const startTime = Date.now();
        try {
            const adapter = this.adapterManager.getAdapter(task.agent.platformId);
            if (!adapter) {
                throw new Error(`No adapter found for platform ${task.agent.platformId}`);
            }
            const parameters = JSON.parse(task.parameters || '{}');
            this.webSocketService?.notifyTaskProgress(task.id, 25, 'Initializing task execution');
            this.webSocketService?.notifyTaskProgress(task.id, 50, 'Executing agent workflow');
            const result = await adapter.executeAgent(task.agent.externalId, parameters);
            if (signal.aborted) {
                throw new Error('Task execution was cancelled');
            }
            this.webSocketService?.notifyTaskProgress(task.id, 75, 'Processing results');
            const executionTime = Date.now() - startTime;
            const taskResult = {
                success: result.success,
                data: result.data,
                executionTime,
                timestamp: new Date()
            };
            await database_1.prisma.task.update({
                where: { id: task.id },
                data: {
                    status: 'COMPLETED',
                    result: JSON.stringify(taskResult),
                    completedAt: new Date(),
                    updatedAt: new Date()
                }
            });
            this.webSocketService?.notifyTaskProgress(task.id, 100, 'Task completed successfully');
            this.webSocketService?.notifyTaskStatusChange(task.id, 'COMPLETED', {
                success: true,
                executionTime,
                completedAt: new Date()
            });
            this.emit('taskCompleted', {
                taskId: task.id,
                agentId: task.agentId,
                result: taskResult
            });
        }
        catch (error) {
            if (signal.aborted) {
                throw new Error('Task execution was cancelled');
            }
            throw error;
        }
    }
    async handleTaskError(queuedTask, error) {
        const { id: taskId, retryCount, maxRetries } = queuedTask;
        logger_1.logger.error('Task execution failed', error, {
            taskId,
            retryCount,
            maxRetries
        });
        if (retryCount < maxRetries && error.message !== 'Task execution was cancelled') {
            const nextRetryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
            const nextScheduledAt = new Date(Date.now() + nextRetryDelay);
            await database_1.prisma.task.update({
                where: { id: taskId },
                data: {
                    retryCount: retryCount + 1,
                    updatedAt: new Date()
                }
            });
            this.addToQueue({
                ...queuedTask,
                retryCount: retryCount + 1,
                scheduledAt: nextScheduledAt
            });
            this.webSocketService?.notifyTaskStatusChange(taskId, 'PENDING', {
                retrying: true,
                retryCount: retryCount + 1,
                nextRetryAt: nextScheduledAt,
                error: error.message
            });
            logger_1.logger.info('Task scheduled for retry', {
                taskId,
                retryCount: retryCount + 1,
                nextRetryAt: nextScheduledAt
            });
        }
        else {
            const taskError = {
                message: error.message,
                stack: error.stack,
                timestamp: new Date(),
                retryCount
            };
            await database_1.prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'FAILED',
                    error: JSON.stringify(taskError),
                    completedAt: new Date(),
                    updatedAt: new Date()
                }
            });
            this.webSocketService?.notifyTaskStatusChange(taskId, 'FAILED', {
                error: error.message,
                retryCount,
                maxRetriesExceeded: retryCount >= maxRetries
            });
            this.webSocketService?.notifyTaskError(taskId, error.message, {
                retryCount,
                maxRetries,
                timestamp: new Date()
            });
            this.emit('taskFailed', {
                taskId,
                error: taskError,
                retryCount
            });
        }
    }
    startScheduler() {
        if (this.schedulerInterval) {
            return;
        }
        this.schedulerInterval = setInterval(async () => {
            await this.processQueue();
        }, this.queueProcessingInterval);
        logger_1.logger.info('Task scheduler started', {
            interval: this.queueProcessingInterval,
            maxConcurrentTasks: this.maxConcurrentTasks
        });
    }
    stopScheduler() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = undefined;
            logger_1.logger.info('Task scheduler stopped');
        }
    }
    async processQueue() {
        if (this.isProcessing || this.runningTasks.size >= this.maxConcurrentTasks) {
            return;
        }
        this.isProcessing = true;
        try {
            while (this.runningTasks.size < this.maxConcurrentTasks) {
                const nextTask = this.getNextTask();
                if (!nextTask) {
                    break;
                }
                this.taskQueue.delete(nextTask.id);
                this.executeTask(nextTask).catch(error => {
                    logger_1.logger.error('Unhandled task execution error', error, {
                        taskId: nextTask.id
                    });
                });
            }
        }
        finally {
            this.isProcessing = false;
        }
    }
    async cleanup() {
        try {
            logger_1.logger.info('Cleaning up task service');
            this.stopScheduler();
            const runningTaskIds = Array.from(this.runningTasks.keys());
            await Promise.all(runningTaskIds.map(taskId => this.cancelTask(taskId)));
            this.taskQueue.clear();
            this.runningTasks.clear();
            logger_1.logger.info('Task service cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup task service', error);
            throw error;
        }
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.js.map