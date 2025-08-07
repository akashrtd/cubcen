import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UsersPage from '../page'

// Mock the child components
jest.mock('@/components/users/user-list', () => ({
  UserList: ({ onUserInvite, onUserEdit, onUserDelete, onUserSelect }: any) => (
    <div data-testid="user-list">
      <button onClick={() => onUserInvite()}>Mock Invite</button>
      <button
        onClick={() =>
          onUserEdit({
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            status: 'active',
          })
        }
      >
        Mock Edit
      </button>
      <button
        onClick={() =>
          onUserDelete({
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            status: 'suspended',
          })
        }
      >
        Mock Delete
      </button>
      <button
        onClick={() =>
          onUserSelect({
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            status: 'active',
          })
        }
      >
        Mock Select
      </button>
    </div>
  ),
}))

jest.mock('@/components/users/user-form', () => ({
  UserForm: ({ mode, onSubmit, onCancel }: any) => (
    <div data-testid="user-form">
      <span>Form Mode: {mode}</span>
      <button
        onClick={() =>
          onSubmit({ name: 'Test User', email: 'test@example.com' })
        }
      >
        Submit Form
      </button>
      <button onClick={onCancel}>Cancel Form</button>
    </div>
  ),
}))

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock console.log for user selection test
const originalConsoleLog = console.log

// Mock window.confirm
global.confirm = jest.fn()

describe('UsersPage', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Clear mocks
    ;(global.confirm as jest.Mock).mockClear()

    // Mock the initial users fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          users: [],
        },
      }),
    } as Response)
  })

  it('renders the users page correctly', () => {
    render(<UsersPage />)

    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Manage user accounts, roles, and permissions with full audit trail logging'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Invite User' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create User' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('user-list')).toBeInTheDocument()
  })

  it('opens invite form when invite button is clicked', async () => {
    render(<UsersPage />)

    const inviteButton = screen.getByRole('button', { name: 'Invite User' })
    fireEvent.click(inviteButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
      expect(screen.getByText('Form Mode: invite')).toBeInTheDocument()
      expect(screen.getAllByText('Invite User')).toHaveLength(2) // Button and dialog title
    })
  })

  it('opens create form when create button is clicked', async () => {
    render(<UsersPage />)

    const createButton = screen.getByRole('button', { name: 'Create User' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
      expect(screen.getByText('Form Mode: create')).toBeInTheDocument()
      expect(screen.getAllByText('Create User')).toHaveLength(2) // Button and dialog title
    })
  })

  it('opens edit form when edit is triggered from user list', async () => {
    render(<UsersPage />)

    const editButton = screen.getByText('Mock Edit')
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
      expect(screen.getByText('Form Mode: edit')).toBeInTheDocument()
      expect(screen.getByText('Edit User')).toBeInTheDocument()
    })
  })

  it('handles form submission for creating user', async () => {
    // Mock the second fetch call for user creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { user: { id: '1', name: 'Test User' } },
      }),
    } as Response)

    render(<UsersPage />)

    // Open create form
    const createButton = screen.getByRole('button', { name: 'Create User' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
    })

    // Submit form
    const submitButton = screen.getByText('Submit Form')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/cubcen/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          auditTrail: true,
          action: 'create',
        }),
      })
    })
  })

  it('handles form submission for editing user', async () => {
    // Mock the second fetch call for user update
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { user: { id: '1', name: 'Test User' } },
      }),
    } as Response)

    render(<UsersPage />)

    // Open edit form
    const editButton = screen.getByText('Mock Edit')
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
    })

    // Submit form
    const submitButton = screen.getByText('Submit Form')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/cubcen/v1/users/1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          auditTrail: true,
          action: 'update',
        }),
      })
    })
  })

  it('handles user deletion with confirmation', async () => {
    ;(global.confirm as jest.Mock).mockReturnValue(true)
    // Mock the second fetch call for user status update
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<UsersPage />)

    const deleteButton = screen.getByText('Mock Delete')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to reactivate Test User? This action will be logged for audit purposes.'
      )
      expect(mockFetch).toHaveBeenCalledWith('/api/cubcen/v1/users/1/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'active',
          reason: 'User reactivated by administrator',
          auditTrail: true,
        }),
      })
    })
  })

  it('cancels user deletion when not confirmed', async () => {
    ;(global.confirm as jest.Mock).mockReturnValue(false)

    render(<UsersPage />)

    const deleteButton = screen.getByText('Mock Delete')
    fireEvent.click(deleteButton)

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to reactivate Test User? This action will be logged for audit purposes.'
    )
    // Should only have been called once for the initial fetch
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('closes form when cancel is clicked', async () => {
    render(<UsersPage />)

    // Open create form
    const createButton = screen.getByRole('button', { name: 'Create User' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
    })

    // Cancel form
    const cancelButton = screen.getByText('Cancel Form')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByTestId('user-form')).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock the second fetch call to fail
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<UsersPage />)

    // Open create form
    const createButton = screen.getByRole('button', { name: 'Create User' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
    })

    // Submit form
    const submitButton = screen.getByText('Submit Form')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2) // Initial fetch + failed create
      // Form should still be open on error
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
    })
  })

  it('handles user selection', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    render(<UsersPage />)

    const selectButton = screen.getByText('Mock Select')
    fireEvent.click(selectButton)

    expect(consoleSpy).toHaveBeenCalledWith('Selected user:', {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      status: 'active',
    })

    consoleSpy.mockRestore()
  })

  it('opens invite form from user list', async () => {
    render(<UsersPage />)

    const inviteButton = screen.getByText('Mock Invite')
    fireEvent.click(inviteButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument()
      expect(screen.getByText('Form Mode: invite')).toBeInTheDocument()
    })
  })
})
