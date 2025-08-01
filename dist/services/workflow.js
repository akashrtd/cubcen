"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const database_1 = require("@/lib/database");
const logger_1 = require("@/lib/logger");
const zod_1 = require("zod");
const events_1 = require("events");
const workflowCreationSchema = zod_1.z.object({
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
    })).min(1),
    createdBy: zod_1.z.string().min(1)
});
const workflowUpdateSchema = zod_1.z.object({
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
});
const workflowExecutionSchema = zod_1.z.object({
    variables: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).default({}),
    dryRun: zod_1.z.boolean().default(false)
});
class WorkflowService extends events_1.EventEmitter {
    constructor(adapterManager, taskService, webSocketService) {
        super();
        this.runningExecutions = new Map();
        this.executionTimeouts = new Map();
        this.adapterManager = adapterManager;
        this.taskService = taskService;
        this.webSocketService = webSocketService;
    }
    setWebSocketService(webSocketService) {
        this.webSocketService = webSocketService;
    }
    async createWorkflow(data) {
        try {
            const validatedData = workflowCreationSchema.parse(data);
            logger_1.logger.info('Creating new workflow', {
                name: validatedData.name,
                stepCount: validatedData.steps.length,
                createdBy: validatedData.createdBy
            });
            const validation = await this.validateWorkflowDefinition({
                id: '',
                name: validatedData.name,
                description: validatedData.description,
                status: 'DRAFT',
                steps: validatedData.steps.map(step => ({
                    id: '',
                    workflowId: '',
                    ...step,
                    conditions: step.conditions || [{ type: 'always' }]
                })),
                createdBy: validatedData.createdBy,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            if (!validation.valid) {
                throw new Error(`Workflow validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
            }
            const workflow = await database_1.prisma.workflow.create({
                data: {
                    name: validatedData.name,
                    description: validatedData.description,
                    status: 'DRAFT',
                    createdBy: validatedData.createdBy,
                    steps: {
                        create: validatedData.steps.map(step => ({
                            agentId: step.agentId,
                            stepOrder: step.stepOrder,
                            name: step.name,
                            parameters: JSON.stringify(step.parameters || {}),
                            conditions: JSON.stringify(step.conditions || [{ type: 'always' }])
                        }))
                    }
                },
                include: {
                    steps: {
                        include: {
                            agent: true
                        },
                        orderBy: {
                            stepOrder: 'asc'
                        }
                    },
                    creator: {
                        select: { id: true, email: true, name: true }
                    }
                }
            });
            const workflowDefinition = {
                id: workflow.id,
                name: workflow.name,
                description: workflow.description || undefined,
                status: workflow.status,
                steps: workflow.steps.map(step => ({
                    id: step.id,
                    workflowId: step.workflowId,
                    agentId: step.agentId,
                    stepOrder: step.stepOrder,
                    name: step.name,
                    parameters: JSON.parse(step.parameters),
                    conditions: JSON.parse(step.conditions)
                })),
                createdBy: workflow.createdBy,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt
            };
            logger_1.logger.info('Workflow created successfully', {
                workflowId: workflow.id,
                name: workflow.name,
                stepCount: workflow.steps.length
            });
            return workflowDefinition;
        }
        catch (error) {
            logger_1.logger.error('Failed to create workflow', error, {
                name: data.name,
                stepCount: data.steps.length
            });
            throw error;
        }
    }
    async updateWorkflow(workflowId, data) {
        try {
            const validatedData = workflowUpdateSchema.parse(data);
            logger_1.logger.info('Updating workflow', { workflowId, updateData: validatedData });
            const existingWorkflow = await database_1.prisma.workflow.findUnique({
                where: { id: workflowId },
                include: { steps: true }
            });
            if (!existingWorkflow) {
                throw new Error(`Workflow with ID ${workflowId} not found`);
            }
            if (this.runningExecutions.has(workflowId)) {
                throw new Error('Cannot update a workflow that is currently executing');
            }
            const workflow = await database_1.prisma.$transaction(async (tx) => {
                const updatedWorkflow = await tx.workflow.update({
                    where: { id: workflowId },
                    data: {
                        ...(validatedData.name && { name: validatedData.name }),
                        ...(validatedData.description !== undefined && { description: validatedData.description }),
                        ...(validatedData.status && { status: validatedData.status }),
                        updatedAt: new Date()
                    }
                });
                if (validatedData.steps) {
                    await tx.workflowStep.deleteMany({
                        where: { workflowId }
                    });
                    await tx.workflowStep.createMany({
                        data: validatedData.steps.map(step => ({
                            workflowId,
                            agentId: step.agentId,
                            stepOrder: step.stepOrder,
                            name: step.name,
                            parameters: JSON.stringify(step.parameters || {}),
                            conditions: JSON.stringify(step.conditions || [{ type: 'always' }])
                        }))
                    });
                }
                return await tx.workflow.findUnique({
                    where: { id: workflowId },
                    include: {
                        steps: {
                            include: {
                                agent: true
                            },
                            orderBy: {
                                stepOrder: 'asc'
                            }
                        },
                        creator: {
                            select: { id: true, email: true, name: true }
                        }
                    }
                });
            });
            if (!workflow) {
                throw new Error('Failed to retrieve updated workflow');
            }
            const workflowDefinition = {
                id: workflow.id,
                name: workflow.name,
                description: workflow.description || undefined,
                status: workflow.status,
                steps: workflow.steps.map(step => ({
                    id: step.id,
                    workflowId: step.workflowId,
                    agentId: step.agentId,
                    stepOrder: step.stepOrder,
                    name: step.name,
                    parameters: JSON.parse(step.parameters),
                    conditions: JSON.parse(step.conditions)
                })),
                createdBy: workflow.createdBy,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt
            };
            logger_1.logger.info('Workflow updated successfully', {
                workflowId,
                name: workflow.name
            });
            return workflowDefinition;
        }
        catch (error) {
            logger_1.logger.error('Failed to update workflow', error, { workflowId });
            throw error;
        }
    }
    async getWorkflow(workflowId) {
        try {
            const workflow = await database_1.prisma.workflow.findUnique({
                where: { id: workflowId },
                include: {
                    steps: {
                        include: {
                            agent: true
                        },
                        orderBy: {
                            stepOrder: 'asc'
                        }
                    },
                    creator: {
                        select: { id: true, email: true, name: true }
                    }
                }
            });
            if (!workflow) {
                return null;
            }
            return {
                id: workflow.id,
                name: workflow.name,
                description: workflow.description || undefined,
                status: workflow.status,
                steps: workflow.steps.map(step => ({
                    id: step.id,
                    workflowId: step.workflowId,
                    agentId: step.agentId,
                    stepOrder: step.stepOrder,
                    name: step.name,
                    parameters: JSON.parse(step.parameters),
                    conditions: JSON.parse(step.conditions)
                })),
                createdBy: workflow.createdBy,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get workflow', error, { workflowId });
            throw error;
        }
    }
    async getWorkflows(options = {}) {
        try {
            const { status, createdBy, dateFrom, dateTo, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
            const where = {};
            if (status)
                where.status = status;
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
            const total = await database_1.prisma.workflow.count({ where });
            const workflows = await database_1.prisma.workflow.findMany({
                where,
                include: {
                    steps: {
                        include: {
                            agent: true
                        },
                        orderBy: {
                            stepOrder: 'asc'
                        }
                    },
                    creator: {
                        select: { id: true, email: true, name: true }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit
            });
            const workflowDefinitions = workflows.map(workflow => ({
                id: workflow.id,
                name: workflow.name,
                description: workflow.description || undefined,
                status: workflow.status,
                steps: workflow.steps.map(step => ({
                    id: step.id,
                    workflowId: step.workflowId,
                    agentId: step.agentId,
                    stepOrder: step.stepOrder,
                    name: step.name,
                    parameters: JSON.parse(step.parameters),
                    conditions: JSON.parse(step.conditions)
                })),
                createdBy: workflow.createdBy,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt
            }));
            return {
                workflows: workflowDefinitions,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get workflows', error, options);
            throw error;
        }
    }
    async deleteWorkflow(workflowId) {
        try {
            logger_1.logger.info('Deleting workflow', { workflowId });
            if (this.runningExecutions.has(workflowId)) {
                throw new Error('Cannot delete a workflow that is currently executing');
            }
            await database_1.prisma.workflow.delete({
                where: { id: workflowId }
            });
            logger_1.logger.info('Workflow deleted successfully', { workflowId });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete workflow', error, { workflowId });
            throw error;
        }
    }
    async validateWorkflowDefinition(workflow) {
        const errors = [];
        const warnings = [];
        try {
            const agentIds = workflow.steps.map(step => step.agentId);
            const agents = await database_1.prisma.agent.findMany({
                where: { id: { in: agentIds } }
            });
            const existingAgentIds = new Set(agents.map(agent => agent.id));
            const activeAgentIds = new Set(agents.filter(agent => agent.status === 'ACTIVE').map(agent => agent.id));
            for (const step of workflow.steps) {
                if (!existingAgentIds.has(step.agentId)) {
                    errors.push({
                        type: 'missing_agent',
                        stepId: step.id,
                        message: `Agent ${step.agentId} not found for step "${step.name}"`
                    });
                }
                else if (!activeAgentIds.has(step.agentId)) {
                    warnings.push({
                        type: 'missing_dependency',
                        stepId: step.id,
                        message: `Agent ${step.agentId} is not active for step "${step.name}"`
                    });
                }
            }
            const dependencies = this.buildDependencyGraph(workflow.steps);
            const circularDeps = this.detectCircularDependencies(dependencies);
            for (const cycle of circularDeps) {
                errors.push({
                    type: 'circular_dependency',
                    message: `Circular dependency detected: ${cycle.join(' -> ')}`
                });
            }
            const reachableSteps = this.findReachableSteps(workflow.steps);
            for (const step of workflow.steps) {
                if (!reachableSteps.has(step.id)) {
                    warnings.push({
                        type: 'unreachable_step',
                        stepId: step.id,
                        message: `Step "${step.name}" may be unreachable`
                    });
                }
            }
            for (const step of workflow.steps) {
                for (const condition of step.conditions) {
                    if (condition.type === 'expression' && !condition.expression) {
                        errors.push({
                            type: 'invalid_condition',
                            stepId: step.id,
                            message: `Expression condition missing expression for step "${step.name}"`
                        });
                    }
                    if (condition.dependsOn) {
                        for (const depId of condition.dependsOn) {
                            if (!workflow.steps.find(s => s.id === depId)) {
                                errors.push({
                                    type: 'invalid_condition',
                                    stepId: step.id,
                                    message: `Dependency "${depId}" not found for step "${step.name}"`
                                });
                            }
                        }
                    }
                }
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to validate workflow', error, { workflowId: workflow.id });
            return {
                valid: false,
                errors: [{
                        type: 'invalid_parameters',
                        message: `Validation error: ${error.message}`
                    }],
                warnings: []
            };
        }
    }
    async executeWorkflow(workflowId, options = {}, createdBy) {
        try {
            const validatedOptions = workflowExecutionSchema.parse(options);
            logger_1.logger.info('Starting workflow execution', {
                workflowId,
                options: validatedOptions,
                createdBy
            });
            const workflow = await this.getWorkflow(workflowId);
            if (!workflow) {
                throw new Error(`Workflow ${workflowId} not found`);
            }
            if (workflow.status !== 'ACTIVE') {
                throw new Error(`Workflow ${workflowId} is not active (status: ${workflow.status})`);
            }
            const validation = await this.validateWorkflowDefinition(workflow);
            if (!validation.valid) {
                throw new Error(`Workflow validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
            }
            const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const execution = {
                id: executionId,
                workflowId,
                status: 'PENDING',
                startedAt: new Date(),
                context: {
                    variables: validatedOptions.variables || {},
                    stepOutputs: {},
                    metadata: validatedOptions.metadata || {}
                },
                stepExecutions: workflow.steps.map(step => ({
                    id: `step_${step.id}_${Date.now()}`,
                    workflowExecutionId: executionId,
                    stepId: step.id,
                    agentId: step.agentId,
                    status: 'PENDING',
                    input: {},
                    retryCount: 0
                })),
                createdBy
            };
            this.runningExecutions.set(executionId, execution);
            this.webSocketService?.notifyWorkflowStatusChange(executionId, 'PENDING', {
                workflowId,
                workflowName: workflow.name,
                totalSteps: workflow.steps.length
            });
            if (!validatedOptions.dryRun) {
                this.performWorkflowExecution(workflow, execution).catch(error => {
                    logger_1.logger.error('Unhandled workflow execution error', error, { executionId });
                });
            }
            else {
                execution.status = 'COMPLETED';
                execution.completedAt = new Date();
                this.runningExecutions.delete(executionId);
                this.webSocketService?.notifyWorkflowStatusChange(executionId, 'COMPLETED', {
                    dryRun: true,
                    validation
                });
            }
            logger_1.logger.info('Workflow execution started', { executionId, workflowId });
            return executionId;
        }
        catch (error) {
            logger_1.logger.error('Failed to start workflow execution', error, { workflowId });
            throw error;
        }
    }
    getWorkflowExecution(executionId) {
        return this.runningExecutions.get(executionId) || null;
    }
    async cancelWorkflowExecution(executionId) {
        try {
            logger_1.logger.info('Cancelling workflow execution', { executionId });
            const execution = this.runningExecutions.get(executionId);
            if (!execution) {
                throw new Error(`Workflow execution ${executionId} not found`);
            }
            execution.status = 'CANCELLED';
            execution.completedAt = new Date();
            for (const stepExecution of execution.stepExecutions) {
                if (stepExecution.status === 'RUNNING') {
                    stepExecution.status = 'SKIPPED';
                    stepExecution.completedAt = new Date();
                }
            }
            const timeout = this.executionTimeouts.get(executionId);
            if (timeout) {
                clearTimeout(timeout);
                this.executionTimeouts.delete(executionId);
            }
            this.runningExecutions.delete(executionId);
            this.webSocketService?.notifyWorkflowStatusChange(executionId, 'CANCELLED', {
                cancelled: true,
                timestamp: new Date()
            });
            logger_1.logger.info('Workflow execution cancelled', { executionId });
        }
        catch (error) {
            logger_1.logger.error('Failed to cancel workflow execution', error, { executionId });
            throw error;
        }
    }
    getWorkflowProgress(executionId) {
        const execution = this.runningExecutions.get(executionId);
        if (!execution) {
            return null;
        }
        const totalSteps = execution.stepExecutions.length;
        const completedSteps = execution.stepExecutions.filter(step => step.status === 'COMPLETED').length;
        const failedSteps = execution.stepExecutions.filter(step => step.status === 'FAILED').length;
        const currentStep = execution.stepExecutions.find(step => step.status === 'RUNNING');
        const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        return {
            workflowExecutionId: executionId,
            totalSteps,
            completedSteps,
            failedSteps,
            currentStep: currentStep?.stepId,
            progress
        };
    }
    async performWorkflowExecution(workflow, execution) {
        try {
            logger_1.logger.info('Performing workflow execution', {
                executionId: execution.id,
                workflowId: workflow.id,
                stepCount: workflow.steps.length
            });
            execution.status = 'RUNNING';
            this.webSocketService?.notifyWorkflowStatusChange(execution.id, 'RUNNING', {
                startedAt: execution.startedAt
            });
            for (const step of workflow.steps) {
                if (execution.status === 'CANCELLED') {
                    break;
                }
                if (!this.shouldExecuteStep(step, execution)) {
                    const stepExecution = execution.stepExecutions.find(se => se.stepId === step.id);
                    if (stepExecution) {
                        stepExecution.status = 'SKIPPED';
                        stepExecution.completedAt = new Date();
                    }
                    continue;
                }
                await this.executeWorkflowStep(workflow, step, execution);
                const stepExecution = execution.stepExecutions.find(se => se.stepId === step.id);
                if (stepExecution?.status === 'FAILED') {
                    const continueOnFailure = step.conditions.some(c => c.type === 'on_failure');
                    if (!continueOnFailure) {
                        throw new Error(`Step "${step.name}" failed and workflow cannot continue`);
                    }
                }
                const progress = this.getWorkflowProgress(execution.id);
                if (progress) {
                    this.webSocketService?.notifyWorkflowProgress(execution.id, progress);
                }
            }
            execution.status = 'COMPLETED';
            execution.completedAt = new Date();
            this.runningExecutions.delete(execution.id);
            this.webSocketService?.notifyWorkflowStatusChange(execution.id, 'COMPLETED', {
                completedAt: execution.completedAt,
                totalSteps: workflow.steps.length,
                completedSteps: execution.stepExecutions.filter(se => se.status === 'COMPLETED').length
            });
            this.emit('workflowCompleted', {
                executionId: execution.id,
                workflowId: workflow.id,
                duration: execution.completedAt.getTime() - execution.startedAt.getTime()
            });
            logger_1.logger.info('Workflow execution completed successfully', {
                executionId: execution.id,
                workflowId: workflow.id,
                duration: execution.completedAt.getTime() - execution.startedAt.getTime()
            });
        }
        catch (error) {
            await this.handleWorkflowError(execution, error);
        }
    }
    async executeWorkflowStep(workflow, step, execution) {
        const stepExecution = execution.stepExecutions.find(se => se.stepId === step.id);
        if (!stepExecution) {
            throw new Error(`Step execution not found for step ${step.id}`);
        }
        try {
            logger_1.logger.info('Executing workflow step', {
                executionId: execution.id,
                stepId: step.id,
                stepName: step.name,
                agentId: step.agentId
            });
            stepExecution.status = 'RUNNING';
            stepExecution.startedAt = new Date();
            const stepInput = {
                ...step.parameters,
                ...this.resolveVariables(step.parameters, execution.context)
            };
            stepExecution.input = stepInput;
            const agent = await database_1.prisma.agent.findUnique({
                where: { id: step.agentId },
                include: { platform: true }
            });
            if (!agent) {
                throw new Error(`Agent ${step.agentId} not found`);
            }
            const adapter = this.adapterManager.getAdapter(agent.platformId);
            if (!adapter) {
                throw new Error(`No adapter found for platform ${agent.platformId}`);
            }
            const retryConfig = step.retryConfig || {
                maxRetries: 3,
                backoffMs: 1000,
                backoffMultiplier: 2,
                maxBackoffMs: 30000
            };
            let lastError = null;
            for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
                try {
                    const result = await adapter.executeAgent(agent.externalId, stepInput);
                    if (!result.success) {
                        throw new Error(result.error || 'Agent execution failed');
                    }
                    stepExecution.output = result.data;
                    stepExecution.status = 'COMPLETED';
                    stepExecution.completedAt = new Date();
                    stepExecution.executionTime = Date.now() - (stepExecution.startedAt?.getTime() || Date.now());
                    execution.context.stepOutputs[step.id] = result.data;
                    logger_1.logger.info('Workflow step completed successfully', {
                        executionId: execution.id,
                        stepId: step.id,
                        stepName: step.name,
                        executionTime: stepExecution.executionTime,
                        attempt: attempt + 1
                    });
                    return;
                }
                catch (error) {
                    lastError = error;
                    stepExecution.retryCount = attempt;
                    if (attempt < retryConfig.maxRetries) {
                        const delay = Math.min(retryConfig.backoffMs * Math.pow(retryConfig.backoffMultiplier, attempt), retryConfig.maxBackoffMs);
                        logger_1.logger.warn('Workflow step failed, retrying', {
                            executionId: execution.id,
                            stepId: step.id,
                            stepName: step.name,
                            attempt: attempt + 1,
                            maxRetries: retryConfig.maxRetries,
                            retryDelay: delay,
                            error: error.message
                        });
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            throw lastError || new Error('Step execution failed after all retries');
        }
        catch (error) {
            stepExecution.status = 'FAILED';
            stepExecution.completedAt = new Date();
            stepExecution.error = error.message;
            stepExecution.executionTime = Date.now() - (stepExecution.startedAt?.getTime() || Date.now());
            logger_1.logger.error('Workflow step failed', error, {
                executionId: execution.id,
                stepId: step.id,
                stepName: step.name,
                retryCount: stepExecution.retryCount
            });
            throw error;
        }
    }
    shouldExecuteStep(step, execution) {
        for (const condition of step.conditions) {
            switch (condition.type) {
                case 'always':
                    return true;
                case 'on_success':
                    if (condition.dependsOn) {
                        return condition.dependsOn.every(depId => {
                            const depExecution = execution.stepExecutions.find(se => se.stepId === depId);
                            return depExecution?.status === 'COMPLETED';
                        });
                    }
                    return true;
                case 'on_failure':
                    if (condition.dependsOn) {
                        return condition.dependsOn.some(depId => {
                            const depExecution = execution.stepExecutions.find(se => se.stepId === depId);
                            return depExecution?.status === 'FAILED';
                        });
                    }
                    return false;
                case 'expression':
                    return true;
                default:
                    return false;
            }
        }
        return false;
    }
    resolveVariables(parameters, context) {
        const resolved = {};
        for (const [key, value] of Object.entries(parameters)) {
            if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
                const varPath = value.slice(2, -1);
                resolved[key] = this.getValueFromPath(varPath, context);
            }
            else {
                resolved[key] = value;
            }
        }
        return resolved;
    }
    getValueFromPath(path, context) {
        const parts = path.split('.');
        let current = context;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    async handleWorkflowError(execution, error) {
        logger_1.logger.error('Workflow execution failed', error, {
            executionId: execution.id,
            workflowId: execution.workflowId
        });
        execution.status = 'FAILED';
        execution.completedAt = new Date();
        execution.error = error.message;
        this.runningExecutions.delete(execution.id);
        const timeout = this.executionTimeouts.get(execution.id);
        if (timeout) {
            clearTimeout(timeout);
            this.executionTimeouts.delete(execution.id);
        }
        this.webSocketService?.notifyWorkflowStatusChange(execution.id, 'FAILED', {
            error: error.message,
            completedAt: execution.completedAt
        });
        this.webSocketService?.notifyWorkflowError(execution.id, error.message, {
            workflowId: execution.workflowId,
            timestamp: new Date()
        });
        this.emit('workflowFailed', {
            executionId: execution.id,
            workflowId: execution.workflowId,
            error: error.message
        });
    }
    buildDependencyGraph(steps) {
        const graph = new Map();
        for (const step of steps) {
            const dependencies = [];
            for (const condition of step.conditions) {
                if (condition.dependsOn) {
                    dependencies.push(...condition.dependsOn);
                }
            }
            graph.set(step.id, dependencies);
        }
        return graph;
    }
    detectCircularDependencies(graph) {
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (node, path) => {
            if (recursionStack.has(node)) {
                const cycleStart = path.indexOf(node);
                cycles.push(path.slice(cycleStart).concat(node));
                return;
            }
            if (visited.has(node)) {
                return;
            }
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            const dependencies = graph.get(node) || [];
            for (const dep of dependencies) {
                dfs(dep, [...path]);
            }
            recursionStack.delete(node);
            path.pop();
        };
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                dfs(node, []);
            }
        }
        return cycles;
    }
    findReachableSteps(steps) {
        const reachable = new Set();
        const entryPoints = steps.filter(step => step.conditions.every(condition => !condition.dependsOn || condition.dependsOn.length === 0));
        if (entryPoints.length === 0 && steps.length > 0) {
            entryPoints.push(steps[0]);
        }
        const queue = [...entryPoints.map(step => step.id)];
        while (queue.length > 0) {
            const stepId = queue.shift();
            if (reachable.has(stepId)) {
                continue;
            }
            reachable.add(stepId);
            for (const step of steps) {
                for (const condition of step.conditions) {
                    if (condition.dependsOn?.includes(stepId) && !reachable.has(step.id)) {
                        queue.push(step.id);
                    }
                }
            }
        }
        return reachable;
    }
    async cleanup() {
        try {
            logger_1.logger.info('Cleaning up workflow service');
            const runningExecutionIds = Array.from(this.runningExecutions.keys());
            await Promise.all(runningExecutionIds.map(executionId => this.cancelWorkflowExecution(executionId)));
            for (const timeout of this.executionTimeouts.values()) {
                clearTimeout(timeout);
            }
            this.executionTimeouts.clear();
            logger_1.logger.info('Workflow service cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup workflow service', error);
            throw error;
        }
    }
}
exports.WorkflowService = WorkflowService;
//# sourceMappingURL=workflow.js.map