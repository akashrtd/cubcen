import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationPreferences } from '../notification-preferences'

const mockPreferences = {
  email: {
    enabled: true,
    taskCompletion: true,
    taskFailure: true,
    agentErrors: true,
    systemAlerts: false,
    weeklyReports: true,
  },
  push: {
    enabled: true,
    taskCompletion: false,
    taskFailure: true,
    agentErrors: true,
    systemAlerts: true,
    weeklyReports: false,
  },
  slack: {
    enabled: false,
    taskCompletion: false,
    taskFailure: false,
    agentErrors: false,
    systemAlerts: false,
    weeklyReports: false,
    webhookUrl: '',
    channel: '#alerts',
  },
  frequency: 'immediate',
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
  },
}

const mockGlobalSettings = {
  emailEnabled: true,
  pushEnabled: true,
  slackEnabled: true,
  maintenanceMode: false,
}

const mockOnSave = jest.fn()

describe('NotificationPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all notification channels', () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    expect(screen.getByText('Slack Notifications')).toBeInTheDocument()
  })

  it('displays current preference values', () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    // Email preferences
    expect(
      screen.getByRole('checkbox', { name: /enable email notifications/i })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /task completion.*email/i })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /task failure.*email/i })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /agent errors.*email/i })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /system alerts.*email/i })
    ).not.toBeChecked()

    // Push preferences
    expect(
      screen.getByRole('checkbox', { name: /enable push notifications/i })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /task completion.*push/i })
    ).not.toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /task failure.*push/i })
    ).toBeChecked()

    // Slack preferences
    expect(
      screen.getByRole('checkbox', { name: /enable slack notifications/i })
    ).not.toBeChecked()
  })

  it('displays notification frequency setting', () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    expect(screen.getByDisplayValue('Immediate')).toBeInTheDocument()
  })

  it('displays quiet hours settings', () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    expect(
      screen.getByRole('checkbox', { name: /enable quiet hours/i })
    ).toBeChecked()
    expect(screen.getByDisplayValue('22:00')).toBeInTheDocument()
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument()
  })

  it('handles email notification toggle', async () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const emailToggle = screen.getByRole('checkbox', {
      name: /enable email notifications/i,
    })
    fireEvent.click(emailToggle)

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockPreferences,
        email: {
          ...mockPreferences.email,
          enabled: false,
        },
      })
    })
  })

  it('handles individual email preference changes', async () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const taskCompletionToggle = screen.getByRole('checkbox', {
      name: /task completion.*email/i,
    })
    fireEvent.click(taskCompletionToggle)

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockPreferences,
        email: {
          ...mockPreferences.email,
          taskCompletion: false,
        },
      })
    })
  })

  it('handles push notification toggle', async () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const pushToggle = screen.getByRole('checkbox', {
      name: /enable push notifications/i,
    })
    fireEvent.click(pushToggle)

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockPreferences,
        push: {
          ...mockPreferences.push,
          enabled: false,
        },
      })
    })
  })

  it('handles slack notification toggle', async () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const slackToggle = screen.getByRole('checkbox', {
      name: /enable slack notifications/i,
    })
    fireEvent.click(slackToggle)

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockPreferences,
        slack: {
          ...mockPreferences.slack,
          enabled: true,
        },
      })
    })
  })

  it('handles slack webhook URL changes', async () => {
    const preferencesWithSlackEnabled = {
      ...mockPreferences,
      slack: {
        ...mockPreferences.slack,
        enabled: true,
      },
    }

    render(
      <NotificationPreferences
        preferences={preferencesWithSlackEnabled}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    const webhookInput = screen.getByLabelText(/webhook url/i)
    fireEvent.change(webhookInput, {
      target: { value: 'https://hooks.slack.com/test' },
    })

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...preferencesWithSlackEnabled,
        slack: {
          ...preferencesWithSlackEnabled.slack,
          webhookUrl: 'https://hooks.slack.com/test',
        },
      })
    })
  })

  it('handles frequency changes', async () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const frequencySelect = screen.getByLabelText(/notification frequency/i)
    fireEvent.change(frequencySelect, { target: { value: 'hourly' } })

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockPreferences,
        frequency: 'hourly',
      })
    })
  })

  it('handles quiet hours toggle', async () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const quietHoursToggle = screen.getByRole('checkbox', {
      name: /enable quiet hours/i,
    })
    fireEvent.click(quietHoursToggle)

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockPreferences,
        quietHours: {
          ...mockPreferences.quietHours,
          enabled: false,
        },
      })
    })
  })

  it('handles quiet hours time changes', async () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const startTimeInput = screen.getByLabelText(/start time/i)
    fireEvent.change(startTimeInput, { target: { value: '23:00' } })

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockPreferences,
        quietHours: {
          ...mockPreferences.quietHours,
          start: '23:00',
        },
      })
    })
  })

  it('disables options when global settings are disabled', () => {
    const disabledGlobalSettings = {
      ...mockGlobalSettings,
      emailEnabled: false,
      pushEnabled: false,
    }

    render(
      <NotificationPreferences
        preferences={mockPreferences}
        globalSettings={disabledGlobalSettings}
        onSave={mockOnSave}
      />
    )

    expect(
      screen.getByRole('checkbox', { name: /enable email notifications/i })
    ).toBeDisabled()
    expect(
      screen.getByRole('checkbox', { name: /enable push notifications/i })
    ).toBeDisabled()
  })

  it('shows disabled state messages', () => {
    const disabledGlobalSettings = {
      ...mockGlobalSettings,
      emailEnabled: false,
    }

    render(
      <NotificationPreferences
        preferences={mockPreferences}
        globalSettings={disabledGlobalSettings}
        onSave={mockOnSave}
      />
    )

    expect(
      screen.getByText(/email notifications are disabled by administrator/i)
    ).toBeInTheDocument()
  })

  it('displays loading state during save', async () => {
    mockOnSave.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(saveButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText('Save Preferences')).toBeInTheDocument()
    })
  })

  it('resets form when reset button is clicked', () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    // Make a change
    const emailToggle = screen.getByRole('checkbox', {
      name: /enable email notifications/i,
    })
    fireEvent.click(emailToggle)

    // Reset form
    const resetButton = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetButton)

    // Should be back to original state
    expect(emailToggle).toBeChecked()
  })

  it('validates slack webhook URL format', async () => {
    const preferencesWithSlackEnabled = {
      ...mockPreferences,
      slack: {
        ...mockPreferences.slack,
        enabled: true,
      },
    }

    render(
      <NotificationPreferences
        preferences={preferencesWithSlackEnabled}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
      />
    )

    const webhookInput = screen.getByLabelText(/webhook url/i)
    fireEvent.change(webhookInput, { target: { value: 'invalid-url' } })

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid webhook url/i)
      ).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('shows success message after saving', async () => {
    render(
      <NotificationPreferences onSave={mockOnSave} />
    )

    const saveButton = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(
        screen.getByText(/preferences saved successfully/i)
      ).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <NotificationPreferences
        preferences={mockPreferences}
        globalSettings={mockGlobalSettings}
        onSave={mockOnSave}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
