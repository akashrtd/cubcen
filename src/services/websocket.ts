// Cubcen WebSocket Service
// Handles real-time communication using Socket.io for agent status, task updates, and alerts

import type { ServerToClientEvents, ClientToServerEvents, AgentStatusUpdate, TaskProgressEvent, AgentErrorEvent, CriticalAlertEvent, TaskErrorEvent, PlatformErrorEvent, SystemHealthEvent, WarningAlertEvent, InfoAlertEvent, ConnectionInfo, AuthResult, SocketData, InterServerEvents } from '@/types/websocket'
import { Server as HTTPServer } from 'http'
import { logger } from '@/lib/logger'
import { verifyAccessToken } from '@/lib/jwt'
import { AgentService } from '@/services/agent'
import { TaskStatus } from '@/lib/database'
import { Server as SocketIOServer } from 'socket.io'

export class WebSocketService {
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
  private connections: Map<string, ConnectionInfo> = new Map()
  private subscriptions: {
    agents: Map<string, Set<string>>
    tasks: Map<string, Set<string>>
    platforms: Map<string, Set<string>>
  } = {
    agents: new Map(),
    tasks: new Map(),
    platforms: new Map(),
  }
  private agentService?: AgentService

  constructor(httpServer: HTTPServer, agentService?: AgentService) {
    this.agentService = agentService

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin:
          process.env.NODE_ENV === 'production'
            ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://cubcen.com']
            : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
      upgradeTimeout: 10000,
    })

    this.setupEventHandlers()
    this.setupHealthMonitoring()

    logger.info('WebSocket service initialized')
  }

  private setupEventHandlers(): void {
    this.io.on('connection', socket => {
      logger.info('New WebSocket connection', { socketId: socket.id })

      // Initialize socket data
      socket.data = {
        userId: '',
        userRole: '',
        subscriptions: {
          agents: new Set(),
          tasks: new Set(),
          platforms: new Set(),
        },
        authenticated: false,
        connectedAt: new Date(),
      }

      // Authentication handler
      socket.on('auth:authenticate', async (token: string, callback) => {
        try {
          const authResult = await this.authenticateSocket(socket, token)

          if (typeof callback === 'function') {
            callback(authResult.success, authResult.error)
          }

          if (authResult.success) {
            logger.info('Socket authenticated successfully', {
              socketId: socket.id,
              userId: authResult.userId,
              userRole: authResult.userRole,
            })
          } else {
            logger.warn('Socket authentication failed', {
              socketId: socket.id,
              error: authResult.error,
            })
          }
        } catch (error) {
          logger.error('Socket authentication error', error as Error, {
            socketId: socket.id,
          })
          if (typeof callback === 'function') {
            callback(false, 'Authentication failed')
          }
        }
      })

      // Subscription handlers
      socket.on('subscribe:agents', agentIds => {
        if (!socket.data.authenticated) {
          socket.emit('auth:session_invalid')
          return
        }
        this.handleAgentSubscription(socket, agentIds || [])
      })

      socket.on('subscribe:tasks', taskIds => {
        if (!socket.data.authenticated) {
          socket.emit('auth:session_invalid')
          return
        }
        this.handleTaskSubscription(socket, taskIds || [])
      })

      socket.on('subscribe:platforms', platformIds => {
        if (!socket.data.authenticated) {
          socket.emit('auth:session_invalid')
          return
        }
        this.handlePlatformSubscription(socket, platformIds || [])
      })

      // Unsubscription handlers
      socket.on('unsubscribe:agents', agentIds => {
        this.handleAgentUnsubscription(socket, agentIds || [])
      })

      socket.on('unsubscribe:tasks', taskIds => {
        this.handleTaskUnsubscription(socket, taskIds || [])
      })

      socket.on('unsubscribe:platforms', platformIds => {
        this.handlePlatformUnsubscription(socket, platformIds || [])
      })

      // Ping handler
      socket.on('ping', callback => {
        if (typeof callback === 'function') {
          callback(Date.now())
        }
      })

      // Disconnection handler
      socket.on('disconnect', reason => {
        this.handleDisconnection(socket, reason)
      })

      // Error handler
      socket.on('error', error => {
        logger.error('Socket error', error, { socketId: socket.id })
      })
    })
  }

  private async authenticateSocket(
    socket: any,
    token: string
  ): Promise<AuthResult> {
     
    try {
      const decoded = verifyAccessToken(token)

      socket.data.userId = decoded.userId
      socket.data.userRole = decoded.role
      socket.data.authenticated = true

      // Store connection info
      const connectionInfo: ConnectionInfo = {
        socketId: socket.id,
        userId: decoded.userId,
        userRole: decoded.role,
        connectedAt: new Date(),
        lastActivity: new Date(),
        subscriptions: {
          agents: [],
          tasks: [],
          platforms: [],
        },
      }

      this.connections.set(socket.id, connectionInfo)

      return {
        success: true,
        userId: decoded.userId,
        userRole: decoded.role,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token',
      }
    }
  }

  private handleAgentSubscription(socket: any, agentIds: string[]): void {
     
    const userId = socket.data.userId

    if (agentIds.length === 0) {
      // Subscribe to all agents (admin/operator only)
      if (
        socket.data.userRole === 'admin' ||
        socket.data.userRole === 'operator'
      ) {
        socket.join('agents:all')
        socket.data.subscriptions.agents.add('all')
        logger.debug('Socket subscribed to all agents', {
          socketId: socket.id,
          userId,
        })
      }
    } else {
      // Subscribe to specific agents
      agentIds.forEach(agentId => {
        socket.join(`agent:${agentId}`)
        socket.data.subscriptions.agents.add(agentId)

        // Track subscription
        if (!this.subscriptions.agents.has(agentId)) {
          this.subscriptions.agents.set(agentId, new Set())
        }
        this.subscriptions.agents.get(agentId)!.add(socket.id)
      })

      logger.debug('Socket subscribed to agents', {
        socketId: socket.id,
        userId,
        agentIds,
      })
    }

    // Update connection info
    const connection = this.connections.get(socket.id)
    if (connection) {
      connection.subscriptions.agents = Array.from(
        socket.data.subscriptions.agents
      )
      connection.lastActivity = new Date()
    }
  }

  private handleTaskSubscription(socket: any, taskIds: string[]): void {
     
    const userId = socket.data.userId

    if (taskIds.length === 0) {
      // Subscribe to all tasks
      socket.join('tasks:all')
      socket.data.subscriptions.tasks.add('all')
      logger.debug('Socket subscribed to all tasks', {
        socketId: socket.id,
        userId,
      })
    } else {
      // Subscribe to specific tasks
      taskIds.forEach(taskId => {
        socket.join(`task:${taskId}`)
        socket.data.subscriptions.tasks.add(taskId)

        // Track subscription
        if (!this.subscriptions.tasks.has(taskId)) {
          this.subscriptions.tasks.set(taskId, new Set())
        }
        this.subscriptions.tasks.get(taskId)!.add(socket.id)
      })

      logger.debug('Socket subscribed to tasks', {
        socketId: socket.id,
        userId,
        taskIds,
      })
    }

    // Update connection info
    const connection = this.connections.get(socket.id)
    if (connection) {
      connection.subscriptions.tasks = Array.from(
        socket.data.subscriptions.tasks
      )
      connection.lastActivity = new Date()
    }
  }

  private handlePlatformSubscription(socket: any, platformIds: string[]): void {
     
    const userId = socket.data.userId

    if (platformIds.length === 0) {
      // Subscribe to all platforms
      socket.join('platforms:all')
      socket.data.subscriptions.platforms.add('all')
      logger.debug('Socket subscribed to all platforms', {
        socketId: socket.id,
        userId,
      })
    } else {
      // Subscribe to specific platforms
      platformIds.forEach(platformId => {
        socket.join(`platform:${platformId}`)
        socket.data.subscriptions.platforms.add(platformId)

        // Track subscription
        if (!this.subscriptions.platforms.has(platformId)) {
          this.subscriptions.platforms.set(platformId, new Set())
        }
        this.subscriptions.platforms.get(platformId)!.add(socket.id)
      })

      logger.debug('Socket subscribed to platforms', {
        socketId: socket.id,
        userId,
        platformIds,
      })
    }

    // Update connection info
    const connection = this.connections.get(socket.id)
    if (connection) {
      connection.subscriptions.platforms = Array.from(
        socket.data.subscriptions.platforms
      )
      connection.lastActivity = new Date()
    }
  }

  private handleAgentUnsubscription(socket: any, agentIds: string[]): void {
     
    if (agentIds.length === 0) {
      // Unsubscribe from all agents
      socket.leave('agents:all')
      socket.data.subscriptions.agents.delete('all')
    } else {
      agentIds.forEach(agentId => {
        socket.leave(`agent:${agentId}`)
        socket.data.subscriptions.agents.delete(agentId)

        // Remove from subscription tracking
        const subscribers = this.subscriptions.agents.get(agentId)
        if (subscribers) {
          subscribers.delete(socket.id)
          if (subscribers.size === 0) {
            this.subscriptions.agents.delete(agentId)
          }
        }
      })
    }

    logger.debug('Socket unsubscribed from agents', {
      socketId: socket.id,
      agentIds,
    })
  }

  private handleTaskUnsubscription(socket: any, taskIds: string[]): void {
     
    if (taskIds.length === 0) {
      // Unsubscribe from all tasks
      socket.leave('tasks:all')
      socket.data.subscriptions.tasks.delete('all')
    } else {
      taskIds.forEach(taskId => {
        socket.leave(`task:${taskId}`)
        socket.data.subscriptions.tasks.delete(taskId)

        // Remove from subscription tracking
        const subscribers = this.subscriptions.tasks.get(taskId)
        if (subscribers) {
          subscribers.delete(socket.id)
          if (subscribers.size === 0) {
            this.subscriptions.tasks.delete(taskId)
          }
        }
      })
    }

    logger.debug('Socket unsubscribed from tasks', {
      socketId: socket.id,
      taskIds,
    })
  }

  private handlePlatformUnsubscription(
    socket: any,
    platformIds: string[]
  ): void {
     
    if (platformIds.length === 0) {
      // Unsubscribe from all platforms
      socket.leave('platforms:all')
      socket.data.subscriptions.platforms.delete('all')
    } else {
      platformIds.forEach(platformId => {
        socket.leave(`platform:${platformId}`)
        socket.data.subscriptions.platforms.delete(platformId)

        // Remove from subscription tracking
        const subscribers = this.subscriptions.platforms.get(platformId)
        if (subscribers) {
          subscribers.delete(socket.id)
          if (subscribers.size === 0) {
            this.subscriptions.platforms.delete(platformId)
          }
        }
      })
    }

    logger.debug('Socket unsubscribed from platforms', {
      socketId: socket.id,
      platformIds,
    })
  }

  private handleDisconnection(socket: any, reason: string): void {
     
    logger.info('Socket disconnected', {
      socketId: socket.id,
      userId: socket.data.userId,
      reason,
    })

    // Clean up subscriptions
    socket.data.subscriptions.agents.forEach((agentId: string) => {
      if (agentId !== 'all') {
        const subscribers = this.subscriptions.agents.get(agentId)
        if (subscribers) {
          subscribers.delete(socket.id)
          if (subscribers.size === 0) {
            this.subscriptions.agents.delete(agentId)
          }
        }
      }
    })

    socket.data.subscriptions.tasks.forEach((taskId: string) => {
      if (taskId !== 'all') {
        const subscribers = this.subscriptions.tasks.get(taskId)
        if (subscribers) {
          subscribers.delete(socket.id)
          if (subscribers.size === 0) {
            this.subscriptions.tasks.delete(taskId)
          }
        }
      }
    })

    socket.data.subscriptions.platforms.forEach((platformId: string) => {
      if (platformId !== 'all') {
        const subscribers = this.subscriptions.platforms.get(platformId)
        if (subscribers) {
          subscribers.delete(socket.id)
          if (subscribers.size === 0) {
            this.subscriptions.platforms.delete(platformId)
          }
        }
      }
    })

    // Remove connection info
    this.connections.delete(socket.id)
  }

  private setupHealthMonitoring(): void {
    // Send system health updates every 30 seconds
    setInterval(() => {
      const healthData: SystemHealthEvent = {
      timestamp: new Date(),
      status: 'healthy', // This would be calculated based on actual system metrics
      metrics: {
        cpu: process.cpuUsage().user / 1000000, // Convert to percentage
        memory: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
        activeConnections: this.connections.size,
        activeAgents: this.subscriptions.agents.size,
        runningTasks: this.subscriptions.tasks.size,
        errorRate: 0, // This would be calculated from actual error metrics
      },
    };

      this.broadcastSystemHealth(healthData)
    }, 30000)

    // Clean up stale connections every 5 minutes
    setInterval(() => {
      this.cleanupStaleConnections()
    }, 300000)
  }

  // Public methods for broadcasting events

  public broadcastAgentStatus(data: AgentStatusUpdate): void {
    this.io.to(`agent:${data.agentId}`).emit('agent:status', data)
    this.io.to('agents:all').emit('agent:status', data)

    logger.debug('Broadcasted agent status update', {
      agentId: data.agentId,
      status: data.status,
    })
  }

  public broadcastTaskProgress(data: TaskProgressEvent): void {
    this.io.to(`task:${data.taskId}`).emit('task:progress', data)
    this.io.to('tasks:all').emit('task:progress', data)

    logger.debug('Broadcasted task progress update', {
      taskId: data.taskId,
      progress: data.progress.percentage,
    })
  }

  public broadcastAgentError(data: AgentErrorEvent): void {
    this.io.to(`agent:${data.agentId}`).emit('error:agent', data)
    this.io.to('agents:all').emit('error:agent', data)

    logger.debug('Broadcasted agent error', {
      agentId: data.agentId,
      error: data.error.code,
    })
  }

  public broadcastTaskError(data: TaskErrorEvent): void {
    this.io.to(`task:${data.taskId}`).emit('error:task', data)
    this.io.to('tasks:all').emit('error:task', data)

    logger.debug('Broadcasted task error', {
      taskId: data.taskId,
      error: data.error.code,
    })
  }

  public broadcastPlatformError(data: PlatformErrorEvent): void {
    this.io.to(`platform:${data.platformId}`).emit('error:platform', data)
    this.io.to('platforms:all').emit('error:platform', data)

    logger.debug('Broadcasted platform error', {
      platformId: data.platformId,
      error: data.error.code,
    })
  }

  public broadcastCriticalAlert(data: CriticalAlertEvent): void {
    this.io.emit('alert:critical', data)

    logger.info('Broadcasted critical alert', {
      alertId: data.id,
      source: data.source,
    })
  }

  public broadcastWarningAlert(data: WarningAlertEvent): void {
    this.io.emit('alert:warning', data)

    logger.debug('Broadcasted warning alert', {
      alertId: data.id,
      source: data.source,
    })
  }

  public broadcastInfoAlert(data: InfoAlertEvent): void {
    this.io.emit('alert:info', data)

    logger.debug('Broadcasted info alert', {
      alertId: data.id,
      source: data.source,
    })
  }

  public broadcastSystemHealth(data: SystemHealthEvent): void {
    this.io.emit('system:health', data)

    logger.debug('Broadcasted system health update', {
      status: data.status,
      connections: data.metrics.activeConnections,
    })
  }

  // Utility methods

  public getConnectionCount(): number {
    return this.connections.size
  }

  public getConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values())
  }

  public getSubscriptionStats(): {
    agents: number
    tasks: number
    platforms: number
  } {
    return {
      agents: this.subscriptions.agents.size,
      tasks: this.subscriptions.tasks.size,
      platforms: this.subscriptions.platforms.size,
    }
  }

  private cleanupStaleConnections(): void {
    const now = new Date()
    const staleThreshold = 10 * 60 * 1000 // 10 minutes

    for (const [socketId, connection] of this.connections.entries()) {
      if (now.getTime() - connection.lastActivity.getTime() > staleThreshold) {
        logger.info('Cleaning up stale connection', {
          socketId,
          userId: connection.userId,
        })
        this.connections.delete(socketId)
      }
    }
  }

  // Integration methods for external services

  /**
   * Notify about agent status change (called by AgentService)
   */
  public notifyAgentStatusChange(
    agentId: string,
    status: 'active' | 'inactive' | 'error' | 'maintenance',
    metadata?: Record<string, unknown>
  ): void {
    const statusUpdate: AgentStatusUpdate = {
      agentId,
      status,
      timestamp: new Date(),
      metadata,
    }

    this.broadcastAgentStatus(statusUpdate)
  }

  /**
   * Notify about agent health change (called by AgentService)
   */
  public notifyAgentHealthChange(
    agentId: string,
    health: {
      status: 'healthy' | 'unhealthy' | 'degraded'
      lastCheck: Date
      responseTime?: number
      errorCount?: number
      details?: Record<string, unknown>
    }
  ): void {
    const healthUpdate: AgentHealthUpdate = {
      agentId,
      health,
    }

    this.io.to(`agent:${agentId}`).emit('agent:health', healthUpdate)
    this.io.to('agents:all').emit('agent:health', healthUpdate)

    logger.debug('Broadcasted agent health update', {
      agentId,
      status: health.status,
    })
  }

  /**
   * Notify about agent connection/disconnection
   */
  public notifyAgentConnection(
    agentId: string,
    platformId: string,
    connected: boolean,
    reason?: string
  ): void {
    if (connected) {
      const event: AgentConnectedEvent = {
        agentId,
        platformId,
        timestamp: new Date(),
      }

      this.io.to(`agent:${agentId}`).emit('agent:connected', event)
      this.io.to('agents:all').emit('agent:connected', event)

      logger.debug('Broadcasted agent connected event', { agentId, platformId })
    } else {
      const event: AgentDisconnectedEvent = {
        agentId,
        platformId,
        reason: reason || 'Unknown',
        timestamp: new Date(),
      }

      this.io.to(`agent:${agentId}`).emit('agent:disconnected', event)
      this.io.to('agents:all').emit('agent:disconnected', event)

      logger.debug('Broadcasted agent disconnected event', {
        agentId,
        platformId,
        reason,
      })
    }
  }

  /**
   * Notify about task lifecycle events
   */
  public notifyTaskCreated(
    taskId: string,
    agentId: string,
    type: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    scheduledAt: Date,
    createdBy: string
  ): void {
    const event: TaskCreatedEvent = {
      taskId,
      agentId,
      type,
      priority,
      scheduledAt,
      createdBy,
    }

    this.io.to(`task:${taskId}`).emit('task:created', event)
    this.io.to('tasks:all').emit('task:created', event)

    logger.debug('Broadcasted task created event', { taskId, agentId, type })
  }

  public notifyTaskStarted(
    taskId: string,
    agentId: string,
    startedAt: Date,
    estimatedDuration?: number
  ): void {
    const event: TaskStartedEvent = {
      taskId,
      agentId,
      startedAt,
      estimatedDuration,
    }

    this.io.to(`task:${taskId}`).emit('task:started', event)
    this.io.to('tasks:all').emit('task:started', event)

    logger.debug('Broadcasted task started event', { taskId, agentId })
  }

  public notifyTaskCompleted(
    taskId: string,
    agentId: string,
    completedAt: Date,
    duration: number,
    success: boolean,
    result?: Record<string, unknown>
  ): void {
    const event: TaskCompletedEvent = {
      taskId,
      agentId,
      completedAt,
      duration,
      success,
      result,
    }

    this.io.to(`task:${taskId}`).emit('task:completed', event)
    this.io.to('tasks:all').emit('task:completed', event)

    logger.debug('Broadcasted task completed event', {
      taskId,
      agentId,
      success,
    })
  }

  public notifyTaskFailed(
    taskId: string,
    agentId: string,
    failedAt: Date,
    error: { code: string; message: string; details?: Record<string, unknown> },
    retryCount: number,
    willRetry: boolean
  ): void {
    const event: TaskFailedEvent = {
      taskId,
      agentId,
      failedAt,
      error,
      retryCount,
      willRetry,
    }

    this.io.to(`task:${taskId}`).emit('task:failed', event)
    this.io.to('tasks:all').emit('task:failed', event)

    logger.debug('Broadcasted task failed event', {
      taskId,
      agentId,
      errorCode: error.code,
    })
  }

  public notifyTaskCancelled(
    taskId: string,
    agentId: string,
    cancelledAt: Date,
    cancelledBy: string,
    reason: string
  ): void {
    const event: TaskCancelledEvent = {
      taskId,
      agentId,
      cancelledAt,
      cancelledBy,
      reason,
    }

    this.io.to(`task:${taskId}`).emit('task:cancelled', event)
    this.io.to('tasks:all').emit('task:cancelled', event)

    logger.debug('Broadcasted task cancelled event', {
      taskId,
      agentId,
      reason,
    })
  }

  /**
   * Notify about task status change (called by TaskService)
   */
  public notifyTaskStatusChange(
    taskId: string,
    status: TaskStatus,
    metadata?: Record<string, unknown>
  ): void {
    // Map database status to WebSocket event types
    switch (status) {
      case 'PENDING':
        // For pending tasks, we might be retrying or newly created
        if (metadata?.retried) {
          // This is a retry, emit as task started again
          this.notifyTaskStarted(taskId, metadata.agentId as string, new Date())
        }
        break
      case 'RUNNING':
        this.notifyTaskStarted(
          taskId,
          metadata?.agentId as string,
          (metadata?.startedAt as Date) || new Date()
        )
        break
      case 'COMPLETED':
        this.notifyTaskCompleted(
          taskId,
          metadata?.agentId as string,
          (metadata?.completedAt as Date) || new Date(),
          (metadata?.executionTime as number) || 0,
          (metadata?.success as boolean) ?? true,
          metadata?.result as Record<string, unknown>
        )
        break
      case 'FAILED':
        this.notifyTaskFailed(
          taskId,
          metadata?.agentId as string,
          new Date(),
          {
            code: 'EXECUTION_FAILED',
            message: (metadata?.error as string) || 'Task execution failed',
            details: metadata,
          },
          (metadata?.retryCount as number) || 0,
          metadata?.maxRetriesExceeded !== true
        )
        break
      case 'CANCELLED':
        this.notifyTaskCancelled(
          taskId,
          metadata?.agentId as string,
          (metadata?.timestamp as Date) || new Date(),
          'system', // Default to system if not specified
          'Task was cancelled'
        )
        break
    }
  }

  /**
   * Notify about task progress (called by TaskService)
   */
  public notifyTaskProgress(
    taskId: string,
    progress: number,
    message?: string
  ): void {
    const event: TaskProgressEvent = {
      taskId,
      agentId: '', // Will be filled by the calling service
      progress: {
        percentage: progress,
        currentStep: message || 'Processing...',
        totalSteps: 100,
        completedSteps: progress,
        message,
      },
      timestamp: new Date(),
    };

    this.io.to(`task:${taskId}`).emit('task:progress', event)
    this.io.to('tasks:all').emit('task:progress', event)

    logger.debug('Broadcasted task progress event', {
      taskId,
      progress,
      message,
    })
  }

  /**
   * Notify about task error (called by TaskService)
   */
  public notifyTaskError(
    taskId: string,
    error: string,
    context?: Record<string, unknown>
  ): void {
    const event: TaskErrorEvent = {
      taskId,
      agentId: (context?.agentId as string) || '',
      error: {
        code: 'TASK_ERROR',
        message: error,
        severity: 'medium',
        details: context,
      },
      timestamp: new Date(),
    }

    this.io.to(`task:${taskId}`).emit('error:task', event)
    this.io.to('tasks:all').emit('error:task', event)

    logger.debug('Broadcasted task error event', { taskId, error })
  }

  /**
   * Notify about workflow status change (called by WorkflowService)
   */
  public notifyWorkflowStatusChange(
    executionId: string,
    status: string,
    metadata?: Record<string, unknown>
  ): void {
    const event = {
      executionId,
      status,
      metadata,
      timestamp: new Date(),
    }

    this.io.to(`workflow:${executionId}`).emit('workflow:statusChange', event)
    this.io.to('workflows:all').emit('workflow:statusChange', event)

    logger.debug('Broadcasted workflow status change event', {
      executionId,
      status,
    })
  }

  /**
   * Notify about workflow progress (called by WorkflowService)
   */
  public notifyWorkflowProgress(executionId: string, progress: any): void {
    const event = {
      executionId,
      progress,
      timestamp: new Date(),
    }

    this.io.to(`workflow:${executionId}`).emit('workflow:progress', event)
    this.io.to('workflows:all').emit('workflow:progress', event)

    logger.debug('Broadcasted workflow progress event', {
      executionId,
      progress: progress.progress,
    })
  }

  /**
   * Notify about workflow error (called by WorkflowService)
   */
  public notifyWorkflowError(
    executionId: string,
    error: string,
    context?: Record<string, unknown>
  ): void {
    const event = {
      executionId,
      error: {
        code: 'WORKFLOW_ERROR',
        message: error,
        severity: 'high',
        details: context,
      },
      timestamp: new Date(),
    }

    this.io.to(`workflow:${executionId}`).emit('error:workflow', event)
    this.io.to('workflows:all').emit('error:workflow', event)

    logger.debug('Broadcasted workflow error event', { executionId, error })
  }

  /**
   * Get real-time statistics for monitoring
   */
  public getRealTimeStats(): {
    connections: number
    subscriptions: { agents: number; tasks: number; platforms: number }
    uptime: number
    memory: { used: number; total: number }
  } {
    return {
      connections: this.connections.size,
      subscriptions: this.getSubscriptionStats(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    }
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down WebSocket service')

    // Notify all clients about shutdown
    this.io.emit('system:maintenance', {
      id: 'shutdown',
      title: 'System Maintenance',
      message: 'Server is shutting down for maintenance',
      startTime: new Date(),
      endTime: new Date(Date.now() + 60000), // 1 minute from now
      affectedServices: ['websocket', 'real-time-updates'],
    })

    // Close all connections
    this.io.close()

    // Clear data structures
    this.connections.clear()
    this.subscriptions.agents.clear()
    this.subscriptions.tasks.clear()
    this.subscriptions.platforms.clear()
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null

export function initializeWebSocketService(
  httpServer: HTTPServer,
  agentService?: AgentService
): WebSocketService {
  if (!webSocketService) {
    webSocketService = new WebSocketService(httpServer, agentService)
  }
  return webSocketService
}

export function getWebSocketService(): WebSocketService {
  if (!webSocketService) {
    throw new Error(
      'WebSocket service not initialized. Call initializeWebSocketService first.'
    )
  }
  return webSocketService
}
