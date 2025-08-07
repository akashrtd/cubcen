'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Bug, Home, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    resetError: () => void
    errorId?: string
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
  className?: string
  pageName?: string
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId =
      this.state.errorId ||
      `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Enhanced error logging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Report error to monitoring service
    this.reportError(error, errorInfo, errorId)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Update state with error info
    this.setState({ errorInfo, errorId })
  }

  reportError = async (
    error: Error,
    errorInfo: React.ErrorInfo,
    errorId: string
  ) => {
    try {
      // Report to backend error tracking
      await fetch('/api/cubcen/v1/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          pageName: this.props.pageName,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Silently fail if error reporting fails
        console.warn('Failed to report error to backend')
      })
    } catch (reportingError) {
      console.warn('Error reporting failed:', reportingError)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <div className={this.props.className}>
            <FallbackComponent
              error={this.state.error!}
              resetError={this.resetError}
              errorId={this.state.errorId}
            />
          </div>
        )
      }

      return (
        <div className={this.props.className}>
          <DefaultErrorFallback
            error={this.state.error!}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
            errorId={this.state.errorId}
            showDetails={this.props.showDetails}
            pageName={this.props.pageName}
          />
        </div>
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  errorInfo?: React.ErrorInfo
  resetError: () => void
  errorId?: string
  showDetails?: boolean
  pageName?: string
}

function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  errorId,
  showDetails = false,
  pageName,
}: ErrorFallbackProps) {
  const [detailsVisible, setDetailsVisible] = React.useState(false)
  const [reportSent, setReportSent] = React.useState(false)

  const sendErrorReport = async () => {
    try {
      const response = await fetch('/api/cubcen/v1/errors/user-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId,
          userDescription: 'User reported error from error boundary',
          reproductionSteps: 'Error occurred while using the application',
        }),
      })

      if (response.ok) {
        setReportSent(true)
        toast.success('Error report sent successfully')
      } else {
        throw new Error('Failed to send report')
      }
    } catch (err) {
      toast.error('Failed to send error report')
    }
  }

  const goHome = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Something went wrong
            {pageName && (
              <span className="ml-2 text-sm text-muted-foreground">
                in {pageName}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            An unexpected error occurred. We&apos;ve been notified and are
            working to fix it.
            {errorId && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Error ID: {errorId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          {(showDetails || detailsVisible) && (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium mb-2">
                      Error Details
                    </summary>
                    <div className="space-y-2">
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                      {errorInfo && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={resetError}
              className="flex-1 bg-cubcen-primary hover:bg-cubcen-primary-hover"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button variant="outline" onClick={goHome} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
            {!showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailsVisible(!detailsVisible)}
                className="flex-1"
              >
                <Bug className="mr-2 h-4 w-4" />
                {detailsVisible ? 'Hide' : 'Show'} Details
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={sendErrorReport}
              disabled={reportSent}
              className="flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              {reportSent ? 'Report Sent' : 'Report Error'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components
export const useErrorBoundary = () => {
  const context = React.useContext(ErrorBoundaryContext)
  if (!context) {
    throw new Error('useErrorBoundary must be used within an ErrorBoundary')
  }
  return context
}
