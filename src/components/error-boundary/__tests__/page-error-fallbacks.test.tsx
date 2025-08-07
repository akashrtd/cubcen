import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import {
  AnalyticsErrorFallback,
  PlatformsErrorFallback,
  UsersErrorFallback,
  SettingsErrorFallback,
  DashboardErrorFallback,
} from '../page-error-fallbacks'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
})

const mockError = new Error('Test error message')
const mockResetError = jest.fn()
const mockErrorId = 'test-error-123'

describe('AnalyticsErrorFallback', () => {
  it('renders analytics-specific error message', () => {
    render(
      <AnalyticsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(screen.getByText('Analytics Dashboard Error')).toBeInTheDocument()
    expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByText(`Error ID: ${mockErrorId}`)).toBeInTheDocument()
  })

  it('shows analytics-specific troubleshooting tips', () => {
    render(
      <AnalyticsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(
      screen.getByText(/analytics data is being processed/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/api connection issues/i)).toBeInTheDocument()
    expect(screen.getByText(/date range filters/i)).toBeInTheDocument()
  })

  it('handles retry analytics button click', () => {
    render(
      <AnalyticsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const retryButton = screen.getByRole('button', { name: /retry analytics/i })
    fireEvent.click(retryButton)

    expect(mockResetError).toHaveBeenCalled()
  })

  it('handles back to dashboard button click', () => {
    render(
      <AnalyticsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const backButton = screen.getByRole('button', {
      name: /back to dashboard/i,
    })
    fireEvent.click(backButton)

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})

describe('PlatformsErrorFallback', () => {
  it('renders platforms-specific error message', () => {
    render(
      <PlatformsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(screen.getByText('Platform Management Error')).toBeInTheDocument()
    expect(screen.getByText(/platform management page/i)).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('shows platforms-specific troubleshooting tips', () => {
    render(
      <PlatformsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(screen.getByText(/platform api connectivity/i)).toBeInTheDocument()
    expect(screen.getByText(/authentication credentials/i)).toBeInTheDocument()
    expect(
      screen.getByText(/platform configuration errors/i)
    ).toBeInTheDocument()
  })

  it('handles retry platforms button click', () => {
    render(
      <PlatformsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const retryButton = screen.getByRole('button', { name: /retry platforms/i })
    fireEvent.click(retryButton)

    expect(mockResetError).toHaveBeenCalled()
  })
})

describe('UsersErrorFallback', () => {
  it('renders users-specific error message', () => {
    render(
      <UsersErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(screen.getByText('User Management Error')).toBeInTheDocument()
    expect(screen.getByText(/user management page/i)).toBeInTheDocument()
  })

  it('shows users-specific troubleshooting tips', () => {
    render(
      <UsersErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument()
    expect(screen.getByText(/user database connectivity/i)).toBeInTheDocument()
    expect(screen.getByText(/role-based access control/i)).toBeInTheDocument()
  })

  it('handles retry users button click', () => {
    render(
      <UsersErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const retryButton = screen.getByRole('button', { name: /retry users/i })
    fireEvent.click(retryButton)

    expect(mockResetError).toHaveBeenCalled()
  })
})

describe('SettingsErrorFallback', () => {
  it('renders settings-specific error message', () => {
    render(
      <SettingsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(screen.getByText('Settings Page Error')).toBeInTheDocument()
    expect(screen.getByText(/loading your settings/i)).toBeInTheDocument()
  })

  it('shows settings-specific troubleshooting tips', () => {
    render(
      <SettingsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(
      screen.getByText(/user preferences data corruption/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/settings api connectivity/i)).toBeInTheDocument()
    expect(
      screen.getByText(/security settings validation/i)
    ).toBeInTheDocument()
  })

  it('handles retry settings button click', () => {
    render(
      <SettingsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const retryButton = screen.getByRole('button', { name: /retry settings/i })
    fireEvent.click(retryButton)

    expect(mockResetError).toHaveBeenCalled()
  })
})

describe('DashboardErrorFallback', () => {
  it('renders dashboard-specific error message', () => {
    render(
      <DashboardErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(screen.getByText('Dashboard Error')).toBeInTheDocument()
    expect(
      screen.getByText(/critical error loading the dashboard/i)
    ).toBeInTheDocument()
  })

  it('shows dashboard-specific troubleshooting tips', () => {
    render(
      <DashboardErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(
      screen.getByText(/authentication session expired/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/core system connectivity/i)).toBeInTheDocument()
    expect(screen.getByText(/browser compatibility/i)).toBeInTheDocument()
  })

  it('handles retry dashboard button click', () => {
    render(
      <DashboardErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const retryButton = screen.getByRole('button', { name: /retry dashboard/i })
    fireEvent.click(retryButton)

    expect(mockResetError).toHaveBeenCalled()
  })

  it('handles reload page button click', () => {
    // Mock window.location.reload
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <DashboardErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const reloadButton = screen.getByRole('button', { name: /reload page/i })
    fireEvent.click(reloadButton)

    expect(mockReload).toHaveBeenCalled()
  })

  it('handles login again button click', () => {
    render(
      <DashboardErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const loginButton = screen.getByRole('button', { name: /login again/i })
    fireEvent.click(loginButton)

    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })
})

describe('Common functionality', () => {
  it('renders without error ID when not provided', () => {
    render(
      <AnalyticsErrorFallback error={mockError} resetError={mockResetError} />
    )

    expect(screen.queryByText(/error id:/i)).not.toBeInTheDocument()
  })

  it('displays error message correctly', () => {
    const customError = new Error('Custom error message')

    render(
      <AnalyticsErrorFallback
        error={customError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <AnalyticsErrorFallback
        error={mockError}
        resetError={mockResetError}
        errorId={mockErrorId}
      />
    )

    const retryButton = screen.getByRole('button', { name: /retry analytics/i })
    const backButton = screen.getByRole('button', {
      name: /back to dashboard/i,
    })

    expect(retryButton).toBeInTheDocument()
    expect(backButton).toBeInTheDocument()
  })
})
