'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LazyPlatformListWithSuspense,
  LazyPlatformFormWithSuspense
} from '@/components/platforms/lazy-components'
import { ErrorBoundary } from '@/components/error-boundary'
import { PlatformsErrorFallback } from '@/components/error-boundary/page-error-fallbacks'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Plus, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Platform {
  id?: string
  name: string
  type: 'n8n' | 'make' | 'zapier'
  baseUrl: string
  authConfig: {
    type: 'api_key' | 'oauth' | 'basic'
    credentials: Record<string, string>
  }
  status?: 'connected' | 'disconnected' | 'error'
  lastSyncAt?: Date | null
  agentCount?: number
  healthStatus?: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    lastCheck: Date
    responseTime?: number
    version?: string
  }
  createdAt?: Date
  updatedAt?: Date
}

interface ConnectionTestResult {
  success: boolean
  responseTime?: number
  version?: string
  capabilities?: string[]
  agentCount?: number
  error?: string
}

export default function PlatformsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [platformToDelete, setPlatformToDelete] = useState<Platform | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAddPlatform = () => {
    setSelectedPlatform(undefined)
    setIsFormOpen(true)
  }

  const handleEditPlatform = (platform: Platform) => {
    setSelectedPlatform(platform)
    setIsFormOpen(true)
  }

  const handleDeletePlatform = (platform: Platform) => {
    setPlatformToDelete(platform)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSave = async (platformData: Platform) => {
    try {
      const url = selectedPlatform 
        ? `/api/cubcen/v1/platforms/${selectedPlatform.id}`
        : '/api/cubcen/v1/platforms'
      
      const method = selectedPlatform ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(platformData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to save platform')
      }

      const result = await response.json()
      
      if (result.success) {
        toast.success(
          selectedPlatform 
            ? 'Platform updated successfully' 
            : 'Platform added successfully'
        )
        setIsFormOpen(false)
        setSelectedPlatform(undefined)
        setRefreshTrigger(prev => prev + 1)
      } else {
        throw new Error(result.error?.message || 'Failed to save platform')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      toast.error(message)
      throw error // Re-throw to let form handle loading state
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedPlatform(undefined)
  }

  const handleTestConnection = async (connectionData: {
    baseUrl: string
    authConfig: Platform['authConfig']
  }): Promise<ConnectionTestResult> => {
    try {
      const response = await fetch('/api/cubcen/v1/platforms/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Connection test failed')
      }

      const result = await response.json()
      
      if (result.success) {
        return result.data.connectionTest
      } else {
        throw new Error(result.error?.message || 'Connection test failed')
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  const confirmDelete = async () => {
    if (!platformToDelete?.id) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/cubcen/v1/platforms/${platformToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to delete platform')
      }

      const result = await response.json()
      
      if (result.success) {
        toast.success('Platform deleted successfully')
        setIsDeleteDialogOpen(false)
        setPlatformToDelete(undefined)
        setRefreshTrigger(prev => prev + 1)
      } else {
        throw new Error(result.error?.message || 'Failed to delete platform')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setPlatformToDelete(undefined)
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <ProtectedRoute requiredResource="platforms">
      <ErrorBoundary 
        fallback={PlatformsErrorFallback}
        pageName="Platform Management"
        showDetails={false}
      >
        <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Management</h1>
          <p className="text-muted-foreground">
            Manage your automation platform connections and monitor their health status.
          </p>
        </div>
        <Button onClick={handleAddPlatform}>
          <Plus className="h-4 w-4 mr-2" />
          Add Platform
        </Button>
      </div>

      {/* Platform List */}
      <LazyPlatformListWithSuspense
        key={refreshTrigger} // Force re-render when refreshTrigger changes
        onPlatformEdit={handleEditPlatform}
        onPlatformDelete={handleDeletePlatform}
        onRefresh={handleRefresh}
      />

      {/* Platform Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlatform ? 'Edit Platform' : 'Add New Platform'}
            </DialogTitle>
          </DialogHeader>
          <LazyPlatformFormWithSuspense
            platform={selectedPlatform}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            onTestConnection={handleTestConnection}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Platform
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. This will permanently delete the platform
                connection and remove all associated data.
              </AlertDescription>
            </Alert>
            
            {platformToDelete && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Platform Details:</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Name:</strong> {platformToDelete.name}</p>
                  <p><strong>Type:</strong> {platformToDelete.type}</p>
                  <p><strong>URL:</strong> {platformToDelete.baseUrl}</p>
                  {platformToDelete.agentCount !== undefined && (
                    <p><strong>Connected Agents:</strong> {platformToDelete.agentCount}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Platform
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  )
}