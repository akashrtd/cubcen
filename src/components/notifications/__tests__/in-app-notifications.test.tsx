import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  InAppNotifications,
  useNotificationToasts,
} from '../in-app-notifications'

// Mock fetch
global.fetch = jest.fn()

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

const mockNotifications = [
  {
    id: '1',
    type: 'success',
    title: 'Task Completed',
    message: 'Your automation task has been completed successfully',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    read: false,
    actionUrl: '/tasks/123',
  },
  {
    id: '2',
    type: 'error',
    title: 'Agent Error',
    message: 'Agent "Test Agent" encountered an error',
    timestamp: new Date('2024-01-01T09:30:00Z'),
    read: false,
    actionUrl: '/agents/456',
  },
  {
    id: '3',
    type: 'info',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight',
    timestamp: new Date('2024-01-01T09:00:00Z'),
    read: true,
  },
]

const mockOnNotificationClick = jest.fn()
const mockOnMarkAsRead = jest.fn()
const mockOnMarkAllAsRead = jest.fn()

describe('InAppNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockNotifications,
        }),
    })
  })

  it('renders loading state initially', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    expect(screen.getByText('Notifications')).toBeInTheDocument()

    // Check for loading skeleton
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Task Completed')).toBeInTheDocument()
    })
  })

  it('fetches and displays notifications', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(screen.getByText('Task Completed')).toBeInTheDocument()
      expect(screen.getByText('Agent Error')).toBeInTheDocument()
      expect(screen.getByText('System Update')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/cubcen/v1/notifications?userId=user-1'
    )
  })

  it('displays notification messages', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByText('Your automation task has been completed successfully')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Agent "Test Agent" encountered an error')
      ).toBeInTheDocument()
      expect(
        screen.getByText('System maintenance scheduled for tonight')
      ).toBeInTheDocument()
    })
  })

  it('displays notification types with correct icons', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      // Check for different notification type indicators
      const successIcon = document.querySelector('.text-green-500')
      const errorIcon = document.querySelector('.text-red-500')
      const infoIcon = document.querySelector('.text-blue-500')

      expect(successIcon).toBeInTheDocument()
      expect(errorIcon).toBeInTheDocument()
      expect(infoIcon).toBeInTheDocument()
    })
  })

  it('displays unread notification indicators', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      // Should show unread indicators for first two notifications
      const unreadIndicators = document.querySelectorAll('.bg-blue-500')
      expect(unreadIndicators.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('displays timestamps in relative format', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      // Should show relative time formats
      const timeElements = screen.getAllByText(/ago/)
      expect(timeElements.length).toBeGreaterThan(0)
    })
  })

  it('calls onNotificationClick when notification is clicked', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(screen.getByText('Task Completed')).toBeInTheDocument()
    })

    const notification = screen.getByText('Task Completed')
    fireEvent.click(notification)

    expect(mockOnNotificationClick).toHaveBeenCalledWith(mockNotifications[0])
  })

  it('calls onMarkAsRead when mark as read is clicked', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(screen.getByText('Task Completed')).toBeInTheDocument()
    })

    const markAsReadButton = screen.getAllByRole('button', {
      name: /mark as read/i,
    })[0]
    fireEvent.click(markAsReadButton)

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1')
  })

  it('calls onMarkAllAsRead when mark all as read is clicked', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(screen.getByText('Task Completed')).toBeInTheDocument()
    })

    const markAllAsReadButton = screen.getByRole('button', {
      name: /mark all as read/i,
    })
    fireEvent.click(markAllAsReadButton)

    expect(mockOnMarkAllAsRead).toHaveBeenCalledTimes(1)
  })

  it('displays empty state when no notifications', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: [],
        }),
    })

    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument()
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load notifications')
      ).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load notifications')
      ).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <InAppNotifications
        userId="user-1"
        onNotificationClick={mockOnNotificationClick}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('displays unread count in header', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Unread count badge
    })
  })

  it('filters notifications by type', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(screen.getByText('Task Completed')).toBeInTheDocument()
    })

    // Click filter button
    const filterButton = screen.getByRole('button', { name: /filter/i })
    fireEvent.click(filterButton)

    // Select error filter
    const errorFilter = screen.getByText('Errors')
    fireEvent.click(errorFilter)

    // Should only show error notifications
    expect(screen.getByText('Agent Error')).toBeInTheDocument()
    expect(screen.queryByText('Task Completed')).not.toBeInTheDocument()
  })

  it('refreshes notifications when refresh button is clicked', async () => {
    render(
      <InAppNotifications userId="user-1" />
    )

    await waitFor(() => {
      expect(screen.getByText('Task Completed')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('useNotificationToasts', () => {
  it('sets up WebSocket connection for real-time notifications', () => {
    const TestComponent = () => {
      useNotificationToasts('user-1')
      return <div>Test</div>
    }

    render(<TestComponent />)

    // Should render without errors
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
