'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  BarChart3, 
  Settings, 
  Users, 
  Layers,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageErrorFallbackProps {
  error: Error
  resetError: () => void
  errorId?: string
}

export function AnalyticsErrorFallback({ error, resetError, errorId }: PageErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <BarChart3 className="mr-2 h-5 w-5" />
            Analytics Dashboard Error
          </CardTitle>
          <CardDescription>
            There was an error loading the analytics dashboard. This might be due to data processing issues or API connectivity problems.
            {errorId && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Error ID: {errorId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Common causes and solutions:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Analytics data is being processed - try again in a few moments</li>
              <li>API connection issues - check your network connection</li>
              <li>Date range filters may be too broad - try a smaller time range</li>
              <li>Database connectivity issues - our team has been notified</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Analytics
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function PlatformsErrorFallback({ error, resetError, errorId }: PageErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Layers className="mr-2 h-5 w-5" />
            Platform Management Error
          </CardTitle>
          <CardDescription>
            There was an error loading the platform management page. This might be due to platform connectivity issues or configuration problems.
            {errorId && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Error ID: {errorId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Common causes and solutions:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Platform API connectivity issues - check platform status</li>
              <li>Authentication credentials may have expired</li>
              <li>Network connectivity problems</li>
              <li>Platform configuration errors</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Platforms
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function UsersErrorFallback({ error, resetError, errorId }: PageErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Users className="mr-2 h-5 w-5" />
            User Management Error
          </CardTitle>
          <CardDescription>
            There was an error loading the user management page. This might be due to permission issues or database connectivity problems.
            {errorId && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Error ID: {errorId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Common causes and solutions:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Insufficient permissions - contact your administrator</li>
              <li>User database connectivity issues</li>
              <li>Authentication session may have expired</li>
              <li>Role-based access control restrictions</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Users
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SettingsErrorFallback({ error, resetError, errorId }: PageErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Settings className="mr-2 h-5 w-5" />
            Settings Page Error
          </CardTitle>
          <CardDescription>
            There was an error loading your settings. This might be due to profile data issues or preference loading problems.
            {errorId && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Error ID: {errorId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Common causes and solutions:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>User preferences data corruption</li>
              <li>Settings API connectivity issues</li>
              <li>Profile data loading problems</li>
              <li>Security settings validation errors</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Settings
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardErrorFallback({ error, resetError, errorId }: PageErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Dashboard Error
          </CardTitle>
          <CardDescription>
            There was a critical error loading the dashboard. This might be due to authentication issues or core system problems.
            {errorId && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Error ID: {errorId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Common causes and solutions:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Authentication session expired - try logging in again</li>
              <li>Core system connectivity issues</li>
              <li>Browser compatibility problems - try a different browser</li>
              <li>JavaScript errors - try clearing your browser cache</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button variant="outline" onClick={() => router.push('/auth/login')} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Login Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}