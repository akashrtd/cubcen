import React from 'react'
import { render, screen } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth'
import DashboardLayout from '../layout.tsx'

// Mock the hooks and components
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div>Theme Toggle</div>,
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Dashboard Layout - Navigation Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Admin User Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn(roles => roles.includes(UserRole.ADMIN)),
        canAccessResource: jest.fn(() => true), // Admin can access all resources
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(role => role === UserRole.ADMIN),
      })
    })

    it('should show all navigation items for admin users', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      )

      // Admin should see all navigation items
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Platforms')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Errors')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('Operator User Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '2',
          email: 'operator@test.com',
          name: 'Operator User',
          role: UserRole.OPERATOR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn(roles => roles.includes(UserRole.OPERATOR)),
        canAccessResource: jest.fn(resource => {
          // Operator can access most resources except users
          return resource !== 'users'
        }),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(role => role === UserRole.OPERATOR),
      })
    })

    it('should hide admin-only navigation items for operator users', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      )

      // Operator should see most items but not Users
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Platforms')).toBeInTheDocument()
      expect(screen.getByText('Errors')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()

      // Users should not be visible (admin only)
      expect(screen.queryByText('Users')).not.toBeInTheDocument()
    })
  })

  describe('Viewer User Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '3',
          email: 'viewer@test.com',
          name: 'Viewer User',
          role: UserRole.VIEWER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn(roles => roles.includes(UserRole.VIEWER)),
        canAccessResource: jest.fn(resource => {
          // Viewer can only access read-only resources
          return ['analytics', 'agents', 'tasks', 'settings'].includes(resource)
        }),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(role => role === UserRole.VIEWER),
      })
    })

    it('should show only viewer-accessible navigation items', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      )

      // Viewer should see limited items
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()

      // These should not be visible for viewers
      expect(screen.queryByText('Users')).not.toBeInTheDocument()
      expect(screen.queryByText('Platforms')).not.toBeInTheDocument()
      expect(screen.queryByText('Errors')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading skeletons when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        hasAnyRole: jest.fn(() => false),
        canAccessResource: jest.fn(() => false),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(() => false),
      })

      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      )

      // Should show skeleton loading components
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(5) // 5 skeleton items
    })
  })

  describe('User Profile Display', () => {
    it('should display user information in profile dropdown', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn(() => true),
        canAccessResource: jest.fn(() => true),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(() => true),
      })

      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      )

      // User info should be displayed in avatar fallback
      expect(screen.getByText('TU')).toBeInTheDocument() // Initials
    })
  })
})
