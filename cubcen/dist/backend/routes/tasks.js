"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("@/lib/logger");
const auth_1 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createTaskSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1, 'Agent ID is required'),
    workflowId: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    scheduledAt: zod_1.z.string().datetime().optional(),
    parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({})
});
const updateTaskSchema = zod_1.z.object({
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
    parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional()
});
const taskQuerySchema = validation_1.paginationQuerySchema.extend({
    agentId: zod_1.z.string().optional(),
    workflowId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional()
});
router.get('/', auth_1.authenticate, auth_1.requireAuth, (0, validation_1.validateQuery)(taskQuerySchema), async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, agentId, workflowId, status, priority, dateFrom, dateTo } = req.query;
        logger_1.logger.info('Get tasks request', {
            userId: req.user.id,
            filters: { agentId, workflowId, status, priority, dateFrom, dateTo },
            pagination: { page, limit, sortBy, sortOrder }
        });
        const mockTasks = [
            {
                id: 'task_1',
                agentId: 'agent_1',
                workflowId: 'workflow_1',
                status: 'completed',
                priority: 'medium',
                scheduledAt: new Date(),
                startedAt: new Date(),
                completedAt: new Date(),
                parameters: { email: '[email]' },
                result: { success: true, message: 'Email sent successfully' },
                error: null,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'task_2',
                agentId: 'agent_1',
                workflowId: null,
                status: 'running',
                priority: 'high',
                scheduledAt: new Date(),
                startedAt: new Date(),
                completedAt: null,
                parameters: { data: 'processing' },
                result: null,
                error: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        res.status(200).json({
            success: true,
            data: {
                tasks: mockTasks,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: mockTasks.length,
                    totalPages: Math.ceil(mockTasks.length / Number(limit))
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
        const { id } = req.params;
        logger_1.logger.info('Get task by ID request', {
            userId: req.user.id,
            taskId: id
        });
        const mockTask = {
            id,
            agentId: 'agent_1',
            workflowId: 'workflow_1',
            status: 'completed',
            priority: 'medium',
            scheduledAt: new Date(),
            startedAt: new Date(),
            completedAt: new Date(),
            parameters: { email: '[email]' },
            result: { success: true, message: 'Email sent successfully' },
            error: null,
            executionLogs: [
                {
                    timestamp: new Date(),
                    level: 'info',
                    message: 'Task started',
                    context: {}
                },
                {
                    timestamp: new Date(),
                    level: 'info',
                    message: 'Processing email',
                    context: { recipient: '[email]' }
                },
                {
                    timestamp: new Date(),
                    level: 'info',
                    message: 'Task completed successfully',
                    context: { duration: 1500 }
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        res.status(200).json({
            success: true,
            data: { task: mockTask },
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
        const taskData = req.body;
        logger_1.logger.info('Create task request', {
            userId: req.user.id,
            taskData: { ...taskData, parameters: '[REDACTED]' }
        });
        const mockTask = {
            id: `task_${Date.now()}`,
            ...taskData,
            status: 'pending',
            scheduledAt: taskData.scheduledAt ? new Date(taskData.scheduledAt) : new Date(),
            startedAt: null,
            completedAt: null,
            result: null,
            error: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        logger_1.logger.info('Task created successfully', {
            userId: req.user.id,
            taskId: mockTask.id
        });
        res.status(201).json({
            success: true,
            data: { task: mockTask },
            message: 'Task created successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Create task failed', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to create task'
            }
        });
    }
});
router.put('/:id', auth_1.authenticate, auth_1.requireOperator, (0, validation_1.validateParams)(validation_1.idParamSchema), (0, validation_1.validateBody)(updateTaskSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        logger_1.logger.info('Update task request', {
            userId: req.user.id,
            taskId: id,
            updateData: { ...updateData, parameters: updateData.parameters ? '[REDACTED]' : undefined }
        });
        const mockTask = {
            id,
            agentId: 'agent_1',
            workflowId: 'workflow_1',
            status: updateData.status || 'pending',
            priority: updateData.priority || 'medium',
            scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : new Date(),
            startedAt: null,
            completedAt: null,
            parameters: updateData.parameters || { email: '[email]' },
            result: null,
            error: null,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        };
        logger_1.logger.info('Task updated successfully', {
            userId: req.user.id,
            taskId: id
        });
        res.status(200).json({
            success: true,
            data: { task: mockTask },
            message: 'Task updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update task failed', error, {
            userId: req.user?.id,
            taskId: req.params.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update task'
            }
        });
    }
});
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateParams)(validation_1.idParamSchema), async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info('Delete task request', {
            userId: req.user.id,
            taskId: id
        });
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
        const { id } = req.params;
        logger_1.logger.info('Cancel task request', {
            userId: req.user.id,
            taskId: id
        });
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
        const { id } = req.params;
        logger_1.logger.info('Retry task request', {
            userId: req.user.id,
            taskId: id
        });
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
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retry task'
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