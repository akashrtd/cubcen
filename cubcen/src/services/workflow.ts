/**
 * Cubcen Workflow Orchestration Service
 * Handles workflow creation, validation, execution, and monitoring
 */

import { prisma } from '@/lib/database'
import { logger } from '@/lib/logger'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { TaskService } from './task'
import { z } from 'zod'
import { EventEmitter } from 'events'
import {
  WorkflowDefinition,
  WorkflowStepDefinition,
  WorkflowExecution,
  WorkflowContext,
  WorkflowExecutionOptions,
  WorkflowValidationResult,
  WorkflowValidationError,
  WorkflowValidationWarning,
  WorkflowProgress,
  WorkflowListOptions,
  StepCondition,
  RetryConfig,
  WorkflowStatus,
  WorkflowExecutionStatus
} from '@/types/workflow'

// Forward declaration to avoid circular dependency
interface WebSocketService {
  notifyWorkflowStatusChange(executionId: string, status: string, metadata?: Record<string, unknown>): void
  notifyWorkflowProgress(executionId: string, progress: any): void
  notifyWorkflowError(executionId: string, error: string, context?: Record<string, unknown>): void
}

// Validation schemas
const workflowCreationSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  steps: z.array(z.object({
    agentId: z.string().min(1),
    stepOrder: z.number().min(0),
    name: z.string().min(1).max(200),
    parameters: z.record(z.string(), z.unknown()).default({}),
    conditions: z.array(z.object({
      type: z.enum(['always', 'on_success', 'on_failure', 'expression']),
      expression: z.string().optional(),
      dependsOn: z.array(z.string()).optional()
    })).default([{ type: 'always' }]),
    retryConfig: z.object({
      maxRetries: z.number().min(0).max(10).default(3),
      backoffMs: z.number().min(100).default(1000),
      backoffMultiplier: z.number().min(1).default(2),
      maxBackoffMs: z.number().min(1000).default(30000)
    }).optional(),
    timeoutMs: z.number().min(1000).max(300000).default(60000)
  })).min(1),
  createdBy: z.string().min(1)
})

const workflowUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  steps: z.array(z.object({
    id: z.string().optional(),
    agentId: z.string().min(1),
    stepOrder: z.number().min(0),
    name: z.string().min(1).max(200),
    parameters: z.record(z.string(), z.unknown()).default({}),
    conditions: z.array(z.object({
      type: z.enum(['always', 'on_success', 'on_failure', 'expression']),
      expression: z.string().optional(),
      dependsOn: z.array(z.string()).optional()
    })).default([{ type: 'always' }]),
    retryConfig: z.object({
      maxRetries: z.number().min(0).max(10).default(3),
      backoffMs: z.number().min(100).default(1000),
      backoffMultiplier: z.number().min(1).default(2),
      maxBackoffMs: z.number().min(1000).default(30000)
    }).optional(),
    timeoutMs: z.number().min(1000).max(300000).default(60000)
  })).optional()
})

const workflowExecutionSchema = z.object({
  variables: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
  dryRun: z.boolean().default(false)
})

export interface WorkflowCreationData {
  name: string
  description?: string
  steps: Array<{
    agentId: string
    stepOrder: number
    name: string
    parameters?: Record<string, unknown>
    conditions?: StepCondition[]
    retryConfig?: RetryConfig
    timeoutMs?: number
  }>
  createdBy: string
}

export interface WorkflowUpdateData {
  name?: string
  description?: string
  status?: WorkflowStatus
  steps?: Array<{
    id?: string
    agentId: string
    stepOrder: number
    name: string
    parameters?: Record<string, unknown>
    conditions?: StepCondition[]
    retryConfig?: RetryConfig
    timeoutMs?: number
  }>
}

export class WorkflowService extends EventEmitter {
  private adapterManager: AdapterManager
  private taskService: TaskService
  private webSocketService?: WebSocketService
  private runningExecutions: Map<string, WorkflowExecution> = new Map()
  private executionTimeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor(adapterManager: AdapterManager, taskService: TaskService, webSocketService?: WebSocketService) {
    super()
    this.adapterManager = adapterManager
    this.taskService = taskService
    this.webSocketService = webSocketService
  }

