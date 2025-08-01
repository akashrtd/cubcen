/**
 * Workflow orchestration types and interfaces for Cubcen
 */

export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
export type WorkflowExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type StepExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'

export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  status: WorkflowStatus
  steps: WorkflowStepDefinition[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowStepDefinition {
  id: string
  workflowId: string
  agentId: string
  stepOrder: number
  name: string
  parameters: Record<string, unknown>
  conditions: StepCondition[]
  retryConfig?: RetryConfig
  timeoutMs?: number
}

export interface StepCondition {
  type: 'always' | 'on_success' | 'on_failure' | 'expression'
  expression?: string // For complex conditions
  dependsOn?: string[] // Step IDs this step depends on
}

export interface RetryConfig {
  maxRetries: number
  backoffMs: number
  backoffMultiplier: number
  maxBackoffMs: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: WorkflowExecutionStatus
  startedAt: Date
  completedAt?: Date
  error?: string
  context: WorkflowContext
  stepExecutions: StepExecution[]
  createdBy: string
}

export interface StepExecution {
  id: string
  workflowExecutionId: string
  stepId: string
  agentId: string
  status: StepExecutionStatus
  startedAt?: Date
  completedAt?: Date
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  retryCount: number
  executionTime?: number
}

export interface WorkflowContext {
  variables: Record<string, unknown>
  stepOutputs: Record<string, unknown> // stepId -> output data
  metadata: Record<string, unknown>
}

export interface WorkflowExecutionOptions {
  variables?: Record<string, unknown>
  metadata?: Record<string, unknown>
  dryRun?: boolean
}

export interface WorkflowValidationResult {
  valid: boolean
  errors: WorkflowValidationError[]
  warnings: WorkflowValidationWarning[]
}

export interface WorkflowValidationError {
  type: 'missing_agent' | 'circular_dependency' | 'invalid_condition' | 'invalid_parameters'
  stepId?: string
  message: string
}

export interface WorkflowValidationWarning {
  type: 'unreachable_step' | 'missing_dependency' | 'performance'
  stepId?: string
  message: string
}

export interface WorkflowProgress {
  workflowExecutionId: string
  totalSteps: number
  completedSteps: number
  failedSteps: number
  currentStep?: string
  progress: number // 0-100
  estimatedTimeRemaining?: number
}

export interface WorkflowFilter {
  status?: WorkflowStatus
  createdBy?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface WorkflowListOptions extends WorkflowFilter {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface WorkflowExecutionFilter {
  workflowId?: string
  status?: WorkflowExecutionStatus
  createdBy?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface WorkflowExecutionListOptions extends WorkflowExecutionFilter {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Events for workflow execution
export interface WorkflowEvent {
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'step_started' | 'step_completed' | 'step_failed'
  workflowExecutionId: string
  stepId?: string
  timestamp: Date
  data?: Record<string, unknown>
}

// Data transformation utilities
export interface DataTransformation {
  type: 'map' | 'filter' | 'transform' | 'merge'
  source: string // JSONPath or step reference
  target: string // Variable name or JSONPath
  expression?: string // Transformation expression
}

export interface StepDataMapping {
  inputs: DataTransformation[]
  outputs: DataTransformation[]
}