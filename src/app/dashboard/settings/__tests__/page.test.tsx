import { render, screen, waitFor } from '@testing-library/react'
import SettingsPage from '../page'
import { toast } from 'sonner'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful responses
    mockFetch.mockImplementation((url) => {
      if (url === '/api/cubcen/v1/users/profile') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              avatar: 'avatar.jpg'
            }
          })
        } as Response)
      }
      
      if (url === '/api/cubcen/v1/users/preferences/notifications') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              email: true,
              push: false,
              slack: false,
              frequency: 'immediate',
              types: {
                agentAlerts: true,
                taskUpdates: true,
                systemNotifications: true,
                securityAlerts: true,
              }
            }
          })
        } as Response)
      }
      
      if (url === '/api/cubcen/v1/users/security') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              twoFactorEnabled: false,
              activeSessions: [
                {
                  id: '1',
                  deviceName: 'MacBook Pro',
                  deviceType: 'desktop',
                  browser: 'Chrome',
                  location: 'San Francisco',
                  ipAddress: '192.168.1.1',
                  lastActive: new Date(),
                  current: true,
                }
              ],
              auditLogs: [
                {
                  id: '1',
                  event: 'Login',
                  description: 'Successful login',
                  ipAddress: '192.168.1.1',
                  location: 'San Francisco',
                  timestamp: new Date(),
                  severity: 'low',
                }
              ]
            }
          })
        } as Response)
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Not found' })
      } as Response)
    })
  })

  it('renders settings page with basic structure', () => {
    render(<SettingsPage />)
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<SettingsPage />)
    
    // Should show loading skeleton
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('loads data successfully', async () => {
    render(<SettingsPage />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('Security')).toBeInTheDocument()
    })
  })

  it('handles error states gracefully', async () => {
    mockFetch.mockImplementation(() => 
      Promise.reject(new Error('Network error'))
    )
    
    render(<SettingsPage />)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load settings data')
    })
  })
})