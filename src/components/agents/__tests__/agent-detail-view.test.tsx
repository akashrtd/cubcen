import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentDetailView } from '../agent-detail-view'

const mockAgent = {
  id: 'agent-1',
  name: 'Test Agent',
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
    details: {
      version: '1.0.0',
      uptime: '5 days',
    },
  },
  capabilities: ['webhook', 'http-request', 'data-transformation', 'email', 'database'],
  configuration: {
    timeout: 30000,
    retries: 3,
    environment: 'production',
  },
  description: 'Main automation agent for handling webhooks and data processing',
  createdAt: new Date('2024-01-01T09:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
}

const mockOnClose = jest.fn()
const mockOnEdit = jest.fn()
const mockOnDelete = jest.fn()

describe('AgentDetailView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    render(
      <AgentDetailView
        agent={null}
        loading={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    // Check for loading skeletons
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders agent details correctly', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('Main automation agent for handling webhooks and data processing')).toBeInTheDocument()
    expect(screen.getByText('n8n Instance')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays health status information', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('150ms')).toBeInTheDocument()
    expect(screen.getByText('1.0.0')).toBeInTheDocument()
    expect(screen.getByText('5 days')).toBeInTheDocument()
  })

  it('displays capabilities list', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('webhook')).toBeInTheDocument()
    expect(screen.getByText('http-request')).toBeInTheDocument()
    expect(screen.getByText('data-transformation')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('database')).toBeInTheDocument()
  })

  it('displays configuration details', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('30000')).toBeInTheDocument() // timeout
    expect(screen.getByText('3')).toBeInTheDocument() // retries
    expect(screen.getByText('production')).toBeInTheDocument() // environment
  })

  it('displays creation and update timestamps', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    // Should display relative time formats
    expect(screen.getByText(/ago/)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit when edit button is clicked', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockAgent)
  })

  it('calls onDelete when delete button is clicked', async () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    
    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    fireEvent.click(confirmButton)
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockAgent)
  })

  it('displays error health status correctly', () => {
    const agentWithError = {
      ...mockAgent,
      status: 'ERROR',
      healthStatus: {
        status: 'unhealthy',
        lastCheck: new Date('2024-01-01T10:00:00Z'),
        responseTime: 5000,
        error: 'Connection timeout',
        details: {},
      },
    }
    
    render(
      <AgentDetailView
        agent={agentWithError}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Unhealthy')).toBeInTheDocument()
    expect(screen.getByText('Connection timeout')).toBeInTheDocument()
  })

  it('displays maintenance status correctly', () => {
    const agentInMaintenance = {
      ...mockAgent,
      status: 'MAINTENANCE',
      healthStatus: {
        status: 'degraded',
        lastCheck: new Date('2024-01-01T10:00:00Z'),
        responseTime: 800,
        details: {},
      },
    }
    
    render(
      <AgentDetailView
        agent={agentInMaintenance}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
    expect(screen.getByText('Degraded')).toBeInTheDocument()
  })

  it('handles empty capabilities list', () => {
    const agentWithoutCapabilities = {
      ...mockAgent,
      capabilities: [],
    }
    
    render(
      <AgentDetailView
        agent={agentWithoutCapabilities}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('No capabilities defined')).toBeInTheDocument()
  })

  it('handles empty configuration', () => {
    const agentWithoutConfig = {
      ...mockAgent,
      configuration: {},
    }
    
    render(
      <AgentDetailView
        agent={agentWithoutConfig}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('No configuration set')).toBeInTheDocument()
  })

  it('handles missing description', () => {
    const agentWithoutDescription = {
      ...mockAgent,
      description: undefined,
    }
    
    render(
      <AgentDetailView
        agent={agentWithoutDescription}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('No description provided')).toBeInTheDocument()
  })

  it('displays platform type badge correctly', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('n8n')).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    
    // Test Enter key
    fireEvent.keyDown(editButton, { key: 'Enter', code: 'Enter' })
    
    // Test Space key
    fireEvent.keyDown(editButton, { key: ' ', code: 'Space' })
    
    // Should not throw errors
    expect(editButton).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        className="custom-class"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('cancels delete confirmation', async () => {
    render(
      <AgentDetailView
        agent={mockAgent}
        loading={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    
    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    
    // Cancel deletion
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnDelete).not.toHaveBeenCalled()
  })
})