'use client'

import { useState, useEffect } from 'react'
import { 
  LazyUserListWithSuspense,
  LazyUserFormWithSuspense
} from '@/components/users/lazy-components'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ErrorBoundary } from '@/components/error-boundary'
import { UsersErrorFallback } from '@/components/error-boundary/page-error-fallbacks'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { UserRole } from '@/types/auth'
import { toast } from 'sonner'
import { ArrowLeft, Users, UserPlus, Mail, Shield, Activity } from 'lucide-react'

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
    lastLogin: Date | null
    tasksCreated: number
    agentsManaged: number
  }
  createdAt: Date
  updatedAt: Date
}

type FormMode = 'create' | 'edit' | 'invite'

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/users?page=1&limit=100', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch users')
      }

      const result = await response.json()
      const fetchedUsers = result.data?.users || []
      
      setUsers(fetchedUsers)
      
      // Calculate user statistics
      const stats = {
        total: fetchedUsers.length,
        active: fetchedUsers.filter((u: User) => u.status === 'active').length,
        inactive: fetchedUsers.filter((u: User) => u.status === 'inactive').length,
        suspended: fetchedUsers.filter((u: User) => u.status === 'suspended').length,
      }
      setUserStats(stats)
      
    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch users')
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    // You could show a user detail view here
    console.log('Selected user:', user)
  }

  const handleUserEdit = (user: User) => {
    setSelectedUser(user)
    setFormMode('edit')
    setShowForm(true)
  }

  const handleUserDeactivate = async (user: User) => {
    const action = user.status === 'active' ? 'suspend' : 'reactivate'
    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    
    if (confirm(`Are you sure you want to ${action} ${user.name}? This action will be logged for audit purposes.`)) {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/cubcen/v1/users/${user.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status: newStatus,
            reason: `User ${action === 'suspend' ? 'suspended' : 'reactivated'} by administrator`,
            auditTrail: true
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || `Failed to ${action} user`)
        }

        const result = await response.json()
        
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id 
              ? { ...u, status: newStatus as 'active' | 'inactive' | 'suspended', updatedAt: new Date() }
              : u
          )
        )

        // Update statistics
        setUserStats(prevStats => {
          const newStats = { ...prevStats }
          if (user.status === 'active' && newStatus === 'suspended') {
            newStats.active -= 1
            newStats.suspended += 1
          } else if (user.status === 'suspended' && newStatus === 'active') {
            newStats.suspended -= 1
            newStats.active += 1
          }
          return newStats
        })

        toast.success(`${user.name} has been ${action}ed successfully. Action logged for audit trail.`)
        
      } catch (error) {
        console.error(`Error ${action}ing user:`, error)
        toast.error(error instanceof Error ? error.message : `Failed to ${action} user`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUserInvite = () => {
    setSelectedUser(null)
    setFormMode('invite')
    setShowForm(true)
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setFormMode('create')
    setShowForm(true)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true)

      let url = '/api/cubcen/v1/users'
      let method = 'POST'

      if (formMode === 'edit' && selectedUser) {
        url = `/api/cubcen/v1/users/${selectedUser.id}/profile`
        method = 'PUT'
      }

      const requestBody = {
        ...data,
        auditTrail: true, // Enable audit logging
        action: formMode === 'invite' ? 'invite' : formMode === 'create' ? 'create' : 'update'
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to save user')
      }

      const result = await response.json()
      const savedUser = result.data?.user
      
      if (formMode === 'invite') {
        toast.success(`Invitation sent to ${data.email}. Action logged for audit trail.`)
      } else if (formMode === 'create') {
        toast.success(`User ${data.name} created successfully. Action logged for audit trail.`)
        // Add new user to local state
        if (savedUser) {
          setUsers(prevUsers => [...prevUsers, savedUser])
          setUserStats(prevStats => ({
            ...prevStats,
            total: prevStats.total + 1,
            active: prevStats.active + (savedUser.status === 'active' ? 1 : 0),
            inactive: prevStats.inactive + (savedUser.status === 'inactive' ? 1 : 0),
            suspended: prevStats.suspended + (savedUser.status === 'suspended' ? 1 : 0),
          }))
        }
      } else {
        toast.success(`User ${data.name} updated successfully. Action logged for audit trail.`)
        // Update user in local state
        if (savedUser) {
          setUsers(prevUsers => 
            prevUsers.map(u => u.id === savedUser.id ? savedUser : u)
          )
        }
      }

      setShowForm(false)
      setSelectedUser(null)
      
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedUser(null)
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
      <ErrorBoundary 
        fallback={UsersErrorFallback}
        pageName="User Management"
        showDetails={false}
      >
        <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions with full audit trail logging
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleUserInvite} variant="outline" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invite User
          </Button>
          <Button onClick={handleCreateUser} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{userStats.total}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-yellow-600">{userStats.inactive}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspended</p>
              <p className="text-2xl font-bold text-red-600">{userStats.suspended}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={fetchUsers}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Audit Trail Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All user management actions are logged with full audit trails for compliance and security monitoring.
        </AlertDescription>
      </Alert>

      {/* User List */}
      <LazyUserListWithSuspense
        users={users}
        loading={loading}
        onUserSelect={handleUserSelect}
        onUserEdit={handleUserEdit}
        onUserDelete={handleUserDeactivate}
        onUserInvite={handleUserInvite}
        onRefresh={fetchUsers}
      />

      {/* User Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {formMode === 'invite' && <Mail className="h-5 w-5" />}
              {formMode === 'create' && <UserPlus className="h-5 w-5" />}
              {formMode === 'edit' && <Activity className="h-5 w-5" />}
              {formMode === 'invite' ? 'Invite User' : formMode === 'create' ? 'Create User' : 'Edit User'}
            </DialogTitle>
          </DialogHeader>
          <LazyUserFormWithSuspense
            user={selectedUser || undefined}
            mode={formMode}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
            className="border-0 shadow-none"
          />
        </DialogContent>
      </Dialog>
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  )
}