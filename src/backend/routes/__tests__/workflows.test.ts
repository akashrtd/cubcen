/**
 * Workflow API Routes Tests
 * Tests for workflow management REST API endpoints
 */

import request from 'supertest'
import express from 'express'
import { createWorkflowRoutes } from '../workflows'
import { WorkflowService } from '@/services/workflow'
import { TaskService } from '@/services/task'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { authenticateToken } from '@/backend/middleware/auth'
import { logger } from '@/lib/logger'
import {
  WorkflowDefinition,
  WorkflowCreationData,
  WorkflowUpdateData,
  WorkflowValidationResult,
  WorkflowExecution,
  WorkflowProgress,
} from '@/types/workflow'

// Mock dependencies
jest.mock('@/services/workflow')
jest.mock('@/services/task')
jest.mock('@/backend/adapters/adapter-factory')
jest.mock('@/backend/middleware/auth')
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}))

const MockWorkflowService = WorkflowService as jest.MockedClass<
  typeof WorkflowService
>
const mockAuthenticateToken = authenticateToken as jest.MockedFunction<
  typeof authenticateToken
>

describe('Workflow API Routes', () => {
  let app: express.Application
  let mockWorkflowService: jest.Mocked<WorkflowService>

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock workflow service
    mockWorkflowService = {
      createWorkflow: jest.fn(),
      updateWorkflow: jest.fn(),
      getWorkflow: jest.fn(),
      getWorkflows: jest.fn(),
      deleteWorkflow: jest.fn(),
      validateWorkflowDefinition: jest.fn(),
      executeWorkflow: jest.fn(),
      getWorkflowExecution: jest.fn(),
      cancelWorkflowExecution: jest.fn(),
      getWorkflowProgress: jest.fn(),
      cleanup: jest.fn(),
    } as any

    // Setup Express app
    app = express()
    app.use(express.json())

    // Mock authentication middleware
    mockAuthenticateToken.mockImplementation(
      (req: any, res: any, next: any) => {
        req.user = { id: 'user-1', email: 'test@example.com', role: 'ADMIN' }
        next()
      }
    )

    // Setup routes
    app.use(
      '/api/cubcen/v1/workflows',
      createWorkflowRoutes(mockWorkflowService)
    )

    // Error handling middleware
    app.use((error: any, req: any, res: any, next: any) => {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      })
    })
  })

  describe('POST /api/cubcen/v1/workflows', () => {
    it('should create workflow successfully', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        steps: [
          {
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'First Step',
            parameters: { input: 'test' },
            conditions: [{ type: 'always' }],
          },
        ],
      }

      const mockWorkflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'A test workflow',
        status: 'DRAFT',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'First Step',
            parameters: { input: 'test' },
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockWorkflowService.createWorkflow.mockResolvedValue(mockWorkflow)

      const response = await request(app)
        .post('/api/cubcen/v1/workflows')
        .send(workflowData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'workflow-1',
          name: 'Test Workflow',
          status: 'DRAFT',
        }),
      })

      expect(mockWorkflowService.createWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Workflow',
          description: 'A test workflow',
          steps: expect.arrayContaining([
            expect.objectContaining({
              agentId: 'agent-1',
              name: 'First Step',
            }),
          ]),
          createdBy: 'user-1',
        })
      )

      expect(logger.info).toHaveBeenCalledWith(
        'Workflow created via API',
        expect.objectContaining({
          workflowId: 'workflow-1',
          name: 'Test Workflow',
          userId: 'user-1',
        })
      )
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: '', // Empty name
        steps: [], // Empty steps
      }

      const response = await request(app)
        .post('/api/cubcen/v1/workflows')
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toBeDefined()
      expect(mockWorkflowService.createWorkflow).not.toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      const workflowData = {
        name: 'Test Workflow',
        steps: [
          {
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'First Step',
            parameters: {},
          },
        ],
      }

      mockWorkflowService.createWorkflow.mockRejectedValue(
        new Error('Agent not found')
      )

      const response = await request(app)
        .post('/api/cubcen/v1/workflows')
        .send(workflowData)
        .expect(500)

      expect(response.body.error.message).toBe('Agent not found')
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create workflow via API',
        expect.any(Error),
        expect.objectContaining({
          userId: 'user-1',
        })
      )
    })
  })

  describe('GET /api/cubcen/v1/workflows', () => {
    it('should get workflows with pagination', async () => {
      const mockResult = {
        workflows: [
          {
            id: 'workflow-1',
            name: 'Workflow 1',
            status: 'ACTIVE',
            steps: [],
            createdBy: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'workflow-2',
            name: 'Workflow 2',
            status: 'DRAFT',
            steps: [],
            createdBy: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ] as WorkflowDefinition[],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockWorkflowService.getWorkflows.mockResolvedValue(mockResult)

      const response = await request(app)
        .get('/api/cubcen/v1/workflows')
        .query({
          page: '1',
          limit: '10',
          status: 'ACTIVE',
          search: 'test',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          workflows: expect.arrayContaining([
            expect.objectContaining({ name: 'Workflow 1' }),
            expect.objectContaining({ name: 'Workflow 2' }),
          ]),
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      })

      expect(mockWorkflowService.getWorkflows).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          status: 'ACTIVE',
          search: 'test',
        })
      )
    })

    it('should use default pagination values', async () => {
      const mockResult = {
        workflows: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      mockWorkflowService.getWorkflows.mockResolvedValue(mockResult)

      await request(app).get('/api/cubcen/v1/workflows').expect(200)

      expect(mockWorkflowService.getWorkflows).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      )
    })

    it('should handle service errors', async () => {
      mockWorkflowService.getWorkflows.mockRejectedValue(
        new Error('Database error')
      )

      const response = await request(app)
        .get('/api/cubcen/v1/workflows')
        .expect(500)

      expect(response.body.error.message).toBe('Database error')
    })
  })

  describe('GET /api/cubcen/v1/workflows/:id', () => {
    it('should get workflow by ID', async () => {
      const mockWorkflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test description',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Test Step',
            parameters: { input: 'test' },
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockWorkflowService.getWorkflow.mockResolvedValue(mockWorkflow)

      const response = await request(app)
        .get('/api/cubcen/v1/workflows/workflow-1')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'workflow-1',
          name: 'Test Workflow',
          status: 'ACTIVE',
        }),
      })

      expect(mockWorkflowService.getWorkflow).toHaveBeenCalledWith('workflow-1')
    })

    it('should return 404 for non-existent workflow', async () => {
      mockWorkflowService.getWorkflow.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/cubcen/v1/workflows/non-existent')
        .expect(404)

      expect(response.body.error).toMatchObject({
        code: 'WORKFLOW_NOT_FOUND',
        message: 'Workflow with ID non-existent not found',
      })
    })
  })

  describe('PUT /api/cubcen/v1/workflows/:id', () => {
    it('should update workflow successfully', async () => {
      const updateData = {
        name: 'Updated Workflow',
        description: 'Updated description',
        status: 'ACTIVE',
      }

      const mockUpdatedWorkflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Updated Workflow',
        description: 'Updated description',
        status: 'ACTIVE',
        steps: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockWorkflowService.updateWorkflow.mockResolvedValue(mockUpdatedWorkflow)

      const response = await request(app)
        .put('/api/cubcen/v1/workflows/workflow-1')
        .send(updateData)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'workflow-1',
          name: 'Updated Workflow',
          status: 'ACTIVE',
        }),
      })

      expect(mockWorkflowService.updateWorkflow).toHaveBeenCalledWith(
        'workflow-1',
        updateData
      )

      expect(logger.info).toHaveBeenCalledWith(
        'Workflow updated via API',
        expect.objectContaining({
          workflowId: 'workflow-1',
          userId: 'user-1',
        })
      )
    })

    it('should validate update data', async () => {
      const invalidData = {
        name: '', // Empty name
        status: 'INVALID_STATUS',
      }

      const response = await request(app)
        .put('/api/cubcen/v1/workflows/workflow-1')
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toBeDefined()
      expect(mockWorkflowService.updateWorkflow).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/cubcen/v1/workflows/:id', () => {
    it('should delete workflow successfully', async () => {
      mockWorkflowService.deleteWorkflow.mockResolvedValue()

      const response = await request(app)
        .delete('/api/cubcen/v1/workflows/workflow-1')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Workflow deleted successfully',
      })

      expect(mockWorkflowService.deleteWorkflow).toHaveBeenCalledWith(
        'workflow-1'
      )

      expect(logger.info).toHaveBeenCalledWith(
        'Workflow deleted via API',
        expect.objectContaining({
          workflowId: 'workflow-1',
          userId: 'user-1',
        })
      )
    })

    it('should handle service errors', async () => {
      mockWorkflowService.deleteWorkflow.mockRejectedValue(
        new Error('Cannot delete running workflow')
      )

      const response = await request(app)
        .delete('/api/cubcen/v1/workflows/workflow-1')
        .expect(500)

      expect(response.body.error.message).toBe('Cannot delete running workflow')
    })
  })

  describe('POST /api/cubcen/v1/workflows/:id/validate', () => {
    it('should validate workflow successfully', async () => {
      const mockWorkflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'DRAFT',
        steps: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockValidation: WorkflowValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      }

      mockWorkflowService.getWorkflow.mockResolvedValue(mockWorkflow)
      mockWorkflowService.validateWorkflowDefinition.mockResolvedValue(
        mockValidation
      )

      const response = await request(app)
        .post('/api/cubcen/v1/workflows/workflow-1/validate')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          valid: true,
          errors: [],
          warnings: [],
        },
      })

      expect(
        mockWorkflowService.validateWorkflowDefinition
      ).toHaveBeenCalledWith(mockWorkflow)
    })

    it('should return validation errors', async () => {
      const mockWorkflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'DRAFT',
        steps: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockValidation: WorkflowValidationResult = {
        valid: false,
        errors: [
          {
            type: 'missing_agent',
            stepId: 'step-1',
            message: 'Agent not found',
          },
        ],
        warnings: [],
      }

      mockWorkflowService.getWorkflow.mockResolvedValue(mockWorkflow)
      mockWorkflowService.validateWorkflowDefinition.mockResolvedValue(
        mockValidation
      )

      const response = await request(app)
        .post('/api/cubcen/v1/workflows/workflow-1/validate')
        .expect(200)

      expect(response.body.data.valid).toBe(false)
      expect(response.body.data.errors).toHaveLength(1)
    })

    it('should return 404 for non-existent workflow', async () => {
      mockWorkflowService.getWorkflow.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/cubcen/v1/workflows/non-existent/validate')
        .expect(404)

      expect(response.body.error.code).toBe('WORKFLOW_NOT_FOUND')
    })
  })

  describe('POST /api/cubcen/v1/workflows/:id/execute', () => {
    it('should execute workflow successfully', async () => {
      const executionOptions = {
        variables: { testVar: 'testValue' },
        metadata: { source: 'api' },
        dryRun: false,
      }

      mockWorkflowService.executeWorkflow.mockResolvedValue('exec-123')

      const response = await request(app)
        .post('/api/cubcen/v1/workflows/workflow-1/execute')
        .send(executionOptions)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          executionId: 'exec-123',
          workflowId: 'workflow-1',
          status: 'PENDING',
        },
      })

      expect(mockWorkflowService.executeWorkflow).toHaveBeenCalledWith(
        'workflow-1',
        executionOptions,
        'user-1'
      )

      expect(logger.info).toHaveBeenCalledWith(
        'Workflow execution started via API',
        expect.objectContaining({
          workflowId: 'workflow-1',
          executionId: 'exec-123',
          userId: 'user-1',
        })
      )
    })

    it('should handle dry run execution', async () => {
      mockWorkflowService.executeWorkflow.mockResolvedValue('exec-123')

      const response = await request(app)
        .post('/api/cubcen/v1/workflows/workflow-1/execute')
        .send({ dryRun: true })
        .expect(200)

      expect(response.body.data.executionId).toBe('exec-123')
      expect(mockWorkflowService.executeWorkflow).toHaveBeenCalledWith(
        'workflow-1',
        expect.objectContaining({ dryRun: true }),
        'user-1'
      )
    })

    it('should use default values for optional fields', async () => {
      mockWorkflowService.executeWorkflow.mockResolvedValue('exec-123')

      await request(app)
        .post('/api/cubcen/v1/workflows/workflow-1/execute')
        .send({})
        .expect(200)

      expect(mockWorkflowService.executeWorkflow).toHaveBeenCalledWith(
        'workflow-1',
        expect.objectContaining({
          variables: {},
          metadata: {},
          dryRun: false,
        }),
        'user-1'
      )
    })

    it('should handle service errors', async () => {
      mockWorkflowService.executeWorkflow.mockRejectedValue(
        new Error('Workflow validation failed')
      )

      const response = await request(app)
        .post('/api/cubcen/v1/workflows/workflow-1/execute')
        .send({})
        .expect(500)

      expect(response.body.error.message).toBe('Workflow validation failed')
    })
  })

  describe('GET /api/cubcen/v1/workflows/executions/:executionId', () => {
    it('should get workflow execution status', async () => {
      const mockExecution: WorkflowExecution = {
        id: 'exec-123',
        workflowId: 'workflow-1',
        status: 'RUNNING',
        startedAt: new Date(),
        context: {
          variables: {},
          stepOutputs: {},
          metadata: {},
        },
        stepExecutions: [],
        createdBy: 'user-1',
      }

      mockWorkflowService.getWorkflowExecution.mockReturnValue(mockExecution)

      const response = await request(app)
        .get('/api/cubcen/v1/workflows/executions/exec-123')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'exec-123',
          workflowId: 'workflow-1',
          status: 'RUNNING',
        }),
      })

      expect(mockWorkflowService.getWorkflowExecution).toHaveBeenCalledWith(
        'exec-123'
      )
    })

    it('should return 404 for non-existent execution', async () => {
      mockWorkflowService.getWorkflowExecution.mockReturnValue(null)

      const response = await request(app)
        .get('/api/cubcen/v1/workflows/executions/non-existent')
        .expect(404)

      expect(response.body.error.code).toBe('EXECUTION_NOT_FOUND')
    })
  })

  describe('POST /api/cubcen/v1/workflows/executions/:executionId/cancel', () => {
    it('should cancel workflow execution', async () => {
      mockWorkflowService.cancelWorkflowExecution.mockResolvedValue()

      const response = await request(app)
        .post('/api/cubcen/v1/workflows/executions/exec-123/cancel')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Workflow execution cancelled successfully',
      })

      expect(mockWorkflowService.cancelWorkflowExecution).toHaveBeenCalledWith(
        'exec-123'
      )

      expect(logger.info).toHaveBeenCalledWith(
        'Workflow execution cancelled via API',
        expect.objectContaining({
          executionId: 'exec-123',
          userId: 'user-1',
        })
      )
    })

    it('should handle service errors', async () => {
      mockWorkflowService.cancelWorkflowExecution.mockRejectedValue(
        new Error('Execution not found')
      )

      const response = await request(app)
        .post('/api/cubcen/v1/workflows/executions/exec-123/cancel')
        .expect(500)

      expect(response.body.error.message).toBe('Execution not found')
    })
  })

  describe('GET /api/cubcen/v1/workflows/executions/:executionId/progress', () => {
    it('should get workflow execution progress', async () => {
      const mockProgress: WorkflowProgress = {
        workflowExecutionId: 'exec-123',
        totalSteps: 3,
        completedSteps: 1,
        failedSteps: 0,
        currentStep: 'step-2',
        progress: 33,
      }

      mockWorkflowService.getWorkflowProgress.mockReturnValue(mockProgress)

      const response = await request(app)
        .get('/api/cubcen/v1/workflows/executions/exec-123/progress')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          workflowExecutionId: 'exec-123',
          totalSteps: 3,
          completedSteps: 1,
          failedSteps: 0,
          currentStep: 'step-2',
          progress: 33,
        },
      })

      expect(mockWorkflowService.getWorkflowProgress).toHaveBeenCalledWith(
        'exec-123'
      )
    })

    it('should return 404 for non-existent execution', async () => {
      mockWorkflowService.getWorkflowProgress.mockReturnValue(null)

      const response = await request(app)
        .get('/api/cubcen/v1/workflows/executions/non-existent/progress')
        .expect(404)

      expect(response.body.error.code).toBe('EXECUTION_NOT_FOUND')
    })
  })

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      // Mock authentication to fail
      mockAuthenticateToken.mockImplementation(
        (req: any, res: any, next: any) => {
          res.status(401).json({
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          })
        }
      )

      const endpoints = [
        { method: 'post', path: '/api/cubcen/v1/workflows' },
        { method: 'get', path: '/api/cubcen/v1/workflows' },
        { method: 'get', path: '/api/cubcen/v1/workflows/workflow-1' },
        { method: 'put', path: '/api/cubcen/v1/workflows/workflow-1' },
        { method: 'delete', path: '/api/cubcen/v1/workflows/workflow-1' },
        {
          method: 'post',
          path: '/api/cubcen/v1/workflows/workflow-1/validate',
        },
        { method: 'post', path: '/api/cubcen/v1/workflows/workflow-1/execute' },
        { method: 'get', path: '/api/cubcen/v1/workflows/executions/exec-123' },
        {
          method: 'post',
          path: '/api/cubcen/v1/workflows/executions/exec-123/cancel',
        },
        {
          method: 'get',
          path: '/api/cubcen/v1/workflows/executions/exec-123/progress',
        },
      ]

      for (const endpoint of endpoints) {
        const response = await request(app)[
          endpoint.method as keyof typeof request
        ](endpoint.path)
        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHORIZED')
      }
    })
  })
})
