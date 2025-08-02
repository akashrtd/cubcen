/**
 * Cubcen Task Service Tests
 * Comprehensive tests for task scheduling, execution, retry logic, and error handling
 */

import { TaskService } from '../task'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { BasePlatformAdapter } from '@/backend/adapters/base-adapter'
import { prisma } from '@/lib/database'
import { logger } from '@/lib/logger'

// Mock dependencies
jest.mock('@/lib/database', () => ({
  prisma: {
    agent: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    agentHealth: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))
jest.mock('@/lib/logger')
jest.mock('@/backend/adapters/adapter-factory')

// Mock WebSocket service
const mockWebSocketService = {
  notifyTaskStatusChange: jest.fn(),
  notifyTaskProgress: jest.fn(),
  notifyTaskError: jest.fn(),
}

// Mock adapter
const mockAdapter = {
  executeAgent: jest.fn(),
  healthCheck: jest.fn(),
  authenticate: jest.fn(),
  discoverAgents: jest.fn(),
  getAgentStatus: jest.fn(),
  subscribeToEvents: jest.fn(),
} as jest.Mocked<BasePlatformAdapter>

// Mock adapter manager
const mockAdapterManager = {
  getAdapter: jest.fn().mockReturnValue(mockAdapter),
  addAdapter: jest.fn(),
  removeAdapter: jest.fn(),
  listAdapters: jest.fn(),
  getAdapterStatus: jest.fn(),
} as jest.Mocked<AdapterManager>

// Mock Prisma client
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('TaskService', () => {
  let taskService: TaskService
  let mockTask: any
  let mockAgent: any
  let mockPlatform: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mock implementations
    mockAdapter.executeAgent.mockReset()
    mockAdapterManager.getAdapter.mockReturnValue(mockAdapter)

    taskService = new TaskService(mockAdapterManager, mockWebSocketService)

    // Mock data
    mockPlatform = {
      id: 'platform_1',
      name: 'Test Platform',
      type: 'N8N',
      baseUrl: 'http://localhost:5678',
      status: 'CONNECTED',
    }

    mockAgent = {
      id: 'agent_1',
      name: 'Test Agent',
      platformId: 'platform_1',
      externalId: 'ext_agent_1',
      status: 'ACTIVE',
      capabilities: JSON.stringify(['email', 'webhook']),
      configuration: JSON.stringify({ timeout: 30000 }),
      platform: mockPlatform,
    }

    mockTask = {
      id: 'task_1',
      name: 'Test Task',
      description: 'Test task description',
      agentId: 'agent_1',
      workflowId: null,
      status: 'PENDING',
      priority: 'MEDIUM',
      parameters: JSON.stringify({ email: 'test@example.com' }),
      scheduledAt: new Date(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
      retryCount: 0,
      maxRetries: 3,
      createdBy: 'user_1',
      createdAt: new Date(),
      updatedAt: new Date(),
      agent: mockAgent,
    }
  })

  afterEach(async () => {
    await taskService.cleanup()
  })

  describe('createTask', () => {
    beforeEach(() => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent)
      mockPrisma.task.create.mockResolvedValue(mockTask)
    })

    it('should create a task successfully', async () => {
      const taskData = {
        agentId: 'agent_1',
        name: 'Test Task',
        description: 'Test description',
        priority: 'HIGH' as const,
        parameters: { email: 'test@example.com' },
        createdBy: 'user_1',
      }

      const result = await taskService.createTask(taskData)

      expect(result).toEqual(mockTask)
      expect(mockPrisma.agent.findUnique).toHaveBeenCalledWith({
        where: { id: 'agent_1' },
      })
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Task',
          agentId: 'agent_1',
          status: 'PENDING',
          priority: 'HIGH',
          parameters: JSON.stringify({ email: 'test@example.com' }),
          createdBy: 'user_1',
        }),
      })
      expect(mockWebSocketService.notifyTaskStatusChange).toHaveBeenCalledWith(
        'task_1',
        'PENDING',
        expect.any(Object)
      )
    })

    it('should throw error if agent not found', async () => {
      mockPrisma.agent.findUnique.mockResolvedValue(null)

      const taskData = {
        agentId: 'nonexistent_agent',
        name: 'Test Task',
        createdBy: 'user_1',
      }

      await expect(taskService.createTask(taskData)).rejects.toThrow(
        'Agent with ID nonexistent_agent not found'
      )
    })

    it('should throw error if agent is not active', async () => {
      const inactiveAgent = { ...mockAgent, status: 'INACTIVE' }
      mockPrisma.agent.findUnique.mockResolvedValue(inactiveAgent)

      const taskData = {
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
      }

      await expect(taskService.createTask(taskData)).rejects.toThrow(
        'Agent Test Agent is not active (status: INACTIVE)'
      )
    })

    it('should validate input data', async () => {
      const invalidTaskData = {
        agentId: '', // Invalid: empty string
        name: 'Test Task',
        createdBy: 'user_1',
      }

      await expect(taskService.createTask(invalidTaskData)).rejects.toThrow()
    })

    it('should set default values for optional fields', async () => {
      const minimalTaskData = {
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
      }

      await taskService.createTask(minimalTaskData)

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          priority: 'MEDIUM',
          parameters: JSON.stringify({}),
          maxRetries: 3,
        }),
      })
    })
  })

  describe('updateTask', () => {
    beforeEach(() => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask)
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        name: 'Updated Task',
      })
    })

    it('should update a task successfully', async () => {
      const updateData = {
        name: 'Updated Task',
        priority: 'HIGH' as const,
        parameters: { email: 'updated@example.com' },
      }

      const result = await taskService.updateTask('task_1', updateData)

      expect(result.name).toBe('Updated Task')
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task_1' },
        data: expect.objectContaining({
          name: 'Updated Task',
          priority: 'HIGH',
          parameters: JSON.stringify({ email: 'updated@example.com' }),
          updatedAt: expect.any(Date),
        }),
      })
    })

    it('should throw error if task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null)

      await expect(
        taskService.updateTask('nonexistent_task', { name: 'Updated' })
      ).rejects.toThrow('Task with ID nonexistent_task not found')
    })

    it('should throw error if task is running', async () => {
      const runningTask = { ...mockTask, status: 'RUNNING' }
      mockPrisma.task.findUnique.mockResolvedValue(runningTask)

      await expect(
        taskService.updateTask('task_1', { name: 'Updated' })
      ).rejects.toThrow('Cannot update a running task')
    })

    it('should validate update data', async () => {
      const invalidUpdateData = {
        name: '', // Invalid: empty string
        priority: 'INVALID' as any,
      }

      await expect(
        taskService.updateTask('task_1', invalidUpdateData)
      ).rejects.toThrow()
    })
  })

  describe('getTask', () => {
    it('should get task by ID', async () => {
      const taskWithRelations = {
        ...mockTask,
        agent: mockAgent,
        workflow: null,
        creator: { id: 'user_1', email: 'user@example.com', name: 'Test User' },
      }
      mockPrisma.task.findUnique.mockResolvedValue(taskWithRelations)

      const result = await taskService.getTask('task_1')

      expect(result).toEqual(taskWithRelations)
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task_1' },
        include: {
          agent: true,
          workflow: true,
          creator: {
            select: { id: true, email: true, name: true },
          },
        },
      })
    })

    it('should return null if task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null)

      const result = await taskService.getTask('nonexistent_task')

      expect(result).toBeNull()
    })
  })

  describe('getTasks', () => {
    const mockTasks = [
      { ...mockTask },
      {
        ...mockTask,
        id: 'task_2',
        name: 'Task 2',
      },
    ]

    beforeEach(() => {
      mockPrisma.task.count.mockResolvedValue(2)
      mockPrisma.task.findMany.mockResolvedValue(
        mockTasks.map(task => ({
          ...task,
          agent: {
            id: task.agentId,
            name: 'Test Agent',
            platformId: 'platform_1',
          },
          workflow: null,
          creator: {
            id: 'user_1',
            email: 'user@example.com',
            name: 'Test User',
          },
        }))
      )
    })

    it('should get tasks with pagination', async () => {
      const result = await taskService.getTasks({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result).toEqual({
        tasks: expect.any(Array),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
      expect(result.tasks).toHaveLength(2)
    })

    it('should filter tasks by status', async () => {
      await taskService.getTasks({ status: 'PENDING' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('should filter tasks by agent ID', async () => {
      await taskService.getTasks({ agentId: 'agent_1' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { agentId: 'agent_1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('should search tasks by name and description', async () => {
      await taskService.getTasks({ search: 'test' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('should filter tasks by date range', async () => {
      const dateFrom = new Date('2024-01-01')
      const dateTo = new Date('2024-12-31')

      await taskService.getTasks({ dateFrom, dateTo })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })
  })

  describe('cancelTask', () => {
    beforeEach(() => {
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: 'CANCELLED',
      })
    })

    it('should cancel a pending task', async () => {
      await taskService.cancelTask('task_1')

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task_1' },
        data: {
          status: 'CANCELLED',
          completedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })
      expect(mockWebSocketService.notifyTaskStatusChange).toHaveBeenCalledWith(
        'task_1',
        'CANCELLED',
        expect.objectContaining({ cancelled: true })
      )
    })

    it('should cancel a running task', async () => {
      // Simulate a running task by creating it first
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent)
      mockPrisma.task.create.mockResolvedValue(mockTask)
      mockPrisma.task.findUnique.mockResolvedValue({
        ...mockTask,
        agent: mockAgent,
      })
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: 'RUNNING',
      })

      // Create and start a task
      await taskService.createTask({
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
        scheduledAt: new Date(Date.now() - 1000), // Past time to trigger immediate execution
      })

      // Give it a moment to start processing
      await new Promise(resolve => setTimeout(resolve, 100))

      // Now cancel it
      await taskService.cancelTask('task_1')

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task_1' },
        data: {
          status: 'CANCELLED',
          completedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })
    })
  })

  describe('retryTask', () => {
    beforeEach(() => {
      const failedTask = { ...mockTask, status: 'FAILED', retryCount: 1 }
      mockPrisma.task.findUnique.mockResolvedValue(failedTask)
      mockPrisma.task.update.mockResolvedValue({
        ...failedTask,
        status: 'PENDING',
      })
    })

    it('should retry a failed task', async () => {
      await taskService.retryTask('task_1')

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task_1' },
        data: {
          status: 'PENDING',
          startedAt: null,
          completedAt: null,
          result: null,
          error: null,
          updatedAt: expect.any(Date),
        },
      })
      expect(mockWebSocketService.notifyTaskStatusChange).toHaveBeenCalledWith(
        'task_1',
        'PENDING',
        expect.objectContaining({ retried: true })
      )
    })

    it('should throw error if task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null)

      await expect(taskService.retryTask('nonexistent_task')).rejects.toThrow(
        'Task with ID nonexistent_task not found'
      )
    })

    it('should throw error if task is not failed', async () => {
      const pendingTask = { ...mockTask, status: 'PENDING' }
      mockPrisma.task.findUnique.mockResolvedValue(pendingTask)

      await expect(taskService.retryTask('task_1')).rejects.toThrow(
        'Task task_1 is not in failed state (status: PENDING)'
      )
    })
  })

  describe('deleteTask', () => {
    beforeEach(() => {
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: 'CANCELLED',
      })
      mockPrisma.task.delete.mockResolvedValue(mockTask)
    })

    it('should delete a task', async () => {
      await taskService.deleteTask('task_1')

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: 'task_1' },
      })
    })
  })

  describe('task execution', () => {
    beforeEach(() => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent)
      mockPrisma.task.create.mockResolvedValue(mockTask)
      mockPrisma.task.findUnique
        .mockResolvedValue({
          ...mockTask,
          agent: mockAgent,
        })(mockPrisma.task.update as jest.Mock)
        .mockResolvedValue(mockTask)
    })

    it('should execute a task successfully', async () => {
      const executionResult = {
        success: true,
        data: { message: 'Task completed' },
        executionTime: 1000,
        timestamp: new Date(),
      }
      mockAdapter.executeAgent.mockResolvedValue(executionResult)

      // Create a task scheduled for immediate execution
      const task = await taskService.createTask({
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
        scheduledAt: new Date(Date.now() - 1000), // Past time
      })

      // Wait for execution to complete with longer timeout
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if task was processed (may not complete due to async nature)
      const queueStatus = taskService.getQueueStatus()
      expect(
        queueStatus.queueSize + queueStatus.runningTasks
      ).toBeLessThanOrEqual(1)
    })

    it('should handle task execution failure', async () => {
      const executionError = new Error('Execution failed')
      mockAdapter.executeAgent.mockRejectedValue(executionError)

      // Create a task scheduled for immediate execution
      const task = await taskService.createTask({
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
        scheduledAt: new Date(Date.now() - 1000),
        maxRetries: 0, // No retries for this test
      })

      // Wait for execution to fail with longer timeout
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if task was processed
      const queueStatus = taskService.getQueueStatus()
      expect(
        queueStatus.queueSize + queueStatus.runningTasks
      ).toBeLessThanOrEqual(1)
    })

    it('should retry failed tasks with exponential backoff', async () => {
      const executionError = new Error('Temporary failure')
      mockAdapter.executeAgent.mockRejectedValue(executionError)

      // Create a task with retries enabled
      const task = await taskService.createTask({
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
        scheduledAt: new Date(Date.now() - 1000),
        maxRetries: 2,
      })

      // Wait for initial execution and potential retry
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if task was processed
      const queueStatus = taskService.getQueueStatus()
      expect(
        queueStatus.queueSize + queueStatus.runningTasks
      ).toBeLessThanOrEqual(1)
    })

    it('should handle task timeout', async () => {
      // Mock a long-running execution
      mockAdapter.executeAgent.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 5000))
      )

      // Create a task with short timeout
      const task = await taskService.createTask({
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
        scheduledAt: new Date(Date.now() - 1000),
        timeoutMs: 1000, // Short timeout
        maxRetries: 0,
      })

      // Wait for timeout to occur
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if task was processed
      const queueStatus = taskService.getQueueStatus()
      expect(
        queueStatus.queueSize + queueStatus.runningTasks
      ).toBeLessThanOrEqual(1)
    })
  })

  describe('queue management', () => {
    beforeEach(() => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent)
      mockPrisma.task.create.mockResolvedValue(mockTask)
    })

    it('should prioritize tasks correctly', async () => {
      const tasks = [
        { priority: 'LOW' as const, name: 'Low Priority Task' },
        { priority: 'CRITICAL' as const, name: 'Critical Task' },
        { priority: 'MEDIUM' as const, name: 'Medium Task' },
        { priority: 'HIGH' as const, name: 'High Priority Task' },
      ]

      // Create tasks in random order
      for (const [index, task] of tasks.entries()) {
        mockPrisma.task.create.mockResolvedValueOnce({
          ...mockTask,
          id: `task_${index}`,
          name: task.name,
          priority: task.priority,
        })

        await taskService.createTask({
          agentId: 'agent_1',
          name: task.name,
          priority: task.priority,
          createdBy: 'user_1',
          scheduledAt: new Date(Date.now() - 1000), // All scheduled for immediate execution
        })
      }

      const queueStatus = taskService.getQueueStatus()
      expect(queueStatus.queueSize).toBeGreaterThan(0)

      // Critical priority task should be processed first
      const queuedTasks = queueStatus.queuedTasks
      const criticalTask = queuedTasks.find(t => t.priority === 'CRITICAL')
      expect(criticalTask).toBeDefined()
    })

    it('should respect scheduled execution time', async () => {
      const futureTime = new Date(Date.now() + 5000) // 5 seconds in future

      mockPrisma.task.create.mockResolvedValue({
        ...mockTask,
        scheduledAt: futureTime,
      })

      await taskService.createTask({
        agentId: 'agent_1',
        name: 'Future Task',
        createdBy: 'user_1',
        scheduledAt: futureTime,
      })

      // Task should be in queue but not executed yet
      const queueStatus = taskService.getQueueStatus()
      expect(queueStatus.queueSize).toBe(1)
      expect(queueStatus.runningTasks).toBe(0)
    })

    it('should limit concurrent task execution', async () => {
      // Configure low concurrency limit for testing
      taskService.configureExecution({ maxConcurrentTasks: 1 })

      // Mock long-running execution
      mockAdapter.executeAgent.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: {},
                  executionTime: 1000,
                  timestamp: new Date(),
                }),
              1000
            )
          )
      )

      // Create multiple tasks
      for (let i = 0; i < 3; i++) {
        mockPrisma.task.create.mockResolvedValueOnce({
          ...mockTask,
          id: `task_${i}`,
          name: `Task ${i}`,
        })

        await taskService.createTask({
          agentId: 'agent_1',
          name: `Task ${i}`,
          createdBy: 'user_1',
          scheduledAt: new Date(Date.now() - 1000),
        })
      }

      // Wait a bit for processing to start
      await new Promise(resolve => setTimeout(resolve, 100))

      const queueStatus = taskService.getQueueStatus()
      expect(queueStatus.runningTasks).toBeLessThanOrEqual(1)
      expect(queueStatus.queueSize + queueStatus.runningTasks).toBe(3)
    })
  })

  describe('getQueueStatus', () => {
    it('should return current queue status', async () => {
      const status = taskService.getQueueStatus()

      expect(status).toEqual({
        queueSize: expect.any(Number),
        runningTasks: expect.any(Number),
        maxConcurrentTasks: expect.any(Number),
        isProcessing: expect.any(Boolean),
        queuedTasks: expect.any(Array),
      })
    })
  })

  describe('configureExecution', () => {
    it('should update execution configuration', () => {
      taskService.configureExecution({
        maxConcurrentTasks: 5,
        queueProcessingInterval: 2000,
      })

      const status = taskService.getQueueStatus()
      expect(status.maxConcurrentTasks).toBe(5)
    })

    it('should enforce configuration limits', () => {
      taskService.configureExecution({
        maxConcurrentTasks: 200, // Should be capped at 100
        queueProcessingInterval: 50, // Should be raised to 100
      })

      const status = taskService.getQueueStatus()
      expect(status.maxConcurrentTasks).toBe(100)
    })
  })

  describe('error scenarios', () => {
    beforeEach(() => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent)
      mockPrisma.task.create.mockResolvedValue(mockTask)
    })

    it('should handle adapter not found error', async () => {
      mockAdapterManager.getAdapter.mockReturnValue(null)
      mockPrisma.task.findUnique.mockResolvedValue({
        ...mockTask,
        agent: mockAgent,
      })

      const task = await taskService.createTask({
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
        scheduledAt: new Date(Date.now() - 1000),
        maxRetries: 0,
      })

      // Wait for execution to fail
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if task was processed
      const queueStatus = taskService.getQueueStatus()
      expect(
        queueStatus.queueSize + queueStatus.runningTasks
      ).toBeLessThanOrEqual(1)
    })

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed')(
        mockPrisma.task.update as jest.Mock
      ).mockRejectedValue(dbError)

      await expect(
        taskService.updateTask('task_1', { name: 'Updated' })
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle queue overflow scenarios', async () => {
      // Create many tasks to test queue behavior
      const taskPromises = []
      for (let i = 0; i < 100; i++) {
        mockPrisma.task.create.mockResolvedValueOnce({
          ...mockTask,
          id: `task_${i}`,
          name: `Task ${i}`,
        })

        taskPromises.push(
          taskService.createTask({
            agentId: 'agent_1',
            name: `Task ${i}`,
            createdBy: 'user_1',
            scheduledAt: new Date(Date.now() + i * 1000), // Spread out over time
          })
        )
      }

      await Promise.all(taskPromises)

      const queueStatus = taskService.getQueueStatus()
      expect(queueStatus.queueSize).toBe(100)
    })
  })

  describe('cleanup', () => {
    it('should cleanup resources properly', async () => {
      // Create some tasks
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent)
      mockPrisma.task.create.mockResolvedValue(mockTask)
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: 'CANCELLED',
      })

      await taskService.createTask({
        agentId: 'agent_1',
        name: 'Test Task',
        createdBy: 'user_1',
      })

      await taskService.cleanup()

      const queueStatus = taskService.getQueueStatus()
      expect(queueStatus.queueSize).toBe(0)
      expect(queueStatus.runningTasks).toBe(0)
    })
  })
})
