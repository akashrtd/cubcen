import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskDetailModal } from '../task-detail-modal'
import { Task, TaskStatus, TaskPriority } from '@/lib/database'

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
  status: 'PENDING',
  priority: 'MEDIUM',
  parameters: '{"test": true, "value": 123}',
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
  isOpen: true,
  onClose: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  agents: mockAgents,
}

describe('TaskDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when task is null', () => {
    render(<TaskDetailModal {...defaultProps} task={null} />)

    expect(screen.queryByText('Test Task')).not.toBeInTheDocument()
  })

  it('does not render when modal is closed', () => {
    render(<TaskDetailModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Test Task')).not.toBeInTheDocument()
  })

  it('renders task name and status in header', () => {
    render(<TaskDetailModal {...defaultProps} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders all tab options', () => {
    render(<TaskDetailModal {...defaultProps} />)

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('Execution Logs')).toBeInTheDocument()
    expect(screen.getByText('Result')).toBeInTheDocument()
  })

  it('displays task information in overview tab', () => {
    render(<TaskDetailModal {...defaultProps} />)

    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    expect(screen.getByText('n8n')).toBeInTheDocument()
  })

  it('shows no description message when description is empty', () => {
    const taskWithoutDesc = createMockTask({ description: undefined })
    render(<TaskDetailModal {...defaultProps} task={taskWithoutDesc} />)

    expect(screen.getByText('No description provided')).toBeInTheDocument()
  })

  it('displays execution details correctly', () => {
    const runningTask = createMockTask({
      status: 'RUNNING',
      startedAt: new Date('2024-01-15T10:00:00Z'),
      retryCount: 1,
    })

    render(<TaskDetailModal {...defaultProps} task={runningTask} />)

    expect(screen.getByText('1 / 3')).toBeInTheDocument() // retry count
  })

  it('shows retry button for failed tasks', () => {
    const failedTask = createMockTask({ status: 'FAILED' })
    render(<TaskDetailModal {...defaultProps} task={failedTask} />)

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('shows cancel button for pending/running tasks', () => {
    const runningTask = createMockTask({ status: 'RUNNING' })
    render(<TaskDetailModal {...defaultProps} task={runningTask} />)

    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('always shows delete button', () => {
    render(<TaskDetailModal {...defaultProps} />)

    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onUpdate when retry button is clicked', async () => {
    const mockOnUpdate = jest.fn()
    const failedTask = createMockTask({ status: 'FAILED' })
    const user = userEvent.setup()

    render(
      <TaskDetailModal
        {...defaultProps}
        task={failedTask}
        onUpdate={mockOnUpdate}
      />
    )

    const retryButton = screen.getByText('Retry')
    await user.click(retryButton)

    expect(mockOnUpdate).toHaveBeenCalledWith('task-1', {
      status: TaskStatus.PENDING,
    })
  })

  it('calls onUpdate when cancel button is clicked', async () => {
    const mockOnUpdate = jest.fn()
    const runningTask = createMockTask({ status: 'RUNNING' })
    const user = userEvent.setup()

    render(
      <TaskDetailModal
        {...defaultProps}
        task={runningTask}
        onUpdate={mockOnUpdate}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(mockOnUpdate).toHaveBeenCalledWith('task-1', { status: 'CANCELLED' })
  })

  it('calls onDelete and onClose when delete button is clicked', async () => {
    const mockOnDelete = jest.fn()
    const mockOnClose = jest.fn()
    const user = userEvent.setup()

    render(
      <TaskDetailModal
        {...defaultProps}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    )

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('task-1')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('displays parameters in parameters tab', async () => {
    const user = userEvent.setup()
    render(<TaskDetailModal {...defaultProps} />)

    const parametersTab = screen.getByText('Parameters')
    await user.click(parametersTab)

    expect(screen.getByText(/"test": true/)).toBeInTheDocument()
    expect(screen.getByText(/"value": 123/)).toBeInTheDocument()
  })

  it('shows no parameters message when parameters are empty', async () => {
    const taskWithoutParams = createMockTask({ parameters: null })
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} task={taskWithoutParams} />)

    const parametersTab = screen.getByText('Parameters')
    await user.click(parametersTab)

    expect(screen.getByText('No parameters provided')).toBeInTheDocument()
  })

  it('displays execution logs for running task', async () => {
    const runningTask = createMockTask({
      status: 'RUNNING',
      startedAt: new Date('2024-01-15T10:00:00Z'),
    })
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} task={runningTask} />)

    const logsTab = screen.getByText('Execution Logs')
    await user.click(logsTab)

    expect(screen.getByText('Task execution started')).toBeInTheDocument()
    expect(screen.getByText('Task is currently running...')).toBeInTheDocument()
  })

  it('displays execution logs for completed task', async () => {
    const completedTask = createMockTask({
      status: 'COMPLETED',
      startedAt: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T10:30:00Z'),
    })
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} task={completedTask} />)

    const logsTab = screen.getByText('Execution Logs')
    await user.click(logsTab)

    expect(screen.getByText('Task execution started')).toBeInTheDocument()
    expect(screen.getByText('Task completed successfully')).toBeInTheDocument()
  })

  it('displays execution logs for failed task', async () => {
    const failedTask = createMockTask({
      status: 'FAILED',
      startedAt: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T10:15:00Z'),
      error: '{"message": "Database connection failed"}',
    })
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} task={failedTask} />)

    const logsTab = screen.getByText('Execution Logs')
    await user.click(logsTab)

    expect(screen.getByText('Task execution started')).toBeInTheDocument()
    expect(screen.getByText('Task execution failed')).toBeInTheDocument()
    expect(screen.getByText('Database connection failed')).toBeInTheDocument()
  })

  it('displays result in result tab', async () => {
    const completedTask = createMockTask({
      status: 'COMPLETED',
      result: '{"success": true, "processed": 100}',
    })
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} task={completedTask} />)

    const resultTab = screen.getByText('Result')
    await user.click(resultTab)

    expect(screen.getByText(/"success": true/)).toBeInTheDocument()
    expect(screen.getByText(/"processed": 100/)).toBeInTheDocument()
  })

  it('shows no result message when result is empty', async () => {
    const user = userEvent.setup()
    render(<TaskDetailModal {...defaultProps} />)

    const resultTab = screen.getByText('Result')
    await user.click(resultTab)

    expect(screen.getByText('No result data available')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = jest.fn()
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} onClose={mockOnClose} />)

    const closeButton = screen.getByText('Close')
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles agent not found gracefully', () => {
    const taskWithMissingAgent = createMockTask({ agentId: 'non-existent' })
    render(<TaskDetailModal {...defaultProps} task={taskWithMissingAgent} />)

    expect(screen.getByText('Agent not found')).toBeInTheDocument()
  })

  it('displays correct status colors and icons', () => {
    const criticalTask = createMockTask({
      status: 'FAILED',
      priority: 'CRITICAL',
    })

    render(<TaskDetailModal {...defaultProps} task={criticalTask} />)

    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    const task = createMockTask({
      createdAt: new Date('2024-01-15T09:00:00Z'),
      scheduledAt: new Date('2024-01-15T10:00:00Z'),
    })

    render(<TaskDetailModal {...defaultProps} task={task} />)

    // Should show formatted dates
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument()
  })

  it('shows execution duration for completed tasks', () => {
    const completedTask = createMockTask({
      status: 'COMPLETED',
      startedAt: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T10:02:30Z'), // 2.5 minutes later
    })

    render(<TaskDetailModal {...defaultProps} task={completedTask} />)

    expect(screen.getByText('150s')).toBeInTheDocument() // 2.5 minutes = 150 seconds
  })

  it('disables buttons while updating', async () => {
    const mockOnUpdate = jest.fn(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    const failedTask = createMockTask({ status: 'FAILED' })
    const user = userEvent.setup()

    render(
      <TaskDetailModal
        {...defaultProps}
        task={failedTask}
        onUpdate={mockOnUpdate}
      />
    )

    const retryButton = screen.getByText('Retry')
    await user.click(retryButton)

    // Button should be disabled while updating
    expect(retryButton).toBeDisabled()
  })

  it('disables delete button while deleting', async () => {
    const mockOnDelete = jest.fn(
      () => new Promise<void>(resolve => setTimeout(resolve, 100))
    )
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    // Button should be disabled while deleting
    expect(deleteButton).toBeDisabled()
  })

  it('handles malformed JSON in parameters gracefully', async () => {
    const taskWithBadParams = createMockTask({ parameters: 'invalid json' })
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} task={taskWithBadParams} />)

    const parametersTab = screen.getByText('Parameters')
    await user.click(parametersTab)

    // Should show the raw string instead of crashing
    expect(screen.getByText('invalid json')).toBeInTheDocument()
  })

  it('handles malformed JSON in result gracefully', async () => {
    const taskWithBadResult = createMockTask({ result: 'invalid json' })
    const user = userEvent.setup()

    render(<TaskDetailModal {...defaultProps} task={taskWithBadResult} />)

    const resultTab = screen.getByText('Result')
    await user.click(resultTab)

    // Should show the raw string instead of crashing
    expect(screen.getByText('invalid json')).toBeInTheDocument()
  })
})
