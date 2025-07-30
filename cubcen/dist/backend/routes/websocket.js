"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/backend/middleware/auth");
const websocket_1 = require("@/services/websocket");
const logger_1 = require("@/lib/logger");
const router = (0, express_1.Router)();
router.get('/status', auth_1.authenticate, async (req, res) => {
    try {
        const webSocketService = (0, websocket_1.getWebSocketService)();
        const connectionCount = webSocketService.getConnectionCount();
        const subscriptionStats = webSocketService.getSubscriptionStats();
        const connections = webSocketService.getConnections();
        const userRole = req.user?.role;
        let filteredConnections = connections;
        if (userRole !== 'ADMIN') {
            const userId = req.user?.id;
            filteredConnections = connections.filter(conn => conn.userId === userId);
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
                    subscriptions: conn.subscriptions
                }))
            },
            subscriptions: subscriptionStats,
            timestamp: new Date().toISOString()
        };
        logger_1.logger.debug('WebSocket status requested', {
            requestedBy: req.user?.id,
            userRole,
            connectionCount
        });
        res.json(status);
    }
    catch (error) {
        logger_1.logger.error('Error getting WebSocket status', error);
        res.status(500).json({
            error: {
                code: 'WEBSOCKET_STATUS_ERROR',
                message: 'Failed to get WebSocket status',
                timestamp: new Date().toISOString()
            }
        });
    }
});
router.get('/connections', auth_1.authenticate, async (req, res) => {
    try {
        const webSocketService = (0, websocket_1.getWebSocketService)();
        const userId = req.user?.id;
        const connections = webSocketService.getConnections();
        const userConnections = connections.filter(conn => conn.userId === userId);
        const response = {
            userId,
            connections: userConnections.map(conn => ({
                socketId: conn.socketId,
                connectedAt: conn.connectedAt,
                lastActivity: conn.lastActivity,
                subscriptions: conn.subscriptions
            })),
            totalConnections: userConnections.length,
            timestamp: new Date().toISOString()
        };
        logger_1.logger.debug('User WebSocket connections requested', {
            userId,
            connectionCount: userConnections.length
        });
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Error getting user WebSocket connections', error);
        res.status(500).json({
            error: {
                code: 'WEBSOCKET_CONNECTIONS_ERROR',
                message: 'Failed to get WebSocket connections',
                timestamp: new Date().toISOString()
            }
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const webSocketService = (0, websocket_1.getWebSocketService)();
        const connectionCount = webSocketService.getConnectionCount();
        const subscriptionStats = webSocketService.getSubscriptionStats();
        const health = {
            status: 'healthy',
            service: 'websocket',
            metrics: {
                connections: connectionCount,
                subscriptions: subscriptionStats,
                uptime: process.uptime(),
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
                }
            },
            timestamp: new Date().toISOString()
        };
        res.json(health);
    }
    catch (error) {
        logger_1.logger.error('WebSocket health check failed', error);
        res.status(503).json({
            status: 'unhealthy',
            service: 'websocket',
            error: 'Service unavailable',
            timestamp: new Date().toISOString()
        });
    }
});
router.post('/test/broadcast', auth_1.authenticate, async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'ADMIN') {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Admin access required',
                    timestamp: new Date().toISOString()
                }
            });
        }
        const { type, data } = req.body;
        const webSocketService = (0, websocket_1.getWebSocketService)();
        const validTypes = ['info', 'warning', 'critical'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_MESSAGE_TYPE',
                    message: 'Message type must be one of: info, warning, critical',
                    timestamp: new Date().toISOString()
                }
            });
        }
        const testAlert = {
            id: `test_${Date.now()}`,
            title: data?.title || 'Test Alert',
            message: data?.message || 'This is a test message from the WebSocket service',
            source: 'system',
            sourceId: 'websocket-test',
            timestamp: new Date()
        };
        switch (type) {
            case 'info':
                webSocketService.broadcastInfoAlert(testAlert);
                break;
            case 'warning':
                webSocketService.broadcastWarningAlert(testAlert);
                break;
            case 'critical':
                webSocketService.broadcastCriticalAlert({
                    ...testAlert,
                    requiresAction: false
                });
                break;
        }
        logger_1.logger.info('Test WebSocket message broadcasted', {
            type,
            broadcastedBy: req.user?.id,
            alertId: testAlert.id
        });
        res.json({
            success: true,
            message: `Test ${type} alert broadcasted successfully`,
            alertId: testAlert.id,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error broadcasting test message', error);
        res.status(500).json({
            error: {
                code: 'BROADCAST_TEST_ERROR',
                message: 'Failed to broadcast test message',
                timestamp: new Date().toISOString()
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=websocket.js.map