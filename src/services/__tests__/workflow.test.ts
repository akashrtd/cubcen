/**
 * Workflow Service Tests
 * Tests for workflow orchestration functionality
 */

import { WorkflowService } from '../workflow'
import { TaskService } from '../task'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { MockAdapter } from '@/backend/adapters/mock-adapter'
import { prisma } from '@/lib/database'
import { logger } from '@/lib/logger'
import {
  WorkflowDefinition,
  WorkflowCreationData,
  WorkflowUpdateData,
  WorkflowExecutionOptions,
  WorkflowValidationResult,
} from '@/types/workflow'

// Mock dependencies
jest.mock('@/lib/database', () => ({
  prisma: {
    workflow: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    workflowStep: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    agent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock WebSocket service
const mockWebSocketService = {
  notifyWorkflowStatusChange: jest.fn(),
  notifyWorkflowProgress: jest.fn(),
  notifyWorkflowError: jest.fn(),
}

describe('WorkflowService', () => {
  let workflowService: WorkflowService
  let adapterManager: AdapterManager
  let taskService: TaskService
  let mockAdapter: MockAdapter

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock adapter
    mockAdapter = new MockAdapter({
      id: 'mock-platform',
      name: 'Mock Platform',
      type: 'n8n',
      baseUrl: 'http://localhost:3000',
      credentials: { apiKey: 'test-key' },
    })

    adapterManager = new AdapterManager()
    adapterManager.registerAdapter('mock-platform', mockAdapter)

    taskService = new TaskService(adapterManager)
    workflowService = new WorkflowService(
      adapterManager,
      taskService,
      mockWebSocketService
    )
  })

  afterEach(async () => {
    await workflowService.cleanup()
  })

  describe('createWorkflow', () => {
    it('should create a workflow successfully', async () => {
      const workflowData: WorkflowCreationData = {
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
          {
            agentId: 'agent-2',
            stepOrder: 1,
            name: 'Second Step',
            parameters: { input: '${steps.step-1.output.result}' },
            conditions: [{ type: 'on_success', dependsOn: ['step-1'] }],
          },
        ],
        createdBy: 'user-1',
      }

      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'A test workflow',
        status: 'DRAFT',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'First Step',
            parameters: JSON.stringify({ input: 'test' }),
            conditions: JSON.stringify([{ type: 'always' }]),
            agent: { id: 'agent-1', name: 'Agent 1' },
          },
          {
            id: 'step-2',
            workflowId: 'workflow-1',
            agentId: 'agent-2',
            stepOrder: 1,
            name: 'Second Step',
            parameters: JSON.stringify({
              input: '${steps.step-1.output.result}',
            }),
            conditions: JSON.stringify([
              { type: 'on_success', dependsOn: ['step-1'] },
            ]),
            agent: { id: 'agent-2', name: 'Agent 2' },
          },
        ],
        creator: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      }

      // Mock agent validation
      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
        { id: 'agent-2', status: 'ACTIVE' },
      ])
      ;(prisma.workflow.create as jest.Mock).mockResolvedValue(mockWorkflow)

      const result = await workflowService.createWorkflow(workflowData)

      expect(result).toMatchObject({
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'A test workflow',
        status: 'DRAFT',
        steps: expect.arrayContaining([
          expect.objectContaining({
            name: 'First Step',
            stepOrder: 0,
          }),
          expect.objectContaining({
            name: 'Second Step',
            stepOrder: 1,
          }),
        ]),
      })

      expect(prisma.workflow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Workflow',
          description: 'A test workflow',
          status: 'DRAFT',
          createdBy: 'user-1',
        }),
        include: expect.any(Object),
      })

      expect(logger.info).toHaveBeenCalledWith(
        'Workflow created successfully',
        expect.objectContaining({
          workflowId: 'workflow-1',
          name: 'Test Workflow',
        })
      )
    })

    it('should fail validation for missing agents', async () => {
      const workflowData: WorkflowCreationData = {
        name: 'Invalid Workflow',
        steps: [
          {
            agentId: 'non-existent-agent',
            stepOrder: 0,
            name: 'Invalid Step',
            parameters: {},
          },
        ],
        createdBy: 'user-1',
      }

      // Mock no agents found
      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([])

      await expect(
        workflowService.createWorkflow(workflowData)
      ).rejects.toThrow('Workflow validation failed')

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create workflow',
        expect.any(Error),
        expect.objectContaining({
          name: 'Invalid Workflow',
        })
      )
    })

    it('should validate input data', async () => {
      const invalidData = {
        name: '', // Empty name should fail validation
        steps: [],
        createdBy: 'user-1',
      } as WorkflowCreationData

      await expect(
        workflowService.createWorkflow(invalidData)
      ).rejects.toThrow()
    })
  })

  describe('updateWorkflow', () => {
    it('should update workflow successfully', async () => {
      const updateData: WorkflowUpdateData = {
        name: 'Updated Workflow',
        description: 'Updated description',
        status: 'ACTIVE',
      }

      const existingWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        status: 'DRAFT',
        steps: [],
      }

      const updatedWorkflow = {
        id: 'workflow-1',
        name: 'Updated Workflow',
        description: 'Updated description',
        status: 'ACTIVE',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [],
        creator: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      }

      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        existingWorkflow
      )
      ;(prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        return await callback({
          workflow: {
            update: jest.fn().mockResolvedValue(updatedWorkflow),
            findUnique: jest.fn().mockResolvedValue(updatedWorkflow),
          },
          workflowStep: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
          },
        })
      })

      const result = await workflowService.updateWorkflow(
        'workflow-1',
        updateData
      )

      expect(result.name).toBe('Updated Workflow')
      expect(result.description).toBe('Updated description')
      expect(result.status).toBe('ACTIVE')

      expect(logger.info).toHaveBeenCalledWith(
        'Workflow updated successfully',
        expect.objectContaining({
          workflowId: 'workflow-1',
        })
      )
    })

    it('should fail to update non-existent workflow', async () => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        workflowService.updateWorkflow('non-existent', { name: 'Updated' })
      ).rejects.toThrow('Workflow with ID non-existent not found')
    })

    it('should fail to update running workflow', async () => {
      // First create a running execution
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Test Step',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock agents
      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])
      ;(prisma.agent.findUnique as jest.Mock).mockResolvedValue({
        id: 'agent-1',
        externalId: 'ext-1',
        platformId: 'mock-platform',
        platform: { id: 'mock-platform' },
      })

      // Start execution
      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)
      await workflowService
        .executeWorkflow(
          'workflow-1',
          {},
          'user-1'
        )(
          // Try to update
          prisma.workflow.findUnique as jest.Mock
        )
        .mockResolvedValue({
          id: 'workflow-1',
          status: 'ACTIVE',
        })

      await expect(
        workflowService.updateWorkflow('workflow-1', { name: 'Updated' })
      ).rejects.toThrow('Cannot update a workflow that is currently executing')
    })
  })

  describe('getWorkflow', () => {
    it('should get workflow by ID', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test description',
        status: 'ACTIVE',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Test Step',
            parameters: JSON.stringify({ input: 'test' }),
            conditions: JSON.stringify([{ type: 'always' }]),
            agent: { id: 'agent-1', name: 'Agent 1' },
          },
        ],
        creator: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      }

      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

      const result = await workflowService.getWorkflow('workflow-1')

      expect(result).toMatchObject({
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test description',
        status: 'ACTIVE',
        steps: expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Step',
            parameters: { input: 'test' },
          }),
        ]),
      })
    })

    it('should return null for non-existent workflow', async () => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await workflowService.getWorkflow('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('getWorkflows', () => {
    it('should get workflows with pagination', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Workflow 1',
          description: 'Description 1',
          status: 'ACTIVE',
          createdBy: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          steps: [],
          creator: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
        {
          id: 'workflow-2',
          name: 'Workflow 2',
          description: 'Description 2',
          status: 'DRAFT',
          createdBy: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          steps: [],
          creator: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      ]

      ;(prisma.workflow.count as jest.Mock).mockResolvedValue(2)
      ;(prisma.workflow.findMany as jest.Mock).mockResolvedValue(mockWorkflows)

      const result = await workflowService.getWorkflows({
        page: 1,
        limit: 10,
        status: 'ACTIVE',
      })

      expect(result).toMatchObject({
        workflows: expect.arrayContaining([
          expect.objectContaining({ name: 'Workflow 1' }),
          expect.objectContaining({ name: 'Workflow 2' }),
        ]),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    })

    it('should filter workflows by search term', async () => {
      ;(prisma.workflow.count as jest.Mock).mockResolvedValue(1)
      ;(prisma.workflow.findMany as jest.Mock).mockResolvedValue([])

      await workflowService.getWorkflows({
        search: 'test workflow',
      })

      expect(prisma.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'test workflow', mode: 'insensitive' } },
              {
                description: { contains: 'test workflow', mode: 'insensitive' },
              },
            ]),
          }),
        })
      )
    })
  })

  describe('deleteWorkflow', () => {
    it('should delete workflow successfully', async () => {
      ;(prisma.workflow.delete as jest.Mock).mockResolvedValue({})

      await workflowService.deleteWorkflow('workflow-1')

      expect(prisma.workflow.delete).toHaveBeenCalledWith({
        where: { id: 'workflow-1' },
      })

      expect(logger.info).toHaveBeenCalledWith(
        'Workflow deleted successfully',
        { workflowId: 'workflow-1' }
      )
    })

    it('should fail to delete running workflow', async () => {
      // Create a running execution first
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Test Step',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock agents
      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)
      await workflowService.executeWorkflow('workflow-1', {}, 'user-1')

      await expect(
        workflowService.deleteWorkflow('workflow-1')
      ).rejects.toThrow('Cannot delete a workflow that is currently executing')
    })
  })

  describe('validateWorkflowDefinition', () => {
    it('should validate workflow successfully', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'DRAFT',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'First Step',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
          {
            id: 'step-2',
            workflowId: 'workflow-1',
            agentId: 'agent-2',
            stepOrder: 1,
            name: 'Second Step',
            parameters: {},
            conditions: [{ type: 'on_success', dependsOn: ['step-1'] }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
        { id: 'agent-2', status: 'ACTIVE' },
      ])

      const result = await workflowService.validateWorkflowDefinition(workflow)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing agents', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'DRAFT',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'non-existent-agent',
            stepOrder: 0,
            name: 'Invalid Step',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([])

      const result = await workflowService.validateWorkflowDefinition(workflow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'missing_agent',
          message: expect.stringContaining(
            'Agent non-existent-agent not found'
          ),
        })
      )
    })

    it('should detect circular dependencies', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'DRAFT',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Step 1',
            parameters: {},
            conditions: [{ type: 'on_success', dependsOn: ['step-2'] }],
          },
          {
            id: 'step-2',
            workflowId: 'workflow-1',
            agentId: 'agent-2',
            stepOrder: 1,
            name: 'Step 2',
            parameters: {},
            conditions: [{ type: 'on_success', dependsOn: ['step-1'] }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
        { id: 'agent-2', status: 'ACTIVE' },
      ])

      const result = await workflowService.validateWorkflowDefinition(workflow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'circular_dependency',
          message: expect.stringContaining('Circular dependency detected'),
        })
      )
    })

    it('should detect invalid conditions', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'DRAFT',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Step 1',
            parameters: {},
            conditions: [{ type: 'expression' }], // Missing expression
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])

      const result = await workflowService.validateWorkflowDefinition(workflow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'invalid_condition',
          message: expect.stringContaining(
            'Expression condition missing expression'
          ),
        })
      )
    })
  })

  describe('executeWorkflow', () => {
    it('should execute workflow successfully', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
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

      // Mock validation
      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])

      // Mock agent execution
      ;(prisma.agent.findUnique as jest.Mock).mockResolvedValue({
        id: 'agent-1',
        externalId: 'ext-1',
        platformId: 'mock-platform',
        platform: { id: 'mock-platform' },
      })

      mockAdapter.executeAgent = jest.fn().mockResolvedValue({
        success: true,
        data: { result: 'success' },
        executionTime: 1000,
        timestamp: new Date(),
      })

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      const executionId = await workflowService.executeWorkflow(
        'workflow-1',
        {
          variables: { testVar: 'testValue' },
        },
        'user-1'
      )

      expect(executionId).toMatch(/^exec_/)
      expect(
        mockWebSocketService.notifyWorkflowStatusChange
      ).toHaveBeenCalledWith(
        executionId,
        'PENDING',
        expect.objectContaining({
          workflowId: 'workflow-1',
          workflowName: 'Test Workflow',
        })
      )

      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockAdapter.executeAgent).toHaveBeenCalledWith('ext-1', {
        input: 'test',
      })
    })

    it('should handle dry run execution', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Test Step',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      const executionId = await workflowService.executeWorkflow(
        'workflow-1',
        {
          dryRun: true,
        },
        'user-1'
      )

      expect(executionId).toMatch(/^exec_/)
      expect(
        mockWebSocketService.notifyWorkflowStatusChange
      ).toHaveBeenCalledWith(
        executionId,
        'COMPLETED',
        expect.objectContaining({
          dryRun: true,
        })
      )
    })

    it('should fail to execute non-existent workflow', async () => {
      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(null)

      await expect(
        workflowService.executeWorkflow('non-existent', {}, 'user-1')
      ).rejects.toThrow('Workflow non-existent not found')
    })

    it('should fail to execute inactive workflow', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'DRAFT', // Not active
        steps: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      await expect(
        workflowService.executeWorkflow('workflow-1', {}, 'user-1')
      ).rejects.toThrow('Workflow workflow-1 is not active (status: DRAFT)')
    })

    it('should fail to execute invalid workflow', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'non-existent-agent',
            stepOrder: 0,
            name: 'Invalid Step',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([])
      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      await expect(
        workflowService.executeWorkflow('workflow-1', {}, 'user-1')
      ).rejects.toThrow('Workflow validation failed')
    })
  })

  describe('getWorkflowExecution', () => {
    it('should get workflow execution status', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Test Step',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      const executionId = await workflowService.executeWorkflow(
        'workflow-1',
        {},
        'user-1'
      )
      const execution = workflowService.getWorkflowExecution(executionId)

      expect(execution).toMatchObject({
        id: executionId,
        workflowId: 'workflow-1',
        status: 'PENDING',
        createdBy: 'user-1',
      })
    })

    it('should return null for non-existent execution', () => {
      const execution = workflowService.getWorkflowExecution('non-existent')
      expect(execution).toBeNull()
    })
  })

  describe('cancelWorkflowExecution', () => {
    it('should cancel workflow execution', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Test Step',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      const executionId = await workflowService.executeWorkflow(
        'workflow-1',
        {},
        'user-1'
      )
      await workflowService.cancelWorkflowExecution(executionId)

      const execution = workflowService.getWorkflowExecution(executionId)
      expect(execution).toBeNull() // Should be removed from running executions

      expect(
        mockWebSocketService.notifyWorkflowStatusChange
      ).toHaveBeenCalledWith(
        executionId,
        'CANCELLED',
        expect.objectContaining({
          cancelled: true,
        })
      )
    })

    it('should fail to cancel non-existent execution', async () => {
      await expect(
        workflowService.cancelWorkflowExecution('non-existent')
      ).rejects.toThrow('Workflow execution non-existent not found')
    })
  })

  describe('getWorkflowProgress', () => {
    it('should get workflow progress', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Test Step 1',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
          {
            id: 'step-2',
            workflowId: 'workflow-1',
            agentId: 'agent-2',
            stepOrder: 1,
            name: 'Test Step 2',
            parameters: {},
            conditions: [{ type: 'always' }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
        { id: 'agent-2', status: 'ACTIVE' },
      ])

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      const executionId = await workflowService.executeWorkflow(
        'workflow-1',
        {},
        'user-1'
      )
      const progress = workflowService.getWorkflowProgress(executionId)

      expect(progress).toMatchObject({
        workflowExecutionId: executionId,
        totalSteps: 2,
        completedSteps: 0,
        failedSteps: 0,
        progress: 0,
      })
    })

    it('should return null for non-existent execution', () => {
      const progress = workflowService.getWorkflowProgress('non-existent')
      expect(progress).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should handle step execution failure with retry', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Failing Step',
            parameters: {},
            conditions: [{ type: 'always' }],
            retryConfig: {
              maxRetries: 2,
              backoffMs: 100,
              backoffMultiplier: 2,
              maxBackoffMs: 1000,
            },
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])
      ;(prisma.agent.findUnique as jest.Mock).mockResolvedValue({
        id: 'agent-1',
        externalId: 'ext-1',
        platformId: 'mock-platform',
        platform: { id: 'mock-platform' },
      })

      // Mock adapter to fail first two times, then succeed
      let callCount = 0
      mockAdapter.executeAgent = jest.fn().mockImplementation(() => {
        callCount++
        if (callCount <= 2) {
          return Promise.resolve({
            success: false,
            error: 'Temporary failure',
            executionTime: 100,
            timestamp: new Date(),
          })
        }
        return Promise.resolve({
          success: true,
          data: { result: 'success after retry' },
          executionTime: 100,
          timestamp: new Date(),
        })
      })

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      const executionId = await workflowService.executeWorkflow(
        'workflow-1',
        {},
        'user-1'
      )

      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 500))

      expect(mockAdapter.executeAgent).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should handle workflow execution timeout', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'Slow Step',
            parameters: {},
            conditions: [{ type: 'always' }],
            timeoutMs: 100, // Very short timeout
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
      ])
      ;(prisma.agent.findUnique as jest.Mock).mockResolvedValue({
        id: 'agent-1',
        externalId: 'ext-1',
        platformId: 'mock-platform',
        platform: { id: 'mock-platform' },
      })

      // Mock adapter to take longer than timeout
      mockAdapter.executeAgent = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: { result: 'too slow' },
              executionTime: 200,
              timestamp: new Date(),
            })
          }, 200)
        })
      })

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      const executionId = await workflowService.executeWorkflow(
        'workflow-1',
        {},
        'user-1'
      )

      // Wait for timeout to occur
      await new Promise(resolve => setTimeout(resolve, 300))

      expect(mockWebSocketService.notifyWorkflowError).toHaveBeenCalled()
    })
  })

  describe('data passing between steps', () => {
    it('should pass data between workflow steps', async () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test',
        status: 'ACTIVE',
        steps: [
          {
            id: 'step-1',
            workflowId: 'workflow-1',
            agentId: 'agent-1',
            stepOrder: 0,
            name: 'First Step',
            parameters: { input: 'initial' },
            conditions: [{ type: 'always' }],
          },
          {
            id: 'step-2',
            workflowId: 'workflow-1',
            agentId: 'agent-2',
            stepOrder: 1,
            name: 'Second Step',
            parameters: {
              input: '${stepOutputs.step-1.result}',
              context: '${variables.testVar}',
            },
            conditions: [{ type: 'on_success', dependsOn: ['step-1'] }],
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.agent.findMany as jest.Mock).mockResolvedValue([
        { id: 'agent-1', status: 'ACTIVE' },
        { id: 'agent-2', status: 'ACTIVE' },
      ])
      ;(prisma.agent.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: 'agent-1',
          externalId: 'ext-1',
          platformId: 'mock-platform',
          platform: { id: 'mock-platform' },
        })
        .mockResolvedValueOnce({
          id: 'agent-2',
          externalId: 'ext-2',
          platformId: 'mock-platform',
          platform: { id: 'mock-platform' },
        })(
          // Mock first step to return data
          mockAdapter.executeAgent as jest.Mock
        )
        .mockResolvedValueOnce({
          success: true,
          data: { result: 'first-step-output' },
          executionTime: 100,
          timestamp: new Date(),
        })
        .mockResolvedValueOnce({
          success: true,
          data: { result: 'second-step-output' },
          executionTime: 100,
          timestamp: new Date(),
        })

      jest.spyOn(workflowService, 'getWorkflow').mockResolvedValue(workflow)

      const executionId = await workflowService.executeWorkflow(
        'workflow-1',
        {
          variables: { testVar: 'context-value' },
        },
        'user-1'
      )

      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify second step received data from first step
      expect(mockAdapter.executeAgent).toHaveBeenNthCalledWith(2, 'ext-2', {
        input: 'first-step-output',
        context: 'context-value',
      })
    })
  })
})
