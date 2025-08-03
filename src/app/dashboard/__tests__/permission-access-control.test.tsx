import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import DashboardLayout from '../layout'
import UsersPage from '../users/page'
import SettingsPage from '../settings/page'
import PlatformsPage from '../platforms/page'
import AnalyticsPage from '../analytics/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}))

// Mock auth hook
jest.mock('@/hooks/use-auth')

// Mock fetch
global.fetch = jest.fn()

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
}

describe('Dashboard Permission-Based Access Control', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    })
  })

  describe('Admin User Access', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        isAuthenticated: true,
        loading: false,
      })
    })

    it('allows admin to access all dashboard pages', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      // All navigation items should be visible for admin
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Platforms')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('allows admin to access users page', async () => {
      render(<UsersPage />)

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
        expect(screen.getByText('Add User')).toBeInTheDocument()
      })
    })

    it('allows admin to access platforms page', async () => {
      render(<PlatformsPage />)

      await waitFor(() => {
        expect(screen.getByText('Platform Management')).toBeInTheDocument()
        expect(screen.getByText('Add Platform')).toBeInTheDocument()
      })
    })

    it('allows admin to access settings page', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
    })

    it('allows admin to access analytics page', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument()
      })
    })
  })

  describe('Operator User Access', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'operator-1',
          name: 'Operator User',
          email: 'operator@example.com',
          role: 'OPERATOR',
        },
        isAuthenticated: true,
        loading: false,
      })
    })

    it('shows limited navigation for operator users', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      // Operator should see most items but not user management
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Platforms')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Errors')).toBeInTheDocument()

      // Users page should not be visible for operators
      expect(screen.queryByText('Users')).not.toBeInTheDocument()
    })

    it('redirects operator away from users page', async () => {
      render(<UsersPage />)

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument()
        expect(screen.getByText('You do not have permission to access this page')).toBeInTheDocument()
      })

      // Should redirect to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('allows operator to access analytics page', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument()
      })
    })

    it('allows operator to access platforms page with limited actions', async () => {
      render(<PlatformsPage />)

      await waitFor(() => {
        expect(screen.getByText('Platform Management')).toBeInTheDocument()
        // Add Platform button should not be visible for operators
        expect(screen.queryByText('Add Platform')).not.toBeInTheDocument()
      })
    })

    it('allows operator to access settings page', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
    })
  })

  describe('Viewer User Access', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'viewer-1',
          name: 'Viewer User',
          email: 'viewer@example.com',
          role: 'VIEWER',
        },
        isAuthenticated: true,
        loading: false,
      })
    })

    it('shows read-only navigation for viewer users', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      // Viewer should see limited read-only items
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()

      // Admin-only pages should not be visible
      expect(screen.queryByText('Users')).not.toBeInTheDocument()
      expect(screen.queryByText('Platforms')).not.toBeInTheDocument()
    })

    it('redirects viewer away from users page', async () => {
      render(<UsersPage />)

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument()
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('redirects viewer away from platforms page', async () => {
      render(<PlatformsPage />)

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument()
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('allows viewer to access analytics page in read-only mode', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument()
        // Export functionality should not be available for viewers
        expect(screen.queryByText('Export')).not.toBeInTheDocument()
      })
    })

    it('allows viewer to access settings page with limited options', async () => {
      render(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
        // Should only show personal settings, not system settings
        expect(screen.getByText('Profile Settings')).toBeInTheDocument()
        expect(screen.queryByText('System Settings')).not.toBeInTheDocument()
      })
    })
  })

  describe('Unauthenticated User Access', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      })
    })

    it('redirects unauthenticated users to login', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/dashboard')
      })
    })

    it('shows loading state while authentication is being checked', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: true,
      })

      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Role-Based Component Rendering', () => {
    it('shows admin-only buttons for admin users', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        isAuthenticated: true,
        loading: false,
      })

      render(<PlatformsPage />)

      expect(screen.getByText('Add Platform')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('hides admin-only buttons for non-admin users', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'operator-1',
          name: 'Operator User',
          email: 'operator@example.com',
          role: 'OPERATOR',
        },
        isAuthenticated: true,
        loading: false,
      })

      render(<PlatformsPage />)

      expect(screen.queryByText('Add Platform')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('shows edit buttons for operators but not delete buttons', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'operator-1',
          name: 'Operator User',
          email: 'operator@example.com',
          role: 'OPERATOR',
        },
        isAuthenticated: true,
        loading: false,
      })

      render(<PlatformsPage />)

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('shows only view buttons for viewer users', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'viewer-1',
          name: 'Viewer User',
          email: 'viewer@example.com',
          role: 'VIEWER',
        },
        isAuthenticated: true,
        loading: false,
      })

      render(<AnalyticsPage />)

      expect(screen.getByText('View')).toBeInTheDocument()
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })
  })

  describe('API Permission Enforcement', () => {
    it('includes user role in API requests', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        isAuthenticated: true,
        loading: false,
      })

      render(<UsersPage />)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/cubcen/v1/users'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': expect.stringContaining('Bearer'),
              'X-User-Role': 'ADMIN',
            }),
          })
        )
      })
    })

    it('handles API permission errors gracefully', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          success: false,
          error: 'Insufficient permissions',
        }),
      })

      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'operator-1',
          name: 'Operator User',
          email: 'operator@example.com',
          role: 'OPERATOR',
        },
        isAuthenticated: true,
        loading: false,
      })

      render(<UsersPage />)

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument()
        expect(screen.getByText('Insufficient permissions')).toBeInTheDocument()
      })
    })
  })

  describe('Session Expiration Handling', () => {
    it('redirects to login when session expires', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'Session expired',
        }),
      })

      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'OPERATOR',
        },
        isAuthenticated: true,
        loading: false,
      })

      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/dashboard/analytics')
      })
    })

    it('shows session expiration warning before redirect', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: 'Session expired',
        }),
      })

      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Session Expired')).toBeInTheDocument()
        expect(screen.getByText('Please log in again to continue')).toBeInTheDocument()
      })
    })
  })
})