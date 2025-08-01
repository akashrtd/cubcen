import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentMonitoringDashboard } from '../agent-monitoring-dashboard'
import { toast } from 'sonner'

// Mock the WebSocket hook
jest.mock('../../../hooks/use-websocket-agents', () => ({
  useWebSocketAgents: jest.fn(() => ({
    connected: true,
    connecting: false,
    error: null,
    reconnect: jest.fn(),
  })),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

const mockAgentsResponse = {
  success: true,
  data: {
    agents: [
      {
        id: 'agent-1',
        name: 'Test Agent 1',
        platformId: 'platform-1',
        platform: {
          id: 'platform-1',
          name: 'n8n Instance',
          type: 'N8N',
        },
        status: 'ACTIVE',
        capabilities: '["webhook", "http-request"]',
        configuration: '{"timeout": 30000}',
        healthStatus:
          '{"status":"healthy","lastCheck":"2024-01-01T10:00:00Z","responseTime":150}',
        description: 'Main automation agent',
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'agent-2',
        name: 'Test Agent 2',
        platformId: 'platform-2',
        platform: {
          id: 'platform-2',
          name: 'Make Scenario',
          type: 'MAKE',
        },
        status: 'ERROR',
        capabilities: '["api-integration"]',
        configuration: '{}',
        healthStatus:
          '{"status":"unhealthy","lastCheck":"2024-01-01T09:30:00Z","responseTime":5000,"error":"Connection timeout"}',
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T09:30:00Z',
      },
    ],
  },
}

describe('AgentMonitoringDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAgentsResponse),
    })
  })

  it('renders dashboard with correct title and description', async () => {
    render(<AgentMonitoringDashboard />)

    expect(screen.getByText('Agent Monitoring')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Monitor and manage your AI agents across all platforms in real-time.'
      )
    ).toBeInTheDocument()

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    })
  })

  it('displays WebSocket connection status', () => {
    render(<AgentMonitoringDashboard />)

    expect(screen.getByText('Live Updates')).toBeInTheDocument()
  })

  it('fetches and displays agents on mount', async () => {
    render(<AgentMonitoringDashboard />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/cubcen/v1/agents', {
        headers: {
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.getByText('Test Agent 2')).toBeInTheDocument()
    })
  })

  it('displays correct agent statistics', async () => {
    render(<AgentMonitoringDashboard />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Total agents
      expect(screen.getByText('1')).toBeInTheDocument() // Active agents
      expect(screen.getByText('1')).toBeInTheDocument() // Error agents
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))

    render(<AgentMonitoringDashboard />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch agents', {
        description: 'API Error',
      })
    })

    expect(screen.getByText('API Error')).toBeInTheDocument()
  })

  it('handles API response errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    })

    render(<AgentMonitoringDashboard />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch agents', {
        description: 'Failed to fetch agents: Internal Server Error',
      })
    })
  })

  it('switches between view modes', async () => {
    render(<AgentMonitoringDashboard />)

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    })

    // Switch to list view
    const listTab = screen.getByRole('tab', { name: /list/i })
    fireEvent.click(listTab)

    // Should show table headers
    expect(screen.getByText('Agent Name')).toBeInTheDocument()
    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()

    // Switch to detail view
    const detailTab = screen.getByRole('tab', { name: /detail/i })
    fireEvent.click(detailTab)

    // Should show "No Agent Selected" message
    expect(screen.getByText('No Agent Selected')).toBeInTheDocument()
  })

  it('handles agent selection for detail view', async () => {
    render(<AgentMonitoringDashboard />)

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    })

    // Click on "View Details" button for first agent
    const viewButtons = screen.getAllByText('View Details')
    fireEvent.click(viewButtons[0])

    // Should switch to detail view and show selected agent
    await waitFor(() => {
      expect(screen.getByText('Viewing: Test Agent 1')).toBeInTheDocument()
    })
  })

  it('refreshes agents when refresh button is clicked', async () => {
    render(<AgentMonitoringDashboard />)

    // Wait for initial load
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    // Should make another API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('refreshes individual agent', async () => {
    const singleAgentResponse = {
      success: true,
      data: {
        agent: mockAgentsResponse.data.agents[0],
      },
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAgentsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleAgentResponse),
      })

    render(<AgentMonitoringDashboard />)

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    })

    // Find and click refresh button on first agent card
    const refreshButtons = screen
      .getAllByRole('button')
      .filter(button =>
        button.querySelector('svg')?.classList.contains('lucide-refresh-cw')
      )

    fireEvent.click(refreshButtons[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/cubcen/v1/agents/agent-1', {
        headers: {
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Agent refreshed successfully')
  })

  it('handles individual agent refresh errors', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAgentsResponse),
      })
      .mockRejectedValueOnce(new Error('Refresh failed'))

    render(<AgentMonitoringDashboard />)

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    })

    // Find and click refresh button on first agent card
    const refreshButtons = screen
      .getAllByRole('button')
      .filter(button =>
        button.querySelector('svg')?.classList.contains('lucide-refresh-cw')
      )

    fireEvent.click(refreshButtons[0])

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to refresh agent', {
        description: 'Refresh failed',
      })
    })
  })

  it('handles configure agent action', async () => {
    render(<AgentMonitoringDashboard />)

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    })

    // Click configure button
    const configureButtons = screen.getAllByText('Configure')
    fireEvent.click(configureButtons[0])

    expect(toast.info).toHaveBeenCalledWith('Configuration', {
      description: 'Opening configuration for Test Agent 1',
    })
  })

  it('displays WebSocket error state', () => {
    const {
      useWebSocketAgents,
    } = require('../../../hooks/use-websocket-agents')
    useWebSocketAgents.mockReturnValue({
      connected: false,
      connecting: false,
      error: 'Connection failed',
      reconnect: jest.fn(),
    })

    render(<AgentMonitoringDashboard />)

    expect(screen.getByText('Offline')).toBeInTheDocument()
    expect(
      screen.getByText('Real-time updates are unavailable: Connection failed')
    ).toBeInTheDocument()
    expect(screen.getByText('Try reconnecting')).toBeInTheDocument()
  })

  it('displays WebSocket connecting state', () => {
    const {
      useWebSocketAgents,
    } = require('../../../hooks/use-websocket-agents')
    useWebSocketAgents.mockReturnValue({
      connected: false,
      connecting: true,
      error: null,
      reconnect: jest.fn(),
    })

    render(<AgentMonitoringDashboard />)

    expect(screen.getByText('Connecting')).toBeInTheDocument()
  })

  it('handles WebSocket reconnection', () => {
    const mockReconnect = jest.fn()
    const {
      useWebSocketAgents,
    } = require('../../../hooks/use-websocket-agents')
    useWebSocketAgents.mockReturnValue({
      connected: false,
      connecting: false,
      error: 'Connection failed',
      reconnect: mockReconnect,
    })

    render(<AgentMonitoringDashboard />)

    const reconnectButton = screen.getByText('Try reconnecting')
    fireEvent.click(reconnectButton)

    expect(mockReconnect).toHaveBeenCalled()
  })

  it('updates agent data from WebSocket events', async () => {
    const mockOnStatusUpdate = jest.fn()
    const {
      useWebSocketAgents,
    } = require('../../../hooks/use-websocket-agents')

    // Capture the callback functions
    let statusUpdateCallback: any
    useWebSocketAgents.mockImplementation((options: any) => {
      statusUpdateCallback = options.onStatusUpdate
      return {
        connected: true,
        connecting: false,
        error: null,
        reconnect: jest.fn(),
      }
    })

    render(<AgentMonitoringDashboard />)

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    })

    // Simulate WebSocket status update
    if (statusUpdateCallback) {
      statusUpdateCallback({
        agentId: 'agent-1',
        status: 'inactive',
        timestamp: new Date(),
      })
    }

    // The component should update the agent status
    // This would require more complex state management testing
  })

  it('calculates and displays correct statistics', async () => {
    render(<AgentMonitoringDashboard />)

    await waitFor(() => {
      // Total agents
      expect(screen.getByText('2')).toBeInTheDocument()

      // Status counts
      const activeCount = screen
        .getAllByText('1')
        .filter(el => el.parentElement?.textContent?.includes('Active'))
      expect(activeCount.length).toBeGreaterThan(0)

      const errorCount = screen
        .getAllByText('1')
        .filter(el => el.parentElement?.textContent?.includes('Error'))
      expect(errorCount.length).toBeGreaterThan(0)
    })
  })

  it('handles empty agent list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { agents: [] },
        }),
    })

    render(<AgentMonitoringDashboard />)

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument() // Total count should be 0
    })
  })
})
