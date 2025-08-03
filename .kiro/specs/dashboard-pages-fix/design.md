# Design Document

## Overview

This design addresses the missing and non-functional dashboard pages in the Cubcen AI Agent Management Platform. The solution involves creating three new dashboard pages (platforms, users, settings) and fixing issues with the existing analytics page. The design follows the established patterns in the codebase using Next.js App Router, shadcn/ui components, and the existing API structure.

## Architecture

### Page Structure
The dashboard pages follow the established Next.js App Router pattern:
```
src/app/dashboard/
├── platforms/
│   └── page.tsx
├── users/
│   └── page.tsx
├── settings/
│   └── page.tsx
└── analytics/
    └── page.tsx (existing - needs fixes)
```

### Component Architecture
Each page follows the established component pattern:
- **Page Component**: Main page wrapper with data fetching and state management
- **Feature Components**: Reusable components for specific functionality
- **UI Components**: shadcn/ui components for consistent styling

### API Integration
The pages integrate with existing backend APIs:
- **Analytics API**: `/api/cubcen/v1/analytics` (existing)
- **Platforms API**: `/api/cubcen/v1/platforms` (existing)
- **Users API**: `/api/cubcen/v1/users` (existing)
- **Settings API**: New endpoints needed for user preferences

## Components and Interfaces

### 1. Analytics Page Fixes

**Component**: `src/app/dashboard/analytics/page.tsx` (existing)
**Issues to Fix**:
- API error handling improvements
- Loading state optimization
- Date range filter persistence
- Export functionality validation

**Dependencies**:
- Existing analytics components in `src/components/analytics/`
- Analytics service in `src/services/analytics.ts`
- Analytics API routes in `src/backend/routes/analytics.ts`

### 2. Platform Management Page

**Component**: `src/app/dashboard/platforms/page.tsx` (new)
**Features**:
- Platform list with status indicators
- Add/edit platform configuration
- Connection testing
- Platform health monitoring
- Agent synchronization

**Supporting Components**:
```typescript
// src/components/platforms/platform-list.tsx
interface Platform {
  id: string
  name: string
  type: 'n8n' | 'make' | 'zapier'
  baseUrl: string
  status: 'connected' | 'disconnected' | 'error'
  authConfig: {
    type: 'api_key' | 'oauth' | 'basic'
    credentials: Record<string, string>
  }
  lastSyncAt: Date | null
  agentCount: number
  healthStatus: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    lastCheck: Date
    responseTime?: number
    version?: string
  }
}

// src/components/platforms/platform-form.tsx
// src/components/platforms/connection-test.tsx
// src/components/platforms/platform-health.tsx
```

### 3. User Management Page

**Component**: `src/app/dashboard/users/page.tsx` (new)
**Features**:
- User list with roles and status
- User profile management
- Role assignment (admin only)
- Activity monitoring
- User statistics

**Supporting Components**:
```typescript
// src/components/users/user-list.tsx
interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt: Date | null
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: {
      email: boolean
      push: boolean
      slack: boolean
    }
    dashboard: {
      defaultView: 'grid' | 'list' | 'kanban'
      refreshInterval: number
    }
  }
  activityStats: {
    totalLogins: number
    tasksCreated: number
    agentsManaged: number
  }
}

// src/components/users/user-form.tsx
// src/components/users/user-activity.tsx
// src/components/users/user-stats.tsx
```

### 4. Settings Page

**Component**: `src/app/dashboard/settings/page.tsx` (new)
**Features**:
- Personal profile settings
- Notification preferences
- Dashboard customization
- Security settings (password, 2FA)
- Theme preferences

