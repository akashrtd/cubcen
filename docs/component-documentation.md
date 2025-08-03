# Cubcen Component Documentation

This document provides comprehensive documentation for all React components in the Cubcen application, including usage examples, props, and best practices.

## Table of Contents

- [Error Boundary Components](#error-boundary-components)
- [Dashboard Page Components](#dashboard-page-components)
- [Analytics Components](#analytics-components)
- [Platform Management Components](#platform-management-components)
- [User Management Components](#user-management-components)
- [Settings Components](#settings-components)
- [UI Components](#ui-components)
- [Best Practices](#best-practices)

## Error Boundary Components

### ErrorBoundary

A comprehensive error boundary component that catches JavaScript errors anywhere in the child component tree and displays a fallback UI.

**Location:** `src/components/error-boundary.tsx`

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void; errorId?: string }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
  className?: string
  pageName?: string
}
```

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/error-boundary'
import { AnalyticsErrorFallback } from '@/components/error-boundary/page-error-fallbacks'

function AnalyticsPage() {
  return (
    <ErrorBoundary 
      fallback={AnalyticsErrorFallback}
      pageName="Analytics Dashboard"
      showDetails={false}
      onError={(error, errorInfo) => {
        console.error('Analytics page error:', error, errorInfo)
      }}
    >
      <AnalyticsDashboard />
    </ErrorBoundary>
  )
}
```

**Features:**
- Automatic error reporting to backend
- Customizable fallback UI
- Error ID generation for tracking
- Page-specific error messages
- User error reporting functionality
- Error details toggle
- Retry and recovery options

### Page-Specific Error Fallbacks

Pre-built error fallback components for different dashboard pages.

**Location:** `src/components/error-boundary/page-error-fallbacks.tsx`

**Available Fallbacks:**
- `AnalyticsErrorFallback` - For analytics dashboard errors
- `PlatformsErrorFallback` - For platform management errors
- `UsersErrorFallback` - For user management errors
- `SettingsErrorFallback` - For settings page errors
- `DashboardErrorFallback` - For general dashboard errors

**Props:**
```typescript
interface PageErrorFallbackProps {
  error: Error
  resetError: () => void
  errorId?: string
}
```

**Usage:**
```tsx
import { AnalyticsErrorFallback } from '@/components/error-boundary/page-error-fallbacks'

<ErrorBoundary fallback={AnalyticsErrorFallback}>
  <AnalyticsContent />
</ErrorBoundary>
```

### useErrorBoundary Hook

A hook for programmatically triggering error boundaries from functional components.

**Location:** `src/components/error-boundary.tsx`

**Usage:**
```tsx
import { useErrorBoundary } from '@/components/error-boundary'

function MyComponent() {
  const { captureError, resetError } = useErrorBoundary()

  const handleAsyncError = async () => {
    try {
      await riskyOperation()
    } catch (error) {
      captureError(error as Error)
    }
  }

  return (
    <div>
      <button onClick={handleAsyncError}>
        Trigger Async Operation
      </button>
    </div>
  )
}
```

## Dashboard Page Components

### Analytics Dashboard

Comprehensive analytics dashboard with KPIs, charts, and data export functionality.

**Location:** `src/components/analytics/analytics-dashboard.tsx`

**Props:**
```typescript
interface AnalyticsDashboardProps {
  className?: string
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  agentIds?: string[]
}
```

**Usage:**
```tsx
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

function AnalyticsPage() {
  return (
    <AnalyticsDashboard 
      dateRange={{
        startDate: new Date('2023-11-01'),
        endDate: new Date('2023-12-01')
      }}
      agentIds={['agent-1', 'agent-2']}
    />
  )
}
```

**Features:**
- Real-time KPI cards
- Interactive performance charts
- Error pattern analysis
- Data export functionality
- Date range filtering
- Agent-specific filtering

### Platform List

Displays and manages automation platform connections.

**Location:** `src/components/platforms/platform-list.tsx`

**Props:**
```typescript
interface PlatformListProps {
  onPlatformEdit?: (platform: Platform) => void
  onPlatformDelete?: (platform: Platform) => void
  onRefresh?: () => void
  className?: string
}
```

**Usage:**
```tsx
import { PlatformList } from '@/components/platforms/platform-list'

function PlatformsPage() {
  const handleEdit = (platform) => {
    // Handle platform editing
  }

  const handleDelete = (platform) => {
    // Handle platform deletion
  }

  return (
    <PlatformList 
      onPlatformEdit={handleEdit}
      onPlatformDelete={handleDelete}
      onRefresh={() => window.location.reload()}
    />
  )
}
```

**Features:**
- Platform status indicators
- Health monitoring display
- Connection testing
- Bulk operations
- Search and filtering
- Responsive design

### Platform Form

Form component for creating and editing platform connections.

**Location:** `src/components/platforms/platform-form.tsx`

**Props:**
```typescript
interface PlatformFormProps {
  platform?: Platform
  onSave: (platformData: Platform) => Promise<void>
  onCancel: () => void
  onTestConnection: (connectionData: ConnectionData) => Promise<ConnectionTestResult>
  className?: string
}
```

**Usage:**
```tsx
import { PlatformForm } from '@/components/platforms/platform-form'

function PlatformDialog() {
  const handleSave = async (data) => {
    await savePlatform(data)
  }

  const handleTest = async (connectionData) => {
    return await testConnection(connectionData)
  }

  return (
    <PlatformForm 
      platform={selectedPlatform}
      onSave={handleSave}
      onCancel={() => setDialogOpen(false)}
      onTestConnection={handleTest}
    />
  )
}
```

**Features:**
- Multi-platform support (n8n, Make.com, Zapier)
- Real-time connection testing
- Form validation
- Credential management
- Auto-discovery of platform capabilities

### User List

Displays and manages system users with role-based access control.

**Location:** `src/components/users/user-list.tsx`

**Props:**
```typescript
interface UserListProps {
  users: User[]
  loading?: boolean
  onUserSelect?: (user: User) => void
  onUserEdit?: (user: User) => void
  onUserDelete?: (user: User) => void
  onUserInvite?: () => void
  onRefresh?: () => void
  className?: string
}
```

**Usage:**
```tsx
import { UserList } from '@/components/users/user-list'

function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  return (
    <UserList 
      users={users}
      loading={loading}
      onUserEdit={handleUserEdit}
      onUserDelete={handleUserDelete}
      onRefresh={fetchUsers}
    />
  )
}
```

**Features:**
- Role-based filtering
- User status management
- Activity statistics
- Bulk operations
- Search functionality
- Audit trail integration

### User Form

Form component for creating and editing user accounts.

**Location:** `src/components/users/user-form.tsx`

**Props:**
```typescript
interface UserFormProps {
  user?: User
  mode: 'create' | 'edit' | 'invite'
  onSubmit: (userData: UserFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { UserForm } from '@/components/users/user-form'

function UserDialog() {
  const handleSubmit = async (userData) => {
    await saveUser(userData)
  }

  return (
    <UserForm 
      user={selectedUser}
      mode="edit"
      onSubmit={handleSubmit}
      onCancel={() => setDialogOpen(false)}
      loading={saving}
    />
  )
}
```

**Features:**
- Multiple form modes (create, edit, invite)
- Role assignment
- Password generation
- Email validation
- Invitation system integration

## Settings Components

### Profile Settings

Component for managing user profile information.

**Location:** `src/components/settings/profile-settings.tsx`

**Props:**
```typescript
interface ProfileSettingsProps {
  profile: UserProfile
  onProfileUpdate: (profileData: Partial<UserProfile>) => Promise<void>
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>
  className?: string
}
```

**Usage:**
```tsx
import { ProfileSettings } from '@/components/settings/profile-settings'

function SettingsPage() {
  const handleProfileUpdate = async (data) => {
    await updateProfile(data)
  }

  const handlePasswordChange = async (current, newPass) => {
    await changePassword(current, newPass)
  }

  return (
    <ProfileSettings 
      profile={userProfile}
      onProfileUpdate={handleProfileUpdate}
      onPasswordChange={handlePasswordChange}
    />
  )
}
```

**Features:**
- Profile information editing
- Avatar upload
- Password change functionality
- Form validation
- Real-time updates

### Notification Settings

Component for managing notification preferences.

**Location:** `src/components/settings/notification-settings.tsx`

**Props:**
```typescript
interface NotificationSettingsProps {
  preferences: NotificationPreferences
  onPreferencesUpdate: (preferences: NotificationPreferences) => Promise<void>
  className?: string
}
```

**Usage:**
```tsx
import { NotificationSettings } from '@/components/settings/notification-settings'

function SettingsPage() {
  const handleUpdate = async (preferences) => {
    await updateNotificationPreferences(preferences)
  }

  return (
    <NotificationSettings 
      preferences={notificationPreferences}
      onPreferencesUpdate={handleUpdate}
    />
  )
}
```

**Features:**
- Multi-channel notification configuration
- Frequency settings
- Notification type filtering
- Test notification functionality
- Integration status display

### Security Settings

Component for managing security settings and two-factor authentication.

**Location:** `src/components/settings/security-settings.tsx`

**Props:**
```typescript
interface SecuritySettingsProps {
  twoFactorEnabled: boolean
  activeSessions: ActiveSession[]
  auditLogs: SecurityAuditLog[]
  onToggleTwoFactor: (enabled: boolean) => Promise<TwoFactorSetupData>
  onTerminateSession: (sessionId: string) => Promise<void>
  onTerminateAllSessions: () => Promise<void>
  onDownloadBackupCodes: () => Promise<string[]>
  className?: string
}
```

**Usage:**
```tsx
import { SecuritySettings } from '@/components/settings/security-settings'

function SettingsPage() {
  const handleTwoFactorToggle = async (enabled) => {
    return await toggleTwoFactor(enabled)
  }

  return (
    <SecuritySettings 
      twoFactorEnabled={twoFactorEnabled}
      activeSessions={sessions}
      auditLogs={auditLogs}
      onToggleTwoFactor={handleTwoFactorToggle}
      onTerminateSession={terminateSession}
      onTerminateAllSessions={terminateAllSessions}
      onDownloadBackupCodes={downloadBackupCodes}
    />
  )
}
```

**Features:**
- Two-factor authentication setup
- Active session management
- Security audit log display
- Backup code generation
- Session termination

## Analytics Components

### KPI Cards

Displays key performance indicators in card format.

**Location:** `src/components/analytics/kpi-cards.tsx`

**Props:**
```typescript
interface KPICardsProps {
  kpis: {
    totalExecutions: number
    successRate: number
    averageResponseTime: number
    activeAgents: number
    errorRate: number
  }
  loading?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { KPICards } from '@/components/analytics/kpi-cards'

function AnalyticsDashboard() {
  return (
    <KPICards 
      kpis={analyticsData.kpis}
      loading={isLoading}
    />
  )
}
```

### Performance Charts

Interactive charts for displaying performance metrics.

**Location:** `src/components/analytics/performance-charts.tsx`

**Props:**
```typescript
interface PerformanceChartsProps {
  data: ChartData[]
  type: 'line' | 'bar' | 'area'
  title: string
  loading?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { PerformanceCharts } from '@/components/analytics/performance-charts'

function AnalyticsDashboard() {
  return (
    <PerformanceCharts 
      data={chartData}
      type="line"
      title="Execution Trends"
      loading={isLoading}
    />
  )
}
```

### Export Dialog

Dialog component for exporting analytics data.

**Location:** `src/components/analytics/export-dialog.tsx`

**Props:**
```typescript
interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (options: ExportOptions) => Promise<void>
  loading?: boolean
}
```

**Usage:**
```tsx
import { ExportDialog } from '@/components/analytics/export-dialog'

function AnalyticsDashboard() {
  const [exportOpen, setExportOpen] = useState(false)

  const handleExport = async (options) => {
    await exportData(options)
  }

  return (
    <ExportDialog 
      open={exportOpen}
      onOpenChange={setExportOpen}
      onExport={handleExport}
      loading={exporting}
    />
  )
}
```

## UI Components

### Accessible Button

Enhanced button component with accessibility features.

**Location:** `src/components/ui/accessible-button.tsx`

**Props:**
```typescript
interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  loadingText?: string
  ariaLabel?: string
}
```

**Usage:**
```tsx
import { AccessibleButton } from '@/components/ui/accessible-button'

function MyComponent() {
  return (
    <AccessibleButton 
      variant="default"
      size="lg"
      loading={isLoading}
      loadingText="Saving..."
      ariaLabel="Save changes"
      onClick={handleSave}
    >
      Save Changes
    </AccessibleButton>
  )
}
```

### Accessible Form

Form wrapper with enhanced accessibility features.

**Location:** `src/components/ui/accessible-form.tsx`

**Props:**
```typescript
interface AccessibleFormProps extends FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  errorSummary?: string[]
  successMessage?: string
}
```

**Usage:**
```tsx
import { AccessibleForm } from '@/components/ui/accessible-form'

function MyForm() {
  const [errors, setErrors] = useState([])

  return (
    <AccessibleForm 
      onSubmit={handleSubmit}
      errorSummary={errors}
      successMessage="Form submitted successfully"
    >
      {/* Form fields */}
    </AccessibleForm>
  )
}
```

### Accessible Table

Table component with enhanced accessibility and keyboard navigation.

**Location:** `src/components/ui/accessible-table.tsx`

**Props:**
```typescript
interface AccessibleTableProps {
  data: any[]
  columns: TableColumn[]
  caption?: string
  sortable?: boolean
  selectable?: boolean
  onRowSelect?: (row: any) => void
  className?: string
}
```

**Usage:**
```tsx
import { AccessibleTable } from '@/components/ui/accessible-table'

function DataTable() {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
  ]

  return (
    <AccessibleTable 
      data={tableData}
      columns={columns}
      caption="List of users"
      sortable={true}
      selectable={true}
      onRowSelect={handleRowSelect}
    />
  )
}
```

## Lazy Loading Components

### Lazy Component Wrappers

Lazy-loaded component wrappers with Suspense boundaries.

**Locations:**
- `src/components/analytics/lazy-components.tsx`
- `src/components/platforms/lazy-components.tsx`
- `src/components/users/lazy-components.tsx`
- `src/components/settings/lazy-components.tsx`

**Usage:**
```tsx
import { 
  LazyAnalyticsDashboardWithSuspense,
  LazyKPICardsWithSuspense 
} from '@/components/analytics/lazy-components'

function AnalyticsPage() {
  return (
    <div>
      <LazyKPICardsWithSuspense />
      <LazyAnalyticsDashboardWithSuspense />
    </div>
  )
}
```

**Features:**
- Automatic code splitting
- Loading states
- Error boundaries
- Performance optimization

## Best Practices

### Component Development

1. **Use TypeScript**: All components should have proper TypeScript interfaces
2. **Error Boundaries**: Wrap components in error boundaries for better error handling
3. **Accessibility**: Use accessible components and follow WCAG guidelines
4. **Performance**: Implement lazy loading for heavy components
5. **Testing**: Write comprehensive tests for all components

### Props and Interfaces

```typescript
// Good: Descriptive interface with proper types
interface UserFormProps {
  user?: User
  mode: 'create' | 'edit' | 'invite'
  onSubmit: (userData: UserFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  className?: string
}

// Bad: Generic props without types
interface UserFormProps {
  data?: any
  onSubmit?: Function
  loading?: boolean
}
```

### Error Handling

```tsx
// Good: Proper error boundary usage
function MyPage() {
  return (
    <ErrorBoundary 
      fallback={MyPageErrorFallback}
      pageName="My Page"
      onError={logError}
    >
      <MyPageContent />
    </ErrorBoundary>
  )
}

// Bad: No error handling
function MyPage() {
  return <MyPageContent />
}
```

### Accessibility

```tsx
// Good: Accessible component with proper ARIA labels
<AccessibleButton 
  ariaLabel="Delete user account"
  onClick={handleDelete}
  variant="destructive"
>
  <Trash2 className="h-4 w-4" />
  Delete
</AccessibleButton>

// Bad: Button without accessibility considerations
<button onClick={handleDelete}>
  <Trash2 />
</button>
```

### Performance

```tsx
// Good: Lazy loading for heavy components
const LazyAnalyticsDashboard = lazy(() => 
  import('./analytics-dashboard').then(module => ({
    default: module.AnalyticsDashboard
  }))
)

export function LazyAnalyticsDashboardWithSuspense(props: AnalyticsDashboardProps) {
  return (
    <Suspense fallback={<AnalyticsDashboardSkeleton />}>
      <LazyAnalyticsDashboard {...props} />
    </Suspense>
  )
}

// Bad: Direct import of heavy components
import { AnalyticsDashboard } from './analytics-dashboard'
```

### State Management

```tsx
// Good: Proper state management with error handling
function MyComponent() {
  const [data, setData] = useState<Data[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.getData()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <Alert variant="destructive">{error}</Alert>}
      {loading ? <Skeleton /> : <DataDisplay data={data} />}
    </div>
  )
}
```

### Testing

```tsx
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { UserForm } from '../user-form'

describe('UserForm', () => {
  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn()
    
    render(
      <UserForm 
        mode="create"
        onSubmit={mockSubmit}
        onCancel={() => {}}
      />
    )

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    })
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    })

    fireEvent.click(screen.getByRole('button', { name: /create user/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      })
    })
  })
})
```

For more detailed information about specific components, refer to the inline documentation in the component files or contact the development team.