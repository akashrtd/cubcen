'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX, ArrowLeft, Home, LogIn } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: UserRole[]
  requiredResource?: string
  fallbackPath?: string
  showUnauthorized?: boolean
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredResource,
  fallbackPath = '/auth/login',
  showUnauthorized = true,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasAnyRole, canAccessResource } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname + window.location.search
      localStorage.setItem('redirectAfterLogin', currentPath)
      router.push(fallbackPath)
    }
  }, [isLoading, isAuthenticated, router, fallbackPath])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (!showUnauthorized) {
      router.push('/dashboard')
      return null
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have the required permissions to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Required role:</span>
                <span className="font-medium">{requiredRoles.join(' or ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your role:</span>
                <span className="font-medium">{user?.role}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check resource-based access
  if (requiredResource && !canAccessResource(requiredResource)) {
    if (!showUnauthorized) {
      router.push('/dashboard')
      return null
    }

    const getResourceDisplayName = (resource: string) => {
      const resourceNames: Record<string, string> = {
        users: 'User Management',
        platforms: 'Platform Management',
        settings: 'Settings',
        analytics: 'Analytics',
        agents: 'Agent Management',
        tasks: 'Task Management',
        errors: 'Error Management',
      }
      return resourceNames[resource] || resource
    }

    const getRequiredRolesForResource = (resource: string): UserRole[] => {
      const resourceAccess: Record<string, UserRole[]> = {
        users: [UserRole.ADMIN],
        platforms: [UserRole.ADMIN, UserRole.OPERATOR],
        settings: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
        analytics: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
        agents: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
        tasks: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER],
        errors: [UserRole.ADMIN, UserRole.OPERATOR],
      }
      return resourceAccess[resource] || []
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access {getResourceDisplayName(requiredResource)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Required roles:</span>
                <span className="font-medium">{getRequiredRolesForResource(requiredResource).join(', ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your role:</span>
                <span className="font-medium">{user?.role}</span>
              </div>
            </div>
            <Alert>
              <AlertDescription className="text-sm">
                Contact your administrator if you believe you should have access to this section.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}