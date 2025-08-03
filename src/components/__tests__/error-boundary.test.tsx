import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorBoundary, useErrorBoundary } from '../error-boundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Component that uses the useErrorBoundary hook
const ComponentWithHook = ({ shouldThrow }: { shouldThrow: boolean }) => {
  const { captureError } = useErrorBoundary()
  
  if (shouldThrow) {
    captureError(new Error('Hook error'))
  }
  
  return <div>Component with hook</div>
}

// Mock fetch for error reporting
global.fetch = jest.fn()

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

beforeEach(() => {
  jest.clearAllMocks()
  ;(global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  })
})

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
  })

  it('displays error details when showDetails is true', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('renders custom fallback component', () => {
    const CustomFallback = () => <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const mockOnError = jest.fn()
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('displays retry button and allows retry', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
    
    // Click retry button
    fireEvent.click(retryButton)
    
    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('displays reload button', () => {
    // Mock window.location.reload
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const reloadButton = screen.getByRole('button', { name: /reload page/i })
    expect(reloadButton).toBeInTheDocument()
    
    fireEvent.click(reloadButton)
    expect(mockReload).toHaveBeenCalled()
  })

  it('displays go home button', () => {
    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const homeButton = screen.getByRole('button', { name: /go home/i })
    expect(homeButton).toBeInTheDocument()
    
    fireEvent.click(homeButton)
    expect(window.location.href).toBe('/dashboard')
  })

  it('shows error ID when available', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/error id:/i)).toBeInTheDocument()
  })

  it('shows page name when provided', () => {
    render(
      <ErrorBoundary pageName="Test Page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/in test page/i)).toBeInTheDocument()
  })

  it('reports error to backend', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/cubcen/v1/errors/report',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('Test error'),
        })
      )
    })
  })

  it('allows sending user error report', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const reportButton = screen.getByRole('button', { name: /report error/i })
    fireEvent.click(reportButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/cubcen/v1/errors/user-report',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })

  it('shows/hides error details', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const detailsButton = screen.getByRole('button', { name: /show details/i })
    fireEvent.click(detailsButton)
    
    expect(screen.getByText(/stack trace/i)).toBeInTheDocument()
    
    const hideButton = screen.getByRole('button', { name: /hide details/i })
    fireEvent.click(hideButton)
    
    expect(screen.queryByText(/stack trace/i)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ErrorBoundary className="custom-error-boundary">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(container.firstChild).toHaveClass('custom-error-boundary')
  })

  it('logs error to console in development', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})

describe('useErrorBoundary', () => {
  it('provides captureError function', () => {
    render(
      <ErrorBoundary>
        <ComponentWithHook shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Component with hook')).toBeInTheDocument()
  })

  it('captures errors through hook', () => {
    render(
      <ErrorBoundary>
        <ComponentWithHook shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('provides error state', () => {
    const ComponentWithErrorState = () => {
      const { error } = useErrorBoundary()
      return <div>{error ? 'Has error' : 'No error'}</div>
    }
    
    render(
      <ErrorBoundary>
        <ComponentWithErrorState />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('provides reset function', () => {
    const ComponentWithReset = () => {
      const { reset, captureError } = useErrorBoundary()
      
      return (
        <div>
          <button onClick={() => captureError(new Error('Test'))}>
            Throw Error
          </button>
          <button onClick={reset}>Reset</button>
        </div>
      )
    }
    
    render(
      <ErrorBoundary>
        <ComponentWithReset />
      </ErrorBoundary>
    )
    
    expect(screen.getByRole('button', { name: /throw error/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })
})