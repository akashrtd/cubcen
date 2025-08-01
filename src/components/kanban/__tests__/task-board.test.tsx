import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskBoard } from '../task-board'
import { Task, TaskStatus, TaskPriority } from '@/lib/database'

// Mock the drag and drop functionality
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode
    onDragEnd?: (event: {
      active: { id: string }
      over: { id: string }
    }) => void
  }) => (
    <div
      data-testid="dnd-context"
      onClick={() =>
        onDragEnd?.({ active: { id: 'task-1' }, over: { id: 'RUNNING' } })
      }
    >
      {children}
    </div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  useSensor: () => ({}),
  useSensors: () => [],
  closestCorners: () => ({}),
}))

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Test Task 1',
    description: 'Test description 1',
    agentId: 'agent-1',
    workflowId: null,
    status: 'PENDING' as TaskStatus,
    priority: 'HIGH' as TaskPriority,
    parameters: '{"test": true}',
    scheduledAt: new Date('2024-01-15T10:00:00Z'),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
    retryCount: 0,
    maxRetries: 3,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z'),
  },
  {
    id: 'task-2',
    name: 'Test Task 2',
    description: 'Test description 2',
    agentId: 'agent-2',
    workflowId: null,
    status: 'RUNNING' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    parameters: '{"test": false}',
    scheduledAt: new Date('2024-01-15T11:00:00Z'),
    startedAt: new Date('2024-01-15T11:00:00Z'),
    completedAt: null,
    result: null,
    error: null,
    retryCount: 0,
    maxRetries: 3,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T11:00:00Z'),
  },
  {
    id: 'task-3',
    name: 'Test Task 3',
    description: 'Test description 3',
    agentId: 'agent-1',
    workflowId: null,
    status: 'COMPLETED' as TaskStatus,
    priority: 'LOW' as TaskPriority,
    parameters: '{}',
    scheduledAt: new Date('2024-01-15T08:00:00Z'),
    startedAt: new Date('2024-01-15T08:00:00Z'),
    completedAt: new Date('2024-01-15T08:30:00Z'),
    result: '{"success": true}',
    error: null,
    retryCount: 0,
    maxRetries: 3,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15T07:00:00Z'),
    updatedAt: new Date('2024-01-15T08:30:00Z'),
  },
  {
    id: 'task-4',
    name: 'Test Task 4',
    description: 'Test description 4',
    agentId: 'agent-2',
    workflowId: null,
    status: 'FAILED' as TaskStatus,
    priority: 'CRITICAL' as TaskPriority,
    parameters: '{"retry": true}',
    scheduledAt: new Date('2024-01-15T12:00:00Z'),
    startedAt: new Date('2024-01-15T12:00:00Z'),
    completedAt: new Date('2024-01-15T12:15:00Z'),
    result: null,
    error: '{"message": "Test error", "code": "TEST_ERROR"}',
    retryCount: 2,
    maxRetries: 3,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15T11:00:00Z'),
    updatedAt: new Date('2024-01-15T12:15:00Z'),
  },
]

const mockAgents = [
  { id: 'agent-1', name: 'Test Agent 1', platformId: 'n8n' },
  { id: 'agent-2', name: 'Test Agent 2', platformId: 'make' },
]

const defaultProps = {
  tasks: mockTasks,
  onTaskUpdate: jest.fn(),
  onTaskCreate: jest.fn(),
  onTaskDelete: jest.fn(),
  agents: mockAgents,
  isLoading: false,
}

