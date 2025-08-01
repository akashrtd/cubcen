"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflowRoutes = createWorkflowRoutes;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("@/backend/middleware/auth");
const validation_1 = require("@/backend/middleware/validation");
const logger_1 = require("@/lib/logger");
const createWorkflowSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(200),
        description: zod_1.z.string().optional(),
        steps: zod_1.z.array(zod_1.z.object({
            agentId: zod_1.z.string().min(1),
            stepOrder: zod_1.z.number().min(0),
            name: zod_1.z.string().min(1).max(200),
            parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
            conditions: zod_1.z.array(zod_1.z.object({
                type: zod_1.z.enum(['always', 'on_success', 'on_failure', 'expression']),
                expression: zod_1.z.string().optional(),
                dependsOn: zod_1.z.array(zod_1.z.string()).optional()
            })).default([{ type: 'always' }]),
            retryConfig: zod_1.z.object({
                maxRetries: zod_1.z.number().min(0).max(10).default(3),
                backoffMs: zod_1.z.number().min(100).default(1000),
                backoffMultiplier: zod_1.z.number().min(1).default(2),
                maxBackoffMs: zod_1.z.number().min(1000).default(30000)
            }).optional(),
            timeoutMs: zod_1.z.number().min(1000).max(300000).default(60000)
        })).min(1)
    })
});
const updateWorkflowSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(200).optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
        steps: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string().optional(),
            agentId: zod_1.z.string().min(1),
            stepOrder: zod_1.z.number().min(0),
            name: zod_1.z.string().min(1).max(200),
            parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
            conditions: zod_1.z.array(zod_1.z.object({
                type: zod_1.z.enum(['always', 'on_success', 'on_failure', 'expression']),
                expression: zod_1.z.string().optional(),
                dependsOn: zod_1.z.array(zod_1.z.string()).optional()
            })).default([{ type: 'always' }]),
            retryConfig: zod_1.z.object({
                maxRetries: zod_1.z.number().min(0).max(10).default(3),
                backoffMs: zod_1.z.number().min(100).default(1000),
                backoffMultiplier: zod_1.z.number().min(1).default(2),
                maxBackoffMs: zod_1.z.number().min(1000).default(30000)
            }).optional(),
            timeoutMs: zod_1.z.number().min(1000).max(300000).default(60000)
        })).optional()
    })
});
const getWorkflowsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).default('1'),
        limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).default('10'),
        status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
        createdBy: zod_1.z.string().optional(),
        dateFrom: zod_1.z.string().datetime().transform(str => new Date(str)).optional(),
        dateTo: zod_1.z.string().datetime().transform(str => new Date(str)).optional(),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
    })
});
const executeWorkflowSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    }),
    body: zod_1.z.object({
        variables: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
        dryRun: zod_1.z.boolean().default(false)
    })
});
const workflowIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
const executionIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        executionId: zod_1.z.string().min(1)
    })
});
function createWorkflowRoutes(workflowService) {
    const router = (0, express_1.Router)();
    router.post('/', auth_1.authenticateToken, (0, validation_1.validateRequest)(createWorkflowSchema), async (req, res, next) => {
        try {
            const { name, description, steps } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'User ID not found in token'
                    }
                });
            }
            const workflowData = {
                name,
                description,
                steps,
                createdBy: userId
            };
            const workflow = await workflowService.createWorkflow(workflowData);
            logger_1.logger.info('Workflow created via API', {
                workflowId: workflow.id,
                name: workflow.name,
                userId,
                stepCount: workflow.steps.length
            });
            res.status(201).json({
                success: true,
                data: workflow
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to create workflow via API', error, {
                userId: req.user?.id,
                body: req.body
            });
            next(error);
        }
    });
    router.get('/', auth_1.authenticateToken, (0, validation_1.validateRequest)(getWorkflowsSchema), async (req, res, next) => {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                status: req.query.status,
                createdBy: req.query.createdBy,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                search: req.query.search,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder
            };
            const result = await workflowService.getWorkflows(options);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get workflows via API', error, {
                userId: req.user?.id,
                query: req.query
            });
            next(error);
        }
    });
    router.get('/:id', auth_1.authenticateToken, (0, validation_1.validateRequest)(workflowIdSchema), async (req, res, next) => {
        try {
            const { id } = req.params;
            const workflow = await workflowService.getWorkflow(id);
            if (!workflow) {
                return res.status(404).json({
                    error: {
                        code: 'WORKFLOW_NOT_FOUND',
                        message: `Workflow with ID ${id} not found`
                    }
                });
            }
            res.json({
                success: true,
                data: workflow
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get workflow via API', error, {
                userId: req.user?.id,
                workflowId: req.params.id
            });
            next(error);
        }
    });
    router.put('/:id', auth_1.authenticateToken, (0, validation_1.validateRequest)(updateWorkflowSchema), async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const workflow = await workflowService.updateWorkflow(id, updateData);
            logger_1.logger.info('Workflow updated via API', {
                workflowId: id,
                userId: req.user?.id,
                updateData
            });
            res.json({
                success: true,
                data: workflow
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to update workflow via API', error, {
                userId: req.user?.id,
                workflowId: req.params.id,
                body: req.body
            });
            next(error);
        }
    });
    router.delete('/:id', auth_1.authenticateToken, (0, validation_1.validateRequest)(workflowIdSchema), async (req, res, next) => {
        try {
            const { id } = req.params;
            await workflowService.deleteWorkflow(id);
            logger_1.logger.info('Workflow deleted via API', {
                workflowId: id,
                userId: req.user?.id
            });
            res.json({
                success: true,
                message: 'Workflow deleted successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete workflow via API', error, {
                userId: req.user?.id,
                workflowId: req.params.id
            });
            next(error);
        }
    });
    router.post('/:id/validate', auth_1.authenticateToken, (0, validation_1.validateRequest)(workflowIdSchema), async (req, res, next) => {
        try {
            const { id } = req.params;
            const workflow = await workflowService.getWorkflow(id);
            if (!workflow) {
                return res.status(404).json({
                    error: {
                        code: 'WORKFLOW_NOT_FOUND',
                        message: `Workflow with ID ${id} not found`
                    }
                });
            }
            const validation = await workflowService.validateWorkflowDefinition(workflow);
            res.json({
                success: true,
                data: validation
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to validate workflow via API', error, {
                userId: req.user?.id,
                workflowId: req.params.id
            });
            next(error);
        }
    });
    router.post('/:id/execute', auth_1.authenticateToken, (0, validation_1.validateRequest)(executeWorkflowSchema), async (req, res, next) => {
        try {
            const { id } = req.params;
            const { variables, metadata, dryRun } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'User ID not found in token'
                    }
                });
            }
            const options = {
                variables,
                metadata,
                dryRun
            };
            const executionId = await workflowService.executeWorkflow(id, options, userId);
            logger_1.logger.info('Workflow execution started via API', {
                workflowId: id,
                executionId,
                userId,
                dryRun
            });
            res.json({
                success: true,
                data: {
                    executionId,
                    workflowId: id,
                    status: 'PENDING',
                    startedAt: new Date().toISOString()
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to execute workflow via API', error, {
                userId: req.user?.id,
                workflowId: req.params.id,
                body: req.body
            });
            next(error);
        }
    });
    router.get('/executions/:executionId', auth_1.authenticateToken, (0, validation_1.validateRequest)(executionIdSchema), async (req, res, next) => {
        try {
            const { executionId } = req.params;
            const execution = workflowService.getWorkflowExecution(executionId);
            if (!execution) {
                return res.status(404).json({
                    error: {
                        code: 'EXECUTION_NOT_FOUND',
                        message: `Workflow execution with ID ${executionId} not found`
                    }
                });
            }
            res.json({
                success: true,
                data: execution
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get workflow execution via API', error, {
                userId: req.user?.id,
                executionId: req.params.executionId
            });
            next(error);
        }
    });
    router.post('/executions/:executionId/cancel', auth_1.authenticateToken, (0, validation_1.validateRequest)(executionIdSchema), async (req, res, next) => {
        try {
            const { executionId } = req.params;
            await workflowService.cancelWorkflowExecution(executionId);
            logger_1.logger.info('Workflow execution cancelled via API', {
                executionId,
                userId: req.user?.id
            });
            res.json({
                success: true,
                message: 'Workflow execution cancelled successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to cancel workflow execution via API', error, {
                userId: req.user?.id,
                executionId: req.params.executionId
            });
            next(error);
        }
    });
    router.get('/executions/:executionId/progress', auth_1.authenticateToken, (0, validation_1.validateRequest)(executionIdSchema), async (req, res, next) => {
        try {
            const { executionId } = req.params;
            const progress = workflowService.getWorkflowProgress(executionId);
            if (!progress) {
                return res.status(404).json({
                    error: {
                        code: 'EXECUTION_NOT_FOUND',
                        message: `Workflow execution with ID ${executionId} not found`
                    }
                });
            }
            res.json({
                success: true,
                data: progress
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get workflow execution progress via API', error, {
                userId: req.user?.id,
                executionId: req.params.executionId
            });
            next(error);
        }
    });
    return router;
}
//# sourceMappingURL=workflows.js.map