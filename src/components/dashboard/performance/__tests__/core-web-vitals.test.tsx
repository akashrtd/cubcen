import React from 'react'
import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import {
  useCoreWebVitals,
  getPerformanceRating,
  PERFORMANCE_THRESHOLDS,
  PerformanceMonitor,
  PerformanceDashboard,
  useComponentPerformance,
  usePerformanceBudget,
  useRealUserMonitoring,
} from '../core-web-vitals'

// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn()
mockPerformanceObserver.mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}))

Object.defineProperty(window, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
})

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    mark: jest.fn(),
    measure: jest.fn(),
  },
  writable: true,
})

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock

describe('Core Web Vitals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPerformanceRating', () => {
    it('should return correct ratings for LCP', () => {
      expect(getPerformanceRating('lcp', 2000)).toBe('good')
      expect(getPerformanceRating('lcp', 3000)).toBe('needs-improvement')
      expect(getPerformanceRating('lcp', 5000)).toBe('poor')
    })

    it('should return correct ratings for FID', () => {
      expect(getPerformanceRating('fid', 50)).toBe('good')
      expect(getPerformanceRating('fid', 200)).toBe('needs-improvement')
      expect(getPerformanceRating('fid', 400)).toBe('poor')
    })

    it('should return correct ratings for CLS', () => {
      expect(getPerformanceRating('cls', 0.05)).toBe('good')
      expect(getPerformanceRating('cls', 0.15)).toBe('needs-improvement')
      expect(getPerformanceRating('cls', 0.3)).toBe('poor')
    })
  })

  describe('useCoreWebVitals', () => {
    const TestComponent = () => {
      const metrics = useCoreWebVitals()
      
      return (
        <div>
          <div data-testid="lcp">{metrics.lcp || 'N/A'}</div>
          <div data-testid="fid">{metrics.fid || 'N/A'}</div>
          <div data-testid="cls">{metrics.cls || 'N/A'}</div>
        </div>
      )
    }

    it('should initialize with empty metrics', () => {
      render(<TestComponent />)
      
      expect(screen.getByTestId('lcp')).toHaveTextContent('N/A')
      expect(screen.getByTestId('fid')).toHaveTextContent('N/A')
      expect(screen.getByTestId('cls')).toHaveTextContent('N/A')
    })

    it('should set up performance observers', () => {
      render(<TestComponent />)
      
      // Should attempt to create observers for different metrics
      expect(mockPerformanceObserver).toHaveBeenCalled()
    })
  })

  describe('PerformanceMonitor', () => {
    it('should render children and monitor performance', () => {
      const onMetricsUpdate = jest.fn()
      
      render(
        <PerformanceMonitor onMetricsUpdate={onMetricsUpdate}>
          <div data-testid="child">Child content</div>
        </PerformanceMonitor>
      )
      
      expect(screen.getByTestId('child')).toHaveTextContent('Child content')
    })
  })

  describe('PerformanceDashboard', () => {
    it('should not render in production by default', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      render(<PerformanceDashboard />)
      
      // Should not render dashboard in production
      expect(screen.queryByText('Core Web Vitals')).not.toBeInTheDocument()
      
      process.env.NODE_ENV = originalEnv
    })

    it('should render in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      render(<PerformanceDashboard />)
      
      // Should render dashboard in development
      expect(screen.getByText('Core Web Vitals')).toBeInTheDocument()
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('useComponentPerformance', () => {
    const TestComponent = ({ name }: { name: string }) => {
      const { renderCount, mountTime } = useComponentPerformance(name)
      
      return (
        <div>
          <div data-testid="render-count">{renderCount}</div>
          <div data-testid="mount-time">{mountTime}</div>
        </div>
      )
    }

    it('should track component performance', () => {
      const { rerender } = render(<TestComponent name="TestComponent" />)
      
      expect(screen.getByTestId('render-count')).toHaveTextContent('1')
      
      // Re-render should increment count
      rerender(<TestComponent name="TestComponent" />)
      expect(screen.getByTestId('render-count')).toHaveTextContent('2')
    })
  })

  describe('usePerformanceBudget', () => {
    const TestComponent = ({ budgets }: { budgets: any }) => {
      const { violations, isWithinBudget } = usePerformanceBudget(budgets)
      
      return (
        <div>
          <div data-testid="within-budget">{isWithinBudget.toString()}</div>
          <div data-testid="violations">{violations.length}</div>
        </div>
      )
    }

    it('should check performance budget', () => {
      const budgets = {
        lcp: 2000,
        fid: 100,
        cls: 0.1,
      }
      
      render(<TestComponent budgets={budgets} />)
      
      // Should start within budget (no metrics yet)
      expect(screen.getByTestId('within-budget')).toHaveTextContent('true')
      expect(screen.getByTestId('violations')).toHaveTextContent('0')
    })
  })

  describe('useRealUserMonitoring', () => {
    const TestComponent = () => {
      const rumData = useRealUserMonitoring()
      
      return (
        <div>
          <div data-testid="rum-data">
            {rumData ? 'Has Data' : 'No Data'}
          </div>
        </div>
      )
    }

    it('should collect RUM data', () => {
      // Mock navigation timing
      Object.defineProperty(window.performance, 'getEntriesByType', {
        value: jest.fn((type) => {
          if (type === 'navigation') {
            return [{
              navigationStart: 0,
              loadEventEnd: 1000,
              domContentLoadedEventEnd: 500,
            }]
          }
          if (type === 'resource') {
            return [
              { name: 'script.js', duration: 100 },
              { name: 'style.css', duration: 50 },
            ]
          }
          return []
        }),
        writable: true,
      })
      
      render(<TestComponent />)
      
      // Should collect RUM data
      expect(screen.getByTestId('rum-data')).toHaveTextContent('Has Data')
    })
  })

  describe('PERFORMANCE_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(PERFORMANCE_THRESHOLDS.lcp.good).toBe(2500)
      expect(PERFORMANCE_THRESHOLDS.lcp.needsImprovement).toBe(4000)
      
      expect(PERFORMANCE_THRESHOLDS.fid.good).toBe(100)
      expect(PERFORMANCE_THRESHOLDS.fid.needsImprovement).toBe(300)
      
      expect(PERFORMANCE_THRESHOLDS.cls.good).toBe(0.1)
      expect(PERFORMANCE_THRESHOLDS.cls.needsImprovement).toBe(0.25)
    })
  })
})