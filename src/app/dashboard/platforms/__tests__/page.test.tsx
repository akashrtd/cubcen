import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PlatformsPage from '../page'

// Mock the components
jest.mock('@/components/platforms/platform-list', () => ({
  PlatformList: ({ onPlatformEdit, onPlatformDelete, onRefresh }: any) => (
    <div data-testid="platform-list">
      <button onClick={() => onPlatformEdit?.({ id: '1', name: 'Test Platform' })}>
        Edit Platform
      </button>
      <button onClick={() => onPlatformDelete?.({ id: '1', name: 'Test Platform' })}>
        Delete Platform
      </button>
      <button onClick={() => onRefresh?.()}>Refresh</button>
    </div>
  )
}))

jest.mock('@/components/platforms/platform-form', () => ({
  PlatformForm: ({ onSave, onCancel, onTestConnection, platform }: any) => (
    <div data-testid="platform-form">
      <span>{platform ? 'Edit Mode' : 'Add Mode'}</span>
      <button onClick={() => onSave?.({ name: 'Test Platform', type: 'n8n' })}>
        Save Platform
      </button>
      <button onClick={() => onCancel?.()}>Cancel</button>
      <button onClick={() => onTestConnection?.({ baseUrl: 'test', authConfig: {} })}>
        Test Connection
      </button>
    </div>
  )
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}))

// Mock fetch
global.fetch = jest.fn()

const mockSuccessResponse = {
  ok: true,
  json: async () => ({
    success: true,
    data: { platform: { id: '1', name: 'Test Platform' } }
  })
}

const mockConnectionTestResponse = {
  ok: true,
  json: async () => ({
    success: true,
    data: {
      connectionTest: {
        success: true,
        responseTime: 200,
        version: '1.0.0'
      }
    }
  })
}

describe('PlatformsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue(mockSuccessResponse)
  })

  it('renders the page with header and platform list', () => {
    render(<PlatformsPage />)
    
    expect(screen.getByText('Platform Management')).toBeInTheDocument()
    expect(screen.getByText('Manage your automation platform connections and monitor their health status.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add platform/i })).toBeInTheDocument()
    expect(screen.getByTestId('platform-list')).toBeInTheDocument()
  })

  it('opens add platform dialog when add button is clicked', () => {
    render(<PlatformsPage />)
    
    const addButton = screen.getByRole('button', { name: /add platform/i })
    fireEvent.click(addButton)
    
    expect(screen.getByText('Add New Platform')).toBeInTheDocument()
    expect(screen.getByTestId('platform-form')).toBeInTheDocument()
    expect(screen.getByText('Add Mode')).toBeInTheDocument()
  })

  it('opens edit platform dialog when edit is triggered from list', () => {
    render(<PlatformsPage />)
    
    const editButton = screen.getByText('Edit Platform')
    fireEvent.click(editButton)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('platform-form')).toBeInTheDocument()
    expect(screen.getByText('Edit Mode')).toBeInTheDocument()
  })

  it('closes form dialog when cancel is clicked', () => {
    render(<PlatformsPage />)
    
    // Open dialog
    const addButton = screen.getByRole('button', { name: /add platform/i })
    fireEvent.click(addButton)
    
    expect(screen.getByTestId('platform-form')).toBeInTheDocument()
    
    // Cancel
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(screen.queryByTestId('platform-form')).not.toBeInTheDocument()
  })

  it('handles platform save successfully', async () => {
    const { toast } = require('sonner')
    
    render(<PlatformsPage />)
    
    // Open dialog
    const addButton = screen.getByRole('button', { name: /add platform/i })
    fireEvent.click(addButton)
    
    // Save platform
    const saveButton = screen.getByText('Save Platform')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/cubcen/v1/platforms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Platform', type: 'n8n' }),
      })
    })
    
    expect(toast.success).toHaveBeenCalledWith('Platform added successfully')
    // The dialog should close after successful save
    await waitFor(() => {
      expect(screen.queryByTestId('platform-form')).not.toBeInTheDocument()
    })
  })

  it('handles platform update successfully', async () => {
    const { toast } = require('sonner')
    
    render(<PlatformsPage />)
    
    // Open edit dialog
    const editButton = screen.getByText('Edit Platform')
    fireEvent.click(editButton)
    
    // Save platform
    const saveButton = screen.getByText('Save Platform')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/cubcen/v1/platforms/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Platform', type: 'n8n' }),
      })
    })
    
    expect(toast.success).toHaveBeenCalledWith('Platform updated successfully')
  })

  it('handles save error', async () => {
    const { toast } = require('sonner')
    
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Validation failed' }
      })
    })
    
    render(<PlatformsPage />)
    
    // Open dialog and save
    const addButton = screen.getByRole('button', { name: /add platform/i })
    fireEvent.click(addButton)
    
    const saveButton = screen.getByText('Save Platform')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Validation failed')
    })
  })

  it('handles connection test', async () => {
    ;(fetch as jest.Mock).mockResolvedValue(mockConnectionTestResponse)
    
    render(<PlatformsPage />)
    
    // Open dialog
    const addButton = screen.getByRole('button', { name: /add platform/i })
    fireEvent.click(addButton)
    
    // Test connection
    const testButton = screen.getByText('Test Connection')
    fireEvent.click(testButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/cubcen/v1/platforms/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ baseUrl: 'test', authConfig: {} }),
      })
    })
  })

  it('opens delete confirmation dialog', () => {
    render(<PlatformsPage />)
    
    const deleteButton = screen.getByText('Delete Platform')
    fireEvent.click(deleteButton)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument()
    expect(screen.getByText('Platform Details:')).toBeInTheDocument()
  })

  it('handles platform deletion successfully', async () => {
    const { toast } = require('sonner')
    
    render(<PlatformsPage />)
    
    // Open delete dialog
    const deleteButton = screen.getByText('Delete Platform')
    fireEvent.click(deleteButton)
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete platform/i })
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/cubcen/v1/platforms/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
    
    expect(toast.success).toHaveBeenCalledWith('Platform deleted successfully')
  })

  it('handles delete error', async () => {
    const { toast } = require('sonner')
    
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Platform has active agents' }
      })
    })
    
    render(<PlatformsPage />)
    
    // Open delete dialog and confirm
    const deleteButton = screen.getByText('Delete Platform')
    fireEvent.click(deleteButton)
    
    const confirmButton = screen.getByRole('button', { name: /delete platform/i })
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Platform has active agents')
    })
  })

  it('cancels delete operation', () => {
    render(<PlatformsPage />)
    
    // Open delete dialog
    const deleteButton = screen.getByText('Delete Platform')
    fireEvent.click(deleteButton)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(screen.queryByText(/cannot be undone/)).not.toBeInTheDocument()
  })

  it('handles refresh from platform list', () => {
    render(<PlatformsPage />)
    
    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)
    
    // Should trigger a re-render of the platform list
    expect(screen.getByTestId('platform-list')).toBeInTheDocument()
  })
})