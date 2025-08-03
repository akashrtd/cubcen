'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser, UserRole } from '@/types/auth'
import { clientLogger } from '@/lib/client-logger'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  canAccessResource: (resource: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  // Check if user can access a resource based on role
  const canAccessResource = (resource: string): boolean => {
    if (!user) return false

    // Define resource access by role
    const resourceAccess: Record<string, UserRole[]> = {
      users: [UserRole.ADMIN],
      platforms: [UserRole.ADMIN, UserRole.OPERATOR],
      settings: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
      analytics: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
      agents: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
      tasks: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
      errors: [UserRole.ADMIN, UserRole.OPERATOR],
    }

    const allowedRoles = resourceAccess[resource]
    return allowedRoles ? allowedRoles.includes(user.role) : false
  }

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/cubcen/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.accessToken)
      localStorage.setItem('refreshToken', data.tokens.refreshToken)
      
      setUser(data.user)
      
      // Handle redirect after login
      const redirectPath = localStorage.getItem('redirectAfterLogin')
      if (redirectPath && redirectPath !== '/auth/login') {
        localStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      } else {
        router.push('/dashboard')
      }
      
      clientLogger.info('User logged in successfully', { userId: data.user.id })
    } catch (error) {
      clientLogger.error('Login failed', error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    router.push('/auth/login')
    clientLogger.info('User logged out')
  }

  // Validate token and get user info
  const validateToken = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/cubcen/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Token is invalid, try to refresh
        await refreshToken()
        return
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      clientLogger.error('Token validation failed', error as Error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh token
  const refreshToken = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        logout()
        return
      }

      const response = await fetch('/api/cubcen/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        logout()
        return
      }

      const data = await response.json()
      
      // Update tokens
      localStorage.setItem('accessToken', data.tokens.accessToken)
      localStorage.setItem('refreshToken', data.tokens.refreshToken)
      
      // Validate the new token
      await validateToken()
    } catch (error) {
      clientLogger.error('Token refresh failed', error as Error)
      logout()
    }
  }

  // Initialize auth state on mount
  useEffect(() => {
    validateToken()
  }, [])

  const authContextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasAnyRole,
    canAccessResource,
  }

  return React.createElement(
    AuthContext.Provider,
    { value: authContextValue },
    children
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
