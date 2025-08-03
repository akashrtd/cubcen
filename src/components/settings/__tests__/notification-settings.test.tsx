import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationSettings } from '../notification-settings'
import { NotificationEventType, NotificationChannelType } from '@/types/notification'
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
      fn({
        preferences: [],
        globalSettings: {
          emailEnabled: true,
          slackEnabled: true,
          pushEnabled: false,
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
          },
        },
      })
    },
    formState: { isDirty: true },
    watch: jest.fn().mockReturnValue(true),
  }),
}))

const mockPreferences = [
  {
    eventType: NotificationEventType.AGENT_DOWN,
    enabled: true,
    channels: [NotificationChannelType.EMAIL, NotificationChannelType.SLACK],
    frequency: 'immediate' as const,
    escalationDelay: 15,
  },
  {
    eventType: NotificationEventType.TASK_COMPLETED,
    enabled: false,
    channels: [NotificationChannelType.IN_APP],
    frequency: 'hourly' as const,
  },
]

const mockGlobalSettings = {
  emailEnabled: true,
  slackEnabled: true,
  pushEnabled: false,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
}

describe('NotificationSettings', () => {
  const mockOnSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders notification settings form', () => {
    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Global Notification Settings')).toBeInTheDocument()
    expect(screen.getByText('Event Notification Preferences')).toBeInTheDocument()
    expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    expect(screen.getByText('Slack Notifications')).toBeInTheDocument()
    expect(screen.getByText('Push Notifications')).toBeInTheDocument()
  })

  it('displays event types with correct information', () => {
    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Agent Down')).toBeInTheDocument()
    expect(screen.getByText('Task Completed')).toBeInTheDocument()
    expect(screen.getByText('When an agent becomes unavailable or stops responding')).toBeInTheDocument()
  })

  it('shows priority badges for events', () => {
    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('low')).toBeInTheDocument()
  })

  it('displays quiet hours settings when enabled', () => {
    const settingsWithQuietHours = {
      ...mockGlobalSettings,
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
      },
    }

    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={settingsWithQuietHours}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Quiet Hours')).toBeInTheDocument()
    expect(screen.getByText('Start Time')).toBeInTheDocument()
    expect(screen.getByText('End Time')).toBeInTheDocument()
  })

  it('shows notification channels for enabled events', () => {
    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Notification Channels')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Slack')).toBeInTheDocument()
    expect(screen.getByText('In-App')).toBeInTheDocument()
  })

  it('displays frequency and escalation options', () => {
    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Frequency')).toBeInTheDocument()
    expect(screen.getByText('Escalation Delay (minutes)')).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    mockOnSave.mockResolvedValue(undefined)

    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    })

    expect(toast.success).toHaveBeenCalledWith('Notification preferences saved successfully')
  })

  it('handles form submission error', async () => {
    mockOnSave.mockRejectedValue(new Error('Save failed'))

    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save notification preferences')
    })
  })

  it('disables save button when form is not dirty', () => {
    // Mock form as not dirty
    const mockUseForm = require('react-hook-form').useForm
    mockUseForm.mockReturnValue({
      control: {},
      handleSubmit: jest.fn(),
      formState: { isDirty: false },
      watch: jest.fn().mockReturnValue(true),
    })

    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    expect(saveButton).toBeDisabled()
  })

  it('shows loading state during save', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('renders all notification event types', () => {
    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    // Check that all event types are rendered
    expect(screen.getByText('Agent Down')).toBeInTheDocument()
    expect(screen.getByText('Agent Error')).toBeInTheDocument()
    expect(screen.getByText('Task Failed')).toBeInTheDocument()
    expect(screen.getByText('Task Completed')).toBeInTheDocument()
    expect(screen.getByText('Workflow Failed')).toBeInTheDocument()
    expect(screen.getByText('Workflow Completed')).toBeInTheDocument()
    expect(screen.getByText('System Error')).toBeInTheDocument()
    expect(screen.getByText('Health Check Failed')).toBeInTheDocument()
    expect(screen.getByText('Platform Disconnected')).toBeInTheDocument()
  })

  it('renders all notification channels', () => {
    render(
      <NotificationSettings
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    // Check that all channel types are rendered
    const emailElements = screen.getAllByText('Email')
    const slackElements = screen.getAllByText('Slack')
    const inAppElements = screen.getAllByText('In-App')

    expect(emailElements.length).toBeGreaterThan(0)
    expect(slackElements.length).toBeGreaterThan(0)
    expect(inAppElements.length).toBeGreaterThan(0)
  })
})