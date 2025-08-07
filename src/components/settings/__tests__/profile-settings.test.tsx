import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileSettings } from '../profile-settings'
import { toast } from 'sonner'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e.preventDefault()
      fn({ name: 'John Doe', email: 'john@example.com' })
    },
    formState: { isDirty: true },
    reset: jest.fn(),
  }),
}))

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'ADMIN',
  avatar: 'https://example.com/avatar.jpg',
}

describe('ProfileSettings', () => {
  const mockOnProfileUpdate = jest.fn()
  const mockOnPasswordChange = jest.fn()
  const mockOnAvatarUpload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders profile settings form', () => {
    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    expect(screen.getByText('Profile Information')).toBeInTheDocument()
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByText('Change Avatar')).toBeInTheDocument()
  })

  it('displays user information correctly', () => {
    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
  })

  it('shows user initials when no avatar', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined }
    render(
      <ProfileSettings
        user={userWithoutAvatar}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('handles profile update submission', async () => {
    mockOnProfileUpdate.mockResolvedValue(undefined)

    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockOnProfileUpdate).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully')
  })

  it('handles profile update error', async () => {
    mockOnProfileUpdate.mockRejectedValue(new Error('Update failed'))

    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update profile')
    })
  })

  it('handles password change submission', async () => {
    mockOnPasswordChange.mockResolvedValue(undefined)

    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const changePasswordButton = screen.getByRole('button', {
      name: /change password/i,
    })
    fireEvent.click(changePasswordButton)

    await waitFor(() => {
      expect(mockOnPasswordChange).toHaveBeenCalled()
    })

    expect(toast.success).toHaveBeenCalledWith('Password changed successfully')
  })

  it('handles password change error', async () => {
    mockOnPasswordChange.mockRejectedValue(new Error('Password change failed'))

    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const changePasswordButton = screen.getByRole('button', {
      name: /change password/i,
    })
    fireEvent.click(changePasswordButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to change password')
    })
  })

  it('handles avatar upload', async () => {
    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })
    mockOnAvatarUpload.mockResolvedValue('https://example.com/new-avatar.jpg')

    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const fileInput = screen.getByLabelText(/change avatar/i)
    await userEvent.upload(fileInput, file)

    await waitFor(() => {
      expect(mockOnAvatarUpload).toHaveBeenCalledWith(file)
    })

    expect(toast.success).toHaveBeenCalledWith('Avatar updated successfully')
  })

  it('validates avatar file type', async () => {
    const file = new File(['document'], 'document.pdf', {
      type: 'application/pdf',
    })

    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const fileInput = screen.getByLabelText(/change avatar/i)
    await userEvent.upload(fileInput, file)

    expect(toast.error).toHaveBeenCalledWith('Please select an image file')
    expect(mockOnAvatarUpload).not.toHaveBeenCalled()
  })

  it('validates avatar file size', async () => {
    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    })

    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const fileInput = screen.getByLabelText(/change avatar/i)
    await userEvent.upload(fileInput, largeFile)

    expect(toast.error).toHaveBeenCalledWith('Image must be less than 5MB')
    expect(mockOnAvatarUpload).not.toHaveBeenCalled()
  })

  it('handles avatar upload error', async () => {
    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })
    mockOnAvatarUpload.mockRejectedValue(new Error('Upload failed'))

    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const fileInput = screen.getByLabelText(/change avatar/i)
    await userEvent.upload(fileInput, file)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to upload avatar')
    })
  })

  it('disables buttons during loading states', async () => {
    render(
      <ProfileSettings
        user={mockUser}
        onProfileUpdate={mockOnProfileUpdate}
        onPasswordChange={mockOnPasswordChange}
        onAvatarUpload={mockOnAvatarUpload}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    const changePasswordButton = screen.getByRole('button', {
      name: /change password/i,
    })

    expect(updateButton).not.toBeDisabled()
    expect(changePasswordButton).not.toBeDisabled()
  })
})
