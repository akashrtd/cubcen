import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserForm } from '../user-form'

const mockUser = {
  id: 'user_1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'OPERATOR' as const,
  status: 'active' as const,
  preferences: {
    theme: 'dark' as const,
    notifications: {
      email: true,
      push: false,
      slack: true,
    },
    dashboard: {
      defaultView: 'kanban' as const,
      refreshInterval: 60,
    },
  },
}

describe('UserForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnCancel.mockClear()
  })

  describe('Create Mode', () => {
    it('renders create user form correctly', () => {
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getAllByText('Create User')).toHaveLength(2) // Title and button
      expect(
        screen.getByRole('button', { name: 'Create User' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('calls onCancel when cancel button is clicked', () => {
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Edit Mode', () => {
    it('renders edit user form with existing data', () => {
      render(
        <UserForm
          user={mockUser}
          mode="edit"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Edit User')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Update User' })
      ).toBeInTheDocument()
    })
  })

  describe('Invite Mode', () => {
    it('renders invite user form correctly', () => {
      render(
        <UserForm
          mode="invite"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Invite User')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Send Invitation' })
      ).toBeInTheDocument()
    })
  })
})