**Supporting Components**:
```typescript
// src/components/settings/profile-settings.tsx
// src/components/settings/notification-settings.tsx
// src/components/settings/security-settings.tsx
// src/components/settings/appearance-settings.tsx

interface UserSettings {
  profile: {
    name: string
    email: string
    avatar?: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: {
      email: boolean
      push: boolean
      slack: boolean
      frequency: 'immediate' | 'hourly' | 'daily'
    }
    dashboard: {
      defaultView: 'grid' | 'list' | 'kanban'
      refreshInterval: number
      showWelcome: boolean
    }
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: Date
    activeSessions: number
  }
}
```

## Data Models

### Platform Model
```typescript
interface Platform {
  id: string
  name: string
  type: 'n8n' | 'make' | 'zapier'
  baseUrl: string
  status: 'connected' | 'disconnected' | 'error'
  authConfig: {
    type: 'api_key' | 'oauth' | 'basic'
    credentials: Record<string, string>
  }
  lastSyncAt: Date | null
  agentCount: number
  healthStatus: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    lastCheck: Date
    responseTime?: number
    version?: string
    capabilities?: string[]
    metrics?: {
      totalAgents: number
      activeAgents: number
      totalExecutions: number
      successRate: number
      avgResponseTime: number
    }
  }
  createdAt: Date
  updatedAt: Date
}
```

### User Model
```typescript
interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt: Date | null
  preferences: UserPreferences
  activityStats: UserActivityStats
  createdAt: Date
  updatedAt: Date
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    slack: boolean
    frequency: 'immediate' | 'hourly' | 'daily'
  }
  dashboard: {
    defaultView: 'grid' | 'list' | 'kanban'
    refreshInterval: number
    showWelcome: boolean
  }
}

interface UserActivityStats {
  totalLogins: number
  lastLogin: Date | null
  tasksCreated: number
  tasksCompleted: number
  tasksSuccessRate: number
  agentsManaged: number
  platformsConnected: number
}
```

## Error Handling

### API Error Handling
All pages implement consistent error handling:
```typescript
interface APIError {
  code: string
  message: string
  details?: unknown
  timestamp: string
  requestId?: string
}

interface APIResponse<T> {
  success: boolean
  data?: T
  error?: APIError
  message?: string
}
```

### Error States
- **Loading States**: Skeleton components during data fetching
- **Error States**: User-friendly error messages with retry options
- **Empty States**: Helpful messages when no data is available
- **Network Errors**: Offline detection and retry mechanisms

### Validation
- **Client-side**: Form validation using zod schemas
- **Server-side**: API validation using existing middleware
- **Real-time**: Live validation feedback for forms

## Testing Strategy

### Unit Tests
- Component rendering tests using React Testing Library
- API service tests using Jest and MSW
- Form validation tests
- Error handling tests

### Integration Tests
- Page navigation tests
- API integration tests
- User workflow tests
- Permission-based access tests

### E2E Tests
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

### Test Coverage
- Maintain 90% test coverage requirement
- Focus on critical user paths
- Test error scenarios and edge cases

## Security Considerations

### Authentication & Authorization
- All pages require authentication
- Role-based access control (RBAC)
- Admin-only features properly protected
- Session management and timeout handling

### Data Protection
- Sensitive data masking in logs
- Secure credential storage
- Input sanitization and validation
- CSRF protection for forms

### API Security
- Rate limiting on sensitive endpoints
- Request validation and sanitization
- Audit logging for admin actions
- Secure error messages (no data leakage)

## Performance Optimization

### Client-side Performance
- Code splitting for each page
- Lazy loading of components
- Optimized bundle sizes
- Efficient re-rendering patterns

### Server-side Performance
- API response caching where appropriate
- Database query optimization
- Pagination for large datasets
- Background data synchronization

### User Experience
- Progressive loading states
- Optimistic updates where safe
- Offline capability indicators
- Responsive design patterns

## Accessibility

### WCAG Compliance
- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

### Visual Design
- High contrast color schemes
- Scalable text and UI elements
- Focus indicators
- Color-blind friendly palettes

### Interaction Design
- Clear navigation patterns
- Consistent UI behavior
- Error message clarity
- Help text and tooltips