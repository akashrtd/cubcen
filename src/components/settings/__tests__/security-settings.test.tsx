import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SecuritySettings } from '../security-settings'
import { toast } from 'sonner'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock form components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormField: ({ render }: { render: (props: any) => React.ReactNode }) => 
    render({ field: { value: false, onChange: jest.fn() } }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    setValue: jest.fn(),
    formState: { errors: {} },
  }),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
})

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

const mockActiveSessions = [
  {
    id: '1',
    deviceName: 'MacBook Pro',
    deviceType: 'desktop' as const,
    browser: 'Chrome 120',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.1',
    lastActive: new Date('2024-01-15T10:30:00Z'),
    current: true,
  },
  {
    id: '2',
    deviceName: 'iPhone 15',
    deviceType: 'mobile' as const,
    browser: 'Safari 17',
    location: 'New York, NY',
    ipAddress: '192.168.1.2',
    lastActive: new Date('2024-01-14T15:45:00Z'),
    current: false,
  },
]

const mockAuditLogs = [
  {
    id: '1',
    event: 'Login',
    description: 'Successful login from new device',
    ipAddress: '192.168.1.1',
    location: 'San Francisco, CA',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    severity: 'low' as const,
  },
  {
    id: '2',
    event: 'Failed Login',
    description: 'Failed login attempt with incorrect password',
    ipAddress: '192.168.1.3',
    location: 'Unknown',
    timestamp: new Date('2024-01-14T20:15:00Z'),
    severity: 'medium' as const,
  },
]

describe('SecuritySettings', () => {
  const mockOnToggleTwoFactor = jest.fn()
  const mockOnTerminateSession = jest.fn()
  const mockOnTerminateAllSessions = jest.fn()
  const mockOnDownloadBackupCodes = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders security settings components', () => {
    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
    expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    expect(screen.getByText('Security Audit Log')).toBeInTheDocument()
  })

  it('displays two-factor authentication status correctly', () => {
    render(
      <SecuritySettings
        twoFactorEnabled={true}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    expect(screen.getByText('Two-factor authentication is enabled')).toBeInTheDocument()
    expect(screen.getByText('Download Backup Codes')).toBeInTheDocument()
  })

  it('handles two-factor authentication toggle', async () => {
    mockOnToggleTwoFactor.mockResolvedValue({
      qrCode: 'data:image/png;base64,mock-qr-code',
      backupCodes: ['code1', 'code2', 'code3'],
    })

    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    const toggleSwitch = screen.getByRole('switch')
    fireEvent.click(toggleSwitch)

    await waitFor(() => {
      expect(mockOnToggleTwoFactor).toHaveBeenCalledWith(true)
    })

    expect(toast.success).toHaveBeenCalledWith('Two-factor authentication enabled successfully')
  })

  it('handles two-factor authentication toggle error', async () => {
    mockOnToggleTwoFactor.mockRejectedValue(new Error('Toggle failed'))

    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    const toggleSwitch = screen.getByRole('switch')
    fireEvent.click(toggleSwitch)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update two-factor authentication')
    })
  })

  it('displays active sessions correctly', () => {
    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('iPhone 15')).toBeInTheDocument()
    expect(screen.getByText('Chrome 120 • San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByText('Safari 17 • New York, NY')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('handles session termination', async () => {
    mockOnTerminateSession.mockResolvedValue(undefined)

    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    const terminateButtons = screen.getAllByText('Terminate')
    fireEvent.click(terminateButtons[0])

    await waitFor(() => {
      expect(mockOnTerminateSession).toHaveBeenCalledWith('2')
    })

    expect(toast.success).toHaveBeenCalledWith('Session terminated successfully')
  })

  it('handles terminate all sessions', async () => {
    mockOnTerminateAllSessions.mockResolvedValue(undefined)

    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    const terminateAllButton = screen.getByText('Terminate All Others')
    fireEvent.click(terminateAllButton)

    await waitFor(() => {
      expect(mockOnTerminateAllSessions).toHaveBeenCalled()
    })

    expect(toast.success).toHaveBeenCalledWith('All sessions terminated successfully')
  })

  it('displays audit logs correctly', () => {
    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Failed Login')).toBeInTheDocument()
    expect(screen.getByText('Successful login from new device')).toBeInTheDocument()
    expect(screen.getByText('Failed login attempt with incorrect password')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('handles backup codes download', async () => {
    mockOnDownloadBackupCodes.mockResolvedValue(['code1', 'code2', 'code3'])

    render(
      <SecuritySettings
        twoFactorEnabled={true}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    const downloadButton = screen.getByText('Download Backup Codes')
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(mockOnDownloadBackupCodes).toHaveBeenCalled()
    })
  })

  it('handles backup codes copy', async () => {
    mockOnDownloadBackupCodes.mockResolvedValue(['code1', 'code2', 'code3'])

    render(
      <SecuritySettings
        twoFactorEnabled={true}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    const downloadButton = screen.getByText('Download Backup Codes')
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(screen.getByText('Copy Codes')).toBeInTheDocument()
    })

    const copyButton = screen.getByText('Copy Codes')
    fireEvent.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('code1\ncode2\ncode3')
    expect(toast.success).toHaveBeenCalledWith('Backup codes copied to clipboard')
  })

  it('shows severity badges for audit logs', () => {
    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={mockActiveSessions}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    expect(screen.getByText('low')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
  })

  it('disables terminate all button when only one session', () => {
    const singleSession = [mockActiveSessions[0]]

    render(
      <SecuritySettings
        twoFactorEnabled={false}
        activeSessions={singleSession}
        auditLogs={mockAuditLogs}
        onToggleTwoFactor={mockOnToggleTwoFactor}
        onTerminateSession={mockOnTerminateSession}
        onTerminateAllSessions={mockOnTerminateAllSessions}
        onDownloadBackupCodes={mockOnDownloadBackupCodes}
      />
    )

    const terminateAllButton = screen.getByText('Terminate All Others')
    expect(terminateAllButton).toBeDisabled()
  })
})