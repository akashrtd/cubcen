import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserList } from '../user-list'

// Mock fetch
global.fetch = jest.fn()

const mockUsers = [
  {
    id: 'user_1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    status: 'active' as const,
    lastLoginAt: new Date('2024-01-15T10:00:00Z'),
    preferences: {
      theme: 'dark' as const,
      notifications: { email: true, push: true, slack: false },
      dashboard: { defaultView: 'grid' as const, refreshInterval: 30 },
    },
    activityStats: {
      totalLogins: 45,
      lastLogin: new Date('2024-01-15T10:00:00Z'),
      tasksCreated: 23,
      agentsManaged: 5,
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'user_2',
    name: 'Operator User',
    email: 'operator@example.com',
    role: 'OPERATOR' as const,
    status: 'active' as const,
    lastLoginAt: new Date('2024-01-14T15:30:00Z'),
    preferences: {
      theme: 'light' as const,
      notifications: { email: true, push: false, slack: true },
      dashboard: { defaultView: 'kanban' as const, refreshInterval: 60 },
    },
    activityStats: {
      totalLogins: 32,
      lastLogin: new Date('2024-01-14T15:30:00Z'),
      tasksCreated: 18,
      agentsManaged: 3,
    },
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-14T15:30:00Z'),
  },
  {
    id: 'user_3',
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: 'VIEWER' as const,
    status: 'inactive' as const,
    lastLoginAt: null,
    preferences: {
      theme: 'system' as const,
      notifications: { email: false, push: false, slack: false },
      dashboard: { defaultView: 'list' as const, refreshInterval: 120 },
    },
    activityStats: {
      totalLogins: 0,
      lastLogin: null,
      tasksCreated: 0,
      agentsManaged: 0,
    },
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
  },
]

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('UserList', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          users: mockUsers,
          pagination: {
            page: 1,
            limit: 50,
            total: mockUsers.length,
            totalPages: 1,
          },
        },
        message: 'Users retrieved successfully',
      }),
    } as Response)
  })

  it('renders loading state initially', () => {
    render(<UserList />)

    expect(screen.getByText('Users')).toBeInTheDocument()
    // Check for skeleton elements by their data-slot attribute
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders users list after loading', async () => {
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('Operator User')).toBeInTheDocument()
      expect(screen.getByText('Viewer User')).toBeInTheDocument()
    })

    expect(screen.getByText('Users (3)')).toBeInTheDocument()
  })

  it('displays user information correctly', async () => {
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    // Check user details
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
    expect(screen.getAllByText('active')).toHaveLength(2) // Two active users
    expect(screen.getByText('23 tasks')).toBeInTheDocument()
    expect(screen.getByText('5 agents')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search users...')
    fireEvent.change(searchInput, { target: { value: 'admin' } })

    expect(searchInput).toHaveValue('admin')
  })

  it('handles role filtering', async () => {
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    const roleSelect = screen.getByText('All Roles')
    fireEvent.click(roleSelect)

    const adminOption = screen.getByText('Admin')
    fireEvent.click(adminOption)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('role=ADMIN')
      )
    })
  })

  it('handles status filtering', async () => {
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    const statusSelect = screen.getByText('All Status')
    fireEvent.click(statusSelect)

    const activeOption = screen.getByText('Active')
    fireEvent.click(activeOption)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=active')
      )
    })
  })

  it('calls onUserSelect when user row is clicked', async () => {
    const onUserSelect = jest.fn()
    render(<UserList onUserSelect={onUserSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    const userRow = screen.getByText('Admin User').closest('tr')
    fireEvent.click(userRow!)

    expect(onUserSelect).toHaveBeenCalledWith(mockUsers[0])
  })

  it('calls onUserInvite when invite button is clicked', async () => {
    const onUserInvite = jest.fn()
    render(<UserList onUserInvite={onUserInvite} />)

    await waitFor(() => {
      expect(screen.getByText('Invite User')).toBeInTheDocument()
    })

    const inviteButton = screen.getByText('Invite User')
    fireEvent.click(inviteButton)

    expect(onUserInvite).toHaveBeenCalled()
  })

  it('renders dropdown menu trigger buttons', async () => {
    const onUserEdit = jest.fn()
    const onUserDelete = jest.fn()

    render(<UserList onUserEdit={onUserEdit} onUserDelete={onUserDelete} />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    // Check that dropdown trigger buttons are rendered
    const dropdownTriggers = screen.getAllByRole('button')
    const moreButtons = dropdownTriggers.filter(
      button => button.getAttribute('aria-expanded') === 'false'
    )

    expect(moreButtons.length).toBeGreaterThan(0)
  })

  it('formats last login correctly', async () => {
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    // Should show relative time for users with login
    expect(screen.getAllByText(/days ago|weeks ago|months ago/)).toHaveLength(2)

    // Should show "Never" for users without login
    expect(screen.getByText('Never')).toBeInTheDocument()
  })

  it('displays role badges with correct variants', async () => {
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    const adminBadge = screen.getByText('ADMIN')
    const operatorBadge = screen.getByText('OPERATOR')
    const viewerBadge = screen.getByText('VIEWER')

    // Check that badges have the correct styling classes
    expect(adminBadge.closest('[data-slot="badge"]')).toHaveClass(
      'bg-destructive'
    )
    expect(operatorBadge.closest('[data-slot="badge"]')).toHaveClass(
      'bg-primary'
    )
    expect(viewerBadge.closest('[data-slot="badge"]')).toHaveClass(
      'bg-secondary'
    )
  })

  it('displays status badges with correct variants', async () => {
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    const activeBadges = screen.getAllByText('active')
    const inactiveBadge = screen.getByText('inactive')

    activeBadges.forEach(badge => {
      expect(badge.closest('[data-slot="badge"]')).toHaveClass('bg-primary')
    })
    expect(inactiveBadge.closest('[data-slot="badge"]')).toHaveClass(
      'bg-secondary'
    )
  })

  it('handles API error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  it('shows empty state when no users found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
        },
        message: 'Users retrieved successfully',
      }),
    } as Response)

    render(<UserList onUserInvite={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument()
      expect(screen.getByText('Invite First User')).toBeInTheDocument()
    })
  })

  it('shows filtered empty state', async () => {
    // First render with users, then mock empty response
    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    // Mock empty response for search
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
        },
        message: 'Users retrieved successfully',
      }),
    } as Response)

    // Set a search term to trigger filtered state
    const searchInput = screen.getByPlaceholderText('Search users...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(
        screen.getByText('No users match your filters')
      ).toBeInTheDocument()
    })
  })
})
