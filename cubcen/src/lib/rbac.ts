// Cubcen Role-Based Access Control (RBAC) System
// Defines permissions and role-based access control logic

import { UserRole } from '@/types/auth'
import { Permission, RolePermissions, AuthorizationError } from '@/types/auth'

// Define all available permissions in the system
export const PERMISSIONS = {
  // User management
  USER_CREATE: { resource: 'user', action: 'create' },
  USER_READ: { resource: 'user', action: 'read' },
  USER_UPDATE: { resource: 'user', action: 'update' },
  USER_DELETE: { resource: 'user', action: 'delete' },
  USER_MANAGE_ROLES: { resource: 'user', action: 'manage_roles' },

  // Agent management
  AGENT_CREATE: { resource: 'agent', action: 'create' },
  AGENT_READ: { resource: 'agent', action: 'read' },
  AGENT_UPDATE: { resource: 'agent', action: 'update' },
  AGENT_DELETE: { resource: 'agent', action: 'delete' },
  AGENT_EXECUTE: { resource: 'agent', action: 'execute' },

  // Platform management
  PLATFORM_CREATE: { resource: 'platform', action: 'create' },
  PLATFORM_READ: { resource: 'platform', action: 'read' },
  PLATFORM_UPDATE: { resource: 'platform', action: 'update' },
  PLATFORM_DELETE: { resource: 'platform', action: 'delete' },
  PLATFORM_CONNECT: { resource: 'platform', action: 'connect' },

  // Task management
  TASK_CREATE: { resource: 'task', action: 'create' },
  TASK_READ: { resource: 'task', action: 'read' },
  TASK_UPDATE: { resource: 'task', action: 'update' },
  TASK_DELETE: { resource: 'task', action: 'delete' },
  TASK_EXECUTE: { resource: 'task', action: 'execute' },
  TASK_CANCEL: { resource: 'task', action: 'cancel' },

  // Workflow management
  WORKFLOW_CREATE: { resource: 'workflow', action: 'create' },
  WORKFLOW_READ: { resource: 'workflow', action: 'read' },
  WORKFLOW_UPDATE: { resource: 'workflow', action: 'update' },
  WORKFLOW_DELETE: { resource: 'workflow', action: 'delete' },
  WORKFLOW_EXECUTE: { resource: 'workflow', action: 'execute' },

  // System management
  SYSTEM_READ: { resource: 'system', action: 'read' },
  SYSTEM_CONFIGURE: { resource: 'system', action: 'configure' },
  SYSTEM_LOGS: { resource: 'system', action: 'logs' },
  SYSTEM_METRICS: { resource: 'system', action: 'metrics' },
  SYSTEM_HEALTH: { resource: 'system', action: 'health' },

  // Analytics and reporting
  ANALYTICS_READ: { resource: 'analytics', action: 'read' },
  ANALYTICS_EXPORT: { resource: 'analytics', action: 'export' },
  REPORTS_CREATE: { resource: 'reports', action: 'create' },
  REPORTS_READ: { resource: 'reports', action: 'read' }
} as const

// Define role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: [
    // Full access to all resources
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_ROLES,
    
    PERMISSIONS.AGENT_CREATE,
    PERMISSIONS.AGENT_READ,
    PERMISSIONS.AGENT_UPDATE,
    PERMISSIONS.AGENT_DELETE,
    PERMISSIONS.AGENT_EXECUTE,
    
    PERMISSIONS.PLATFORM_CREATE,
    PERMISSIONS.PLATFORM_READ,
    PERMISSIONS.PLATFORM_UPDATE,
    PERMISSIONS.PLATFORM_DELETE,
    PERMISSIONS.PLATFORM_CONNECT,
    
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_EXECUTE,
    PERMISSIONS.TASK_CANCEL,
    
    PERMISSIONS.WORKFLOW_CREATE,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.WORKFLOW_UPDATE,
    PERMISSIONS.WORKFLOW_DELETE,
    PERMISSIONS.WORKFLOW_EXECUTE,
    
    PERMISSIONS.SYSTEM_READ,
    PERMISSIONS.SYSTEM_CONFIGURE,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_METRICS,
    PERMISSIONS.SYSTEM_HEALTH,
    
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_READ
  ],

  [UserRole.OPERATOR]: [
    // Read-only user access
    PERMISSIONS.USER_READ,
    
    // Full agent and task management
    PERMISSIONS.AGENT_CREATE,
    PERMISSIONS.AGENT_READ,
    PERMISSIONS.AGENT_UPDATE,
    PERMISSIONS.AGENT_EXECUTE,
    
    // Platform read and connect
    PERMISSIONS.PLATFORM_READ,
    PERMISSIONS.PLATFORM_CONNECT,
    
    // Full task management
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_EXECUTE,
    PERMISSIONS.TASK_CANCEL,
    
    // Full workflow management
    PERMISSIONS.WORKFLOW_CREATE,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.WORKFLOW_UPDATE,
    PERMISSIONS.WORKFLOW_EXECUTE,
    
    // System monitoring
    PERMISSIONS.SYSTEM_READ,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_METRICS,
    PERMISSIONS.SYSTEM_HEALTH,
    
    // Analytics access
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.REPORTS_READ
  ],

  [UserRole.VIEWER]: [
    // Read-only access to most resources
    PERMISSIONS.USER_READ,
    PERMISSIONS.AGENT_READ,
    PERMISSIONS.PLATFORM_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.SYSTEM_READ,
    PERMISSIONS.SYSTEM_HEALTH,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REPORTS_READ
  ]
}

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions.some(
    p => p.resource === permission.resource && p.action === permission.action
  )
}

/**
 * Check if a user role has permission for a resource and action
 */
export function hasResourcePermission(
  userRole: UserRole, 
  resource: string, 
  action: string
): boolean {
  return hasPermission(userRole, { resource, action })
}

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || []
}

/**
 * Validate that a user has the required permission, throw error if not
 */
export function requirePermission(
  userRole: UserRole, 
  permission: Permission,
  errorMessage?: string
): void {
  if (!hasPermission(userRole, permission)) {
    throw new AuthorizationError(
      errorMessage || `Access denied. Required permission: ${permission.action} on ${permission.resource}`,
      'INSUFFICIENT_PERMISSIONS'
    )
  }
}

/**
 * Validate that a user has the required resource permission, throw error if not
 */
export function requireResourcePermission(
  userRole: UserRole,
  resource: string,
  action: string,
  errorMessage?: string
): void {
  requirePermission(userRole, { resource, action }, errorMessage)
}

/**
 * Check if a role can perform any action on a resource
 */
export function canAccessResource(userRole: UserRole, resource: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions.some(p => p.resource === resource)
}

/**
 * Get all resources a role can access
 */
export function getAccessibleResources(userRole: UserRole): string[] {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  const resources = new Set(rolePermissions.map(p => p.resource))
  return Array.from(resources)
}

/**
 * Get all actions a role can perform on a specific resource
 */
export function getResourceActions(userRole: UserRole, resource: string): string[] {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions
    .filter(p => p.resource === resource)
    .map(p => p.action)
}