  /**
   * Set WebSocket service for real-time updates
   */
  public setWebSocketService(webSocketService: WebSocketService): void {
    this.webSocketService = webSocketService
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(data: WorkflowCreationData): Promise<WorkflowDefinition> {
    try {
      // Validate input data
      const validatedData = workflowCreationSchema.parse(data)

      logger.info('Creating new workflow', {
        name: validatedData.name,
        stepCount: validatedData.steps.length,
        createdBy: validatedData.createdBy
      })

      // Validate workflow definition
      const validation = await this.validateWorkflowDefinition({
        id: '', // Will be set after creation
        name: validatedData.name,
        description: validatedData.description,
        status: 'DRAFT',
        steps: validatedData.steps.map(step => ({
          id: '', // Will be set after creation
          workflowId: '',
          ...step,
          conditions: step.conditions || [{ type: 'always' }]
        })),
        createdBy: validatedData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      // Create workflow in database
      const workflow = await prisma.workflow.create({
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
      })

      const workflowDefinition: WorkflowDefinition = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || undefined,
        status: workflow.status as WorkflowStatus,
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
      }

      logger.info('Workflow created successfully', {
        workflowId: workflow.id,
        name: workflow.name,
        stepCount: workflow.steps.length
      })

      return workflowDefinition
    } catch (error) {
      logger.error('Failed to create workflow', error as Error, {
        name: data.name,
        stepCount: data.steps.length
      })
      throw error
    }
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(workflowId: string, data: WorkflowUpdateData): Promise<WorkflowDefinition> {
    try {
      // Validate input data
      const validatedData = workflowUpdateSchema.parse(data)

      logger.info('Updating workflow', { workflowId, updateData: validatedData })

      // Check if workflow exists
      const existingWorkflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { steps: true }
      })

      if (!existingWorkflow) {
        throw new Error(`Workflow with ID ${workflowId} not found`)
      }

      // Check if workflow is running
      if (this.runningExecutions.has(workflowId)) {
        throw new Error('Cannot update a workflow that is currently executing')
      }

      // Update workflow and steps in transaction
      const workflow = await prisma.$transaction(async (tx) => {
        // Update workflow
        const updatedWorkflow = await tx.workflow.update({
          where: { id: workflowId },
          data: {
            ...(validatedData.name && { name: validatedData.name }),
            ...(validatedData.description !== undefined && { description: validatedData.description }),
            ...(validatedData.status && { status: validatedData.status }),
            updatedAt: new Date()
          }
        })

        // Update steps if provided
        if (validatedData.steps) {
          // Delete existing steps
          await tx.workflowStep.deleteMany({
            where: { workflowId }
          })

          // Create new steps
          await tx.workflowStep.createMany({
            data: validatedData.steps.map(step => ({
              workflowId,
              agentId: step.agentId,
              stepOrder: step.stepOrder,
              name: step.name,
              parameters: JSON.stringify(step.parameters || {}),
              conditions: JSON.stringify(step.conditions || [{ type: 'always' }])
            }))
          })
        }

        // Return updated workflow with steps
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
        })
      })

      if (!workflow) {
        throw new Error('Failed to retrieve updated workflow')
      }

      const workflowDefinition: WorkflowDefinition = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || undefined,
        status: workflow.status as WorkflowStatus,
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
      }

      logger.info('Workflow updated successfully', {
        workflowId,
        name: workflow.name
      })

