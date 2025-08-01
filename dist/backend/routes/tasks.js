"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTaskService = initializeTaskService;
const express_1 = require("express");
const logger_1 = require("@/lib/logger");
const task_1 = require("@/services/task");
const auth_1 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
let taskService;
function initializeTaskService(adapterManager, webSocketService) {
    taskService = new task_1.TaskService(adapterManager, webSocketService);
}
const createTaskSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1, 'Agent ID is required'),
    workflowId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, 'Task name is required').max(200),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    scheduledAt: zod_1.z.string().datetime().optional(),
    parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
    maxRetries: zod_1.z.number().min(0).max(10).default(3),
    timeoutMs: zod_1.z.number().min(1000).max(300000).default(30000)
});
const updateTaskSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
    parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    maxRetries: zod_1.z.number().min(0).max(10).optional(),
    timeoutMs: zod_1.z.number().min(1000).max(300000).optional()
});
const taskQuerySchema = validation_1.paginationQuerySchema.extend({
    agentId: zod_1.z.string().optional(),
    workflowId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    search: zod_1.z.string().optional(),
    createdBy: zod_1.z.string().optional()
});
router.get('/', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateQuery)(taskQuerySchema), async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', agentId, workflowId, status, priority, dateFrom, dateTo, search, createdBy } = req.query;
        logger_1.logger.info('Get tasks request', {
            userId: req.user.id,
            filters: { agentId, workflowId, status, priority, dateFrom, dateTo, search, createdBy },
            pagination: { page, limit, sortBy, sortOrder }
        });
        const result = await taskService.getTasks({
            page: Number(page),
            limit: Number(limit),
            sortBy: sortBy,
            sortOrder: sortOrder,
            agentId: agentId,
            workflowId: workflowId,
            status: status,
            priority: priority,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            search: search,
            createdBy: createdBy
        });
        res.status(200).json({
            success: true,
            data: {
                tasks: result.tasks,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            },
            message: 'Tasks retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get tasks failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve tasks'
            }
        });
    }
});
router.get('/:id', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        const { id } = req.params;
        logger_1.logger.info('Get task by ID request', {
            userId: req.user.id,
            taskId: id
        });
        const task = await taskService.getTask(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'TASK_NOT_FOUND',
                    message: 'Task not found'
                }
            });
        }
        res.status(200).json({
            success: true,
            data: { task },
            message: 'Task retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get task by ID failed', error, {
            userId: req.user?.id,
            taskId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve task'
            }
        });
    }
});
router.post('/', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateBody)(createTaskSchema), async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        const taskData = req.body;
        logger_1.logger.info('Create task request', {
            userId: req.user.id,
            taskData: { ...taskData, parameters: '[REDACTED]' }
        });
        const task = await taskService.createTask({
            ...taskData,
            scheduledAt: taskData.scheduledAt ? new Date(taskData.scheduledAt) : undefined,
            createdBy: req.user.id
        });
        logger_1.logger.info('Task created successfully', {
            userId: req.user.id,
            taskId: task.id
        });
        res.status(201).json({
            success: true,
            data: { task },
            message: 'Task created successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Create task failed', error, { userId: req.user?.id });
        const statusCode = error.message.includes('not found') ||
            error.message.includes('not active') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
                message: error.message
            }
        });
    }
});
router.put('/:id', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), (0, validation_1.validateBody)(updateTaskSchema), async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        const { id } = req.params;
        const updateData = req.body;
        logger_1.logger.info('Update task request', {
            userId: req.user.id,
            taskId: id,
            updateData: { ...updateData, parameters: updateData.parameters ? '[REDACTED]' : undefined }
        });
        const task = await taskService.updateTask(id, {
            ...updateData,
            scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : undefined
        });
        logger_1.logger.info('Task updated successfully', {
            userId: req.user.id,
            taskId: id
        });
        res.status(200).json({
            success: true,
            data: { task },
            message: 'Task updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update task failed', error, {
            userId: req.user?.id,
            taskId: req.params.id
        });
        const statusCode = error.message.includes('not found') ||
            error.message.includes('Cannot update') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
                message: error.message
            }
        });
    }
});
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        const { id } = req.params;
        logger_1.logger.info('Delete task request', {
            userId: req.user.id,
            taskId: id
        });
        await taskService.deleteTask(id);
        logger_1.logger.info('Task deleted successfully', {
            userId: req.user.id,
            taskId: id
        });
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete task failed', error, {
            userId: req.user?.id,
            taskId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to delete task'
            }
        });
    }
});
router.post('/:id/cancel', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        const { id } = req.params;
        logger_1.logger.info('Cancel task request', {
            userId: req.user.id,
            taskId: id
        });
        await taskService.cancelTask(id);
        logger_1.logger.info('Task cancellation initiated', {
            userId: req.user.id,
            taskId: id
        });
        res.status(200).json({
            success: true,
            message: 'Task cancellation initiated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Cancel task failed', error, {
            userId: req.user?.id,
            taskId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to cancel task'
            }
        });
    }
});
router.post('/:id/retry', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        const { id } = req.params;
        logger_1.logger.info('Retry task request', {
            userId: req.user.id,
            taskId: id
        });
        await taskService.retryTask(id);
        logger_1.logger.info('Task retry initiated', {
            userId: req.user.id,
            taskId: id
        });
        res.status(200).json({
            success: true,
            message: 'Task retry initiated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Retry task failed', error, {
            userId: req.user?.id,
            taskId: req.params.id
        });
        const statusCode = error.message.includes('not found') ||
            error.message.includes('not in failed state') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: {
                code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
                message: error.message
            }
        });
    }
});
router.get('/queue/status', auth_1.authenticate, auth_1.requireAuth, async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        logger_1.logger.info('Get queue status request', {
            userId: req.user.id
        });
        const queueStatus = taskService.getQueueStatus();
        res.status(200).json({
            success: true,
            data: { queueStatus },
            message: 'Queue status retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get queue status failed', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve queue status'
            }
        });
    }
});
router.post('/queue/configure', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        if (!taskService) {
            throw new Error('Task service not initialized');
        }
        const { maxConcurrentTasks, queueProcessingInterval } = req.body;
        logger_1.logger.info('Configure task execution request', {
            userId: req.user.id,
            config: { maxConcurrentTasks, queueProcessingInterval }
        });
        taskService.configureExecution({
            maxConcurrentTasks,
            queueProcessingInterval
        });
        res.status(200).json({
            success: true,
            message: 'Task execution configuration updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Configure task execution failed', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to configure task execution'
            }
        });
    }
});
router.get('/:id/logs', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Get task logs request', {
            userId: req.user.id,
            taskId: id
        });
        const mockLogs = [
            {
                timestamp: new Date(),
                level: 'info',
                message: 'Task started',
                context: { taskId: id }
            },
            {
                timestamp: new Date(),
                level: 'debug',
                message: 'Processing parameters',
                context: { paramCount: 3 }
            },
            {
                timestamp: new Date(),
                level: 'info',
                message: 'Executing agent workflow',
                context: { agentId: 'agent_1' }
            },
            {
                timestamp: new Date(),
                level: 'info',
                message: 'Task completed successfully',
                context: { duration: 1500, result: 'success' }
            }
        ];
        res.status(200).json({
            success: true,
            data: { logs: mockLogs },
            message: 'Task logs retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Get task logs failed', error, {
            userId: req.user?.id,
            taskId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve task logs'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.js.map