import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '../protected-route'
import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth'

// Mock the hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
}

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ProtectedRoute - Permission-based Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  describe('Role-based Access Control', () => {
    it('should allow access for users with required roles', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn().mockReturnValue(true),
        canAccessResource: jest.fn().mockReturnValue(true),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(),
      })

      render(
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should deny access for users without required roles', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'viewer@test.com',
          name: 'Viewer',
          role: UserRole.VIEWER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn().mockReturnValue(false),
        canAccessResource: jest.fn().mockReturnValue(true),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(),
      })

      render(
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(
        screen.getByText(
          "You don't have the required permissions to access this page"
        )
      ).toBeInTheDocument()
      expect(screen.getByText('Required role:')).toBeInTheDocument()
      expect(screen.getByText('ADMIN')).toBeInTheDocument()
      expect(screen.getByText('Your role:')).toBeInTheDocument()
      expect(screen.getByText('VIEWER')).toBeInTheDocument()
    })
  })

  describe('Resource-based Access Control', () => {
    it('should allow access for users with resource permissions', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'operator@test.com',
          name: 'Operator',
          role: UserRole.OPERATOR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn().mockReturnValue(true),
        canAccessResource: jest.fn().mockReturnValue(true),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(),
      })

      render(
        <ProtectedRoute requiredResource="platforms">
          <div>Platform Management</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Platform Management')).toBeInTheDocument()
    })

    it('should deny access for users without resource permissions', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'viewer@test.com',
          name: 'Viewer',
          role: UserRole.VIEWER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn().mockReturnValue(true),
        canAccessResource: jest.fn().mockReturnValue(false),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(),
      })

      render(
        <ProtectedRoute requiredResource="users">
          <div>User Management</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(
        screen.getByText("You don't have permission to access User Management")
      ).toBeInTheDocument()
      expect(screen.getByText('Required roles:')).toBeInTheDocument()
      expect(screen.getByText('ADMIN')).toBeInTheDocument()
    })
  })

  describe('Authentication Redirect', () => {
    it('should redirect to login for unauthenticated users', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        hasAnyRole: jest.fn().mockReturnValue(false),
        canAccessResource: jest.fn().mockReturnValue(false),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(),
      })

      render(
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading skeleton while authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        hasAnyRole: jest.fn().mockReturnValue(false),
        canAccessResource: jest.fn().mockReturnValue(false),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(),
      })

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      // Should show skeleton loading components
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Navigation Options', () => {
    it('should provide navigation options in access denied screen', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'viewer@test.com',
          name: 'Viewer',
          role: UserRole.VIEWER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isAuthenticated: true,
        hasAnyRole: jest.fn().mockReturnValue(false),
        canAccessResource: jest.fn().mockReturnValue(false),
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn(),
      })

      render(
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Go Back')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    })
  })
})