      return workflowDefinition
    } catch (error) {
      logger.error('Failed to update workflow', error as Error, { workflowId })
      throw error
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
    try {
      const workflow = await prisma.workflow.findUnique({
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
      })

      if (!workflow) {
        return null
      }

      return {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || undefined,
        status: workflow.status as WorkflowStatus,
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
      }
    } catch (error) {
      logger.error('Failed to get workflow', error as Error, { workflowId })
      throw error
    }
  }

  /**
   * Get workflows with filtering and pagination
   */
  async getWorkflows(options: WorkflowListOptions = {}): Promise<{
    workflows: WorkflowDefinition[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const {
        status,
        createdBy,
        dateFrom,
        dateTo,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options

      // Build where clause
      const where: Record<string, unknown> = {}

      if (status) where.status = status
      if (createdBy) where.createdBy = createdBy

      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) (where.createdAt as Record<string, unknown>).gte = dateFrom
        if (dateTo) (where.createdAt as Record<string, unknown>).lte = dateTo
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ] as Record<string, unknown>[]
      }

      // Get total count
      const total = await prisma.workflow.count({ where })

      // Get workflows with pagination
      const workflows = await prisma.workflow.findMany({
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
      })

      const workflowDefinitions: WorkflowDefinition[] = workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || undefined,
        status: workflow.status as WorkflowStatus,
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
      }))

      return {
        workflows: workflowDefinitions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      logger.error('Failed to get workflows', error as Error, options)
      throw error
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      logger.info('Deleting workflow', { workflowId })

      // Check if workflow is running
      if (this.runningExecutions.has(workflowId)) {
        throw new Error('Cannot delete a workflow that is currently executing')
      }

      // Delete workflow (cascade will delete steps)
      await prisma.workflow.delete({
        where: { id: workflowId }
      })

      logger.info('Workflow deleted successfully', { workflowId })
    } catch (error) {
      logger.error('Failed to delete workflow', error as Error, { workflowId })
      throw error
    }
  }

  /**
   * Validate workflow definition
   */
  async validateWorkflowDefinition(workflow: WorkflowDefinition): Promise<WorkflowValidationResult> {
    const errors: WorkflowValidationError[] = []
    const warnings: WorkflowValidationWarning[] = []

    try {
      // Check if all agents exist and are active
      const agentIds = workflow.steps.map(step => step.agentId)
      const agents = await prisma.agent.findMany({
        where: { id: { in: agentIds } }
      })

      const existingAgentIds = new Set(agents.map(agent => agent.id))
      const activeAgentIds = new Set(agents.filter(agent => agent.status === 'ACTIVE').map(agent => agent.id))

      for (const step of workflow.steps) {
        if (!existingAgentIds.has(step.agentId)) {
          errors.push({
            type: 'missing_agent',
            stepId: step.id,
            message: `Agent ${step.agentId} not found for step "${step.name}"`
          })
        } else if (!activeAgentIds.has(step.agentId)) {
          warnings.push({
            type: 'missing_dependency',
            stepId: step.id,
            message: `Agent ${step.agentId} is not active for step "${step.name}"`
          })
        }
      }

      // Check for circular dependencies
      const dependencies = this.buildDependencyGraph(workflow.steps)
      const circularDeps = this.detectCircularDependencies(dependencies)
      
      for (const cycle of circularDeps) {
        errors.push({
          type: 'circular_dependency',
          message: `Circular dependency detected: ${cycle.join(' -> ')}`
        })
      }

      // Check for unreachable steps
      const reachableSteps = this.findReachableSteps(workflow.steps)
      for (const step of workflow.steps) {
        if (!reachableSteps.has(step.id)) {
          warnings.push({
            type: 'unreachable_step',
            stepId: step.id,
            message: `Step "${step.name}" may be unreachable`
          })
        }
      }

      // Validate step conditions
      for (const step of workflow.steps) {
        for (const condition of step.conditions) {
          if (condition.type === 'expression' && !condition.expression) {
            errors.push({
              type: 'invalid_condition',
              stepId: step.id,
              message: `Expression condition missing expression for step "${step.name}"`
            })
          }

          if (condition.dependsOn) {
            for (const depId of condition.dependsOn) {
              if (!workflow.steps.find(s => s.id === depId)) {
                errors.push({
                  type: 'invalid_condition',
                  stepId: step.id,
                  message: `Dependency "${depId}" not found for step "${step.name}"`
                })
              }
            }
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      logger.error('Failed to validate workflow', error as Error, { workflowId: workflow.id })
      return {
        valid: false,
        errors: [{
          type: 'invalid_parameters',
          message: `Validation error: ${(error as Error).message}`
        }],
        warnings: []
      }
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, options: WorkflowExecutionOptions = {}, createdBy: string): Promise<string> {
    try {
      // Validate input data
      const validatedOptions = workflowExecutionSchema.parse(options)

      logger.info('Starting workflow execution', {
        workflowId,
        options: validatedOptions,
        createdBy
      })

      // Get workflow definition
      const workflow = await this.getWorkflow(workflowId)
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`)
      }

      if (workflow.status !== 'ACTIVE') {
        throw new Error(`Workflow ${workflowId} is not active (status: ${workflow.status})`)
      }

      // Validate workflow before execution
      const validation = await this.validateWorkflowDefinition(workflow)
      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      // Create workflow execution
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const execution: WorkflowExecution = {
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
      }

      // Store execution
      this.runningExecutions.set(executionId, execution)

      // Notify WebSocket clients
      this.webSocketService?.notifyWorkflowStatusChange(executionId, 'PENDING', {
        workflowId,
        workflowName: workflow.name,
        totalSteps: workflow.steps.length
      })

      // Start execution (don't await - run asynchronously)
      if (!validatedOptions.dryRun) {
        this.performWorkflowExecution(workflow, execution).catch(error => {
          logger.error('Unhandled workflow execution error', error, { executionId })
        })
      } else {
        // For dry run, just validate and return
        execution.status = 'COMPLETED'
        execution.completedAt = new Date()
        this.runningExecutions.delete(executionId)
        
        this.webSocketService?.notifyWorkflowStatusChange(executionId, 'COMPLETED', {
          dryRun: true,
          validation
        })
      }

      logger.info('Workflow execution started', { executionId, workflowId })

      return executionId
    } catch (error) {
      logger.error('Failed to start workflow execution', error as Error, { workflowId })
      throw error
    }
  }

  /**
   * Get workflow execution status
   */
  getWorkflowExecution(executionId: string): WorkflowExecution | null {
    return this.runningExecutions.get(executionId) || null
  }

  /**
   * Cancel workflow execution
   */
  async cancelWorkflowExecution(executionId: string): Promise<void> {
    try {
      logger.info('Cancelling workflow execution', { executionId })

      const execution = this.runningExecutions.get(executionId)
      if (!execution) {
        throw new Error(`Workflow execution ${executionId} not found`)
      }

      // Update execution status
      execution.status = 'CANCELLED'
      execution.completedAt = new Date()

      // Cancel any running steps
      for (const stepExecution of execution.stepExecutions) {
        if (stepExecution.status === 'RUNNING') {
          stepExecution.status = 'SKIPPED'
          stepExecution.completedAt = new Date()
        }
      }

      // Clear timeout
      const timeout = this.executionTimeouts.get(executionId)
      if (timeout) {
        clearTimeout(timeout)
        this.executionTimeouts.delete(executionId)
      }

      // Remove from running executions
      this.runningExecutions.delete(executionId)

      // Notify WebSocket clients
      this.webSocketService?.notifyWorkflowStatusChange(executionId, 'CANCELLED', {
        cancelled: true,
        timestamp: new Date()
      })

      logger.info('Workflow execution cancelled', { executionId })
    } catch (error) {
      logger.error('Failed to cancel workflow execution', error as Error, { executionId })
      throw error
    }
  }

  /**
   * Get workflow execution progress
   */
  getWorkflowProgress(executionId: string): WorkflowProgress | null {
    const execution = this.runningExecutions.get(executionId)
    if (!execution) {
      return null
    }

    const totalSteps = execution.stepExecutions.length
    const completedSteps = execution.stepExecutions.filter(step => step.status === 'COMPLETED').length
    const failedSteps = execution.stepExecutions.filter(step => step.status === 'FAILED').length
    const currentStep = execution.stepExecutions.find(step => step.status === 'RUNNING')

    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    return {
      workflowExecutionId: executionId,
      totalSteps,
      completedSteps,
      failedSteps,
      currentStep: currentStep?.stepId,
      progress
    }
  }

  /**
   * Perform workflow execution
   */
  private async performWorkflowExecution(workflow: WorkflowDefinition, execution: WorkflowExecution): Promise<void> {
    try {
      logger.info('Performing workflow execution', {
        executionId: execution.id,
        workflowId: workflow.id,
        stepCount: workflow.steps.length
      })

      // Update execution status
      execution.status = 'RUNNING'

      // Notify WebSocket clients
      this.webSocketService?.notifyWorkflowStatusChange(execution.id, 'RUNNING', {
        startedAt: execution.startedAt
      })

      // Execute steps sequentially
      for (const step of workflow.steps) {
        // Check if execution was cancelled
        if (execution.status === 'CANCELLED') {
          break
        }

        // Check step conditions
        if (!this.shouldExecuteStep(step, execution)) {
          const stepExecution = execution.stepExecutions.find(se => se.stepId === step.id)
          if (stepExecution) {
            stepExecution.status = 'SKIPPED'
            stepExecution.completedAt = new Date()
          }
          continue
        }

        // Execute step
        await this.executeWorkflowStep(workflow, step, execution)

        // Check if step failed and should stop execution
        const stepExecution = execution.stepExecutions.find(se => se.stepId === step.id)
        if (stepExecution?.status === 'FAILED') {
          // Check if we should continue on failure
          const continueOnFailure = step.conditions.some(c => c.type === 'on_failure')
          if (!continueOnFailure) {
            throw new Error(`Step "${step.name}" failed and workflow cannot continue`)
          }
        }

        // Update progress
        const progress = this.getWorkflowProgress(execution.id)
        if (progress) {
          this.webSocketService?.notifyWorkflowProgress(execution.id, progress)
        }
      }

      // Mark execution as completed
      execution.status = 'COMPLETED'
      execution.completedAt = new Date()

      // Remove from running executions
      this.runningExecutions.delete(execution.id)

      // Notify WebSocket clients
      this.webSocketService?.notifyWorkflowStatusChange(execution.id, 'COMPLETED', {
        completedAt: execution.completedAt,
        totalSteps: workflow.steps.length,
        completedSteps: execution.stepExecutions.filter(se => se.status === 'COMPLETED').length
      })

      // Emit completion event
      this.emit('workflowCompleted', {
        executionId: execution.id,
        workflowId: workflow.id,
        duration: execution.completedAt.getTime() - execution.startedAt.getTime()
      })

      logger.info('Workflow execution completed successfully', {
        executionId: execution.id,
        workflowId: workflow.id,
        duration: execution.completedAt.getTime() - execution.startedAt.getTime()
      })

    } catch (error) {
      await this.handleWorkflowError(execution, error as Error)
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(workflow: WorkflowDefinition, step: WorkflowStepDefinition, execution: WorkflowExecution): Promise<void> {
    const stepExecution = execution.stepExecutions.find(se => se.stepId === step.id)
    if (!stepExecution) {
      throw new Error(`Step execution not found for step ${step.id}`)
    }

    try {
      logger.info('Executing workflow step', {
        executionId: execution.id,
        stepId: step.id,
        stepName: step.name,
        agentId: step.agentId
      })

      // Update step status
      stepExecution.status = 'RUNNING'
      stepExecution.startedAt = new Date()

      // Prepare step input by merging parameters with context variables
      const stepInput = {
        ...step.parameters,
        ...this.resolveVariables(step.parameters, execution.context)
      }
      stepExecution.input = stepInput

      // Get agent and adapter
      const agent = await prisma.agent.findUnique({
        where: { id: step.agentId },
        include: { platform: true }
      })

      if (!agent) {
        throw new Error(`Agent ${step.agentId} not found`)
      }

      const adapter = this.adapterManager.getAdapter(agent.platformId)
      if (!adapter) {
        throw new Error(`No adapter found for platform ${agent.platformId}`)
      }

      // Execute step with retry logic
      const retryConfig = step.retryConfig || {
        maxRetries: 3,
        backoffMs: 1000,
        backoffMultiplier: 2,
        maxBackoffMs: 30000
      }

      let lastError: Error | null = null
      
      for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
          // Execute agent
          const result = await adapter.executeAgent(agent.externalId, stepInput)

          if (!result.success) {
            throw new Error(result.error || 'Agent execution failed')
          }

          // Store step output
          stepExecution.output = result.data as Record<string, unknown>
          stepExecution.status = 'COMPLETED'
          stepExecution.completedAt = new Date()
          stepExecution.executionTime = Date.now() - (stepExecution.startedAt?.getTime() || Date.now())

          // Update workflow context with step output
          execution.context.stepOutputs[step.id] = result.data

          logger.info('Workflow step completed successfully', {
            executionId: execution.id,
            stepId: step.id,
            stepName: step.name,
            executionTime: stepExecution.executionTime,
            attempt: attempt + 1
          })

          return // Success, exit retry loop

        } catch (error) {
          lastError = error as Error
          stepExecution.retryCount = attempt

          if (attempt < retryConfig.maxRetries) {
            // Calculate backoff delay
            const delay = Math.min(
              retryConfig.backoffMs * Math.pow(retryConfig.backoffMultiplier, attempt),
              retryConfig.maxBackoffMs
            )

            logger.warn('Workflow step failed, retrying', {
              executionId: execution.id,
              stepId: step.id,
              stepName: step.name,
              attempt: attempt + 1,
              maxRetries: retryConfig.maxRetries,
              retryDelay: delay,
              error: (error as Error).message
            })

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }

      // All retries exhausted
      throw lastError || new Error('Step execution failed after all retries')

    } catch (error) {
      // Mark step as failed
      stepExecution.status = 'FAILED'
      stepExecution.completedAt = new Date()
      stepExecution.error = (error as Error).message
      stepExecution.executionTime = Date.now() - (stepExecution.startedAt?.getTime() || Date.now())

      logger.error('Workflow step failed', error as Error, {
        executionId: execution.id,
        stepId: step.id,
        stepName: step.name,
        retryCount: stepExecution.retryCount
      })

      throw error
    }
  }

  /**
   * Check if a step should be executed based on its conditions
   */
  private shouldExecuteStep(step: WorkflowStepDefinition, execution: WorkflowExecution): boolean {
    for (const condition of step.conditions) {
      switch (condition.type) {
        case 'always':
          return true

        case 'on_success':
          if (condition.dependsOn) {
            return condition.dependsOn.every(depId => {
              const depExecution = execution.stepExecutions.find(se => se.stepId === depId)
              return depExecution?.status === 'COMPLETED'
            })
          }
          return true

        case 'on_failure':
          if (condition.dependsOn) {
            return condition.dependsOn.some(depId => {
              const depExecution = execution.stepExecutions.find(se => se.stepId === depId)
              return depExecution?.status === 'FAILED'
            })
          }
          return false

        case 'expression':
          // For now, just return true. In a full implementation, 
          // this would evaluate the expression against the workflow context
          return true

        default:
          return false
      }
    }

    return false
  }

  /**
   * Resolve variables in parameters using workflow context
   */
  private resolveVariables(parameters: Record<string, unknown>, context: WorkflowContext): Record<string, unknown> {
    const resolved: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        // Variable reference like ${variables.myVar} or ${steps.step1.output.result}
        const varPath = value.slice(2, -1) // Remove ${ and }
        resolved[key] = this.getValueFromPath(varPath, context)
      } else {
        resolved[key] = value
      }
    }

    return resolved
  }

  /**
   * Get value from context using dot notation path
   */
  private getValueFromPath(path: string, context: WorkflowContext): unknown {
    const parts = path.split('.')
    let current: unknown = context

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }

    return current
  }

  /**
   * Handle workflow execution error
   */
  private async handleWorkflowError(execution: WorkflowExecution, error: Error): Promise<void> {
    logger.error('Workflow execution failed', error, {
      executionId: execution.id,
      workflowId: execution.workflowId
    })

    // Update execution status
    execution.status = 'FAILED'
    execution.completedAt = new Date()
    execution.error = error.message

    // Remove from running executions
    this.runningExecutions.delete(execution.id)

    // Clear timeout
    const timeout = this.executionTimeouts.get(execution.id)
    if (timeout) {
      clearTimeout(timeout)
      this.executionTimeouts.delete(execution.id)
    }

    // Notify WebSocket clients
    this.webSocketService?.notifyWorkflowStatusChange(execution.id, 'FAILED', {
      error: error.message,
      completedAt: execution.completedAt
    })

    this.webSocketService?.notifyWorkflowError(execution.id, error.message, {
      workflowId: execution.workflowId,
      timestamp: new Date()
    })

    // Emit failure event
    this.emit('workflowFailed', {
      executionId: execution.id,
      workflowId: execution.workflowId,
      error: error.message
    })
  }

  /**
   * Build dependency graph from workflow steps
   */
  private buildDependencyGraph(steps: WorkflowStepDefinition[]): Map<string, string[]> {
    const graph = new Map<string, string[]>()

    for (const step of steps) {
      const dependencies: string[] = []
      
      for (const condition of step.conditions) {
        if (condition.dependsOn) {
          dependencies.push(...condition.dependsOn)
        }
      }

      graph.set(step.id, dependencies)
    }

    return graph
  }

  /**
   * Detect circular dependencies in workflow
   */
  private detectCircularDependencies(graph: Map<string, string[]>): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node)
        cycles.push(path.slice(cycleStart).concat(node))
        return
      }

      if (visited.has(node)) {
        return
      }

      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      const dependencies = graph.get(node) || []
      for (const dep of dependencies) {
        dfs(dep, [...path])
      }

      recursionStack.delete(node)
      path.pop()
    }

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, [])
      }
    }

    return cycles
  }

  /**
   * Find reachable steps in workflow
   */
  private findReachableSteps(steps: WorkflowStepDefinition[]): Set<string> {
    const reachable = new Set<string>()
    
    // Find steps with no dependencies (entry points)
    const entryPoints = steps.filter(step => 
      step.conditions.every(condition => 
        !condition.dependsOn || condition.dependsOn.length === 0
      )
    )

    // If no entry points, first step is reachable
    if (entryPoints.length === 0 && steps.length > 0) {
      entryPoints.push(steps[0])
    }

    // BFS to find all reachable steps
    const queue = [...entryPoints.map(step => step.id)]
    
    while (queue.length > 0) {
      const stepId = queue.shift()!
      if (reachable.has(stepId)) {
        continue
      }

      reachable.add(stepId)

      // Find steps that depend on this step
      for (const step of steps) {
        for (const condition of step.conditions) {
          if (condition.dependsOn?.includes(stepId) && !reachable.has(step.id)) {
            queue.push(step.id)
          }
        }
      }
    }

    return reachable
  }

  /**
   * Cleanup - cancel running executions
   */
  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up workflow service')

      // Cancel all running executions
      const runningExecutionIds = Array.from(this.runningExecutions.keys())
      await Promise.all(
        runningExecutionIds.map(executionId => this.cancelWorkflowExecution(executionId))
      )

      // Clear timeouts
      for (const timeout of this.executionTimeouts.values()) {
        clearTimeout(timeout)
      }
      this.executionTimeouts.clear()

      logger.info('Workflow service cleanup completed')
    } catch (error) {
      logger.error('Failed to cleanup workflow service', error as Error)
      throw error
    }
  }
}