'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import type { Agent } from '@/components/agents/agent-list'

interface AgentStatusUpdate {
  agentId: string
  status: 'active' | 'inactive' | 'error' | 'maintenance'
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface AgentHealthUpdate {
  agentId: string
  health: {
    status: 'healthy' | 'unhealthy' | 'degraded'
    lastCheck: Date
    responseTime?: number
    errorCount?: number
    details?: Record<string, unknown>
  }
}

interface AgentConnectedEvent {
  agentId: string
  platformId: string
  timestamp: Date
}

interface AgentDisconnectedEvent {
  agentId: string
  platformId: string
  reason: string
  timestamp: Date
}

interface AgentErrorEvent {
  agentId: string
  error: {
    code: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details?: Record<string, unknown>
  }
  timestamp: Date
}

interface UseWebSocketAgentsOptions {
  agentIds?: string[]
  subscribeToAll?: boolean
  onStatusUpdate?: (update: AgentStatusUpdate) => void
  onHealthUpdate?: (update: AgentHealthUpdate) => void
  onAgentConnected?: (event: AgentConnectedEvent) => void
  onAgentDisconnected?: (event: AgentDisconnectedEvent) => void
  onAgentError?: (event: AgentErrorEvent) => void
  showToasts?: boolean
  autoReconnect?: boolean
}

interface UseWebSocketAgentsReturn {
  socket: Socket | null
  connected: boolean
  connecting: boolean
  error: string | null
  subscribeToAgent: (agentId: string) => void
  unsubscribeFromAgent: (agentId: string) => void
  subscribeToAllAgents: () => void
  unsubscribeFromAllAgents: () => void
  disconnect: () => void
  reconnect: () => void
}

export function useWebSocketAgents(
  options: UseWebSocketAgentsOptions = {}
): UseWebSocketAgentsReturn {
  const {
    agentIds = [],
    subscribeToAll = false,
    onStatusUpdate,
    onHealthUpdate,
    onAgentConnected,
    onAgentDisconnected,
    onAgentError,
    showToasts = true,
    autoReconnect = true,
  } = options

  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000

  const getAuthToken = useCallback(() => {
    // Get token from localStorage or your auth system
    return localStorage.getItem('auth_token')
  }, [])

  const connect = useCallback(() => {
    if (socket?.connected) return

    setConnecting(true)
    setError(null)

    const newSocket = io(
      process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
      {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      }
    )

    // Authentication
    newSocket.on('connect', () => {
      const token = getAuthToken()
      if (token) {
        newSocket.emit(
          'auth:authenticate',
          token,
          (success: boolean, errorMsg?: string) => {
            if (success) {
              setConnected(true)
              setConnecting(false)
              setError(null)
              reconnectAttemptsRef.current = 0

              if (showToasts) {
                toast.success('Connected to real-time updates', {
                  description: 'Agent status will update automatically',
                })
              }

              // Subscribe to agents
              if (subscribeToAll) {
                newSocket.emit('subscribe:agents', [])
              } else if (agentIds.length > 0) {
                newSocket.emit('subscribe:agents', agentIds)
              }
            } else {
              setError(errorMsg || 'Authentication failed')
              setConnecting(false)
              newSocket.disconnect()
            }
          }
        )
      } else {
        setError('No authentication token available')
        setConnecting(false)
        newSocket.disconnect()
      }
    })

    // Connection error handling
    newSocket.on('connect_error', err => {
      setError(`Connection failed: ${err.message}`)
      setConnecting(false)
      setConnected(false)

      if (
        autoReconnect &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptsRef.current++
        if (showToasts) {
          toast.error(
            `Connection failed (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`,
            {
              description: `Retrying in ${reconnectDelay / 1000} seconds...`,
            }
          )
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectDelay)
      } else if (showToasts) {
        toast.error('Failed to connect to real-time updates', {
          description: 'Please refresh the page to try again',
        })
      }
    })

    newSocket.on('disconnect', reason => {
      setConnected(false)
      setConnecting(false)

      if (reason === 'io server disconnect') {
        // Server disconnected us, don't reconnect automatically
        setError('Disconnected by server')
        if (showToasts) {
          toast.warning('Disconnected from real-time updates', {
            description: 'Server disconnected the connection',
          })
        }
      } else if (
        autoReconnect &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        // Client disconnected, try to reconnect
        reconnectAttemptsRef.current++
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectDelay)
      }
    })

    // Session invalid - need to re-authenticate
    newSocket.on('auth:session_invalid', () => {
      setError('Session expired')
      setConnected(false)
      if (showToasts) {
        toast.error('Session expired', {
          description: 'Please log in again to receive real-time updates',
        })
      }
      newSocket.disconnect()
    })

    // Agent event handlers
    newSocket.on('agent:status', (data: AgentStatusUpdate) => {
      onStatusUpdate?.(data)

      if (showToasts) {
        const statusMessages = {
          active: 'Agent is now active',
          inactive: 'Agent is now inactive',
          error: 'Agent encountered an error',
          maintenance: 'Agent is under maintenance',
        }

        const statusColors = {
          active: 'success',
          inactive: 'info',
          error: 'error',
          maintenance: 'warning',
        } as const

        const toastFn = {
          success: toast.success,
          info: toast.info,
          error: toast.error,
          warning: toast.warning,
        }[statusColors[data.status]]

        toastFn(`Agent Status Update`, {
          description: statusMessages[data.status],
        })
      }
    })

    newSocket.on('agent:health', (data: AgentHealthUpdate) => {
      onHealthUpdate?.(data)

      if (showToasts && data.health.status === 'unhealthy') {
        toast.error('Agent Health Alert', {
          description: `Agent health is now ${data.health.status}`,
          action: {
            label: 'View Details',
            onClick: () => {
              // This could navigate to the agent detail view
              console.log('Navigate to agent:', data.agentId)
            },
          },
        })
      }
    })

    newSocket.on('agent:connected', (data: AgentConnectedEvent) => {
      onAgentConnected?.(data)

      if (showToasts) {
        toast.success('Agent Connected', {
          description: `Agent connected to platform`,
        })
      }
    })

    newSocket.on('agent:disconnected', (data: AgentDisconnectedEvent) => {
      onAgentDisconnected?.(data)

      if (showToasts) {
        toast.warning('Agent Disconnected', {
          description: `Agent disconnected: ${data.reason}`,
        })
      }
    })

    newSocket.on('error:agent', (data: AgentErrorEvent) => {
      onAgentError?.(data)

      if (showToasts) {
        const toastFn =
          data.error.severity === 'critical' ? toast.error : toast.warning

        toastFn('Agent Error', {
          description: data.error.message,
          action: {
            label: 'View Details',
            onClick: () => {
              console.log('Navigate to agent error:', data.agentId)
            },
          },
        })
      }
    })

    setSocket(newSocket)
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
    autoReconnect,
  ])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (socket) {
      socket.disconnect()
      setSocket(null)
    }

