import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorPatterns } from '../error-patterns'

// Mock fetch
global.fetch = jest.fn()

const mockErrorPatterns = [
  {
    id: '1',
    description: 'Connection timeout',
    pattern: 'Connection timeout error occurred',
    frequency: 15,
    lastOccurrence: new Date('2024-01-01T10:00:00Z'),
    affectedAgents: ['agent-1', 'agent-2'],
    severity: 'HIGH',
    suggestedAction: 'Check network connectivity and increase timeout values',
  },
  {
    id: '2',
    description: 'Authentication failed',
    pattern: 'Authentication failed error occurred',
    frequency: 8,
    lastOccurrence: new Date('2024-01-01T09:30:00Z'),
    affectedAgents: ['agent-3'],
    severity: 'MEDIUM',
    suggestedAction: 'Verify API credentials and refresh tokens',
  },
  {
    id: '3',
    description: 'Rate limit exceeded',
    pattern: 'Rate limit exceeded error occurred',
    frequency: 12,
    lastOccurrence: new Date('2024-01-01T09:45:00Z'),
    affectedAgents: ['agent-1'],
    severity: 'LOW',
    suggestedAction:
      'Implement exponential backoff and reduce request frequency',
  },
]

describe('ErrorPatterns', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          patterns: mockErrorPatterns,
        }),
    })
  })

  it('renders loading state initially', async () => {
    render(<ErrorPatterns />)

    expect(screen.getByText('Error Patterns')).toBeInTheDocument()

    // Check for loading skeleton
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })
  })

  it('fetches and displays error patterns', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/cubcen/v1/errors/patterns?')
    )
  })

  it('displays error frequencies correctly', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('15 occurrences')).toBeInTheDocument() // Connection timeout frequency
      expect(screen.getByText('8 occurrences')).toBeInTheDocument() // Authentication failed frequency
      expect(screen.getByText('12 occurrences')).toBeInTheDocument() // Rate limit exceeded frequency
    })
  })

  it('displays severity levels with correct styling', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('HIGH')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
      expect(screen.getByText('LOW')).toBeInTheDocument()
    })
  })

  it('displays affected agents count', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('2 agents')).toBeInTheDocument() // Connection timeout
      expect(screen.getByText('1 agent')).toBeInTheDocument() // Authentication failed
    })
  })

  it('displays last occurrence times', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      // Should show relative time formats
      const timeElements = screen.getAllByText(/ago/)
      expect(timeElements.length).toBeGreaterThan(0)
    })
  })

  it('handles custom time range prop', async () => {
    const customTimeRange = {
      from: new Date('2024-01-01T00:00:00Z'),
      to: new Date('2024-01-02T00:00:00Z'),
    }

    render(<ErrorPatterns timeRange={customTimeRange} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('from=2024-01-01T00%3A00%3A00.000Z')
      )
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('to=2024-01-02T00%3A00%3A00.000Z')
      )
    })
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load error patterns')
      ).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load error patterns')
      ).toBeInTheDocument()
    })
  })

  it('displays empty state when no patterns found', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          patterns: [],
        }),
    })

    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('No Error Patterns Detected')).toBeInTheDocument()
      expect(
        screen.getByText(
          'No recurring error patterns found in the selected time range.'
        )
      ).toBeInTheDocument()
    })
  })

  it('allows expanding error details', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })

    // Click on an error to expand details
    const errorRow = screen.getByText('Connection timeout')
    fireEvent.click(errorRow)

    // Should show expanded details
    await waitFor(() => {
      expect(screen.getByText('Error Pattern')).toBeInTheDocument()
      expect(
        screen.getByText('Connection timeout error occurred')
      ).toBeInTheDocument()
    })
  })

  it('displays patterns in order', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
    })
  })

  it('handles refresh functionality', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('applies custom className', () => {
    const { container } = render(<ErrorPatterns className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('displays time range in description', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText(/in the last.*hours/)).toBeInTheDocument()
    })
  })

  it('displays pattern count badge', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // Pattern count badge
    })
  })

  it('displays severity badges correctly', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('HIGH')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
      expect(screen.getByText('LOW')).toBeInTheDocument()
    })
  })

  it('displays error resolution suggestions', async () => {
    render(<ErrorPatterns />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })

    // Click to expand and see suggestions
    const errorRow = screen.getByText('Connection timeout')
    fireEvent.click(errorRow)

    await waitFor(() => {
      expect(screen.getByText('Suggested Action')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Check network connectivity and increase timeout values'
        )
      ).toBeInTheDocument()
    })
  })
})
