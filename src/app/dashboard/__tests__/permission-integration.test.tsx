import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth'
import DashboardLayout from '../layout'
import UsersPage from '../users/page'
import PlatformsPage from '../platforms/page'
import SettingsPage from '../settings/page'

// Mock the hooks and components
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
}

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: jest.fn(() => mockRouter),
}))

jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div>Theme Toggle</div>,
}))

// Mock other components to avoid complex dependencies
jest.mock('@/components/users/user-list', () => ({
  UserList: () => <div>User List Component</div>,
}))

jest.mock('@/components/platforms/platform-list', () => ({
  PlatformList: () => <div>Platform List Component</div>,
}))

jest.mock('@/components/settings/profile-settings', () => ({
  ProfileSettings: () => <div>Profile Settings Component</div>,
}))

jest.mock('@/components/settings/notification-settings', () => ({
  NotificationSettings: () => <div>Notification Settings Component</div>,
}))

jest.mock('@/components/settings/security-settings', () => ({
  SecuritySettings: () => <div>Security Settings Component</div>,
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Permission-based Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Admin User Access', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { 
          id: '1', 
          email: 'admin@test.com', 
          name: 'Admin User', 
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn((roles) => roles.includes(UserRole.ADMIN)),
        canAccessResource: jest.fn(() => true),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn((role) => role === UserRole.ADMIN),
      })
    })

    it('should allow admin to access users page', async () => {
      render(<UsersPage />)
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
      })
    })

    it('should allow admin to access platforms page', async () => {
      render(<PlatformsPage />)
      await waitFor(() => {
        expect(screen.getByText('Platform Management')).toBeInTheDocument()
      })
    })

    it('should allow admin to access settings page', () => {
      render(<SettingsPage />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should show all navigation items in layout', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Platforms')).toBeInTheDocument()
      expect(screen.getByText('Errors')).toBeInTheDocument()
    })
  })

  describe('Operator User Access', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { 
          id: '2', 
          email: 'operator@test.com', 
          name: 'Operator User', 
          role: UserRole.OPERATOR,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn((roles) => roles.includes(UserRole.OPERATOR)),
        canAccessResource: jest.fn((resource) => resource !== 'users'),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn((role) => role === UserRole.OPERATOR),
      })
    })

    it('should deny operator access to users page', () => {
      render(<UsersPage />)
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.getByText('You don\'t have the required permissions to access this page')).toBeInTheDocument()
    })

    it('should allow operator to access platforms page', () => {
      render(<PlatformsPage />)
      expect(screen.getByText('Platform Management')).toBeInTheDocument()
      expect(screen.getByText('Platform List Component')).toBeInTheDocument()
    })

    it('should allow operator to access settings page', () => {
      render(<SettingsPage />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should hide users navigation item in layout', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      expect(screen.queryByText('Users')).not.toBeInTheDocument()
      expect(screen.getByText('Platforms')).toBeInTheDocument()
      expect(screen.getByText('Errors')).toBeInTheDocument()
    })
  })

  describe('Viewer User Access', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { 
          id: '3', 
          email: 'viewer@test.com', 
          name: 'Viewer User', 
          role: UserRole.VIEWER,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn((roles) => roles.includes(UserRole.VIEWER)),
        canAccessResource: jest.fn((resource) => {
          return ['analytics', 'agents', 'tasks', 'settings'].includes(resource)
        }),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn((role) => role === UserRole.VIEWER),
      })
    })

    it('should deny viewer access to users page', () => {
      render(<UsersPage />)
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.getByText('You don\'t have the required permissions to access this page')).toBeInTheDocument()
    })

    it('should deny viewer access to platforms page', () => {
      render(<PlatformsPage />)
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.getByText('You don\'t have permission to access Platform Management')).toBeInTheDocument()
    })

    it('should allow viewer to access settings page', () => {
      render(<SettingsPage />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should hide restricted navigation items in layout', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      expect(screen.queryByText('Users')).not.toBeInTheDocument()
      expect(screen.queryByText('Platforms')).not.toBeInTheDocument()
      expect(screen.queryByText('Errors')).not.toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('Unauthenticated User Access', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        hasAnyRole: jest.fn(() => false),
        canAccessResource: jest.fn(() => false),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(() => false),
      })
    })

    it('should redirect unauthenticated users from protected pages', async () => {
      render(<UsersPage />)
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })
    })
  })

  describe('Error Handling and Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { 
          id: '3', 
          email: 'viewer@test.com', 
          name: 'Viewer User', 
          role: UserRole.VIEWER,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn(() => false),
        canAccessResource: jest.fn(() => false),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(() => false),
      })
    })

    it('should provide navigation options in access denied screen', () => {
      render(<UsersPage />)
      
      expect(screen.getByText('Go Back')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    })

    it('should handle go back navigation', () => {
      render(<UsersPage />)
      
      const goBackButton = screen.getByText('Go Back')
      fireEvent.click(goBackButton)
      
      expect(mockRouter.back).toHaveBeenCalled()
    })

    it('should handle go to dashboard navigation', () => {
      render(<UsersPage />)
      
      const dashboardButton = screen.getByText('Go to Dashboard')
      fireEvent.click(dashboardButton)
      
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })
})
