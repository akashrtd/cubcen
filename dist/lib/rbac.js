"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
exports.hasResourcePermission = hasResourcePermission;
exports.getRolePermissions = getRolePermissions;
exports.requirePermission = requirePermission;
exports.requireResourcePermission = requireResourcePermission;
exports.canAccessResource = canAccessResource;
exports.getAccessibleResources = getAccessibleResources;
exports.getResourceActions = getResourceActions;
const auth_1 = require("@/types/auth");
const auth_2 = require("@/types/auth");
exports.PERMISSIONS = {
    USER_CREATE: { resource: 'user', action: 'create' },
    USER_READ: { resource: 'user', action: 'read' },
    USER_UPDATE: { resource: 'user', action: 'update' },
    USER_DELETE: { resource: 'user', action: 'delete' },
    USER_MANAGE_ROLES: { resource: 'user', action: 'manage_roles' },
    AGENT_CREATE: { resource: 'agent', action: 'create' },
    AGENT_READ: { resource: 'agent', action: 'read' },
    AGENT_UPDATE: { resource: 'agent', action: 'update' },
    AGENT_DELETE: { resource: 'agent', action: 'delete' },
    AGENT_EXECUTE: { resource: 'agent', action: 'execute' },
    PLATFORM_CREATE: { resource: 'platform', action: 'create' },
    PLATFORM_READ: { resource: 'platform', action: 'read' },
    PLATFORM_UPDATE: { resource: 'platform', action: 'update' },
    PLATFORM_DELETE: { resource: 'platform', action: 'delete' },
    PLATFORM_CONNECT: { resource: 'platform', action: 'connect' },
    TASK_CREATE: { resource: 'task', action: 'create' },
    TASK_READ: { resource: 'task', action: 'read' },
    TASK_UPDATE: { resource: 'task', action: 'update' },
    TASK_DELETE: { resource: 'task', action: 'delete' },
    TASK_EXECUTE: { resource: 'task', action: 'execute' },
    TASK_CANCEL: { resource: 'task', action: 'cancel' },
    WORKFLOW_CREATE: { resource: 'workflow', action: 'create' },
    WORKFLOW_READ: { resource: 'workflow', action: 'read' },
    WORKFLOW_UPDATE: { resource: 'workflow', action: 'update' },
    WORKFLOW_DELETE: { resource: 'workflow', action: 'delete' },
    WORKFLOW_EXECUTE: { resource: 'workflow', action: 'execute' },
    SYSTEM_READ: { resource: 'system', action: 'read' },
    SYSTEM_CONFIGURE: { resource: 'system', action: 'configure' },
    SYSTEM_LOGS: { resource: 'system', action: 'logs' },
    SYSTEM_METRICS: { resource: 'system', action: 'metrics' },
    SYSTEM_HEALTH: { resource: 'system', action: 'health' },
    ANALYTICS_READ: { resource: 'analytics', action: 'read' },
    ANALYTICS_EXPORT: { resource: 'analytics', action: 'export' },
    REPORTS_CREATE: { resource: 'reports', action: 'create' },
    REPORTS_READ: { resource: 'reports', action: 'read' }
};
exports.ROLE_PERMISSIONS = {
    [auth_1.UserRole.ADMIN]: [
        exports.PERMISSIONS.USER_CREATE,
        exports.PERMISSIONS.USER_READ,
        exports.PERMISSIONS.USER_UPDATE,
        exports.PERMISSIONS.USER_DELETE,
        exports.PERMISSIONS.USER_MANAGE_ROLES,
        exports.PERMISSIONS.AGENT_CREATE,
        exports.PERMISSIONS.AGENT_READ,
        exports.PERMISSIONS.AGENT_UPDATE,
        exports.PERMISSIONS.AGENT_DELETE,
        exports.PERMISSIONS.AGENT_EXECUTE,
        exports.PERMISSIONS.PLATFORM_CREATE,
        exports.PERMISSIONS.PLATFORM_READ,
        exports.PERMISSIONS.PLATFORM_UPDATE,
        exports.PERMISSIONS.PLATFORM_DELETE,
        exports.PERMISSIONS.PLATFORM_CONNECT,
        exports.PERMISSIONS.TASK_CREATE,
        exports.PERMISSIONS.TASK_READ,
        exports.PERMISSIONS.TASK_UPDATE,
        exports.PERMISSIONS.TASK_DELETE,
        exports.PERMISSIONS.TASK_EXECUTE,
        exports.PERMISSIONS.TASK_CANCEL,
        exports.PERMISSIONS.WORKFLOW_CREATE,
        exports.PERMISSIONS.WORKFLOW_READ,
        exports.PERMISSIONS.WORKFLOW_UPDATE,
        exports.PERMISSIONS.WORKFLOW_DELETE,
        exports.PERMISSIONS.WORKFLOW_EXECUTE,
        exports.PERMISSIONS.SYSTEM_READ,
        exports.PERMISSIONS.SYSTEM_CONFIGURE,
        exports.PERMISSIONS.SYSTEM_LOGS,
        exports.PERMISSIONS.SYSTEM_METRICS,
        exports.PERMISSIONS.SYSTEM_HEALTH,
        exports.PERMISSIONS.ANALYTICS_READ,
        exports.PERMISSIONS.ANALYTICS_EXPORT,
        exports.PERMISSIONS.REPORTS_CREATE,
        exports.PERMISSIONS.REPORTS_READ
    ],
    [auth_1.UserRole.OPERATOR]: [
        exports.PERMISSIONS.USER_READ,
        exports.PERMISSIONS.AGENT_CREATE,
        exports.PERMISSIONS.AGENT_READ,
        exports.PERMISSIONS.AGENT_UPDATE,
        exports.PERMISSIONS.AGENT_EXECUTE,
        exports.PERMISSIONS.PLATFORM_READ,
        exports.PERMISSIONS.PLATFORM_CONNECT,
        exports.PERMISSIONS.TASK_CREATE,
        exports.PERMISSIONS.TASK_READ,
        exports.PERMISSIONS.TASK_UPDATE,
        exports.PERMISSIONS.TASK_EXECUTE,
        exports.PERMISSIONS.TASK_CANCEL,
        exports.PERMISSIONS.WORKFLOW_CREATE,
        exports.PERMISSIONS.WORKFLOW_READ,
        exports.PERMISSIONS.WORKFLOW_UPDATE,
        exports.PERMISSIONS.WORKFLOW_EXECUTE,
        exports.PERMISSIONS.SYSTEM_READ,
        exports.PERMISSIONS.SYSTEM_LOGS,
        exports.PERMISSIONS.SYSTEM_METRICS,
        exports.PERMISSIONS.SYSTEM_HEALTH,
        exports.PERMISSIONS.ANALYTICS_READ,
        exports.PERMISSIONS.ANALYTICS_EXPORT,
        exports.PERMISSIONS.REPORTS_READ
    ],
    [auth_1.UserRole.VIEWER]: [
        exports.PERMISSIONS.USER_READ,
        exports.PERMISSIONS.AGENT_READ,
        exports.PERMISSIONS.PLATFORM_READ,
        exports.PERMISSIONS.TASK_READ,
        exports.PERMISSIONS.WORKFLOW_READ,
        exports.PERMISSIONS.SYSTEM_READ,
        exports.PERMISSIONS.SYSTEM_HEALTH,
        exports.PERMISSIONS.ANALYTICS_READ,
        exports.PERMISSIONS.REPORTS_READ
    ]
};
function hasPermission(userRole, permission) {
    const rolePermissions = exports.ROLE_PERMISSIONS[userRole];
    return rolePermissions.some(p => p.resource === permission.resource && p.action === permission.action);
}
function hasResourcePermission(userRole, resource, action) {
    return hasPermission(userRole, { resource, action });
}
function getRolePermissions(userRole) {
    return exports.ROLE_PERMISSIONS[userRole] || [];
}
function requirePermission(userRole, permission, errorMessage) {
    if (!hasPermission(userRole, permission)) {
        throw new auth_2.AuthorizationError(errorMessage || `Access denied. Required permission: ${permission.action} on ${permission.resource}`, 'INSUFFICIENT_PERMISSIONS');
    }
}
function requireResourcePermission(userRole, resource, action, errorMessage) {
    requirePermission(userRole, { resource, action }, errorMessage);
}
function canAccessResource(userRole, resource) {
    const rolePermissions = exports.ROLE_PERMISSIONS[userRole];
    return rolePermissions.some(p => p.resource === resource);
}
function getAccessibleResources(userRole) {
    const rolePermissions = exports.ROLE_PERMISSIONS[userRole];
    const resources = new Set(rolePermissions.map(p => p.resource));
    return Array.from(resources);
}
function getResourceActions(userRole, resource) {
    const rolePermissions = exports.ROLE_PERMISSIONS[userRole];
    return rolePermissions
        .filter(p => p.resource === resource)
        .map(p => p.action);
}
//# sourceMappingURL=rbac.js.map