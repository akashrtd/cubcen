# Cubcen API Endpoints Documentation

This document provides comprehensive documentation for all Cubcen API endpoints, including the newly added error reporting and enhanced dashboard functionality.

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Analytics API](#analytics-api)
- [Platform Management API](#platform-management-api)
- [User Management API](#user-management-api)
- [Settings API](#settings-api)
- [Error Reporting API](#error-reporting-api)
- [Response Formats](#response-formats)

## Authentication

All API endpoints require authentication unless otherwise specified. Cubcen uses JWT (JSON Web Tokens) for authentication.

### Authentication Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting an Authentication Token

```http
POST /api/cubcen/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "ADMIN"
    }
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2023-12-01T10:00:00Z",
    "requestId": "req_123456789"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` - Missing or invalid authentication
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request validation failed
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error occurred

## Rate Limiting

API endpoints are rate limited to ensure fair usage:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Error Reporting**: 50 requests per 15 minutes per IP

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701432000
```

## Analytics API

### Get Analytics Dashboard Data

Retrieve comprehensive analytics data for the dashboard.

```http
GET /api/cubcen/v1/analytics/dashboard
```

**Query Parameters:**

- `startDate` (optional): Start date for analytics (ISO 8601)
- `endDate` (optional): End date for analytics (ISO 8601)
- `agentIds` (optional): Comma-separated list of agent IDs to filter

**Response:**

```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalExecutions": 1250,
      "successRate": 94.5,
      "averageResponseTime": 2.3,
      "activeAgents": 15,
      "errorRate": 5.5
    },
    "charts": {
      "executionTrends": [
        {
          "date": "2023-12-01",
          "executions": 45,
          "successes": 42,
          "failures": 3
        }
      ],
      "performanceMetrics": [
        {
          "agent": "agent-1",
          "responseTime": 1.8,
          "successRate": 96.2
        }
      ]
    },
    "errorPatterns": [
      {
        "errorType": "TIMEOUT",
        "count": 12,
        "percentage": 60
      }
    ]
  }
}
```

### Export Analytics Data

Export analytics data in various formats.

```http
POST /api/cubcen/v1/analytics/export
Content-Type: application/json

{
  "format": "csv",
  "startDate": "2023-11-01T00:00:00Z",
  "endDate": "2023-12-01T00:00:00Z",
  "includeCharts": true,
  "agentIds": ["agent-1", "agent-2"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "downloadUrl": "/api/cubcen/v1/analytics/download/export-123.csv",
    "expiresAt": "2023-12-01T11:00:00Z"
  }
}
```

## Platform Management API

### List Platforms

Get all connected automation platforms.

```http
GET /api/cubcen/v1/platforms
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (connected, disconnected, error)
- `type` (optional): Filter by platform type (n8n, make, zapier)

**Response:**

```json
{
  "success": true,
  "data": {
    "platforms": [
      {
        "id": "platform-123",
        "name": "Production n8n",
        "type": "n8n",
        "baseUrl": "https://n8n.example.com",
        "status": "connected",
        "lastSyncAt": "2023-12-01T10:00:00Z",
        "agentCount": 12,
        "healthStatus": {
          "status": "healthy",
          "lastCheck": "2023-12-01T10:00:00Z",
          "responseTime": 150,
          "version": "1.15.0"
        },
        "createdAt": "2023-11-01T10:00:00Z",
        "updatedAt": "2023-12-01T09:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### Create Platform Connection

Add a new platform connection.

```http
POST /api/cubcen/v1/platforms
Content-Type: application/json

{
  "name": "Development n8n",
  "type": "n8n",
  "baseUrl": "https://dev-n8n.example.com",
  "authConfig": {
    "type": "api_key",
    "credentials": {
      "apiKey": "your-api-key-here"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "platform": {
      "id": "platform-456",
      "name": "Development n8n",
      "type": "n8n",
      "baseUrl": "https://dev-n8n.example.com",
      "status": "connected",
      "agentCount": 0,
      "createdAt": "2023-12-01T10:30:00Z"
    }
  }
}
```

### Test Platform Connection

Test connectivity to a platform before saving.

```http
POST /api/cubcen/v1/platforms/test-connection
Content-Type: application/json

{
  "baseUrl": "https://n8n.example.com",
  "authConfig": {
    "type": "api_key",
    "credentials": {
      "apiKey": "test-api-key"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "connectionTest": {
      "success": true,
      "responseTime": 145,
      "version": "1.15.0",
      "capabilities": ["workflows", "executions", "credentials"],
      "agentCount": 8
    }
  }
}
```

### Update Platform

Update an existing platform connection.

```http
PUT /api/cubcen/v1/platforms/{platformId}
Content-Type: application/json

{
  "name": "Updated Platform Name",
  "authConfig": {
    "type": "api_key",
    "credentials": {
      "apiKey": "new-api-key"
    }
  }
}
```

### Delete Platform

Remove a platform connection.

```http
DELETE /api/cubcen/v1/platforms/{platformId}
```

**Response:**

```json
{
  "success": true,
  "message": "Platform deleted successfully"
}
```

## User Management API

### List Users

Get all system users (Admin only).

```http
GET /api/cubcen/v1/users
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `role` (optional): Filter by role (ADMIN, OPERATOR, VIEWER)
- `status` (optional): Filter by status (active, inactive, suspended)
- `search` (optional): Search by name or email

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "ADMIN",
        "status": "active",
        "lastLoginAt": "2023-12-01T09:00:00Z",
        "preferences": {
          "theme": "dark",
          "notifications": {
            "email": true,
            "push": false,
            "slack": true
          }
        },
        "activityStats": {
          "totalLogins": 45,
          "tasksCreated": 12,
          "agentsManaged": 8
        },
        "createdAt": "2023-10-01T10:00:00Z",
        "updatedAt": "2023-12-01T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

### Create User

Create a new user account (Admin only).

```http
POST /api/cubcen/v1/users
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "OPERATOR",
  "password": "secure-password",
  "sendInvitation": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "OPERATOR",
      "status": "active",
      "createdAt": "2023-12-01T10:30:00Z"
    },
    "invitationSent": true
  }
}
```

### Update User Status

Update user status (Admin only).

```http
PUT /api/cubcen/v1/users/{userId}/status
Content-Type: application/json

{
  "status": "suspended",
  "reason": "Policy violation",
  "auditTrail": true
}
```

### Update User Profile

Update user profile information.

```http
PUT /api/cubcen/v1/users/{userId}/profile
Content-Type: application/json

{
  "name": "Updated Name",
  "preferences": {
    "theme": "light",
    "notifications": {
      "email": true,
      "push": true,
      "slack": false
    }
  }
}
```

## Settings API

### Get User Profile

Get current user's profile information.

```http
GET /api/cubcen/v1/users/profile
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "role": "ADMIN",
    "preferences": {
      "theme": "dark",
      "language": "en"
    }
  }
}
```

### Update User Profile

Update current user's profile.

```http
PUT /api/cubcen/v1/users/profile
Content-Type: application/json

{
  "name": "John Updated",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### Get Notification Preferences

Get user's notification preferences.

```http
GET /api/cubcen/v1/users/preferences/notifications
```

**Response:**

```json
{
  "success": true,
  "data": {
    "email": true,
    "push": false,
    "slack": true,
    "frequency": "immediate",
    "types": {
      "agentAlerts": true,
      "taskUpdates": true,
      "systemNotifications": false,
      "securityAlerts": true
    }
  }
}
```

### Update Notification Preferences

Update user's notification preferences.

```http
PUT /api/cubcen/v1/users/preferences/notifications
Content-Type: application/json

{
  "email": true,
  "push": true,
  "slack": false,
  "frequency": "hourly",
  "types": {
    "agentAlerts": true,
    "taskUpdates": false,
    "systemNotifications": true,
    "securityAlerts": true
  }
}
```

### Change Password

Change user's password.

```http
PUT /api/cubcen/v1/users/password
Content-Type: application/json

{
  "currentPassword": "old-password",
  "newPassword": "new-secure-password"
}
```

### Get Security Settings

Get user's security settings and active sessions.

```http
GET /api/cubcen/v1/users/security
```

**Response:**

```json
{
  "success": true,
  "data": {
    "twoFactorEnabled": false,
    "lastPasswordChange": "2023-11-01T10:00:00Z",
    "activeSessions": [
      {
        "id": "session-123",
        "deviceName": "Chrome on MacOS",
        "deviceType": "desktop",
        "browser": "Chrome",
        "location": "San Francisco, CA",
        "ipAddress": "192.168.1.100",
        "lastActive": "2023-12-01T10:00:00Z",
        "current": true
      }
    ],
    "auditLogs": [
      {
        "id": "audit-123",
        "event": "LOGIN",
        "description": "User logged in successfully",
        "ipAddress": "192.168.1.100",
        "timestamp": "2023-12-01T09:00:00Z",
        "severity": "low"
      }
    ]
  }
}
```

### Toggle Two-Factor Authentication

Enable or disable two-factor authentication.

```http
PUT /api/cubcen/v1/users/security/two-factor
Content-Type: application/json

{
  "enabled": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backupCodes": ["12345678", "87654321", "11223344"]
  }
}
```

### Terminate Session

Terminate a specific user session.

```http
DELETE /api/cubcen/v1/users/security/sessions/{sessionId}
```

### Terminate All Sessions

Terminate all user sessions except current.

```http
DELETE /api/cubcen/v1/users/security/sessions
```

## Error Reporting API

### Report Client-Side Error

Report an error that occurred in the client application.

```http
POST /api/cubcen/v1/errors/report
Content-Type: application/json

{
  "errorId": "error_1701432000_abc123",
  "message": "Cannot read property 'map' of undefined",
  "stack": "TypeError: Cannot read property 'map' of undefined\n    at Component.render (App.js:45:12)",
  "componentStack": "    in Component (at App.js:45)\n    in App (at index.js:7)",
  "pageName": "Analytics Dashboard",
  "timestamp": "2023-12-01T10:00:00Z",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "url": "https://app.cubcen.com/dashboard/analytics",
  "metadata": {
    "userId": "user-123",
    "sessionId": "session-456",
    "buildVersion": "1.2.3"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Error reported successfully",
  "data": {
    "errorId": "error_1701432000_abc123",
    "reported": true
  }
}
```

### Submit User Error Report

Submit additional details about an error from the user.

```http
POST /api/cubcen/v1/errors/user-report
Content-Type: application/json

{
  "errorId": "error_1701432000_abc123",
  "userDescription": "The page crashed when I tried to export analytics data",
  "reproductionSteps": "1. Go to Analytics page\n2. Select date range\n3. Click Export button\n4. Page shows error",
  "expectedBehavior": "Should download CSV file with analytics data",
  "actualBehavior": "Page shows error message and becomes unresponsive"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User error report submitted successfully",
  "data": {
    "errorId": "error_1701432000_abc123",
    "userReported": true
  }
}
```

### Get Error Reports (Admin Only)

Retrieve error reports for analysis.

```http
GET /api/cubcen/v1/errors
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `startDate` (optional): Start date filter (ISO 8601)
- `endDate` (optional): End date filter (ISO 8601)
- `pageName` (optional): Filter by page name
- `resolved` (optional): Filter by resolution status (true/false)

**Response:**

```json
{
  "success": true,
  "data": {
    "errors": [
      {
        "id": "error_1701432000_abc123",
        "message": "Cannot read property 'map' of undefined",
        "severity": "high",
        "pageName": "Analytics Dashboard",
        "userId": "user-123",
        "userEmail": "user@example.com",
        "timestamp": "2023-12-01T10:00:00Z",
        "resolved": false,
        "userReported": true,
        "occurrenceCount": 3
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

### Resolve Error (Admin Only)

Mark an error as resolved.

```http
PUT /api/cubcen/v1/errors/{errorId}/resolve
Content-Type: application/json

{
  "resolution": "Fixed in version 1.2.4 - improved error handling for undefined data",
  "notes": "Added null checks and fallback values for analytics data processing"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Error marked as resolved",
  "data": {
    "errorId": "error_1701432000_abc123",
    "resolved": true
  }
}
```

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error details
    },
    "timestamp": "2023-12-01T10:00:00Z",
    "requestId": "req_1701432000_xyz789"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
import { CubcenClient } from '@cubcen/sdk'

const client = new CubcenClient({
  baseUrl: 'https://api.cubcen.com',
  apiKey: 'your-api-key',
})

// Get analytics data
const analytics = await client.analytics.getDashboard({
  startDate: '2023-11-01',
  endDate: '2023-12-01',
})

// Report an error
await client.errors.report({
  errorId: 'error_123',
  message: 'Something went wrong',
  pageName: 'Dashboard',
})

// Create a platform connection
const platform = await client.platforms.create({
  name: 'My n8n Instance',
  type: 'n8n',
  baseUrl: 'https://n8n.example.com',
  authConfig: {
    type: 'api_key',
    credentials: { apiKey: 'your-key' },
  },
})
```

### Python

```python
from cubcen_sdk import CubcenClient

client = CubcenClient(
    base_url='https://api.cubcen.com',
    api_key='your-api-key'
)

# Get analytics data
analytics = client.analytics.get_dashboard(
    start_date='2023-11-01',
    end_date='2023-12-01'
)

# Report an error
client.errors.report(
    error_id='error_123',
    message='Something went wrong',
    page_name='Dashboard'
)
```

## Webhooks

Cubcen can send webhooks for various events. Configure webhook endpoints in the settings.

### Webhook Payload Format

```json
{
  "event": "agent.status_changed",
  "timestamp": "2023-12-01T10:00:00Z",
  "data": {
    "agentId": "agent-123",
    "oldStatus": "running",
    "newStatus": "error",
    "error": {
      "message": "Connection timeout",
      "code": "TIMEOUT"
    }
  },
  "signature": "sha256=abc123..."
}
```

### Webhook Events

- `agent.status_changed` - Agent status changed
- `task.completed` - Task execution completed
- `task.failed` - Task execution failed
- `platform.connected` - Platform connection established
- `platform.disconnected` - Platform connection lost
- `error.reported` - New error reported
- `user.created` - New user created
- `user.login` - User logged in

## Rate Limiting and Best Practices

### Rate Limits

- Respect the rate limits shown in response headers
- Implement exponential backoff for retries
- Use pagination for large datasets
- Cache responses when appropriate

### Error Handling

- Always check the `success` field in responses
- Handle different error codes appropriately
- Log error details for debugging
- Implement retry logic for transient errors

### Security

- Store API keys securely
- Use HTTPS for all requests
- Validate webhook signatures
- Implement proper authentication flows

### Performance

- Use appropriate page sizes for pagination
- Filter data at the API level when possible
- Implement client-side caching
- Monitor API response times

For more information, visit our [Developer Portal](https://developers.cubcen.com) or contact support at [api-support@cubcen.com](mailto:api-support@cubcen.com).
