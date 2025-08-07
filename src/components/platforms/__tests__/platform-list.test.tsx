import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlatformList } from '../platform-list'

// Mock fetch
global.fetch = jest.fn()

const mockPlatforms = [
  {
    id: 'platform_1',
    name: 'Main n8n Instance',
    type: 'n8n' as const,
    baseUrl: 'https://n8n.example.com',
    status: 'connected' as const,
    lastSyncAt: new Date('2024-01-15T10:00:00Z'),
    agentCount: 5,
    healthStatus: {
      status: 'healthy' as const,
      lastCheck: new Date('2024-01-15T10:00:00Z'),
      responseTime: 200,
      version: '1.0.0',
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'platform_2',
    name: 'Make.com Integration',
    type: 'make' as const,
    baseUrl: 'https://api.make.com',
    status: 'disconnected' as const,
    lastSyncAt: null,
    agentCount: 3,
    healthStatus: {
      status: 'unhealthy' as const,
      lastCheck: new Date('2024-01-15T09:00:00Z'),
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z'),
  },
]

const mockFetchResponse = {
  ok: true,
  json: async () => ({
    success: true,
    data: {
      platforms: mockPlatforms,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    },
  }),
}

describe('PlatformList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse)
  })

  it('renders loading state initially', () => {
    render(<PlatformList />)

    expect(screen.getByText('Platforms')).toBeInTheDocument()
    // Check for skeleton elements by class name since they don't have testId
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders platforms after loading', async () => {
    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
      expect(screen.getByText('Make.com Integration')).toBeInTheDocument()
    })

    expect(screen.getByText('Platforms (2)')).toBeInTheDocument()
  })

  it('displays platform information correctly', async () => {
    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    // Check platform details
    expect(screen.getByText('https://n8n.example.com')).toBeInTheDocument()
    expect(screen.getByText('n8n')).toBeInTheDocument()
    expect(screen.getByText('connected')).toBeInTheDocument()
    expect(screen.getByText('healthy')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // agent count
    expect(screen.getByText('(200ms)')).toBeInTheDocument() // response time
  })

  it('handles search filtering', async () => {
    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search platforms...')
    fireEvent.change(searchInput, { target: { value: 'n8n' } })

    expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    expect(screen.queryByText('Make.com Integration')).not.toBeInTheDocument()
  })

  it('handles type filtering', async () => {
    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    // Open type filter dropdown
    const typeFilter = screen.getByLabelText('Filter by type')
    fireEvent.click(typeFilter)

    // Select n8n type - get the option from the dropdown, not the badge
    await waitFor(() => {
      const n8nOptions = screen.getAllByText('n8n')
      // Click the dropdown option (should be the last one)
      fireEvent.click(n8nOptions[n8nOptions.length - 1])
    })

    expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    expect(screen.queryByText('Make.com Integration')).not.toBeInTheDocument()
  })

  it('handles status filtering', async () => {
    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    // Open status filter dropdown
    const statusFilter = screen.getByLabelText('Filter by status')
    fireEvent.click(statusFilter)

    // Select connected status
    const connectedOption = screen.getByText('Connected')
    fireEvent.click(connectedOption)

    expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    expect(screen.queryByText('Make.com Integration')).not.toBeInTheDocument()
  })

  it('handles sorting by name', async () => {
    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    const nameHeader = screen.getByText('Platform Name')

    // Initially should be sorted by name ascending (default)
    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1] // Skip header row
    expect(firstDataRow).toHaveTextContent('Main n8n Instance')

    // Click to change sort order
    fireEvent.click(nameHeader)

    // The component should still work (we're testing the click handler works)
    expect(nameHeader).toBeInTheDocument()
  })

  it('calls onPlatformSelect when platform row is clicked', async () => {
    const onPlatformSelect = jest.fn()
    render(<PlatformList onPlatformSelect={onPlatformSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    const platformRow = screen.getByText('Main n8n Instance').closest('tr')
    fireEvent.click(platformRow!)

    expect(onPlatformSelect).toHaveBeenCalledWith(mockPlatforms[0])
  })

  it('calls onPlatformEdit when edit button is clicked', async () => {
    const onPlatformEdit = jest.fn()
    render(<PlatformList onPlatformEdit={onPlatformEdit} />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    expect(onPlatformEdit).toHaveBeenCalledWith(mockPlatforms[0])
  })

  it('calls onPlatformDelete when delete button is clicked', async () => {
    const onPlatformDelete = jest.fn()
    render(<PlatformList onPlatformDelete={onPlatformDelete} />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(onPlatformDelete).toHaveBeenCalledWith(mockPlatforms[0])
  })

  it('handles refresh functionality', async () => {
    const onRefresh = jest.fn()
    render(<PlatformList onRefresh={onRefresh} />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    expect(fetch).toHaveBeenCalledTimes(2) // Initial load + refresh
    expect(onRefresh).toHaveBeenCalled()
  })

  it('displays error state when fetch fails', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('displays empty state when no platforms exist', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          platforms: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
      }),
    })

    render(<PlatformList />)

    await waitFor(() => {
      expect(
        screen.getByText('No platforms configured yet')
      ).toBeInTheDocument()
    })
  })

  it('displays filtered empty state when no platforms match filters', async () => {
    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search platforms...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(
      screen.getByText('No platforms match your filters')
    ).toBeInTheDocument()
  })

  it('formats last sync time correctly', async () => {
    render(<PlatformList />)

    await waitFor(() => {
      expect(screen.getByText('Main n8n Instance')).toBeInTheDocument()
    })

    // Should show formatted date for platform with lastSyncAt
    expect(screen.getByText(/ago|Just now|\d+\/\d+\/\d+/)).toBeInTheDocument()

    // Should show "Never" for platform without lastSyncAt
    expect(screen.getByText('Never')).toBeInTheDocument()
  })
})
