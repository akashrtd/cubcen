import { render, screen, fireEvent } from '@testing-library/react'
import { TaskFilters } from '../task-filters'

const mockFilters = {
  status: 'ALL',
  priority: 'ALL',
  assignedAgent: 'ALL',
  platform: 'ALL',
  search: '',
}

const mockOnFiltersChange = jest.fn()

const mockAgents = [
  { id: 'agent-1', name: 'Test Agent 1', platformId: 'platform-1' },
  { id: 'agent-2', name: 'Test Agent 2', platformId: 'platform-2' },
]

const mockPlatforms = [
  { id: 'platform-1', name: 'n8n Instance', type: 'N8N' },
  { id: 'platform-2', name: 'Make Scenario', type: 'MAKE' },
]

describe('TaskFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all filter controls', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by agent')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by platform')).toBeInTheDocument()
  })

  it('displays current filter values', () => {
    const filtersWithValues = {
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedAgent: 'agent-1',
      platform: 'platform-1',
      search: 'test search',
    }

    render(
      <TaskFilters
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    expect(screen.getByDisplayValue('test search')).toBeInTheDocument()
    expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument()
    expect(screen.getByDisplayValue('High')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Agent 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('n8n Instance')).toBeInTheDocument()
  })

  it('handles search input changes', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search tasks...')
    fireEvent.change(searchInput, { target: { value: 'new search' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: 'new search',
    })
  })

  it('handles status filter changes', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const statusSelect = screen.getByLabelText('Filter by status')
    fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      status: 'IN_PROGRESS',
    })
  })

  it('handles priority filter changes', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const prioritySelect = screen.getByLabelText('Filter by priority')
    fireEvent.change(prioritySelect, { target: { value: 'HIGH' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      priority: 'HIGH',
    })
  })

  it('handles agent filter changes', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const agentSelect = screen.getByLabelText('Filter by agent')
    fireEvent.change(agentSelect, { target: { value: 'agent-1' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      assignedAgent: 'agent-1',
    })
  })

  it('handles platform filter changes', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const platformSelect = screen.getByLabelText('Filter by platform')
    fireEvent.change(platformSelect, { target: { value: 'platform-1' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      platform: 'platform-1',
    })
  })

  it('displays status options', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const statusSelect = screen.getByLabelText('Filter by status')
    expect(statusSelect).toContainHTML(
      '<option value="ALL">All Statuses</option>'
    )
    expect(statusSelect).toContainHTML('<option value="TODO">To Do</option>')
    expect(statusSelect).toContainHTML(
      '<option value="IN_PROGRESS">In Progress</option>'
    )
    expect(statusSelect).toContainHTML(
      '<option value="COMPLETED">Completed</option>'
    )
    expect(statusSelect).toContainHTML('<option value="FAILED">Failed</option>')
  })

  it('displays priority options', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const prioritySelect = screen.getByLabelText('Filter by priority')
    expect(prioritySelect).toContainHTML(
      '<option value="ALL">All Priorities</option>'
    )
    expect(prioritySelect).toContainHTML('<option value="LOW">Low</option>')
    expect(prioritySelect).toContainHTML(
      '<option value="MEDIUM">Medium</option>'
    )
    expect(prioritySelect).toContainHTML('<option value="HIGH">High</option>')
    expect(prioritySelect).toContainHTML(
      '<option value="CRITICAL">Critical</option>'
    )
  })

  it('displays agent options', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const agentSelect = screen.getByLabelText('Filter by agent')
    expect(agentSelect).toContainHTML('<option value="ALL">All Agents</option>')
    expect(agentSelect).toContainHTML(
      '<option value="agent-1">Test Agent 1</option>'
    )
    expect(agentSelect).toContainHTML(
      '<option value="agent-2">Test Agent 2</option>'
    )
  })

  it('displays platform options', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const platformSelect = screen.getByLabelText('Filter by platform')
    expect(platformSelect).toContainHTML(
      '<option value="ALL">All Platforms</option>'
    )
    expect(platformSelect).toContainHTML(
      '<option value="platform-1">n8n Instance</option>'
    )
    expect(platformSelect).toContainHTML(
      '<option value="platform-2">Make Scenario</option>'
    )
  })

  it('handles empty agents list', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={[]}
        platforms={mockPlatforms}
      />
    )

    const agentSelect = screen.getByLabelText('Filter by agent')
    expect(agentSelect).toContainHTML('<option value="ALL">All Agents</option>')
    // Should only have the "All Agents" option
    expect(agentSelect.children).toHaveLength(1)
  })

  it('handles empty platforms list', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={[]}
      />
    )

    const platformSelect = screen.getByLabelText('Filter by platform')
    expect(platformSelect).toContainHTML(
      '<option value="ALL">All Platforms</option>'
    )
    // Should only have the "All Platforms" option
    expect(platformSelect.children).toHaveLength(1)
  })

  it('clears all filters when clear button is clicked', () => {
    const filtersWithValues = {
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedAgent: 'agent-1',
      platform: 'platform-1',
      search: 'test search',
    }

    render(
      <TaskFilters
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    fireEvent.click(clearButton)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      status: 'ALL',
      priority: 'ALL',
      assignedAgent: 'ALL',
      platform: 'ALL',
      search: '',
    })
  })

  it('shows clear button only when filters are applied', () => {
    const { rerender } = render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    // Should not show clear button when no filters applied
    expect(
      screen.queryByRole('button', { name: /clear filters/i })
    ).not.toBeInTheDocument()

    // Should show clear button when filters are applied
    const filtersWithValues = {
      ...mockFilters,
      status: 'IN_PROGRESS',
    }

    rerender(
      <TaskFilters
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    expect(
      screen.getByRole('button', { name: /clear filters/i })
    ).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('debounces search input', async () => {
    jest.useFakeTimers()

    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search tasks...')

    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'a' } })
    fireEvent.change(searchInput, { target: { value: 'ab' } })
    fireEvent.change(searchInput, { target: { value: 'abc' } })

    // Should not call onChange immediately
    expect(mockOnFiltersChange).not.toHaveBeenCalled()

    // Fast-forward time to trigger debounce
    jest.advanceTimersByTime(300)

    // Should call onChange once with final value
    expect(mockOnFiltersChange).toHaveBeenCalledTimes(1)
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: 'abc',
    })

    jest.useRealTimers()
  })

  it('supports keyboard navigation', () => {
    render(
      <TaskFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        agents={mockAgents}
        platforms={mockPlatforms}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search tasks...')
    const statusSelect = screen.getByLabelText('Filter by status')

    // Test Tab navigation
    searchInput.focus()
    fireEvent.keyDown(searchInput, { key: 'Tab', code: 'Tab' })
    expect(statusSelect).toHaveFocus()
  })
})
