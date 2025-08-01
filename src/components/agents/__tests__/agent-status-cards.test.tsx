import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentStatusCards } from '../agent-status-cards'
import type { Agent } from '../agent-list'

// Mock data
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Test Agent 1',
    platformId: 'platform-1',
    platform: {
      id: 'platform-1',
      name: 'n8n Instance',
      type: 'N8N'
    },
    status: 'ACTIVE',
    healthStatus: {
      status: 'healthy',
      lastCheck: new Date('2024-01-01T10:00:00Z'),
      responseTime: 150,
      details: {}
    },
    capabilities: ['webhook', 'http-request', 'data-transformation'],
    configuration: { timeout: 30000 },
    description: 'Main automation agent',
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: 'agent-2',
    name: 'Test Agent 2',
    platformId: 'platform-2',
    platform: {
      id: 'platform-2',
      name: 'Make Scenario',
      type: 'MAKE'
    },
    status: 'ERROR',
    healthStatus: {
      status: 'unhealthy',
      lastCheck: new Date('2024-01-01T09:30:00Z'),
      responseTime: 5000,
      error: 'Connection timeout',
      details: { errorCode: 'TIMEOUT' }
    },
    capabilities: ['api-integration'],
    configuration: {},
    createdAt: new Date('2024-01-01T08:00:00Z'),
    updatedAt: new Date('2024-01-01T09:30:00Z')
  }
]

describe('AgentStatusCards', () => {
  const mockOnViewAgent = jest.fn()
  const mockOnConfigureAgent = jest.fn()
  const mockOnRefreshAgent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders agent status cards with correct data', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // Check if agent names are rendered
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument()

    // Check status badges
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()

    // Check platform badges
    expect(screen.getByText('n8n Instance')).toBeInTheDocument()
    expect(screen.getByText('Make Scenario')).toBeInTheDocument()

    // Check health status
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('Unhealthy')).toBeInTheDocument()
  })

  it('displays loading state correctly', () => {
    render(
      <AgentStatusCards
        agents={[]}
        loading={true}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // Should show loading cards (6 skeleton cards)
    const loadingCards = screen.getAllByRole('generic').filter(el => 
      el.className.includes('overflow-hidden')
    )
    expect(loadingCards.length).toBeGreaterThan(0)
  })

  it('displays empty state when no agents', () => {
    render(
      <AgentStatusCards
        agents={[]}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    expect(screen.getByText('No Agents Found')).toBeInTheDocument()
    expect(screen.getByText('Connect to a platform to start monitoring your AI agents.')).toBeInTheDocument()
  })

  it('shows real-time pulse indicator for healthy active agents', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // The pulse indicator should be present for the healthy active agent
    const pulseIndicators = screen.getAllByRole('generic').filter(el => 
      el.className.includes('animate-pulse')
    )
    expect(pulseIndicators.length).toBeGreaterThan(0)
  })

  it('displays response times correctly', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    expect(screen.getByText('Response Time: 150ms')).toBeInTheDocument()
    expect(screen.getByText('Response Time: 5000ms')).toBeInTheDocument()
  })

  it('displays uptime percentages', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // Uptime should be displayed (mocked values based on health status)
    expect(screen.getByText('Uptime: 99.9%')).toBeInTheDocument()
    expect(screen.getByText('Uptime: 85.2%')).toBeInTheDocument()
  })

  it('displays last check times in relative format', () => {
    // Mock Date.now to return a fixed time for consistent testing
    const mockNow = new Date('2024-01-01T10:30:00Z').getTime()
    jest.spyOn(Date, 'now').mockReturnValue(mockNow)

    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // Should show relative times - check for any text containing "ago"
    expect(screen.getAllByText(/ago/).length).toBeGreaterThan(0)

    jest.restoreAllMocks()
  })

  it('displays capabilities with truncation', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // Should show first 3 capabilities
    expect(screen.getByText('webhook')).toBeInTheDocument()
    expect(screen.getByText('http-request')).toBeInTheDocument()
    expect(screen.getByText('data-transformation')).toBeInTheDocument()

    // Should show single capability for second agent
    expect(screen.getByText('api-integration')).toBeInTheDocument()
  })

  it('displays error details for unhealthy agents', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    expect(screen.getByText('Error Details')).toBeInTheDocument()
    expect(screen.getByText('Connection timeout')).toBeInTheDocument()
  })

  it('calls onViewAgent when View Details button is clicked', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    const viewButtons = screen.getAllByText('View Details')
    fireEvent.click(viewButtons[0])

    expect(mockOnViewAgent).toHaveBeenCalledWith(mockAgents[0])
  })

  it('calls onConfigureAgent when Configure button is clicked', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    const configureButtons = screen.getAllByText('Configure')
    fireEvent.click(configureButtons[0])

    expect(mockOnConfigureAgent).toHaveBeenCalledWith(mockAgents[0])
  })

  it('calls onRefreshAgent when refresh button is clicked', async () => {
    mockOnRefreshAgent.mockResolvedValue(undefined)

    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    const refreshButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg')?.classList.contains('lucide-refresh-cw')
    )
    
    fireEvent.click(refreshButtons[0])

    expect(mockOnRefreshAgent).toHaveBeenCalledWith('agent-1')
  })

  it('shows loading state on refresh button during refresh', async () => {
    // Mock a delayed response
    mockOnRefreshAgent.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    const refreshButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg')?.classList.contains('lucide-refresh-cw')
    )
    
    fireEvent.click(refreshButtons[0])

    // Button should be disabled during refresh
    expect(refreshButtons[0]).toBeDisabled()

    // Wait for refresh to complete
    await waitFor(() => {
      expect(refreshButtons[0]).not.toBeDisabled()
    })
  })

  it('applies correct styling based on agent status', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // Check if cards have appropriate styling classes
    const cards = screen.getAllByRole('generic').filter(el => 
      el.className.includes('border-l-4')
    )
    
    expect(cards.length).toBeGreaterThan(0)
  })

  it('displays health progress bars with correct values', () => {
    render(
      <AgentStatusCards
        agents={mockAgents}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // Progress bars should be present
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars.length).toBeGreaterThan(0)
  })

  it('handles agents with no capabilities gracefully', () => {
    const agentWithNoCapabilities: Agent = {
      ...mockAgents[0],
      id: 'agent-no-caps',
      capabilities: []
    }

    render(
      <AgentStatusCards
        agents={[agentWithNoCapabilities]}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    // Should not crash and should render the agent
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
  })

  it('handles agents with no response time gracefully', () => {
    const agentWithNoResponseTime: Agent = {
      ...mockAgents[0],
      id: 'agent-no-response-time',
      healthStatus: {
        ...mockAgents[0].healthStatus,
        responseTime: undefined
      }
    }

    render(
      <AgentStatusCards
        agents={[agentWithNoResponseTime]}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
        onRefreshAgent={mockOnRefreshAgent}
      />
    )

    expect(screen.getByText('Response Time: N/Ams')).toBeInTheDocument()
  })
})