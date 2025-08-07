import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import { LazyCard, withLazyLoading, useLazyLoading } from '../lazy-card'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
})

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
})

const TestComponent = ({ message }: { message: string }) => (
  <div data-testid="test-component">{message}</div>
)

describe('LazyCard', () => {
  let mockObserve: jest.Mock
  let mockDisconnect: jest.Mock
  let mockCallback: (entries: IntersectionObserverEntry[]) => void

  beforeEach(() => {
    mockObserve = jest.fn()
    mockDisconnect = jest.fn()
    mockCallback = jest.fn()

    mockIntersectionObserver.mockImplementation(callback => {
      mockCallback = callback
      return {
        observe: mockObserve,
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show skeleton initially when not intersecting', () => {
    render(
      <LazyCard minHeight={300}>
        <TestComponent message="Lazy content" />
      </LazyCard>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading card content')).toBeInTheDocument()
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument()
  })

  it('should load content when intersecting', async () => {
    const onIntersect = jest.fn()
    const onLoad = jest.fn()

    render(
      <LazyCard onIntersect={onIntersect} onLoad={onLoad}>
        <TestComponent message="Lazy content" />
      </LazyCard>
    )

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div') as Element,
    } as IntersectionObserverEntry

    act(() => {
      mockCallback([mockEntry])
    })

    await waitFor(() => {
      expect(onIntersect).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })

    expect(screen.getByText('Lazy content')).toBeInTheDocument()
  })

  it('should apply priority-based loading delays', async () => {
    jest.useFakeTimers()

    const onIntersect = jest.fn()

    render(
      <LazyCard priority="critical" onIntersect={onIntersect}>
        <TestComponent message="Critical content" />
      </LazyCard>
    )

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div') as Element,
    } as IntersectionObserverEntry

    act(() => {
      mockCallback([mockEntry])
    })

    // Critical priority should have no delay
    await waitFor(() => {
      expect(onIntersect).toHaveBeenCalled()
    })

    jest.useRealTimers()
  })

  it('should apply high priority delay', async () => {
    jest.useFakeTimers()

    const onIntersect = jest.fn()

    render(
      <LazyCard priority="high" onIntersect={onIntersect}>
        <TestComponent message="High priority content" />
      </LazyCard>
    )

    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div') as Element,
    } as IntersectionObserverEntry

    mockCallback([mockEntry])

    // Should not be called immediately
    expect(onIntersect).not.toHaveBeenCalled()

    // Should be called after 50ms delay
    jest.advanceTimersByTime(50)
    expect(onIntersect).toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('should apply low priority delay', async () => {
    jest.useFakeTimers()

    const onIntersect = jest.fn()

    render(
      <LazyCard priority="low" onIntersect={onIntersect}>
        <TestComponent message="Low priority content" />
      </LazyCard>
    )

    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div') as Element,
    } as IntersectionObserverEntry

    mockCallback([mockEntry])

    // Should not be called immediately
    expect(onIntersect).not.toHaveBeenCalled()

    // Should be called after 200ms delay
    jest.advanceTimersByTime(200)
    expect(onIntersect).toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('should use custom fallback component', () => {
    const customFallback = (
      <div data-testid="custom-fallback">Custom loading...</div>
    )

    render(
      <LazyCard fallback={customFallback}>
        <TestComponent message="Content" />
      </LazyCard>
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.getByText('Custom loading...')).toBeInTheDocument()
  })

  it('should apply custom root margin and threshold', () => {
    render(
      <LazyCard rootMargin="100px" threshold={0.5}>
        <TestComponent message="Content" />
      </LazyCard>
    )

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '100px',
        threshold: 0.5,
      }
    )
  })

  it('should disconnect observer after intersection', async () => {
    render(
      <LazyCard>
        <TestComponent message="Content" />
      </LazyCard>
    )

    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div') as Element,
    } as IntersectionObserverEntry

    mockCallback([mockEntry])

    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  it('should apply priority-based CSS classes', () => {
    const { container } = render(
      <LazyCard priority="critical" className="custom-class">
        <TestComponent message="Content" />
      </LazyCard>
    )

    const lazyContainer = container.firstChild as HTMLElement
    expect(lazyContainer).toHaveClass('lazy-card-container')
    expect(lazyContainer).toHaveClass('lazy-card-critical')
    expect(lazyContainer).toHaveClass('custom-class')
  })

  it('should set minimum height correctly', () => {
    const { container } = render(
      <LazyCard minHeight={400}>
        <TestComponent message="Content" />
      </LazyCard>
    )

    const lazyContainer = container.firstChild as HTMLElement
    expect(lazyContainer).toHaveStyle('min-height: 400px')
  })
})

describe('withLazyLoading', () => {
  it('should wrap component with lazy loading', async () => {
    const LazyTestComponent = withLazyLoading(TestComponent, {
      priority: 'high',
      minHeight: 250,
    })

    render(<LazyTestComponent message="Wrapped content" />)

    // Should show skeleton initially
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div') as Element,
    } as IntersectionObserverEntry

    mockCallback([mockEntry])

    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })

    expect(screen.getByText('Wrapped content')).toBeInTheDocument()
  })

  it('should preserve component display name', () => {
    const NamedComponent = ({ message }: { message: string }) => (
      <div>{message}</div>
    )
    NamedComponent.displayName = 'NamedComponent'

    const LazyNamedComponent = withLazyLoading(NamedComponent)

    expect(LazyNamedComponent.displayName).toBe('LazyLoaded(NamedComponent)')
  })

  it('should handle component without display name', () => {
    const AnonymousComponent = ({ message }: { message: string }) => (
      <div>{message}</div>
    )

    const LazyAnonymousComponent = withLazyLoading(AnonymousComponent)

    expect(LazyAnonymousComponent.displayName).toBe(
      'LazyLoaded(AnonymousComponent)'
    )
  })
})

