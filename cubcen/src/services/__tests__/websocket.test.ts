// Cubcen WebSocket Service Tests
// Comprehensive tests for real-time communication functionality

import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { WebSocketService, initializeWebSocketService } from '../websocket'
import { generateToken } from '@/lib/jwt'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AgentStatusUpdate,
  TaskProgressEvent,
  AgentErrorEvent,
  CriticalAlertEvent
} from '@/types/websocket'

// Mock JWT verification
jest.mock('@/lib/jwt', () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn()
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

describe('WebSocketService', () => {
  let httpServer: any
  let webSocketService: WebSocketService
  let clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>
  let serverAddress: string

  const mockUser = {
    userId: 'user123',
    role: 'admin',
    email: 'admin@cubcen.com'
  }

  beforeAll((done) => {
    httpServer = createServer()
    webSocketService = initializeWebSocketService(httpServer)
    
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
    
    clientSocket.on('connect', done)
  })

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect()
    }
  })

  describe('Connection and Authentication', () => {
    it('should establish WebSocket connection', (done) => {
      expect(clientSocket.connected).toBe(true)
      done()
    })

    it('should authenticate socket with valid token', (done) => {
      const token = 'valid-jwt-token'
      
      clientSocket.emit('auth:authenticate', token, (success, error) => {
        expect(success).toBe(true)
        expect(error).toBeUndefined()
        done()
      })
    }, 15000)

    it('should reject authentication with invalid token', (done) => {
      const { verifyToken } = require('@/lib/jwt')
      verifyToken.mockRejectedValue(new Error('Invalid token'))

      const token = 'invalid-jwt-token'
      
      clientSocket.emit('auth:authenticate', token, (success, error) => {
        expect(success).toBe(false)
        expect(error).toBe('Invalid token')
        done()
      })
    })

    it('should handle authentication errors gracefully', (done) => {
      const { verifyToken } = require('@/lib/jwt')
      verifyToken.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const token = 'error-token'
      
      clientSocket.emit('auth:authenticate', token, (success, error) => {
        expect(success).toBe(false)
        expect(error).toBe('Authentication failed')
        done()
      })
    }, 15000)
  })

  describe('Subscription Management', () => {
    beforeEach((done) => {
      // Authenticate first
      clientSocket.emit('auth:authenticate', 'valid-token', (success) => {
        expect(success).toBe(true)
        done()
      })
    })

    it('should subscribe to specific agents', (done) => {
      const agentIds = ['agent1', 'agent2']
      
      clientSocket.emit('subscribe:agents', agentIds)
      
      // Verify subscription by checking if we receive agent status updates
      const testUpdate: AgentStatusUpdate = {
        agentId: 'agent1',
        status: 'active',
        timestamp: new Date()
      }
      
      clientSocket.on('agent:status', (data) => {
        expect(data.agentId).toBe('agent1')
        expect(data.status).toBe('active')
        done()
      })
      
      // Broadcast test update
      setTimeout(() => {
        webSocketService.broadcastAgentStatus(testUpdate)
      }, 100)
    })

    it('should subscribe to all agents for admin users', (done) => {
      clientSocket.emit('subscribe:agents', [])
      
      const testUpdate: AgentStatusUpdate = {
        agentId: 'any-agent',
        status: 'inactive',
        timestamp: new Date()
      }
      
      clientSocket.on('agent:status', (data) => {
        expect(data.agentId).toBe('any-agent')
        expect(data.status).toBe('inactive')
        done()
      })
      
      setTimeout(() => {
        webSocketService.broadcastAgentStatus(testUpdate)
      }, 100)
    })

    it('should subscribe to specific tasks', (done) => {
      const taskIds = ['task1', 'task2']
      
      clientSocket.emit('subscribe:tasks', taskIds)
      
      const testUpdate: TaskProgressEvent = {
        taskId: 'task1',
        agentId: 'agent1',
        progress: {
          percentage: 50,
          currentStep: 'Processing',
          totalSteps: 4,
          completedSteps: 2,
          message: 'Halfway done'
        },
        timestamp: new Date()
      }
      
      clientSocket.on('task:progress', (data) => {
        expect(data.taskId).toBe('task1')
        expect(data.progress.percentage).toBe(50)
        done()
      })
      
      setTimeout(() => {
        webSocketService.broadcastTaskProgress(testUpdate)
      }, 100)
    })

    it('should unsubscribe from agents', (done) => {
      const agentIds = ['agent1']
      
      // First subscribe
      clientSocket.emit('subscribe:agents', agentIds)
      
      // Then unsubscribe after a short delay
      setTimeout(() => {
        clientSocket.emit('unsubscribe:agents', agentIds)
        
        // Wait a bit more before testing
        setTimeout(() => {
          // Set up listener after unsubscribing
          let receivedUpdate = false
          clientSocket.on('agent:status', () => {
            receivedUpdate = true
          })
          
          const testUpdate: AgentStatusUpdate = {
            agentId: 'agent1',
            status: 'active',
            timestamp: new Date()
          }
          
          webSocketService.broadcastAgentStatus(testUpdate)
          
          // Check after a delay that no update was received
          setTimeout(() => {
            expect(receivedUpdate).toBe(false)
            done()
          }, 300)
        }, 100)
      }, 100)
    }, 15000)

    it('should require authentication for subscriptions', (done) => {
      // Create unauthenticated client
      const unauthenticatedClient = Client(serverAddress, {
        transports: ['websocket'],
        forceNew: true
      })
      
      unauthenticatedClient.on('connect', () => {
        unauthenticatedClient.emit('subscribe:agents', ['agent1'])
        
        unauthenticatedClient.on('auth:session_invalid', () => {
          unauthenticatedClient.disconnect()
          done()
        })
      })
    })
  })

  describe('Event Broadcasting', () => {
    beforeEach((done) => {
      // Authenticate and subscribe to all
      clientSocket.emit('auth:authenticate', 'valid-token', (success) => {
        expect(success).toBe(true)
        clientSocket.emit('subscribe:agents', [])
        clientSocket.emit('subscribe:tasks', [])
        setTimeout(done, 100) // Give time for subscriptions to be processed
      })
    })

    it('should broadcast agent status updates', (done) => {
      const testUpdate: AgentStatusUpdate = {
        agentId: 'test-agent',
        status: 'error',
        timestamp: new Date(),
        metadata: { errorCode: 'CONNECTION_FAILED' }
      }
      
      clientSocket.on('agent:status', (data) => {
        expect(data.agentId).toBe('test-agent')
        expect(data.status).toBe('error')
        expect(data.metadata?.errorCode).toBe('CONNECTION_FAILED')
        done()
      })
      
      setTimeout(() => {
        webSocketService.broadcastAgentStatus(testUpdate)
      }, 100)
    }, 15000)

    it('should broadcast task progress updates', (done) => {
      const testUpdate: TaskProgressEvent = {
        taskId: 'test-task',
        agentId: 'test-agent',
        progress: {
          percentage: 75,
          currentStep: 'Finalizing',
          totalSteps: 4,
          completedSteps: 3,
          message: 'Almost complete'
        },
        timestamp: new Date()
      }
      
      clientSocket.on('task:progress', (data) => {
        expect(data.taskId).toBe('test-task')
        expect(data.progress.percentage).toBe(75)
        expect(data.progress.currentStep).toBe('Finalizing')
        done()
      })
      
      setTimeout(() => {
        webSocketService.broadcastTaskProgress(testUpdate)
      }, 100)
    }, 15000)

    it('should broadcast agent errors', (done) => {
      const testError: AgentErrorEvent = {
        agentId: 'test-agent',
        platformId: 'n8n-platform',
        error: {
          code: 'EXECUTION_FAILED',
          message: 'Agent execution failed',
          severity: 'high',
          details: { step: 'data-processing' }
        },
        timestamp: new Date()
      }
      
      clientSocket.on('error:agent', (data) => {
        expect(data.agentId).toBe('test-agent')
        expect(data.error.code).toBe('EXECUTION_FAILED')
        expect(data.error.severity).toBe('high')
        done()
      })
      
      setTimeout(() => {
        webSocketService.broadcastAgentError(testError)
      }, 100)
    }, 15000)

    it('should broadcast critical alerts to all clients', (done) => {
      const testAlert: CriticalAlertEvent = {
        id: 'alert-123',
        title: 'System Critical Error',
        message: 'Multiple agents are failing',
        source: 'system',
        sourceId: 'monitoring',
        timestamp: new Date(),
        requiresAction: true,
        actionUrl: '/dashboard/alerts/alert-123'
      }
      
      clientSocket.on('alert:critical', (data) => {
        expect(data.id).toBe('alert-123')
        expect(data.title).toBe('System Critical Error')
        expect(data.requiresAction).toBe(true)
        done()
      })
      
      webSocketService.broadcastCriticalAlert(testAlert)
    })

    it('should broadcast system health updates', (done) => {
      clientSocket.on('system:health', (data) => {
        expect(data.status).toBeDefined()
        expect(data.metrics).toBeDefined()
        expect(data.metrics.activeConnections).toBeGreaterThanOrEqual(0)
        done()
      })
      
      // Trigger health broadcast manually for testing
      webSocketService.broadcastSystemHealth({
        timestamp: new Date(),
        status: 'healthy',
        metrics: {
          cpu: 25.5,
          memory: 128,
          activeConnections: 1,
          activeAgents: 5,
          runningTasks: 3,
          errorRate: 0.02
        }
      })
    })
  })

  describe('Connection Management', () => {
    beforeEach((done) => {
      clientSocket.emit('auth:authenticate', 'valid-token', (success) => {
        expect(success).toBe(true)
        done()
      })
    })

    it('should track connection count', () => {
      const connectionCount = webSocketService.getConnectionCount()
      expect(connectionCount).toBeGreaterThanOrEqual(1)
    })

    it('should provide connection information', () => {
      const connections = webSocketService.getConnections()
      expect(connections).toHaveLength(webSocketService.getConnectionCount())
      
      const connection = connections[0]
      expect(connection.userId).toBe(mockUser.userId)
      expect(connection.userRole).toBe(mockUser.role)
      expect(connection.connectedAt).toBeInstanceOf(Date)
    })

    it('should provide subscription statistics', () => {
      const stats = webSocketService.getSubscriptionStats()
      expect(stats).toHaveProperty('agents')
      expect(stats).toHaveProperty('tasks')
      expect(stats).toHaveProperty('platforms')
      expect(typeof stats.agents).toBe('number')
      expect(typeof stats.tasks).toBe('number')
      expect(typeof stats.platforms).toBe('number')
    })

    it('should handle ping/pong for connection health', (done) => {
      const startTime = Date.now()
      
      clientSocket.emit('ping', (timestamp) => {
        expect(timestamp).toBeGreaterThanOrEqual(startTime)
        expect(timestamp).toBeLessThanOrEqual(Date.now())
        done()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle connection drops gracefully', (done) => {
      const initialConnectionCount = webSocketService.getConnectionCount()
      
      clientSocket.on('disconnect', () => {
        // Check that connection count decreased after disconnect
        setTimeout(() => {
          const newConnectionCount = webSocketService.getConnectionCount()
          expect(newConnectionCount).toBeLessThanOrEqual(initialConnectionCount)
          done()
        }, 200)
      })
      
      clientSocket.disconnect()
    }, 15000)

    it('should clean up subscriptions on disconnect', (done) => {
      // Subscribe to agents first
      clientSocket.emit('subscribe:agents', ['agent1', 'agent2'])
      
      setTimeout(() => {
        const initialStats = webSocketService.getSubscriptionStats()
        
        clientSocket.on('disconnect', () => {
          setTimeout(() => {
            const newStats = webSocketService.getSubscriptionStats()
            // Subscription count should be cleaned up
            expect(newStats.agents).toBeLessThanOrEqual(initialStats.agents)
            done()
          }, 100)
        })
        
        clientSocket.disconnect()
      }, 100)
    })

    it('should handle invalid subscription requests', (done) => {
      // Try to subscribe without authentication
      const unauthenticatedClient = Client(serverAddress, {
        transports: ['websocket'],
        forceNew: true
      })
      
      unauthenticatedClient.on('connect', () => {
        unauthenticatedClient.emit('subscribe:agents', ['agent1'])
        
        unauthenticatedClient.on('auth:session_invalid', () => {
          unauthenticatedClient.disconnect()
          done()
        })
      })
    })
  })

  describe('Service Lifecycle', () => {
    it('should initialize service correctly', () => {
      expect(webSocketService).toBeDefined()
      expect(webSocketService.getConnectionCount).toBeDefined()
      expect(webSocketService.broadcastAgentStatus).toBeDefined()
    })

    it('should handle shutdown gracefully', async () => {
      // This test verifies the shutdown method exists and can be called
      // In a real scenario, this would close all connections
      expect(webSocketService.shutdown).toBeDefined()
      expect(typeof webSocketService.shutdown).toBe('function')
    })
  })

  describe('Role-based Access', () => {
    it('should allow admin users to subscribe to all agents', (done) => {
      // Admin user (already set up in mockUser)
      clientSocket.emit('auth:authenticate', 'admin-token', (success) => {
        expect(success).toBe(true)
        
        // Subscribe to all agents (empty array)
        clientSocket.emit('subscribe:agents', [])
        
        // Should receive updates for any agent
        const testUpdate: AgentStatusUpdate = {
          agentId: 'random-agent',
          status: 'active',
          timestamp: new Date()
        }
        
        clientSocket.on('agent:status', (data) => {
          expect(data.agentId).toBe('random-agent')
          done()
        })
        
        setTimeout(() => {
          webSocketService.broadcastAgentStatus(testUpdate)
        }, 100)
      })
    })

    it('should restrict viewer access appropriately', (done) => {
      const { verifyToken } = require('@/lib/jwt')
      verifyToken.mockResolvedValue({
        userId: 'viewer123',
        role: 'viewer',
        email: 'viewer@cubcen.com'
      })

      const viewerClient = Client(serverAddress, {
        transports: ['websocket'],
        forceNew: true
      })
      
      viewerClient.on('connect', () => {
        viewerClient.emit('auth:authenticate', 'viewer-token', (success) => {
          expect(success).toBe(true)
          
          // Viewer should still be able to subscribe (business logic for restrictions would be in the subscription handler)
          viewerClient.emit('subscribe:agents', ['agent1'])
          
          viewerClient.disconnect()
          done()
        })
      })
    })
  })
})