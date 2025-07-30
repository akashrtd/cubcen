"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
exports.initializeWebSocketService = initializeWebSocketService;
exports.getWebSocketService = getWebSocketService;
const socket_io_1 = require("socket.io");
const logger_1 = require("@/lib/logger");
const jwt_1 = require("@/lib/jwt");
class WebSocketService {
    constructor(httpServer, agentService) {
        this.connections = new Map();
        this.subscriptions = {
            agents: new Map(),
            tasks: new Map(),
            platforms: new Map()
        };
        this.agentService = agentService;
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.NODE_ENV === 'production'
                    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://cubcen.com']
                    : ['http://localhost:3000', 'http://localhost:3001'],
                credentials: true,
                methods: ['GET', 'POST']
            },
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000,
            connectTimeout: 45000,
            upgradeTimeout: 10000
        });
        this.setupEventHandlers();
        this.setupHealthMonitoring();
        logger_1.logger.info('WebSocket service initialized');
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info('New WebSocket connection', { socketId: socket.id });
            socket.data = {
                userId: '',
                userRole: '',
                subscriptions: {
                    agents: new Set(),
                    tasks: new Set(),
                    platforms: new Set()
                },
                authenticated: false,
                connectedAt: new Date()
            };
            socket.on('auth:authenticate', async (token, callback) => {
                try {
                    const authResult = await this.authenticateSocket(socket, token);
                    if (typeof callback === 'function') {
                        callback(authResult.success, authResult.error);
                    }
                    if (authResult.success) {
                        logger_1.logger.info('Socket authenticated successfully', {
                            socketId: socket.id,
                            userId: authResult.userId,
                            userRole: authResult.userRole
                        });
                    }
                    else {
                        logger_1.logger.warn('Socket authentication failed', {
                            socketId: socket.id,
                            error: authResult.error
                        });
                    }
                }
                catch (error) {
                    logger_1.logger.error('Socket authentication error', error, { socketId: socket.id });
                    if (typeof callback === 'function') {
                        callback(false, 'Authentication failed');
                    }
                }
            });
            socket.on('subscribe:agents', (agentIds) => {
                if (!socket.data.authenticated) {
                    socket.emit('auth:session_invalid');
                    return;
                }
                this.handleAgentSubscription(socket, agentIds || []);
            });
            socket.on('subscribe:tasks', (taskIds) => {
                if (!socket.data.authenticated) {
                    socket.emit('auth:session_invalid');
                    return;
                }
                this.handleTaskSubscription(socket, taskIds || []);
            });
            socket.on('subscribe:platforms', (platformIds) => {
                if (!socket.data.authenticated) {
                    socket.emit('auth:session_invalid');
                    return;
                }
                this.handlePlatformSubscription(socket, platformIds || []);
            });
            socket.on('unsubscribe:agents', (agentIds) => {
                this.handleAgentUnsubscription(socket, agentIds || []);
            });
            socket.on('unsubscribe:tasks', (taskIds) => {
                this.handleTaskUnsubscription(socket, taskIds || []);
            });
            socket.on('unsubscribe:platforms', (platformIds) => {
                this.handlePlatformUnsubscription(socket, platformIds || []);
            });
            socket.on('ping', (callback) => {
                if (typeof callback === 'function') {
                    callback(Date.now());
                }
            });
            socket.on('disconnect', (reason) => {
                this.handleDisconnection(socket, reason);
            });
            socket.on('error', (error) => {
                logger_1.logger.error('Socket error', error, { socketId: socket.id });
            });
        });
    }
    async authenticateSocket(socket, token) {
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            socket.data.userId = decoded.userId;
            socket.data.userRole = decoded.role;
            socket.data.authenticated = true;
            const connectionInfo = {
                socketId: socket.id,
                userId: decoded.userId,
                userRole: decoded.role,
                connectedAt: new Date(),
                lastActivity: new Date(),
                subscriptions: {
                    agents: [],
                    tasks: [],
                    platforms: []
                }
            };
            this.connections.set(socket.id, connectionInfo);
            return {
                success: true,
                userId: decoded.userId,
                userRole: decoded.role
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Invalid token'
            };
        }
    }
    handleAgentSubscription(socket, agentIds) {
        const userId = socket.data.userId;
        if (agentIds.length === 0) {
            if (socket.data.userRole === 'admin' || socket.data.userRole === 'operator') {
                socket.join('agents:all');
                socket.data.subscriptions.agents.add('all');
                logger_1.logger.debug('Socket subscribed to all agents', { socketId: socket.id, userId });
            }
        }
        else {
            agentIds.forEach(agentId => {
                socket.join(`agent:${agentId}`);
                socket.data.subscriptions.agents.add(agentId);
                if (!this.subscriptions.agents.has(agentId)) {
                    this.subscriptions.agents.set(agentId, new Set());
                }
                this.subscriptions.agents.get(agentId).add(socket.id);
            });
            logger_1.logger.debug('Socket subscribed to agents', {
                socketId: socket.id,
                userId,
                agentIds
            });
        }
        const connection = this.connections.get(socket.id);
        if (connection) {
            connection.subscriptions.agents = Array.from(socket.data.subscriptions.agents);
            connection.lastActivity = new Date();
        }
    }
    handleTaskSubscription(socket, taskIds) {
        const userId = socket.data.userId;
        if (taskIds.length === 0) {
            socket.join('tasks:all');
            socket.data.subscriptions.tasks.add('all');
            logger_1.logger.debug('Socket subscribed to all tasks', { socketId: socket.id, userId });
        }
        else {
            taskIds.forEach(taskId => {
                socket.join(`task:${taskId}`);
                socket.data.subscriptions.tasks.add(taskId);
                if (!this.subscriptions.tasks.has(taskId)) {
                    this.subscriptions.tasks.set(taskId, new Set());
                }
                this.subscriptions.tasks.get(taskId).add(socket.id);
            });
            logger_1.logger.debug('Socket subscribed to tasks', {
                socketId: socket.id,
                userId,
                taskIds
            });
        }
        const connection = this.connections.get(socket.id);
        if (connection) {
            connection.subscriptions.tasks = Array.from(socket.data.subscriptions.tasks);
            connection.lastActivity = new Date();
        }
    }
    handlePlatformSubscription(socket, platformIds) {
        const userId = socket.data.userId;
        if (platformIds.length === 0) {
            socket.join('platforms:all');
            socket.data.subscriptions.platforms.add('all');
            logger_1.logger.debug('Socket subscribed to all platforms', { socketId: socket.id, userId });
        }
        else {
            platformIds.forEach(platformId => {
                socket.join(`platform:${platformId}`);
                socket.data.subscriptions.platforms.add(platformId);
                if (!this.subscriptions.platforms.has(platformId)) {
                    this.subscriptions.platforms.set(platformId, new Set());
                }
                this.subscriptions.platforms.get(platformId).add(socket.id);
            });
            logger_1.logger.debug('Socket subscribed to platforms', {
                socketId: socket.id,
                userId,
                platformIds
            });
        }
        const connection = this.connections.get(socket.id);
        if (connection) {
            connection.subscriptions.platforms = Array.from(socket.data.subscriptions.platforms);
            connection.lastActivity = new Date();
        }
    }
    handleAgentUnsubscription(socket, agentIds) {
        if (agentIds.length === 0) {
            socket.leave('agents:all');
            socket.data.subscriptions.agents.delete('all');
        }
        else {
            agentIds.forEach(agentId => {
                socket.leave(`agent:${agentId}`);
                socket.data.subscriptions.agents.delete(agentId);
                const subscribers = this.subscriptions.agents.get(agentId);
                if (subscribers) {
                    subscribers.delete(socket.id);
                    if (subscribers.size === 0) {
                        this.subscriptions.agents.delete(agentId);
                    }
                }
            });
        }
        logger_1.logger.debug('Socket unsubscribed from agents', {
            socketId: socket.id,
            agentIds
        });
    }
    handleTaskUnsubscription(socket, taskIds) {
        if (taskIds.length === 0) {
            socket.leave('tasks:all');
            socket.data.subscriptions.tasks.delete('all');
        }
        else {
            taskIds.forEach(taskId => {
                socket.leave(`task:${taskId}`);
                socket.data.subscriptions.tasks.delete(taskId);
                const subscribers = this.subscriptions.tasks.get(taskId);
                if (subscribers) {
                    subscribers.delete(socket.id);
                    if (subscribers.size === 0) {
                        this.subscriptions.tasks.delete(taskId);
                    }
                }
            });
        }
        logger_1.logger.debug('Socket unsubscribed from tasks', {
            socketId: socket.id,
            taskIds
        });
    }
    handlePlatformUnsubscription(socket, platformIds) {
        if (platformIds.length === 0) {
            socket.leave('platforms:all');
            socket.data.subscriptions.platforms.delete('all');
        }
        else {
            platformIds.forEach(platformId => {
                socket.leave(`platform:${platformId}`);
                socket.data.subscriptions.platforms.delete(platformId);
                const subscribers = this.subscriptions.platforms.get(platformId);
                if (subscribers) {
                    subscribers.delete(socket.id);
                    if (subscribers.size === 0) {
                        this.subscriptions.platforms.delete(platformId);
                    }
                }
            });
        }
        logger_1.logger.debug('Socket unsubscribed from platforms', {
            socketId: socket.id,
            platformIds
        });
    }
    handleDisconnection(socket, reason) {
        logger_1.logger.info('Socket disconnected', {
            socketId: socket.id,
            userId: socket.data.userId,
            reason
        });
        socket.data.subscriptions.agents.forEach((agentId) => {
            if (agentId !== 'all') {
                const subscribers = this.subscriptions.agents.get(agentId);
                if (subscribers) {
                    subscribers.delete(socket.id);
                    if (subscribers.size === 0) {
                        this.subscriptions.agents.delete(agentId);
                    }
                }
            }
        });
        socket.data.subscriptions.tasks.forEach((taskId) => {
            if (taskId !== 'all') {
                const subscribers = this.subscriptions.tasks.get(taskId);
                if (subscribers) {
                    subscribers.delete(socket.id);
                    if (subscribers.size === 0) {
                        this.subscriptions.tasks.delete(taskId);
                    }
                }
            }
        });
        socket.data.subscriptions.platforms.forEach((platformId) => {
            if (platformId !== 'all') {
                const subscribers = this.subscriptions.platforms.get(platformId);
                if (subscribers) {
                    subscribers.delete(socket.id);
                    if (subscribers.size === 0) {
                        this.subscriptions.platforms.delete(platformId);
                    }
                }
            }
        });
        this.connections.delete(socket.id);
    }
    setupHealthMonitoring() {
        setInterval(() => {
            const healthData = {
                timestamp: new Date(),
                status: 'healthy',
                metrics: {
                    cpu: process.cpuUsage().user / 1000000,
                    memory: process.memoryUsage().heapUsed / 1024 / 1024,
                    activeConnections: this.connections.size,
                    activeAgents: this.subscriptions.agents.size,
                    runningTasks: this.subscriptions.tasks.size,
                    errorRate: 0
                }
            };
            this.broadcastSystemHealth(healthData);
        }, 30000);
        setInterval(() => {
            this.cleanupStaleConnections();
        }, 300000);
    }
    broadcastAgentStatus(data) {
        this.io.to(`agent:${data.agentId}`).emit('agent:status', data);
        this.io.to('agents:all').emit('agent:status', data);
        logger_1.logger.debug('Broadcasted agent status update', {
            agentId: data.agentId,
            status: data.status
        });
    }
    broadcastTaskProgress(data) {
        this.io.to(`task:${data.taskId}`).emit('task:progress', data);
        this.io.to('tasks:all').emit('task:progress', data);
        logger_1.logger.debug('Broadcasted task progress update', {
            taskId: data.taskId,
            progress: data.progress.percentage
        });
    }
    broadcastAgentError(data) {
        this.io.to(`agent:${data.agentId}`).emit('error:agent', data);
        this.io.to('agents:all').emit('error:agent', data);
        logger_1.logger.debug('Broadcasted agent error', {
            agentId: data.agentId,
            error: data.error.code
        });
    }
    broadcastTaskError(data) {
        this.io.to(`task:${data.taskId}`).emit('error:task', data);
        this.io.to('tasks:all').emit('error:task', data);
        logger_1.logger.debug('Broadcasted task error', {
            taskId: data.taskId,
            error: data.error.code
        });
    }
    broadcastPlatformError(data) {
        this.io.to(`platform:${data.platformId}`).emit('error:platform', data);
        this.io.to('platforms:all').emit('error:platform', data);
        logger_1.logger.debug('Broadcasted platform error', {
            platformId: data.platformId,
            error: data.error.code
        });
    }
    broadcastCriticalAlert(data) {
        this.io.emit('alert:critical', data);
        logger_1.logger.info('Broadcasted critical alert', {
            alertId: data.id,
            source: data.source
        });
    }
    broadcastWarningAlert(data) {
        this.io.emit('alert:warning', data);
        logger_1.logger.debug('Broadcasted warning alert', {
            alertId: data.id,
            source: data.source
        });
    }
    broadcastInfoAlert(data) {
        this.io.emit('alert:info', data);
        logger_1.logger.debug('Broadcasted info alert', {
            alertId: data.id,
            source: data.source
        });
    }
    broadcastSystemHealth(data) {
        this.io.emit('system:health', data);
        logger_1.logger.debug('Broadcasted system health update', {
            status: data.status,
            connections: data.metrics.activeConnections
        });
    }
    getConnectionCount() {
        return this.connections.size;
    }
    getConnections() {
        return Array.from(this.connections.values());
    }
    getSubscriptionStats() {
        return {
            agents: this.subscriptions.agents.size,
            tasks: this.subscriptions.tasks.size,
            platforms: this.subscriptions.platforms.size
        };
    }
    cleanupStaleConnections() {
        const now = new Date();
        const staleThreshold = 10 * 60 * 1000;
        for (const [socketId, connection] of this.connections.entries()) {
            if (now.getTime() - connection.lastActivity.getTime() > staleThreshold) {
                logger_1.logger.info('Cleaning up stale connection', { socketId, userId: connection.userId });
                this.connections.delete(socketId);
            }
        }
    }
    notifyAgentStatusChange(agentId, status, metadata) {
        const statusUpdate = {
            agentId,
            status,
            timestamp: new Date(),
            metadata
        };
        this.broadcastAgentStatus(statusUpdate);
    }
    notifyAgentHealthChange(agentId, health) {
        const healthUpdate = {
            agentId,
            health
        };
        this.io.to(`agent:${agentId}`).emit('agent:health', healthUpdate);
        this.io.to('agents:all').emit('agent:health', healthUpdate);
        logger_1.logger.debug('Broadcasted agent health update', {
            agentId,
            status: health.status
        });
    }
    notifyAgentConnection(agentId, platformId, connected, reason) {
        if (connected) {
            const event = {
                agentId,
                platformId,
                timestamp: new Date()
            };
            this.io.to(`agent:${agentId}`).emit('agent:connected', event);
            this.io.to('agents:all').emit('agent:connected', event);
            logger_1.logger.debug('Broadcasted agent connected event', { agentId, platformId });
        }
        else {
            const event = {
                agentId,
                platformId,
                reason: reason || 'Unknown',
                timestamp: new Date()
            };
            this.io.to(`agent:${agentId}`).emit('agent:disconnected', event);
            this.io.to('agents:all').emit('agent:disconnected', event);
            logger_1.logger.debug('Broadcasted agent disconnected event', { agentId, platformId, reason });
        }
    }
    notifyTaskCreated(taskId, agentId, type, priority, scheduledAt, createdBy) {
        const event = {
            taskId,
            agentId,
            type,
            priority,
            scheduledAt,
            createdBy
        };
        this.io.to(`task:${taskId}`).emit('task:created', event);
        this.io.to('tasks:all').emit('task:created', event);
        logger_1.logger.debug('Broadcasted task created event', { taskId, agentId, type });
    }
    notifyTaskStarted(taskId, agentId, startedAt, estimatedDuration) {
        const event = {
            taskId,
            agentId,
            startedAt,
            estimatedDuration
        };
        this.io.to(`task:${taskId}`).emit('task:started', event);
        this.io.to('tasks:all').emit('task:started', event);
        logger_1.logger.debug('Broadcasted task started event', { taskId, agentId });
    }
    notifyTaskCompleted(taskId, agentId, completedAt, duration, success, result) {
        const event = {
            taskId,
            agentId,
            completedAt,
            duration,
            success,
            result
        };
        this.io.to(`task:${taskId}`).emit('task:completed', event);
        this.io.to('tasks:all').emit('task:completed', event);
        logger_1.logger.debug('Broadcasted task completed event', { taskId, agentId, success });
    }
    notifyTaskFailed(taskId, agentId, failedAt, error, retryCount, willRetry) {
        const event = {
            taskId,
            agentId,
            failedAt,
            error,
            retryCount,
            willRetry
        };
        this.io.to(`task:${taskId}`).emit('task:failed', event);
        this.io.to('tasks:all').emit('task:failed', event);
        logger_1.logger.debug('Broadcasted task failed event', { taskId, agentId, errorCode: error.code });
    }
    notifyTaskCancelled(taskId, agentId, cancelledAt, cancelledBy, reason) {
        const event = {
            taskId,
            agentId,
            cancelledAt,
            cancelledBy,
            reason
        };
        this.io.to(`task:${taskId}`).emit('task:cancelled', event);
        this.io.to('tasks:all').emit('task:cancelled', event);
        logger_1.logger.debug('Broadcasted task cancelled event', { taskId, agentId, reason });
    }
    getRealTimeStats() {
        return {
            connections: this.connections.size,
            subscriptions: this.getSubscriptionStats(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            }
        };
    }
    async shutdown() {
        logger_1.logger.info('Shutting down WebSocket service');
        this.io.emit('system:maintenance', {
            id: 'shutdown',
            title: 'System Maintenance',
            message: 'Server is shutting down for maintenance',
            startTime: new Date(),
            endTime: new Date(Date.now() + 60000),
            affectedServices: ['websocket', 'real-time-updates']
        });
        this.io.close();
        this.connections.clear();
        this.subscriptions.agents.clear();
        this.subscriptions.tasks.clear();
        this.subscriptions.platforms.clear();
    }
}
exports.WebSocketService = WebSocketService;
let webSocketService = null;
function initializeWebSocketService(httpServer, agentService) {
    if (!webSocketService) {
        webSocketService = new WebSocketService(httpServer, agentService);
    }
    return webSocketService;
}
function getWebSocketService() {
    if (!webSocketService) {
        throw new Error('WebSocket service not initialized. Call initializeWebSocketService first.');
    }
    return webSocketService;
}
//# sourceMappingURL=websocket.js.map