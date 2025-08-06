import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import {
  createMemoizedComponent,
  MemoizedDashboardCard,
  MemoizedChartWrapper,
  MemoizedMetricCard,
  useMemoizedCalculation,
  useStableObject,
  withPerformanceMonitoring,
  RenderOptimizer,
  useOptimizedRender,
  RenderBarrier,
  useRenderPerformance,
} from '../memoization'

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
  writable: true,
})

describe('Memoization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createMemoizedComponent', () => {
    it('should create a memoized component', () => {
      const TestComponent = ({ value }: { value: number }) => (
        <div data-testid="test-component">{value}</div>
      )

      const MemoizedTestComponent = createMemoizedComponent(TestComponent)

      const { rerender } = render(<MemoizedTestComponent value={1} />)
      expect(screen.getByText('1')).toBeInTheDocument()

      // Re-render with same props should not cause re-render
      rerender(<MemoizedTestComponent value={1} />)
      expect(screen.getByText('1')).toBeInTheDocument()

      // Re-render with different props should cause re-render
      rerender(<MemoizedTestComponent value={2} />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should use custom comparison function', () => {
      const TestComponent = ({ obj }: { obj: { id: number; name: string } }) => (
        <div data-testid="test-component">{obj.name}</div>
      )

      const MemoizedTestComponent = createMemoizedComponent(
        TestComponent,
        (prevProps, nextProps) => prevProps.obj.id === nextProps.obj.id
      )

      const { rerender } = render(
        <MemoizedTestComponent obj={{ id: 1, name: 'Test' }} />
      )
      expect(screen.getByText('Test')).toBeInTheDocument()

      // Same ID should not re-render even with different name
      rerender(<MemoizedTestComponent obj={{ id: 1, name: 'Updated' }} />)
      expect(screen.getByText('Test')).toBeInTheDocument() // Should still show old name

      // Different ID should re-render
      rerender(<MemoizedTestComponent obj={{ id: 2, name: 'New' }} />)
      expect(screen.getByText('New')).toBeInTheDocument()
    })
  })

  describe('MemoizedDashboardCard', () => {
    it('should render dashboard card', () => {
      render(
        <MemoizedDashboardCard title="Test Card" data={{ value: 100 }}>
          <div>Card content</div>
        </MemoizedDashboardCard>
      )

      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should memoize based on props', () => {
      const { rerender } = render(
        <MemoizedDashboardCard title="Test" data={{ value: 100 }} loading={false}>
          <div>Content</div>
        </MemoizedDashboardCard>
      )

      // Same props should not re-render
      rerender(
        <MemoizedDashboardCard title="Test" data={{ value: 100 }} loading={false}>
          <div>Content</div>
        </MemoizedDashboardCard>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('MemoizedChartWrapper', () => {
    it('should render chart wrapper', () => {
      render(
        <MemoizedChartWrapper
          type="line"
          data={{ datasets: [] }}
          height={300}
        />
      )

      expect(screen.getByRole('generic')).toHaveStyle('height: 300px')
    })
  })

  describe('MemoizedMetricCard', () => {
    it('should render metric card', () => {
      render(
        <MemoizedMetricCard
          metric="100"
          label="Test Metric"
          trend="up"
          unit="items"
        />
      )

      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('Test Metric')).toBeInTheDocument()
      expect(screen.getByText('up')).toBeInTheDocument()
      expect(screen.getByText('items')).toBeInTheDocument()
    })
  })

  describe('useMemoizedCalculation', () => {
    const TestComponent = ({ input }: { input: number }) => {
      const expensiveCalculation = () => {
        // Simulate expensive calculation
        return input * 2
      }

      const result = useMemoizedCalculation(
        expensiveCalculation,
        [input],
        { key: 'test-calculation' }
      )

      return <div data-testid="result">{result}</div>
    }

    it('should memoize expensive calculations', () => {
      const { rerender } = render(<TestComponent input={5} />)
      expect(screen.getByTestId('result')).toHaveTextContent('10')

      // Same input should use cached result
      rerender(<TestComponent input={5} />)
      expect(screen.getByTestId('result')).toHaveTextContent('10')

      // Different input should recalculate
      rerender(<TestComponent input={10} />)
      expect(screen.getByTestId('result')).toHaveTextContent('20')
    })
  })

  describe('useStableObject', () => {
    const TestComponent = ({ obj }: { obj: { id: number; name: string } }) => {
      const stableObj = useStableObject(obj)
      
      return (
        <div data-testid="stable-obj">
          {stableObj.id}-{stableObj.name}
        </div>
      )
    }

    it('should provide stable object references', () => {
      const { rerender } = render(
        <TestComponent obj={{ id: 1, name: 'Test' }} />
      )
      expect(screen.getByTestId('stable-obj')).toHaveTextContent('1-Test')

      // Same object values should maintain reference
      rerender(<TestComponent obj={{ id: 1, name: 'Test' }} />)
      expect(screen.getByTestId('stable-obj')).toHaveTextContent('1-Test')

      // Different object values should update reference
      rerender(<TestComponent obj={{ id: 2, name: 'Updated' }} />)
      expect(screen.getByTestId('stable-obj')).toHaveTextContent('2-Updated')
    })
  })

  describe('withPerformanceMonitoring', () => {
    it('should wrap component with performance monitoring', () => {
      const TestComponent = ({ message }: { message: string }) => (
        <div data-testid="monitored-component">{message}</div>
      )

      const MonitoredComponent = withPerformanceMonitoring(TestComponent, 'TestComponent')

      render(<MonitoredComponent message="Hello" />)
      expect(screen.getByTestId('monitored-component')).toHaveTextContent('Hello')
    })
  })

  describe('RenderOptimizer', () => {
    it('should batch updates', (done) => {
      const updates = [
        jest.fn(),
        jest.fn(),
        jest.fn(),
      ]

      RenderOptimizer.batchUpdates(updates)

      // Updates should be batched and executed asynchronously
      setTimeout(() => {
        updates.forEach(update => {
          expect(update).toHaveBeenCalled()
        })
        done()
      }, 10)
    })

    it('should debounce updates', (done) => {
      const updateFn = jest.fn()

      // Call multiple times rapidly
      RenderOptimizer.debounceUpdate(updateFn, 50, 'test')
      RenderOptimizer.debounceUpdate(updateFn, 50, 'test')
      RenderOptimizer.debounceUpdate(updateFn, 50, 'test')

      // Should only be called once after delay
      setTimeout(() => {
        expect(updateFn).toHaveBeenCalledTimes(1)
        done()
      }, 100)
    })

    it('should throttle updates', () => {
      const updateFn = jest.fn()

      // Call multiple times rapidly
      RenderOptimizer.throttleUpdate(updateFn, 50, 'test')
      RenderOptimizer.throttleUpdate(updateFn, 50, 'test')
      RenderOptimizer.throttleUpdate(updateFn, 50, 'test')

      // Should only be called once immediately
      expect(updateFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('useOptimizedRender', () => {
    const TestComponent = () => {
      const { scheduleUpdate } = useOptimizedRender()
      
      return (
        <div>
          <button onClick={() => scheduleUpdate('high')} data-testid="high-priority">
            High Priority
          </button>
          <button onClick={() => scheduleUpdate('normal')} data-testid="normal-priority">
            Normal Priority
          </button>
          <button onClick={() => scheduleUpdate('low')} data-testid="low-priority">
            Low Priority
          </button>
        </div>
      )
    }

    it('should provide optimized render scheduling', () => {
      render(<TestComponent />)
      
      expect(screen.getByTestId('high-priority')).toBeInTheDocument()
      expect(screen.getByTestId('normal-priority')).toBeInTheDocument()
      expect(screen.getByTestId('low-priority')).toBeInTheDocument()

      // Should not throw when clicking buttons
      fireEvent.click(screen.getByTestId('high-priority'))
      fireEvent.click(screen.getByTestId('normal-priority'))
      fireEvent.click(screen.getByTestId('low-priority'))
    })
  })

  describe('RenderBarrier', () => {
    it('should prevent unnecessary re-renders of children', () => {
      render(
        <RenderBarrier>
          <div data-testid="barrier-child">Protected content</div>
        </RenderBarrier>
      )

      expect(screen.getByTestId('barrier-child')).toHaveTextContent('Protected content')
    })
  })

  describe('useRenderPerformance', () => {
    const TestComponent = ({ name }: { name: string }) => {
      const { renderCount, averageRenderTime } = useRenderPerformance(name)
      
      return (
        <div>
          <div data-testid="render-count">{renderCount}</div>
          <div data-testid="avg-render-time">{averageRenderTime}</div>
        </div>
      )
    }

    it('should track render performance', () => {
      const { rerender } = render(<TestComponent name="TestComponent" />)
      
      expect(screen.getByTestId('render-count')).toHaveTextContent('1')
      
      // Re-render to increment count
      rerender(<TestComponent name="TestComponent" />)
      expect(screen.getByTestId('render-count')).toHaveTextContent('2')
    })
  })
})