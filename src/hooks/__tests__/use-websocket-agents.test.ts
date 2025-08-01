import { renderHook, act, waitFor } from '@testing-library/react'
import { useWebSocketAgents } from '../use-websocket-agents'
import { toast } from 'sonner'

// Mock socket.io-client
const mockSocket = {
  connected: false,
  connect: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn()
}

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket)
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('useWebSocketAgents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSocket.connected = false
    mockLocalStorage.getItem.mockReturnValue('mock-token')
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useWebSocketAgents())

    expect(result.current.socket).toBe(mockSocket)
    expect(result.current.connected).toBe(false)
    expect(result.current.connecting).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('connects to WebSocket on mount', () => {
    renderHook(() => useWebSocketAgents())

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
  })

  it('authenticates on connection', async () => {
    const { result } = renderHook(() => useWebSocketAgents())

    // Simulate connection
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1]
    act(() => {
      connectHandler()
    })

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'auth:authenticate',
      'mock-token',
      expect.any(Function)
    )
  })

  it('handles successful authentication', async () => {
    const { result } = renderHook(() => useWebSocketAgents())

    // Simulate connection and authentication
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1]
    act(() => {
      connectHandler()
    })

    // Simulate successful authentication
    const authCall = mockSocket.emit.mock.calls.find(call => call[0] === 'auth:authenticate')
    const authCallback = authCall[2]
    
    act(() => {
      authCallback(true)
    })

    await waitFor(() => {
      expect(result.current.connected).toBe(true)
      expect(result.current.connecting).toBe(false)
      expect(result.current.error).toBe(null)
    })

    expect(toast.success).toHaveBeenCalledWith(
      'Connected to real-time updates',
      { description: 'Agent status will update automatically' }
    )
  })

  it('handles authentication failure', async () => {
    const { result } = renderHook(() => useWebSocketAgents())

    // Simulate connection and authentication failure
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1]
    act(() => {
      connectHandler()
    })

    const authCall = mockSocket.emit.mock.calls.find(call => call[0] === 'auth:authenticate')
    const authCallback = authCall[2]
    
    act(() => {
      authCallback(false, 'Invalid token')
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid token')
      expect(result.current.connecting).toBe(false)
      expect(result.current.connected).toBe(false)
    })

    expect(mockSocket.disconnect).toHaveBeenCalled()
  })

  it('subscribes to all agents when subscribeToAll is true', async () => {
    renderHook(() => useWebSocketAgents({ subscribeToAll: true }))

    // Simulate successful connection and authentication
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1]
    act(() => {
      connectHandler()
    })

    const authCall = mockSocket.emit.mock.calls.find(call => call[0] === 'auth:authenticate')
    const authCallback = authCall[2]
    
    act(() => {
      authCallback(true)
    })

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe:agents', [])
    })
  })

  it('subscribes to specific agents when agentIds provided', async () => {
    const agentIds = ['agent-1', 'agent-2']
    renderHook(() => useWebSocketAgents({ agentIds }))

    // Simulate successful connection and authentication
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1]
    act(() => {
      connectHandler()
    })

    const authCall = mockSocket.emit.mock.calls.find(call => call[0] === 'auth:authenticate')
    const authCallback = authCall[2]
    
    act(() => {
      authCallback(true)
    })

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe:agents', agentIds)
    })
  })

  it('handles agent status updates', () => {
    const mockOnStatusUpdate = jest.fn()
    renderHook(() => useWebSocketAgents({ onStatusUpdate: mockOnStatusUpdate }))

    // Find the agent:status event handler
    const statusHandler = mockSocket.on.mock.calls.find(call => call[0] === 'agent:status')[1]
    
    const statusUpdate = {
      agentId: 'agent-1',
      status: 'active' as const,
      timestamp: new Date(),
      metadata: {}
    }

    act(() => {
      statusHandler(statusUpdate)
    })

    expect(mockOnStatusUpdate).toHaveBeenCalledWith(statusUpdate)
    expect(toast.success).toHaveBeenCalledWith(
      'Agent Status Update',
      { description: 'Agent is now active' }
    )
  })

  it('handles agent health updates', () => {
    const mockOnHealthUpdate = jest.fn()
    renderHook(() => useWebSocketAgents({ onHealthUpdate: mockOnHealthUpdate }))

    // Find the agent:health event handler
    const healthHandler = mockSocket.on.mock.calls.find(call => call[0] === 'agent:health')[1]
    
    const healthUpdate = {
      agentId: 'agent-1',
      health: {
        status: 'healthy' as const,
        lastCheck: new Date(),
        responseTime: 150
      }
    }

    act(() => {
      healthHandler(healthUpdate)
    })

    expect(mockOnHealthUpdate).toHaveBeenCalledWith(healthUpdate)
  })

  it('shows error toast for unhealthy agents', () => {
    renderHook(() => useWebSocketAgents())

    const healthHandler = mockSocket.on.mock.calls.find(call => call[0] === 'agent:health')[1]
    
    const healthUpdate = {
      agentId: 'agent-1',
      health: {
        status: 'unhealthy' as const,
        lastCheck: new Date(),
        responseTime: 5000
      }
    }

    act(() => {
      healthHandler(healthUpdate)
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Agent Health Alert',
      expect.objectContaining({
        description: 'Agent health is now unhealthy'
      })
    )
  })

  it('handles agent connection events', () => {
    const mockOnAgentConnected = jest.fn()
    renderHook(() => useWebSocketAgents({ onAgentConnected: mockOnAgentConnected }))

    const connectedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'agent:connected')[1]
    
    const connectedEvent = {
      agentId: 'agent-1',
      platformId: 'platform-1',
      timestamp: new Date()
    }

    act(() => {
      connectedHandler(connectedEvent)
    })

    expect(mockOnAgentConnected).toHaveBeenCalledWith(connectedEvent)
    expect(toast.success).toHaveBeenCalledWith(
      'Agent Connected',
      { description: 'Agent connected to platform' }
    )
  })

  it('handles agent disconnection events', () => {
    const mockOnAgentDisconnected = jest.fn()
    renderHook(() => useWebSocketAgents({ onAgentDisconnected: mockOnAgentDisconnected }))

    const disconnectedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'agent:disconnected')[1]
    
    const disconnectedEvent = {
      agentId: 'agent-1',
      platformId: 'platform-1',
      reason: 'Connection lost',
      timestamp: new Date()
    }

    act(() => {
      disconnectedHandler(disconnectedEvent)
    })

    expect(mockOnAgentDisconnected).toHaveBeenCalledWith(disconnectedEvent)
    expect(toast.warning).toHaveBeenCalledWith(
      'Agent Disconnected',
      { description: 'Agent disconnected: Connection lost' }
    )
  })

  it('handles agent error events', () => {
    const mockOnAgentError = jest.fn()
    renderHook(() => useWebSocketAgents({ onAgentError: mockOnAgentError }))

    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'error:agent')[1]
    
    const errorEvent = {
      agentId: 'agent-1',
      error: {
        code: 'CONNECTION_FAILED',
        message: 'Failed to connect to platform',
        severity: 'high' as const,
        details: {}
      },
      timestamp: new Date()
    }

    act(() => {
      errorHandler(errorEvent)
    })

    expect(mockOnAgentError).toHaveBeenCalledWith(errorEvent)
    expect(toast.warning).toHaveBeenCalledWith(
      'Agent Error',
      expect.objectContaining({
        description: 'Failed to connect to platform'
      })
    )
  })

  it('handles critical errors with error toast', () => {
    renderHook(() => useWebSocketAgents())

    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'error:agent')[1]
    
    const criticalErrorEvent = {
      agentId: 'agent-1',
      error: {
        code: 'CRITICAL_FAILURE',
        message: 'Critical system failure',
        severity: 'critical' as const,
        details: {}
      },
      timestamp: new Date()
    }

    act(() => {
      errorHandler(criticalErrorEvent)
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Agent Error',
      expect.objectContaining({
        description: 'Critical system failure'
      })
    )
  })

  it('provides methods to subscribe/unsubscribe to agents', () => {
    const { result } = renderHook(() => useWebSocketAgents())

    act(() => {
      result.current.subscribeToAgent('agent-1')
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('subscribe:agents', ['agent-1'])

    act(() => {
      result.current.unsubscribeFromAgent('agent-1')
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribe:agents', ['agent-1'])
  })

  it('provides methods to subscribe/unsubscribe to all agents', () => {
    const { result } = renderHook(() => useWebSocketAgents())

    act(() => {
      result.current.subscribeToAllAgents()
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('subscribe:agents', [])

    act(() => {
      result.current.unsubscribeFromAllAgents()
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribe:agents', [])
  })

  it('handles connection errors with retry logic', async () => {
    jest.useFakeTimers()
    
    renderHook(() => useWebSocketAgents({ autoReconnect: true }))

    // Simulate connection error
    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1]
    
    act(() => {
      errorHandler(new Error('Connection failed'))
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Connection failed (attempt 1/5)',
      { description: 'Retrying in 3 seconds...' }
    )

    // Fast-forward time to trigger retry
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // Should attempt to reconnect
    expect(mockSocket.on).toHaveBeenCalledTimes(expect.any(Number))

    jest.useRealTimers()
  })

  it('handles session invalid events', () => {
    const { result } = renderHook(() => useWebSocketAgents())

    const sessionInvalidHandler = mockSocket.on.mock.calls.find(call => call[0] === 'auth:session_invalid')[1]
    
    act(() => {
      sessionInvalidHandler()
    })

    expect(result.current.error).toBe('Session expired')
    expect(result.current.connected).toBe(false)
    expect(toast.error).toHaveBeenCalledWith(
      'Session expired',
      { description: 'Please log in again to receive real-time updates' }
    )
    expect(mockSocket.disconnect).toHaveBeenCalled()
  })

  it('disconnects and cleans up on unmount', () => {
    const { unmount } = renderHook(() => useWebSocketAgents())

    unmount()

    expect(mockSocket.disconnect).toHaveBeenCalled()
  })

  it('handles missing auth token', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useWebSocketAgents())

    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1]
    act(() => {
      connectHandler()
    })

    expect(result.current.error).toBe('No authentication token available')
    expect(mockSocket.disconnect).toHaveBeenCalled()
  })

  it('can disable toasts', () => {
    renderHook(() => useWebSocketAgents({ showToasts: false }))

    const statusHandler = mockSocket.on.mock.calls.find(call => call[0] === 'agent:status')[1]
    
    act(() => {
      statusHandler({
        agentId: 'agent-1',
        status: 'active',
        timestamp: new Date()
      })
    })

    expect(toast.success).not.toHaveBeenCalled()
  })
})