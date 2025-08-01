"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocketAgents = useWebSocketAgents;
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
const sonner_1 = require("sonner");
function useWebSocketAgents(options = {}) {
    const { agentIds = [], subscribeToAll = false, onStatusUpdate, onHealthUpdate, onAgentConnected, onAgentDisconnected, onAgentError, showToasts = true, autoReconnect = true } = options;
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const [connecting, setConnecting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const reconnectTimeoutRef = (0, react_1.useRef)();
    const reconnectAttemptsRef = (0, react_1.useRef)(0);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;
    const getAuthToken = (0, react_1.useCallback)(() => {
        return localStorage.getItem('auth_token');
    }, []);
    const connect = (0, react_1.useCallback)(() => {
        if (socket?.connected)
            return;
        setConnecting(true);
        setError(null);
        const newSocket = (0, socket_io_client_1.io)(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });
        newSocket.on('connect', () => {
            const token = getAuthToken();
            if (token) {
                newSocket.emit('auth:authenticate', token, (success, errorMsg) => {
                    if (success) {
                        setConnected(true);
                        setConnecting(false);
                        setError(null);
                        reconnectAttemptsRef.current = 0;
                        if (showToasts) {
                            sonner_1.toast.success('Connected to real-time updates', {
                                description: 'Agent status will update automatically'
                            });
                        }
                        if (subscribeToAll) {
                            newSocket.emit('subscribe:agents', []);
                        }
                        else if (agentIds.length > 0) {
                            newSocket.emit('subscribe:agents', agentIds);
                        }
                    }
                    else {
                        setError(errorMsg || 'Authentication failed');
                        setConnecting(false);
                        newSocket.disconnect();
                    }
                });
            }
            else {
                setError('No authentication token available');
                setConnecting(false);
                newSocket.disconnect();
            }
        });
        newSocket.on('connect_error', (err) => {
            setError(`Connection failed: ${err.message}`);
            setConnecting(false);
            setConnected(false);
            if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++;
                if (showToasts) {
                    sonner_1.toast.error(`Connection failed (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`, {
                        description: `Retrying in ${reconnectDelay / 1000} seconds...`
                    });
                }
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, reconnectDelay);
            }
            else if (showToasts) {
                sonner_1.toast.error('Failed to connect to real-time updates', {
                    description: 'Please refresh the page to try again'
                });
            }
        });
        newSocket.on('disconnect', (reason) => {
            setConnected(false);
            setConnecting(false);
            if (reason === 'io server disconnect') {
                setError('Disconnected by server');
                if (showToasts) {
                    sonner_1.toast.warning('Disconnected from real-time updates', {
                        description: 'Server disconnected the connection'
                    });
                }
            }
            else if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++;
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, reconnectDelay);
            }
        });
        newSocket.on('auth:session_invalid', () => {
            setError('Session expired');
            setConnected(false);
            if (showToasts) {
                sonner_1.toast.error('Session expired', {
                    description: 'Please log in again to receive real-time updates'
                });
            }
            newSocket.disconnect();
        });
        newSocket.on('agent:status', (data) => {
            onStatusUpdate?.(data);
            if (showToasts) {
                const statusMessages = {
                    active: 'Agent is now active',
                    inactive: 'Agent is now inactive',
                    error: 'Agent encountered an error',
                    maintenance: 'Agent is under maintenance'
                };
                const statusColors = {
                    active: 'success',
                    inactive: 'info',
                    error: 'error',
                    maintenance: 'warning'
                };
                const toastFn = {
                    success: sonner_1.toast.success,
                    info: sonner_1.toast.info,
                    error: sonner_1.toast.error,
                    warning: sonner_1.toast.warning
                }[statusColors[data.status]];
                toastFn(`Agent Status Update`, {
                    description: statusMessages[data.status]
                });
            }
        });
        newSocket.on('agent:health', (data) => {
            onHealthUpdate?.(data);
            if (showToasts && data.health.status === 'unhealthy') {
                sonner_1.toast.error('Agent Health Alert', {
                    description: `Agent health is now ${data.health.status}`,
                    action: {
                        label: 'View Details',
                        onClick: () => {
                            console.log('Navigate to agent:', data.agentId);
                        }
                    }
                });
            }
        });
        newSocket.on('agent:connected', (data) => {
            onAgentConnected?.(data);
            if (showToasts) {
                sonner_1.toast.success('Agent Connected', {
                    description: `Agent connected to platform`
                });
            }
        });
        newSocket.on('agent:disconnected', (data) => {
            onAgentDisconnected?.(data);
            if (showToasts) {
                sonner_1.toast.warning('Agent Disconnected', {
                    description: `Agent disconnected: ${data.reason}`
                });
            }
        });
        newSocket.on('error:agent', (data) => {
            onAgentError?.(data);
            if (showToasts) {
                const toastFn = data.error.severity === 'critical' ? sonner_1.toast.error : sonner_1.toast.warning;
                toastFn('Agent Error', {
                    description: data.error.message,
                    action: {
                        label: 'View Details',
                        onClick: () => {
                            console.log('Navigate to agent error:', data.agentId);
                        }
                    }
                });
            }
        });
        setSocket(newSocket);
    }, [
        socket,
        getAuthToken,
        subscribeToAll,
        agentIds,
        onStatusUpdate,
        onHealthUpdate,
        onAgentConnected,
        onAgentDisconnected,
        onAgentError,
        showToasts,
        autoReconnect
    ]);
    const disconnect = (0, react_1.useCallback)(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        setConnected(false);
        setConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
    }, [socket]);
    const reconnect = (0, react_1.useCallback)(() => {
        disconnect();
        setTimeout(() => {
            connect();
        }, 1000);
    }, [disconnect, connect]);
    const subscribeToAgent = (0, react_1.useCallback)((agentId) => {
        if (socket?.connected) {
            socket.emit('subscribe:agents', [agentId]);
        }
    }, [socket]);
    const unsubscribeFromAgent = (0, react_1.useCallback)((agentId) => {
        if (socket?.connected) {
            socket.emit('unsubscribe:agents', [agentId]);
        }
    }, [socket]);
    const subscribeToAllAgents = (0, react_1.useCallback)(() => {
        if (socket?.connected) {
            socket.emit('subscribe:agents', []);
        }
    }, [socket]);
    const unsubscribeFromAllAgents = (0, react_1.useCallback)(() => {
        if (socket?.connected) {
            socket.emit('unsubscribe:agents', []);
        }
    }, [socket]);
    (0, react_1.useEffect)(() => {
        connect();
        return () => {
            disconnect();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (socket?.connected) {
            if (subscribeToAll) {
                socket.emit('subscribe:agents', []);
            }
            else if (agentIds.length > 0) {
                socket.emit('subscribe:agents', agentIds);
            }
        }
    }, [socket, agentIds, subscribeToAll]);
    (0, react_1.useEffect)(() => {
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);
    return {
        socket,
        connected,
        connecting,
        error,
        subscribeToAgent,
        unsubscribeFromAgent,
        subscribeToAllAgents,
        unsubscribeFromAllAgents,
        disconnect,
        reconnect
    };
}
//# sourceMappingURL=use-websocket-agents.js.map