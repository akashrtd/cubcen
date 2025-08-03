import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { ErrorBoundary } from '@/components/error-boundary'
import { AnalyticsErrorFallback } from '@/components/error-boundary/page-error-fallbacks'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredResource="analytics">
      <ErrorBoundary 
        fallback={AnalyticsErrorFallback}
        pageName="Analytics Dashboard"
        showDetails={false}
      >
        <AnalyticsDashboard />
      </ErrorBoundary>
    </ProtectedRoute>
  )
}
