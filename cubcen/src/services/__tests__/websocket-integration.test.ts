// Cubcen WebSocket Integration Tests
// Tests for WebSocket integration with agent service and real-time updates

import { createServer } from 'http'
import { io as Client, Socket } from 'socket.io-client'
import { WebSocketService, initializeWebSocketService } from '../websocket'
import { AgentService } from '../agent'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { generateToken } from '@/lib/jwt'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AgentStatusUpdate,
  AgentHealthUpdate,
  AgentConnectedEvent,
  AgentDisconnectedEvent,
  TaskCreatedEvent,
  TaskStartedEvent,
  TaskProgressEvent,
  TaskCompletedEvent,
  TaskFailedEvent,
  TaskCancelledEvent
} from '@/types/websocket'

// Mock dependencies
jest.mock('@/lib/jwt', () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn()
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock('@/lib/database', () => ({
  prisma: {
    agent: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn()
    },
    agentHealth: {
      create: jest.fn(),
      findFirst: jest.fn()
    },
    platform: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    }
  }
}))

describe('WebSocket Integration', () => {
  let httpServer: any
  let webSocketService: WebSocketService
  let agentService: AgentService
  let clientSocket: Socket
  let serverAddress: string

  const mockUser = {
    userId: 'user123',
    role: 'admin',
    email: 'admin@cubcen.com'
  }

  beforeAll((done) => {
    httpServer = createServer()
    
    // Initialize services with integration
    const adapterManager = new AdapterManager()
    agentService = new AgentService(adapterManager)
    webSocketService = initializeWebSocketService(httpServer, agentService)
    agentService.setWebSocketService(webSocketService)
    
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port
      serverAddress = `http://localhost:${port}`
      done()
    })
  })

  afterAll((done) => {
    httpServer.close(done)
  })

  beforeEach((done) => {
    // Mock JWT verification to return valid user
    const { verifyToken } = require('@/lib/jwt')
    verifyToken.mockResolvedValue(mockUser)

    clientSocket = Client(serverAddress, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 5000
    })
    
    clientSocket.on('connect', () => {
      // Authenticate the socket
      clientSocket.emit('auth:authenticate', 'valid-token', (success) => {
        expect(success).toBe(true)
        // Subscribe to all agents
        clientSocket.emit('subscribe:agents', [])
        setTimeout(done, 100) // Give time for subscriptions to be processed
      })
    })
  })

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect()
    }
  })

  describe('Agent Service Integration', () => {
    it('should broadcast agent status updates through WebSocket service', (done) => {
      const agentId = 'test-agent-123'
      
      // Listen for agent status updates
      clientSocket.on('agent:status', (data: AgentStatusUpdate) => {
        expect(data.agentId).toBe(agentId)
        expect(data.status).toBe('active')
        expect(data.metadata).toHaveProperty('statusUpdate', true)
        done()
      })
      
      // Simulate agent status update from agent service
      setTimeout(() => {
        webSocketService.notifyAgentStatusChange(agentId, 'active', {
          statusUpdate: true
        })
      }, 100)
    }, 15000)

    it('should broadcast agent health updates', (done) => {
      const agentId = 'test-agent-456'
      
      // Listen for agent health updates
      clientSocket.on('agent:health', (data: AgentHealthUpdate) => {
        expect(data.agentId).toBe(agentId)
        expect(data.health.status).toBe('healthy')
        expect(data.health.responseTime).toBe(150)
        done()
      })
      
      // Simulate health update from agent service
      setTimeout(() => {
        webSocketService.notifyAgentHealthChange(agentId, {
          status: 'healthy',
          lastCheck: new Date(),
          responseTime: 150,
          errorCount: 0
        })
      }, 100)
    }, 15000)

    it('should broadcast agent connection events', (done) => {
      const agentId = 'test-agent-789'
      const platformId = 'n8n-platform'
      
      // Listen for agent connected events
      clientSocket.on('agent:connected', (data) => {
        expect(data.agentId).toBe(agentId)
        expect(data.platformId).toBe(platformId)
        expect(data.timestamp).toBeInstanceOf(Date)
        done()
      })
      
      // Simulate agent connection from agent service
      setTimeout(() => {
        webSocketService.notifyAgentConnection(agentId, platformId, true)
      }, 100)
    }, 15000)

    it('should broadcast agent disconnection events', (done) => {
      const agentId = 'test-agent-999'
      const platformId = 'make-platform'
      const reason = 'Connection timeout'
      
      // Listen for agent disconnected events
      clientSocket.on('agent:disconnected', (data) => {
        expect(data.agentId).toBe(agentId)
        expect(data.platformId).toBe(platformId)
        expect(data.reason).toBe(reason)
        expect(data.timestamp).toBeInstanceOf(Date)
        done()
      })
      
      // Simulate agent disconnection from agent service
      setTimeout(() => {
        webSocketService.notifyAgentConnection(agentId, platformId, false, reason)
      }, 100)
    }, 15000)
  })

  describe('Task Lifecycle Integration', () => {
    it('should broadcast task created events', (done) => {
      const taskId = 'task-123'
      const agentId = 'agent-456'
      
      // Subscribe to tasks
      clientSocket.emit('subscribe:tasks', [])
      
      // Listen for task created events
      clientSocket.on('task:created', (data) => {
        expect(data.taskId).toBe(taskId)
        expect(data.agentId).toBe(agentId)
        expect(data.type).toBe('data-processing')
        expect(data.priority).toBe('high')
        done()
      })
      
      // Simulate task creation
      setTimeout(() => {
        webSocketService.notifyTaskCreated(
          taskId,
          agentId,
          'data-processing',
          'high',
          new Date(),
          'user123'
        )
      }, 100)
    }, 15000)

    it('should broadcast task progress updates', (done) => {
      const taskId = 'task-456'
      const agentId = 'agent-789'
      
      // Subscribe to specific task
      clientSocket.emit('subscribe:tasks', [taskId])
      
      // Listen for task progress updates
      clientSocket.on('task:progress', (data) => {
        expect(data.taskId).toBe(taskId)
        expect(data.agentId).toBe(agentId)
        expect(data.progress.percentage).toBe(75)
        expect(data.progress.currentStep).toBe('Finalizing')
        done()
      })
      
      // Simulate task progress update
      setTimeout(() => {
        webSocketService.broadcastTaskProgress({
          taskId,
          agentId,
          progress: {
            percentage: 75,
            currentStep: 'Finalizing',
            totalSteps: 4,
            completedSteps: 3,
            message: 'Almost complete'
          },
          timestamp: new Date()
        })
      }, 100)
    }, 15000)

    it('should broadcast task completion events', (done) => {
      const taskId = 'task-789'
      const agentId = 'agent-123'
      
      // Subscribe to tasks
      clientSocket.emit('subscribe:tasks', [])
      
      // Listen for task completed events
      clientSocket.on('task:completed', (data) => {
        expect(data.taskId).toBe(taskId)
        expect(data.agentId).toBe(agentId)
        expect(data.success).toBe(true)
        expect(data.duration).toBe(5000)
        done()
      })
      
      // Simulate task completion
      setTimeout(() => {
        webSocketService.notifyTaskCompleted(
          taskId,
          agentId,
          new Date(),
          5000,
          true,
          { processed: 100, errors: 0 }
        )
      }, 100)
    }, 15000)

    it('should broadcast task failure events', (done) => {
      const taskId = 'task-failed'
      const agentId = 'agent-error'
      
      // Subscribe to tasks
      clientSocket.emit('subscribe:tasks', [])
      
      // Listen for task failed events
      clientSocket.on('task:failed', (data) => {
        expect(data.taskId).toBe(taskId)
        expect(data.agentId).toBe(agentId)
        expect(data.error.code).toBe('PROCESSING_ERROR')
        expect(data.retryCount).toBe(2)
        expect(data.willRetry).toBe(true)
        done()
      })
      
      // Simulate task failure
      setTimeout(() => {
        webSocketService.notifyTaskFailed(
          taskId,
          agentId,
          new Date(),
          {
            code: 'PROCESSING_ERROR',
            message: 'Failed to process data',
            details: { step: 'validation' }
          },
          2,
          true
        )
      }, 100)
    }, 15000)
  })

  describe('Real-time Statistics', () => {
    it('should provide real-time statistics', () => {
      const stats = webSocketService.getRealTimeStats()
      
      expect(stats).toHaveProperty('connections')
      expect(stats).toHaveProperty('subscriptions')
      expect(stats).toHaveProperty('uptime')
      expect(stats).toHaveProperty('memory')
      
      expect(typeof stats.connections).toBe('number')
      expect(typeof stats.uptime).toBe('number')
      expect(stats.memory).toHaveProperty('used')
      expect(stats.memory).toHaveProperty('total')
    })

    it('should track subscription statistics', () => {
      const stats = webSocketService.getSubscriptionStats()
      
      expect(stats).toHaveProperty('agents')
      expect(stats).toHaveProperty('tasks')
      expect(stats).toHaveProperty('platforms')
      
      expect(typeof stats.agents).toBe('number')
      expect(typeof stats.tasks).toBe('number')
      expect(typeof stats.platforms).toBe('number')
    })
  })

  describe('Error Broadcasting', () => {
    it('should broadcast agent errors', (done) => {
      const agentId = 'error-agent'
      const platformId = 'test-platform'
      
      // Listen for agent errors
      clientSocket.on('error:agent', (data) => {
        expect(data.agentId).toBe(agentId)
        expect(data.platformId).toBe(platformId)
        expect(data.error.code).toBe('CONNECTION_FAILED')
        expect(data.error.severity).toBe('high')
        done()
      })
      
      // Simulate agent error
      setTimeout(() => {
        webSocketService.broadcastAgentError({
          agentId,
          platformId,
          error: {
            code: 'CONNECTION_FAILED',
            message: 'Failed to connect to platform',
            severity: 'high',
            details: { timeout: 30000 }
          },
          timestamp: new Date()
        })
      }, 100)
    }, 15000)

    it('should broadcast critical alerts', (done) => {
      // Listen for critical alerts
      clientSocket.on('alert:critical', (data) => {
        expect(data.title).toBe('System Critical Error')
        expect(data.source).toBe('system')
        expect(data.requiresAction).toBe(true)
        done()
      })
      
      // Simulate critical alert
      webSocketService.broadcastCriticalAlert({
        id: 'critical-123',
        title: 'System Critical Error',
        message: 'Multiple agents are failing',
        source: 'system',
        sourceId: 'monitoring',
        timestamp: new Date(),
        requiresAction: true,
        actionUrl: '/dashboard/alerts/critical-123'
      })
    })
  })

  describe('Connection Management', () => {
    it('should track active connections', () => {
      const connectionCount = webSocketService.getConnectionCount()
      expect(connectionCount).toBeGreaterThanOrEqual(1)
    })

    it('should provide connection details', () => {
      const connections = webSocketService.getConnections()
      expect(connections.length).toBeGreaterThanOrEqual(1)
      
      const connection = connections[0]
      expect(connection).toHaveProperty('socketId')
      expect(connection).toHaveProperty('userId')
      expect(connection).toHaveProperty('userRole')
      expect(connection).toHaveProperty('connectedAt')
      expect(connection).toHaveProperty('subscriptions')
    })
  })
})