    setConnected(false)
    setConnecting(false)
    setError(null)
    reconnectAttemptsRef.current = 0
  }, [socket])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 1000)
  }, [disconnect, connect])

  const subscribeToAgent = useCallback(
    (agentId: string) => {
      if (socket?.connected) {
        socket.emit('subscribe:agents', [agentId])
      }
    },
    [socket]
  )

  const unsubscribeFromAgent = useCallback(
    (agentId: string) => {
      if (socket?.connected) {
        socket.emit('unsubscribe:agents', [agentId])
      }
    },
    [socket]
  )

  const subscribeToAllAgents = useCallback(() => {
    if (socket?.connected) {
      socket.emit('subscribe:agents', [])
    }
  }, [socket])

  const unsubscribeFromAllAgents = useCallback(() => {
    if (socket?.connected) {
      socket.emit('unsubscribe:agents', [])
    }
  }, [socket])

  // Initialize connection
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, []) // Only run once on mount

  // Update subscriptions when agentIds change
  useEffect(() => {
    if (socket?.connected) {
      if (subscribeToAll) {
        socket.emit('subscribe:agents', [])
      } else if (agentIds.length > 0) {
        socket.emit('subscribe:agents', agentIds)
      }
    }
  }, [socket, agentIds, subscribeToAll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

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
    reconnect,
  }
}
