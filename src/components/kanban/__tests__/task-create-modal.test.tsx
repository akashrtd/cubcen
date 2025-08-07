import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskCreateModal } from '../task-create-modal'

const mockOnClose = jest.fn()
const mockOnSubmit = jest.fn()

const mockAgents = [
  { id: 'agent-1', name: 'Test Agent 1' },
  { id: 'agent-2', name: 'Test Agent 2' },
]

const mockPlatforms = [
  { id: 'platform-1', name: 'n8n Instance', type: 'N8N' },
  { id: 'platform-2', name: 'Make Scenario', type: 'MAKE' },
]

describe('TaskCreateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open is true', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    expect(screen.getByText('Create New Task')).toBeInTheDocument()
    expect(screen.getByText('Create a new automation task')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(
      <TaskCreateModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument()
  })

  it('displays all form fields', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    expect(screen.getByLabelText('Task Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
    expect(screen.getByLabelText('Assigned Agent')).toBeInTheDocument()
    expect(screen.getByLabelText('Platform')).toBeInTheDocument()
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
  })

  it('allows filling out the form', async () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const titleInput = screen.getByLabelText('Task Title')
    const descriptionInput = screen.getByLabelText('Description')

    fireEvent.change(titleInput, { target: { value: 'Test Task' } })
    fireEvent.change(descriptionInput, {
      target: { value: 'Test Description' },
    })

    expect(titleInput).toHaveValue('Test Task')
    expect(descriptionInput).toHaveValue('Test Description')
  })

  it('displays priority options', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const prioritySelect = screen.getByLabelText('Priority')
    fireEvent.click(prioritySelect)

    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('displays agent options', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const agentSelect = screen.getByLabelText('Assigned Agent')
    fireEvent.click(agentSelect)

    expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument()
  })

  it('displays platform options', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const platformSelect = screen.getByLabelText('Platform')
    fireEvent.click(platformSelect)

    expect(screen.getByText('n8n Instance')).toBeInTheDocument()
    expect(screen.getByText('Make Scenario')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const submitButton = screen.getByRole('button', { name: /create task/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    // Fill out required fields
    fireEvent.change(screen.getByLabelText('Task Title'), {
      target: { value: 'Test Task' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' },
    })

    // Select priority
    const prioritySelect = screen.getByLabelText('Priority')
    fireEvent.click(prioritySelect)
    fireEvent.click(screen.getByText('High'))

    // Select agent
    const agentSelect = screen.getByLabelText('Assigned Agent')
    fireEvent.click(agentSelect)
    fireEvent.click(screen.getByText('Test Agent 1'))

    // Select platform
    const platformSelect = screen.getByLabelText('Platform')
    fireEvent.click(platformSelect)
    fireEvent.click(screen.getByText('n8n Instance'))

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create task/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH',
        agentId: 'agent-1',
        platformId: 'platform-1',
        dueDate: expect.any(Date),
        status: 'TODO',
      })
    })
  })

  it('closes modal when cancel button is clicked', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('closes modal when close button is clicked', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('resets form when modal is reopened', () => {
    const { rerender } = render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    // Fill out form
    fireEvent.change(screen.getByLabelText('Task Title'), {
      target: { value: 'Test Task' },
    })

    // Close modal
    rerender(
      <TaskCreateModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    // Reopen modal
    rerender(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    // Form should be reset
    expect(screen.getByLabelText('Task Title')).toHaveValue('')
  })

  it('handles date picker', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const dueDateInput = screen.getByLabelText('Due Date')
    expect(dueDateInput).toBeInTheDocument()

    // Click to open date picker
    fireEvent.click(dueDateInput)

    // Should show calendar
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('displays loading state during submission', async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    // Fill out required fields
    fireEvent.change(screen.getByLabelText('Task Title'), {
      target: { value: 'Test Task' },
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create task/i })
    fireEvent.click(submitButton)

    // Should show loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('handles empty agents list', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={[]}
        platforms={mockPlatforms}
      />
    )

    const agentSelect = screen.getByLabelText('Assigned Agent')
    fireEvent.click(agentSelect)

    expect(screen.getByText('No agents available')).toBeInTheDocument()
  })

  it('handles empty platforms list', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={[]}
      />
    )

    const platformSelect = screen.getByLabelText('Platform')
    fireEvent.click(platformSelect)

    expect(screen.getByText('No platforms available')).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(
      <TaskCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const titleInput = screen.getByLabelText('Task Title')

    // Test Tab navigation
    fireEvent.keyDown(titleInput, { key: 'Tab', code: 'Tab' })

    // Test Escape to close
    fireEvent.keyDown(titleInput, { key: 'Escape', code: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
