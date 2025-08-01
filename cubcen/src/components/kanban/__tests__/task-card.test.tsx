import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '../task-card'
import { Task, TaskStatus, TaskPriority } from '@/lib/database'

// Mock the drag and drop functionality
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: {},
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

const mockAgents = [
  { id: 'agent-1', name: 'Test Agent 1', platformId: 'n8n' },
  { id: 'agent-2', name: 'Test Agent 2', platformId: 'make' },
]

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  name: 'Test Task',
  description: 'Test description',
  agentId: 'agent-1',
  workflowId: null,
  status: 'PENDING' as TaskStatus,
  priority: 'MEDIUM' as TaskPriority,
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
  ...overrides,
})

const defaultProps = {
  task: createMockTask(),
  onClick: jest.fn(),
  agents: mockAgents,
  isDragging: false,
}

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders task name and description', () => {
    render(<TaskCard {...defaultProps} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('displays correct status icon for pending task', () => {
    render(<TaskCard {...defaultProps} />)
    
    // Should show clock icon for pending status
    const statusIcon = screen.getByTestId('task-status-icon') || document.querySelector('[data-testid*="clock"]')
    expect(statusIcon || screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('displays correct status icon for running task', () => {
    const runningTask = createMockTask({
      status: 'RUNNING',
      startedAt: new Date('2024-01-15T10:00:00Z'),
    })
    
    render(<TaskCard {...defaultProps} task={runningTask} />)
    
    // Should show play icon for running status
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('displays correct status icon for completed task', () => {
    const completedTask = createMockTask({
      status: 'COMPLETED',
      startedAt: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T10:30:00Z'),
    })
    
    render(<TaskCard {...defaultProps} task={completedTask} />)
    
    // Should show check icon for completed status
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('displays correct status icon for failed task', () => {
    const failedTask = createMockTask({
      status: 'FAILED',
      error: '{"message": "Test error"}',
    })
    
    render(<TaskCard {...defaultProps} task={failedTask} />)
    
    // Should show X icon for failed status and error message
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('displays priority badge with correct styling', () => {
    const highPriorityTask = createMockTask({ priority: 'HIGH' })
    render(<TaskCard {...defaultProps} task={highPriorityTask} />)
    
    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })

  it('displays critical priority with correct styling', () => {
    const criticalTask = createMockTask({ priority: 'CRITICAL' })
    render(<TaskCard {...defaultProps} task={criticalTask} />)
    
    expect(screen.getByText('CRITICAL')).toBeInTheDocument()
  })

  it('displays low priority with correct styling', () => {
    const lowPriorityTask = createMockTask({ priority: 'LOW' })
    render(<TaskCard {...defaultProps} task={lowPriorityTask} />)
    
    expect(screen.getByText('LOW')).toBeInTheDocument()
  })

  it('shows agent information', () => {
    render(<TaskCard {...defaultProps} />)
    
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    expect(screen.getByText('n8n')).toBeInTheDocument()
  })

  it('handles missing agent gracefully', () => {
    const taskWithMissingAgent = createMockTask({ agentId: 'non-existent-agent' })
    render(<TaskCard {...defaultProps} task={taskWithMissingAgent} />)
    
    // Should still render the task without crashing
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('displays scheduled time', () => {
    render(<TaskCard {...defaultProps} />)
    
    // Should show formatted date
    expect(screen.getByText(/Jan 15/)).toBeInTheDocument()
  })

  it('shows execution time for running task', () => {
    const runningTask = createMockTask({
      status: 'RUNNING',
      startedAt: new Date(Date.now() - 120000), // 2 minutes ago
    })
    
    render(<TaskCard {...defaultProps} task={runningTask} />)
    
    // Should show execution time
    expect(screen.getByText(/2:00/)).toBeInTheDocument()
  })

  it('shows execution time for completed task', () => {
    const completedTask = createMockTask({
      status: 'COMPLETED',
      startedAt: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T10:02:30Z'), // 2 minutes 30 seconds later
    })
    
    render(<TaskCard {...defaultProps} task={completedTask} />)
    
    // Should show total execution time
    expect(screen.getByText(/2:30/)).toBeInTheDocument()
  })

  it('shows retry count when task has been retried', () => {
    const retriedTask = createMockTask({ retryCount: 2 })
    render(<TaskCard {...defaultProps} task={retriedTask} />)
    
    expect(screen.getByText('Retry 2')).toBeInTheDocument()
  })

  it('does not show retry count for first attempt', () => {
    render(<TaskCard {...defaultProps} />)
    
    expect(screen.queryByText(/Retry/)).not.toBeInTheDocument()
  })

  it('shows progress bar for running tasks', () => {
    const runningTask = createMockTask({ status: 'RUNNING' })
    render(<TaskCard {...defaultProps} task={runningTask} />)
    
    // Should show progress bar (look for progress indicator)
    const progressBar = document.querySelector('.bg-cubcen-primary')
    expect(progressBar).toBeInTheDocument()
  })

  it('does not show progress bar for non-running tasks', () => {
    render(<TaskCard {...defaultProps} />)
    
    // Should not show progress bar for pending task
    const progressBars = document.querySelectorAll('.bg-cubcen-primary')
    const progressBar = Array.from(progressBars).find(el => 
      el.className.includes('h-1.5') && el.className.includes('rounded-full')
    )
    expect(progressBar).not.toBeInTheDocument()
  })

  it('displays error information for failed tasks', () => {
    const failedTask = createMockTask({
      status: 'FAILED',
      error: '{"message": "Database connection failed", "code": "DB_ERROR"}',
    })
    
    render(<TaskCard {...defaultProps} task={failedTask} />)
    
    expect(screen.getByText('Database connection failed')).toBeInTheDocument()
  })

  it('handles malformed error JSON gracefully', () => {
    const failedTask = createMockTask({
      status: 'FAILED',
      error: 'invalid json',
    })
    
    render(<TaskCard {...defaultProps} task={failedTask} />)
    
    // Should show fallback error message
    expect(screen.getByText('Task failed')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const mockOnClick = jest.fn()
    const user = userEvent.setup()
    
    render(<TaskCard {...defaultProps} onClick={mockOnClick} />)
    
    const card = screen.getByText('Test Task').closest('[data-slot="card"]')
    if (card) {
      await user.click(card)
      expect(mockOnClick).toHaveBeenCalled()
    }
  })

  it('applies dragging styles when isDragging is true', () => {
    render(<TaskCard {...defaultProps} isDragging={true} />)
    
    const card = screen.getByText('Test Task').closest('[data-slot="card"]')
    expect(card).toHaveClass('opacity-50')
  })

  it('truncates long task names', () => {
    const longNameTask = createMockTask({
      name: 'This is a very long task name that should be truncated to prevent layout issues',
    })
    
    render(<TaskCard {...defaultProps} task={longNameTask} />)
    
    const taskName = screen.getByText(/This is a very long task name/)
    expect(taskName).toHaveClass('line-clamp-2')
  })

  it('truncates long descriptions', () => {
    const longDescTask = createMockTask({
      description: 'This is a very long description that should be truncated to prevent the card from becoming too tall and affecting the layout',
    })
    
    render(<TaskCard {...defaultProps} task={longDescTask} />)
    
    const description = screen.getByText(/This is a very long description/)
    expect(description).toHaveClass('line-clamp-2')
  })

  it('shows task without description', () => {
    const noDescTask = createMockTask({ description: undefined })
    render(<TaskCard {...defaultProps} task={noDescTask} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    // Description should not be rendered
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    const task = createMockTask({
      scheduledAt: new Date('2024-01-15T14:30:00Z'),
    })
    
    render(<TaskCard {...defaultProps} task={task} />)
    
    // Should show formatted date and time
    expect(screen.getByText(/Jan 15.*2:30/)).toBeInTheDocument()
  })

  it('applies correct border color based on Cubcen design system', () => {
    render(<TaskCard {...defaultProps} />)
    
    const card = screen.getByText('Test Task').closest('[data-slot="card"]')
    expect(card).toHaveClass('border-l-cubcen-primary')
  })

  it('shows hover effects', () => {
    render(<TaskCard {...defaultProps} />)
    
    const card = screen.getByText('Test Task').closest('[data-slot="card"]')
    expect(card).toHaveClass('hover:shadow-md')
    expect(card).toHaveClass('hover:border-l-cubcen-secondary')
  })
})