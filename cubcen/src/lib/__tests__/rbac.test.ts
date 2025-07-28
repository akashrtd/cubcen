// Cubcen RBAC System Tests
// Tests for role-based access control functionality

import { UserRole } from '@/generated/prisma'
import { AuthorizationError } from '@/types/auth'
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasResourcePermission,
  getRolePermissions,
  requirePermission,
  requireResourcePermission,
  canAccessResource,
  getAccessibleResources,
  getResourceActions
} from '../rbac'

describe('RBAC System', () => {
  describe('PERMISSIONS constant', () => {
    it('should have all required permission definitions', () => {
      expect(PERMISSIONS.USER_CREATE).toEqual({ resource: 'user', action: 'create' })
      expect(PERMISSIONS.AGENT_READ).toEqual({ resource: 'agent', action: 'read' })
      expect(PERMISSIONS.SYSTEM_CONFIGURE).toEqual({ resource: 'system', action: 'configure' })
    })
  })

  describe('ROLE_PERMISSIONS constant', () => {
    it('should define permissions for all roles', () => {
      expect(ROLE_PERMISSIONS[UserRole.ADMIN]).toBeDefined()
      expect(ROLE_PERMISSIONS[UserRole.OPERATOR]).toBeDefined()
      expect(ROLE_PERMISSIONS[UserRole.VIEWER]).toBeDefined()
    })

    it('should give ADMIN full permissions', () => {
      const adminPermissions = ROLE_PERMISSIONS[UserRole.ADMIN]
      
      // Admin should have all user management permissions
      expect(adminPermissions).toContainEqual(PERMISSIONS.USER_CREATE)
      expect(adminPermissions).toContainEqual(PERMISSIONS.USER_DELETE)
      expect(adminPermissions).toContainEqual(PERMISSIONS.USER_MANAGE_ROLES)
      
      // Admin should have system configuration permissions
      expect(adminPermissions).toContainEqual(PERMISSIONS.SYSTEM_CONFIGURE)
    })

    it('should give OPERATOR appropriate permissions', () => {
      const operatorPermissions = ROLE_PERMISSIONS[UserRole.OPERATOR]
      
      // Operator should have agent management permissions
      expect(operatorPermissions).toContainEqual(PERMISSIONS.AGENT_CREATE)
      expect(operatorPermissions).toContainEqual(PERMISSIONS.AGENT_EXECUTE)
      
      // Operator should NOT have user management permissions
      expect(operatorPermissions).not.toContainEqual(PERMISSIONS.USER_CREATE)
      expect(operatorPermissions).not.toContainEqual(PERMISSIONS.USER_DELETE)
      expect(operatorPermissions).not.toContainEqual(PERMISSIONS.USER_MANAGE_ROLES)
      
      // Operator should NOT have system configuration permissions
      expect(operatorPermissions).not.toContainEqual(PERMISSIONS.SYSTEM_CONFIGURE)
    })

    it('should give VIEWER read-only permissions', () => {
      const viewerPermissions = ROLE_PERMISSIONS[UserRole.VIEWER]
      
      // Viewer should have read permissions
      expect(viewerPermissions).toContainEqual(PERMISSIONS.USER_READ)
      expect(viewerPermissions).toContainEqual(PERMISSIONS.AGENT_READ)
      expect(viewerPermissions).toContainEqual(PERMISSIONS.SYSTEM_READ)
      
      // Viewer should NOT have create/update/delete permissions
      expect(viewerPermissions).not.toContainEqual(PERMISSIONS.USER_CREATE)
      expect(viewerPermissions).not.toContainEqual(PERMISSIONS.AGENT_CREATE)
      expect(viewerPermissions).not.toContainEqual(PERMISSIONS.AGENT_DELETE)
      expect(viewerPermissions).not.toContainEqual(PERMISSIONS.SYSTEM_CONFIGURE)
    })
  })

  describe('hasPermission', () => {
    it('should return true for valid admin permissions', () => {
      expect(hasPermission(UserRole.ADMIN, PERMISSIONS.USER_CREATE)).toBe(true)
      expect(hasPermission(UserRole.ADMIN, PERMISSIONS.SYSTEM_CONFIGURE)).toBe(true)
      expect(hasPermission(UserRole.ADMIN, PERMISSIONS.AGENT_DELETE)).toBe(true)
    })

    it('should return true for valid operator permissions', () => {
      expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.AGENT_CREATE)).toBe(true)
      expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.TASK_EXECUTE)).toBe(true)
      expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.WORKFLOW_CREATE)).toBe(true)
    })

    it('should return false for invalid operator permissions', () => {
      expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.USER_CREATE)).toBe(false)
      expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.SYSTEM_CONFIGURE)).toBe(false)
      expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.USER_MANAGE_ROLES)).toBe(false)
    })

    it('should return true for valid viewer permissions', () => {
      expect(hasPermission(UserRole.VIEWER, PERMISSIONS.USER_READ)).toBe(true)
      expect(hasPermission(UserRole.VIEWER, PERMISSIONS.AGENT_READ)).toBe(true)
      expect(hasPermission(UserRole.VIEWER, PERMISSIONS.ANALYTICS_READ)).toBe(true)
    })

    it('should return false for invalid viewer permissions', () => {
      expect(hasPermission(UserRole.VIEWER, PERMISSIONS.USER_CREATE)).toBe(false)
      expect(hasPermission(UserRole.VIEWER, PERMISSIONS.AGENT_CREATE)).toBe(false)
      expect(hasPermission(UserRole.VIEWER, PERMISSIONS.SYSTEM_CONFIGURE)).toBe(false)
    })
  })

  describe('hasResourcePermission', () => {
    it('should return true for valid resource permissions', () => {
      expect(hasResourcePermission(UserRole.ADMIN, 'user', 'create')).toBe(true)
      expect(hasResourcePermission(UserRole.OPERATOR, 'agent', 'execute')).toBe(true)
      expect(hasResourcePermission(UserRole.VIEWER, 'system', 'read')).toBe(true)
    })

    it('should return false for invalid resource permissions', () => {
      expect(hasResourcePermission(UserRole.VIEWER, 'user', 'create')).toBe(false)
      expect(hasResourcePermission(UserRole.OPERATOR, 'system', 'configure')).toBe(false)
    })
  })

  describe('getRolePermissions', () => {
    it('should return all permissions for admin', () => {
      const permissions = getRolePermissions(UserRole.ADMIN)
      expect(permissions.length).toBeGreaterThan(20) // Admin has many permissions
      expect(permissions).toContainEqual(PERMISSIONS.USER_CREATE)
      expect(permissions).toContainEqual(PERMISSIONS.SYSTEM_CONFIGURE)
    })

    it('should return appropriate permissions for operator', () => {
      const permissions = getRolePermissions(UserRole.OPERATOR)
      expect(permissions.length).toBeGreaterThan(10)
      expect(permissions.length).toBeLessThan(ROLE_PERMISSIONS[UserRole.ADMIN].length)
      expect(permissions).toContainEqual(PERMISSIONS.AGENT_CREATE)
      expect(permissions).not.toContainEqual(PERMISSIONS.USER_CREATE)
    })

    it('should return limited permissions for viewer', () => {
      const permissions = getRolePermissions(UserRole.VIEWER)
      expect(permissions.length).toBeLessThan(ROLE_PERMISSIONS[UserRole.OPERATOR].length)
      expect(permissions).toContainEqual(PERMISSIONS.USER_READ)
      expect(permissions).not.toContainEqual(PERMISSIONS.USER_CREATE)
    })

    it('should return empty array for invalid role', () => {
      const permissions = getRolePermissions('INVALID_ROLE' as UserRole)
      expect(permissions).toEqual([])
    })
  })

  describe('requirePermission', () => {
    it('should not throw for valid permissions', () => {
      expect(() => {
        requirePermission(UserRole.ADMIN, PERMISSIONS.USER_CREATE)
      }).not.toThrow()

      expect(() => {
        requirePermission(UserRole.OPERATOR, PERMISSIONS.AGENT_EXECUTE)
      }).not.toThrow()

      expect(() => {
        requirePermission(UserRole.VIEWER, PERMISSIONS.USER_READ)
      }).not.toThrow()
    })

    it('should throw AuthorizationError for invalid permissions', () => {
      expect(() => {
        requirePermission(UserRole.VIEWER, PERMISSIONS.USER_CREATE)
      }).toThrow(AuthorizationError)

      expect(() => {
        requirePermission(UserRole.OPERATOR, PERMISSIONS.SYSTEM_CONFIGURE)
      }).toThrow(AuthorizationError)
    })

    it('should throw with custom error message', () => {
      const customMessage = 'Custom access denied message'
      
      expect(() => {
        requirePermission(UserRole.VIEWER, PERMISSIONS.USER_CREATE, customMessage)
      }).toThrow(new AuthorizationError(customMessage, 'INSUFFICIENT_PERMISSIONS'))
    })

    it('should throw with default error message', () => {
      expect(() => {
        requirePermission(UserRole.VIEWER, PERMISSIONS.USER_CREATE)
      }).toThrow(new AuthorizationError(
        'Access denied. Required permission: create on user',
        'INSUFFICIENT_PERMISSIONS'
      ))
    })
  })

  describe('requireResourcePermission', () => {
    it('should not throw for valid resource permissions', () => {
      expect(() => {
        requireResourcePermission(UserRole.ADMIN, 'user', 'create')
      }).not.toThrow()

      expect(() => {
        requireResourcePermission(UserRole.OPERATOR, 'agent', 'execute')
      }).not.toThrow()
    })

    it('should throw AuthorizationError for invalid resource permissions', () => {
      expect(() => {
        requireResourcePermission(UserRole.VIEWER, 'user', 'create')
      }).toThrow(AuthorizationError)

      expect(() => {
        requireResourcePermission(UserRole.OPERATOR, 'system', 'configure')
      }).toThrow(AuthorizationError)
    })
  })

  describe('canAccessResource', () => {
    it('should return true for accessible resources', () => {
      expect(canAccessResource(UserRole.ADMIN, 'user')).toBe(true)
      expect(canAccessResource(UserRole.ADMIN, 'system')).toBe(true)
      expect(canAccessResource(UserRole.OPERATOR, 'agent')).toBe(true)
      expect(canAccessResource(UserRole.OPERATOR, 'task')).toBe(true)
      expect(canAccessResource(UserRole.VIEWER, 'user')).toBe(true)
      expect(canAccessResource(UserRole.VIEWER, 'agent')).toBe(true)
    })

    it('should return false for inaccessible resources', () => {
      // All roles should have access to basic resources, so test with non-existent resource
      expect(canAccessResource(UserRole.VIEWER, 'nonexistent')).toBe(false)
    })
  })

  describe('getAccessibleResources', () => {
    it('should return all resources for admin', () => {
      const resources = getAccessibleResources(UserRole.ADMIN)
      expect(resources).toContain('user')
      expect(resources).toContain('agent')
      expect(resources).toContain('platform')
      expect(resources).toContain('task')
      expect(resources).toContain('workflow')
      expect(resources).toContain('system')
      expect(resources).toContain('analytics')
      expect(resources).toContain('reports')
    })

    it('should return appropriate resources for operator', () => {
      const resources = getAccessibleResources(UserRole.OPERATOR)
      expect(resources).toContain('user') // read-only
      expect(resources).toContain('agent')
      expect(resources).toContain('platform')
      expect(resources).toContain('task')
      expect(resources).toContain('workflow')
      expect(resources).toContain('system') // monitoring only
      expect(resources).toContain('analytics')
      expect(resources).toContain('reports')
    })

    it('should return limited resources for viewer', () => {
      const resources = getAccessibleResources(UserRole.VIEWER)
      expect(resources).toContain('user')
      expect(resources).toContain('agent')
      expect(resources).toContain('platform')
      expect(resources).toContain('task')
      expect(resources).toContain('workflow')
      expect(resources).toContain('system')
      expect(resources).toContain('analytics')
      expect(resources).toContain('reports')
      
      // All resources are accessible to viewer, but with limited actions
      expect(resources.length).toBeGreaterThan(0)
    })
  })

  describe('getResourceActions', () => {
    it('should return all actions for admin on user resource', () => {
      const actions = getResourceActions(UserRole.ADMIN, 'user')
      expect(actions).toContain('create')
      expect(actions).toContain('read')
      expect(actions).toContain('update')
      expect(actions).toContain('delete')
      expect(actions).toContain('manage_roles')
    })

    it('should return limited actions for operator on user resource', () => {
      const actions = getResourceActions(UserRole.OPERATOR, 'user')
      expect(actions).toContain('read')
      expect(actions).not.toContain('create')
      expect(actions).not.toContain('delete')
      expect(actions).not.toContain('manage_roles')
    })

    it('should return read-only actions for viewer on user resource', () => {
      const actions = getResourceActions(UserRole.VIEWER, 'user')
      expect(actions).toContain('read')
      expect(actions).not.toContain('create')
      expect(actions).not.toContain('update')
      expect(actions).not.toContain('delete')
      expect(actions).not.toContain('manage_roles')
    })

    it('should return full actions for operator on agent resource', () => {
      const actions = getResourceActions(UserRole.OPERATOR, 'agent')
      expect(actions).toContain('create')
      expect(actions).toContain('read')
      expect(actions).toContain('update')
      expect(actions).toContain('execute')
      expect(actions).not.toContain('delete') // Operators can't delete agents
    })

    it('should return empty array for non-existent resource', () => {
      const actions = getResourceActions(UserRole.VIEWER, 'nonexistent')
      expect(actions).toEqual([])
    })
  })
})