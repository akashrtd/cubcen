import { render, screen, waitFor } from '@testing-library/react'
import { SystemHealthIndicators } from '../system-health-indicators'

// Mock fetch
global.fetch = jest.fn()

const mockHealthData = {
  overall: 'healthy',
  components: [
    {
      name: 'Database',
      status: 'healthy',
      responseTime: 45,
      lastCheck: new Date('2024-01-01T10:00:00Z'),
    },
    {
      name: 'API Server',
      status: 'healthy',
      responseTime: 120,
      lastCheck: new Date('2024-01-01T10:00:00Z'),
    },
    {
      name: 'Message Queue',
      status: 'degraded',
      responseTime: 800,
      lastCheck: new Date('2024-01-01T10:00:00Z'),
      error: 'High latency detected',
    },
    {
      name: 'External Service',
      status: 'unhealthy',
      responseTime: 5000,
      lastCheck: new Date('2024-01-01T10:00:00Z'),
      error: 'Connection timeout',
    },
  ],
  metrics: {
    uptime: '99.9%',
    totalRequests: 15420,
    errorRate: '0.1%',
    avgResponseTime: 150,
  },
}

describe('SystemHealthIndicators', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockHealthData,
        }),
    })
  })

  it('renders loading state initially', async () => {
    render(<SystemHealthIndicators />)

    expect(screen.getByText('System Health')).toBeInTheDocument()

    // Check for loading skeleton
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Database')).toBeInTheDocument()
    })
  })

  it('fetches and displays health data', async () => {
    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(screen.getByText('Database')).toBeInTheDocument()
      expect(screen.getByText('API Server')).toBeInTheDocument()
      expect(screen.getByText('Message Queue')).toBeInTheDocument()
      expect(screen.getByText('External Service')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith('/api/cubcen/v1/health')
  })

  it('displays overall health status', async () => {
    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(screen.getByText('Healthy')).toBeInTheDocument()
    })
  })

  it('displays component health statuses with correct colors', async () => {
    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(screen.getByText('Healthy')).toBeInTheDocument() // Database and API Server
      expect(screen.getByText('Degraded')).toBeInTheDocument() // Message Queue
      expect(screen.getByText('Unhealthy')).toBeInTheDocument() // External Service
    })
  })

  it('displays response times', async () => {
    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(screen.getByText('45ms')).toBeInTheDocument() // Database
      expect(screen.getByText('120ms')).toBeInTheDocument() // API Server
      expect(screen.getByText('800ms')).toBeInTheDocument() // Message Queue
      expect(screen.getByText('5000ms')).toBeInTheDocument() // External Service
    })
  })

  it('displays error messages for unhealthy components', async () => {
    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(screen.getByText('High latency detected')).toBeInTheDocument()
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })
  })

  it('displays system metrics', async () => {
    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(screen.getByText('99.9%')).toBeInTheDocument() // Uptime
      expect(screen.getByText('15420')).toBeInTheDocument() // Total requests
      expect(screen.getByText('0.1%')).toBeInTheDocument() // Error rate
      expect(screen.getByText('150ms')).toBeInTheDocument() // Avg response time
    })
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load system health')
      ).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load system health')
      ).toBeInTheDocument()
    })
  })

  it('auto-refreshes at specified interval', async () => {
    jest.useFakeTimers()

    render(<SystemHealthIndicators refreshInterval={5000} />)

    await waitFor(() => {
      expect(screen.getByText('Database')).toBeInTheDocument()
    })

    // Clear the initial call
    jest.clearAllMocks()

    // Fast-forward time
    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    jest.useRealTimers()
  })

  it('applies custom className', () => {
    const { container } = render(
      <SystemHealthIndicators className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('displays last check times', async () => {
    render(<SystemHealthIndicators />)

    await waitFor(() => {
      // Should show relative time formats
      const timeElements = screen.getAllByText(/ago/)
      expect(timeElements.length).toBeGreaterThan(0)
    })
  })

  it('handles empty health data', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            overall: 'unknown',
            components: [],
            metrics: {},
          },
        }),
    })

    render(<SystemHealthIndicators />)

    await waitFor(() => {
      expect(screen.getByText('No health data available')).toBeInTheDocument()
    })
  })

  it('displays critical alerts for unhealthy components', async () => {
    render(<SystemHealthIndicators />)

    await waitFor(() => {
      // Should show alert indicators for unhealthy components
      expect(screen.getByText('External Service')).toBeInTheDocument()
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })
  })
})
