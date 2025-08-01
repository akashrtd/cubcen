// Cubcen WebSocket Management Routes
// Provides endpoints for WebSocket connection management and status

import { Router, Request, Response } from 'express'
import { authenticate } from '@/backend/middleware/auth'
import { getWebSocketService } from '@/services/websocket'
import { logger } from '@/lib/logger'

const router = Router()

// Get WebSocket connection status and statistics
router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const webSocketService = getWebSocketService()

    const connectionCount = webSocketService.getConnectionCount()
    const subscriptionStats = webSocketService.getSubscriptionStats()
    const connections = webSocketService.getConnections()

    // Filter connection details based on user role
    const userRole = req.user?.role
    let filteredConnections = connections

    if (userRole !== 'ADMIN') {
      // Non-admin users can only see their own connections
      const userId = req.user?.id
      filteredConnections = connections.filter(conn => conn.userId === userId)
    }

    const status = {
      service: 'running',
      connections: {
        total: connectionCount,
        details: filteredConnections.map(conn => ({
          socketId: conn.socketId,
          userId: userRole === 'ADMIN' ? conn.userId : 'hidden',
          userRole: userRole === 'ADMIN' ? conn.userRole : 'hidden',
          connectedAt: conn.connectedAt,
          lastActivity: conn.lastActivity,
          subscriptions: conn.subscriptions,
        })),
      },
      subscriptions: subscriptionStats,
      timestamp: new Date().toISOString(),
    }

    logger.debug('WebSocket status requested', {
      requestedBy: req.user?.id,
      userRole,
      connectionCount,
    })

    res.json(status)
  } catch (error) {
    logger.error('Error getting WebSocket status', error as Error)
    res.status(500).json({
      error: {
        code: 'WEBSOCKET_STATUS_ERROR',
        message: 'Failed to get WebSocket status',
        timestamp: new Date().toISOString(),
      },
    })
  }
})

// Get WebSocket connection information for current user
router.get(
  '/connections',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const webSocketService = getWebSocketService()
      const userId = req.user?.id
      const connections = webSocketService.getConnections()

      // Filter to only show current user's connections
      const userConnections = connections.filter(conn => conn.userId === userId)

      const response = {
        userId,
        connections: userConnections.map(conn => ({
          socketId: conn.socketId,
          connectedAt: conn.connectedAt,
          lastActivity: conn.lastActivity,
          subscriptions: conn.subscriptions,
        })),
        totalConnections: userConnections.length,
        timestamp: new Date().toISOString(),
      }

      logger.debug('User WebSocket connections requested', {
        userId,
        connectionCount: userConnections.length,
      })

      res.json(response)
    } catch (error) {
      logger.error('Error getting user WebSocket connections', error as Error)
      res.status(500).json({
        error: {
          code: 'WEBSOCKET_CONNECTIONS_ERROR',
          message: 'Failed to get WebSocket connections',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }
)

// Health check endpoint for WebSocket service
router.get('/health', async (req: Request, res: Response) => {
  try {
    const webSocketService = getWebSocketService()
    const connectionCount = webSocketService.getConnectionCount()
    const subscriptionStats = webSocketService.getSubscriptionStats()

    const health = {
      status: 'healthy',
      service: 'websocket',
      metrics: {
        connections: connectionCount,
        subscriptions: subscriptionStats,
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
      timestamp: new Date().toISOString(),
    }

    res.json(health)
  } catch (error) {
    logger.error('WebSocket health check failed', error as Error)
    res.status(503).json({
      status: 'unhealthy',
      service: 'websocket',
      error: 'Service unavailable',
      timestamp: new Date().toISOString(),
    })
  }
})

// Test endpoint to broadcast a test message (admin only)
router.post(
  '/test/broadcast',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userRole = req.user?.role

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required',
            timestamp: new Date().toISOString(),
          },
        })
      }

      const { type, data } = req.body
      const webSocketService = getWebSocketService()

      // Validate test message type
      const validTypes = ['info', 'warning', 'critical']
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_MESSAGE_TYPE',
            message: 'Message type must be one of: info, warning, critical',
            timestamp: new Date().toISOString(),
          },
        })
      }

      // Create test alert
      const testAlert = {
        id: `test_${Date.now()}`,
        title: data?.title || 'Test Alert',
        message:
          data?.message || 'This is a test message from the WebSocket service',
        source: 'system' as const,
        sourceId: 'websocket-test',
        timestamp: new Date(),
      }

      // Broadcast based on type
      switch (type) {
        case 'info':
          webSocketService.broadcastInfoAlert(testAlert)
          break
        case 'warning':
          webSocketService.broadcastWarningAlert(testAlert)
          break
        case 'critical':
          webSocketService.broadcastCriticalAlert({
            ...testAlert,
            requiresAction: false,
          })
          break
      }

      logger.info('Test WebSocket message broadcasted', {
        type,
        broadcastedBy: req.user?.id,
        alertId: testAlert.id,
      })

      res.json({
        success: true,
        message: `Test ${type} alert broadcasted successfully`,
        alertId: testAlert.id,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Error broadcasting test message', error as Error)
      res.status(500).json({
        error: {
          code: 'BROADCAST_TEST_ERROR',
          message: 'Failed to broadcast test message',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }
)

export default router
