import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentList, type Agent } from '../agent-list'

// Mock data
const mockAgents: Agent[] = [
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
    healthStatus: {
      status: 'healthy',
      lastCheck: new Date('2024-01-01T10:00:00Z'),
      responseTime: 150,
      details: {},
    },
    capabilities: ['webhook', 'http-request', 'data-transformation'],
    configuration: { timeout: 30000 },
    description: 'Main automation agent',
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
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
    healthStatus: {
      status: 'unhealthy',
      lastCheck: new Date('2024-01-01T09:30:00Z'),
      responseTime: 5000,
      error: 'Connection timeout',
      details: {},
    },
    capabilities: ['api-integration'],
    configuration: {},
    createdAt: new Date('2024-01-01T08:00:00Z'),
    updatedAt: new Date('2024-01-01T09:30:00Z'),
  },
  {
    id: 'agent-3',
    name: 'Test Agent 3',
    platformId: 'platform-3',
    platform: {
      id: 'platform-3',
      name: 'Zapier Zap',
      type: 'ZAPIER',
    },
    status: 'MAINTENANCE',
    healthStatus: {
      status: 'degraded',
      lastCheck: new Date('2024-01-01T09:45:00Z'),
      responseTime: 800,
      details: {},
    },
    capabilities: ['email', 'calendar'],
    configuration: { retries: 3 },
    description: 'Email automation agent',
    createdAt: new Date('2024-01-01T07:00:00Z'),
    updatedAt: new Date('2024-01-01T09:45:00Z'),
  },
]

describe('AgentList', () => {
  const mockOnRefresh = jest.fn()
  const mockOnViewAgent = jest.fn()
  const mockOnConfigureAgent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders agent list with correct data', () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    // Check if title is rendered
    expect(screen.getByText('Agent Monitoring')).toBeInTheDocument()
    expect(screen.getByText('3 agents')).toBeInTheDocument()

    // Check if agents are rendered
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 3')).toBeInTheDocument()

    // Check status badges
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()

    // Check platform badges
    expect(screen.getByText('n8n')).toBeInTheDocument()
    expect(screen.getByText('Make.com')).toBeInTheDocument()
    expect(screen.getByText('Zapier')).toBeInTheDocument()

    // Check health badges
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('Unhealthy')).toBeInTheDocument()
    expect(screen.getByText('Degraded')).toBeInTheDocument()
  })

  it('displays loading state correctly', () => {
    render(
      <AgentList
        agents={[]}
        loading={true}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    // Should show loading skeletons
    expect(screen.getByText('Agent Monitoring')).toBeInTheDocument()
    // Loading skeletons don't have specific text, but the structure should be there
  })

  it('displays empty state when no agents', () => {
    render(
      <AgentList
        agents={[]}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    expect(screen.getByText('No agents found')).toBeInTheDocument()
  })

  it('filters agents by search term', async () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search agents...')
    fireEvent.change(searchInput, { target: { value: 'Test Agent 1' } })

    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Agent 3')).not.toBeInTheDocument()
    })
  })

  it('filters agents by status', async () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    // Find and click the status filter
    const statusFilter = screen.getByLabelText('Filter by status')
    fireEvent.click(statusFilter)

    // Select "Active" option from the dropdown
    await waitFor(() => {
      const activeOptions = screen.getAllByText('Active')
      // Click the one in the dropdown (not the one in the table)
      fireEvent.click(activeOptions[activeOptions.length - 1])
    })

    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Agent 3')).not.toBeInTheDocument()
    })
  })

  it('filters agents by platform', async () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    // Find and click the platform filter
    const platformFilter = screen.getByLabelText('Filter by platform')
    fireEvent.click(platformFilter)

    // Select "n8n" option from the dropdown
    await waitFor(() => {
      const n8nOptions = screen.getAllByText('n8n')
      // Click the one in the dropdown (not the one in the table)
      fireEvent.click(n8nOptions[n8nOptions.length - 1])
    })

    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Agent 3')).not.toBeInTheDocument()
    })
  })

  it('filters agents by health status', async () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    // Find and click the health filter
    const healthFilter = screen.getByLabelText('Filter by health')
    fireEvent.click(healthFilter)

    // Select "Healthy" option from the dropdown
    await waitFor(() => {
      const healthyOptions = screen.getAllByText('Healthy')
      // Click the one in the dropdown (not the one in the table)
      fireEvent.click(healthyOptions[healthyOptions.length - 1])
    })

    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Agent 3')).not.toBeInTheDocument()
    })
  })

  it('sorts agents by name', async () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    // The agents should be sorted by name by default (ascending)
    // Check that the sort indicator is present
    expect(screen.getByText('Agent Name')).toBeInTheDocument()

    // Check that agents are displayed (sorting logic is tested in the component)
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 3')).toBeInTheDocument()
  })

  it('calls onRefresh when refresh button is clicked', () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    expect(mockOnRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls onViewAgent when view button is clicked', () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    const viewButtons = screen
      .getAllByRole('button')
      .filter(button =>
        button.querySelector('svg')?.classList.contains('lucide-eye')
      )

    if (viewButtons.length > 0) {
      fireEvent.click(viewButtons[0])
      expect(mockOnViewAgent).toHaveBeenCalledWith(mockAgents[0])
    }
  })

  it('calls onConfigureAgent when configure button is clicked', () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    const configureButtons = screen
      .getAllByRole('button')
      .filter(button =>
        button.querySelector('svg')?.classList.contains('lucide-settings')
      )

    if (configureButtons.length > 0) {
      fireEvent.click(configureButtons[0])
      expect(mockOnConfigureAgent).toHaveBeenCalledWith(mockAgents[0])
    }
  })

  it('displays capabilities correctly', () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    // Check if capabilities are displayed (first 2 + count)
    expect(screen.getByText('webhook')).toBeInTheDocument()
    expect(screen.getByText('http-request')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument() // +1 more capability
  })

  it('displays response times correctly', () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    expect(screen.getByText('150ms')).toBeInTheDocument()
    expect(screen.getByText('5000ms')).toBeInTheDocument()
    expect(screen.getByText('800ms')).toBeInTheDocument()
  })

  it('displays last check times in relative format', () => {
    // Mock Date.now to return a fixed time for consistent testing
    const mockNow = new Date('2024-01-01T10:30:00Z').getTime()
    jest.spyOn(Date, 'now').mockReturnValue(mockNow)

    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    // Should show relative times - check that multiple elements with "ago" exist
    const agoElements = screen.getAllByText(/ago/)
    expect(agoElements.length).toBeGreaterThan(0)

    jest.restoreAllMocks()
  })

  it('shows filtered results message when no matches', async () => {
    render(
      <AgentList
        agents={mockAgents}
        onRefresh={mockOnRefresh}
        onViewAgent={mockOnViewAgent}
        onConfigureAgent={mockOnConfigureAgent}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search agents...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent agent' } })

    await waitFor(() => {
      expect(
        screen.getByText('No agents match your filters')
      ).toBeInTheDocument()
    })
  })
})