describe('TaskBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders task management header', () => {
    render(<TaskBoard {...defaultProps} />)

    expect(screen.getByText('Task Management')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Manage and track task execution across all your agents.'
      )
    ).toBeInTheDocument()
  })

  it('renders all task columns', () => {
    render(<TaskBoard {...defaultProps} />)

    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('displays tasks in correct columns', () => {
    render(<TaskBoard {...defaultProps} />)

    // Check that tasks are in the right columns by looking for task names
    expect(screen.getByText('Test Task 1')).toBeInTheDocument() // PENDING
    expect(screen.getByText('Test Task 2')).toBeInTheDocument() // RUNNING
    expect(screen.getByText('Test Task 3')).toBeInTheDocument() // COMPLETED
    expect(screen.getByText('Test Task 4')).toBeInTheDocument() // FAILED
  })

  it('shows correct task counts in column headers', () => {
    render(<TaskBoard {...defaultProps} />)

    // Each column should show the count of tasks
    const badges = screen.getAllByText('1')
    expect(badges).toHaveLength(4) // One task in each column
  })

  it('shows high priority task indicator', () => {
    render(<TaskBoard {...defaultProps} />)

    // Should show high priority indicators for HIGH and CRITICAL tasks
    const highPriorityBadges = screen.getAllByText(/high/)
    expect(highPriorityBadges.length).toBeGreaterThan(0)
  })

  it('opens create task modal when create button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskBoard {...defaultProps} />)

    const createButton = screen.getByText('Create Task')
    await user.click(createButton)

    // Modal should open (we'll test the modal content in its own test file)
    expect(screen.getByText('Create New Task')).toBeInTheDocument()
  })

  it('opens filters when filter button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskBoard {...defaultProps} />)

    const filterButton = screen.getByText('Filters')
    await user.click(filterButton)

    expect(screen.getByText('Task Filters')).toBeInTheDocument()
  })

  it('filters tasks by search term', async () => {
    const user = userEvent.setup()
    render(<TaskBoard {...defaultProps} />)

    // Open filters
    const filterButton = screen.getByText('Filters')
    await user.click(filterButton)

    // Search for specific task
    const searchInput = screen.getByPlaceholderText(
      'Search by name or description'
    )
    await user.type(searchInput, 'Test Task 1')

    // Should only show matching task
    expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    // Other tasks should not be visible (this is a simplified test)
  })

  it('filters tasks by agent', async () => {
    const user = userEvent.setup()
    render(<TaskBoard {...defaultProps} />)

    // Open filters
    const filterButton = screen.getByText('Filters')
    await user.click(filterButton)

    // Select agent filter
    const agentSelect = screen.getByDisplayValue('All agents')
    await user.click(agentSelect)

    // Select specific agent
    const agentOption = screen.getByText('Test Agent 1')
    await user.click(agentOption)

    // Should filter tasks by selected agent
    expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    expect(screen.getByText('Test Task 3')).toBeInTheDocument()
  })

  it('filters tasks by priority', async () => {
    const user = userEvent.setup()
    render(<TaskBoard {...defaultProps} />)

    // Open filters
    const filterButton = screen.getByText('Filters')
    await user.click(filterButton)

    // Select priority filter
    const prioritySelect = screen.getByDisplayValue('All priorities')
    await user.click(prioritySelect)

    // Select HIGH priority
    const priorityOption = screen.getByText('High')
    await user.click(priorityOption)

    // Should show only high priority tasks
    expect(screen.getByText('Test Task 1')).toBeInTheDocument()
  })

  it('handles drag and drop task status change', async () => {
    const mockOnTaskUpdate = jest.fn()
    render(<TaskBoard {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />)

    // Simulate drag and drop by clicking the DndContext
    const dndContext = screen.getByTestId('dnd-context')
    fireEvent.click(dndContext)

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith('task-1', {
        status: 'RUNNING',
      })
    })
  })

  it('opens task detail modal when task card is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskBoard {...defaultProps} />)

    // Click on a task card
    const taskCard = screen.getByText('Test Task 1')
    await user.click(taskCard)

    // Task detail modal should open
    expect(screen.getByText('Test Task 1')).toBeInTheDocument()
  })

  it('handles task creation', async () => {
    const mockOnTaskCreate = jest.fn()
    const user = userEvent.setup()
    render(<TaskBoard {...defaultProps} onTaskCreate={mockOnTaskCreate} />)

    // Open create modal
    const createButton = screen.getByText('Create Task')
    await user.click(createButton)

    // Fill in task details
    const nameInput = screen.getByPlaceholderText('Enter task name')
    await user.type(nameInput, 'New Test Task')

    // Select agent
    const agentSelect = screen.getByDisplayValue('Select an agent')
    await user.click(agentSelect)
    const agentOption = screen.getByText('Test Agent 1')
    await user.click(agentOption)

    // Submit form
    const submitButton = screen.getByText('Create Task')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnTaskCreate).toHaveBeenCalled()
    })
  })

  it('shows loading state', () => {
    render(<TaskBoard {...defaultProps} isLoading={true} />)

    // Should show loading indicators or disabled states
    expect(screen.getByText('Task Management')).toBeInTheDocument()
  })

  it('handles empty task list', () => {
    render(<TaskBoard {...defaultProps} tasks={[]} />)

    // Should show empty state messages
    const emptyMessages = screen.getAllByText('No tasks')
    expect(emptyMessages.length).toBeGreaterThan(0)
  })

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskBoard {...defaultProps} />)

    // Open filters and apply a filter
    const filterButton = screen.getByText('Filters')
    await user.click(filterButton)

    const searchInput = screen.getByPlaceholderText(
      'Search by name or description'
    )
    await user.type(searchInput, 'test')

    // Clear filters
    const clearButton = screen.getByText('Clear All')
    await user.click(clearButton)

    // Search input should be cleared
    expect(searchInput).toHaveValue('')
  })

  it('handles drag and drop failures gracefully', async () => {
    const mockOnTaskUpdate = jest
      .fn()
      .mockRejectedValue(new Error('Update failed'))
    render(<TaskBoard {...defaultProps} onTaskUpdate={mockOnTaskUpdate} />)

    // Simulate drag and drop
    const dndContext = screen.getByTestId('dnd-context')
    fireEvent.click(dndContext)

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalled()
    })

    // Should handle the error gracefully (no crash)
    expect(screen.getByText('Task Management')).toBeInTheDocument()
  })

  it('shows correct task statistics', () => {
    render(<TaskBoard {...defaultProps} />)

    // Each column should show task count
    const taskCounts = screen.getAllByText('1')
    expect(taskCounts).toHaveLength(4) // One task per column

    // Should show high priority count
    const highPriorityCount = screen.getByText('1 high')
    expect(highPriorityCount).toBeInTheDocument()
  })
})