describe('useLazyLoading', () => {
  const TestHookComponent = ({ options = {} }: { options?: any }) => {
    const { elementRef, isIntersecting, hasLoaded } = useLazyLoading(options)

    return (
      <div>
        <div ref={elementRef} data-testid="observed-element">
          Observed Element
        </div>
        <div data-testid="is-intersecting">{isIntersecting.toString()}</div>
        <div data-testid="has-loaded">{hasLoaded.toString()}</div>
      </div>
    )
  }

  it('should track intersection state', async () => {
    render(<TestHookComponent />)

    expect(screen.getByTestId('is-intersecting')).toHaveTextContent('false')
    expect(screen.getByTestId('has-loaded')).toHaveTextContent('false')

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: screen.getByTestId('observed-element'),
    } as IntersectionObserverEntry

    mockCallback([mockEntry])

    await waitFor(() => {
      expect(screen.getByTestId('is-intersecting')).toHaveTextContent('true')
      expect(screen.getByTestId('has-loaded')).toHaveTextContent('true')
    })
  })

  it('should apply priority-based delays', async () => {
    jest.useFakeTimers()

    render(<TestHookComponent options={{ priority: 'medium' }} />)

    const mockEntry = {
      isIntersecting: true,
      target: screen.getByTestId('observed-element'),
    } as IntersectionObserverEntry

    mockCallback([mockEntry])

    // Should not update immediately
    expect(screen.getByTestId('is-intersecting')).toHaveTextContent('false')

    // Should update after medium priority delay (100ms)
    jest.advanceTimersByTime(100)

    await waitFor(() => {
      expect(screen.getByTestId('is-intersecting')).toHaveTextContent('true')
    })

    jest.useRealTimers()
  })

  it('should use custom root margin and threshold', () => {
    render(
      <TestHookComponent
        options={{
          rootMargin: '200px',
          threshold: 0.8,
        }}
      />
    )

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '200px',
        threshold: 0.8,
      }
    )
  })
})
