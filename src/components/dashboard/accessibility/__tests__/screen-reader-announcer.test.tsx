import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ScreenReaderAnnouncer,
  useScreenReaderAnnouncer,
  DataAnnouncer,
  ChartAnnouncer,
  FilterAnnouncer,
} from '../screen-reader-announcer'

// Mock window.announceToScreenReader
const mockAnnounce = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(window as any).announceToScreenReader = mockAnnounce
})

afterEach(() => {
  delete (window as any).announceToScreenReader
})

describe('ScreenReaderAnnouncer', () => {
  it('renders live regions correctly', () => {
    render(<ScreenReaderAnnouncer />)

    // Should have both polite and assertive live regions
    const politeRegion = document.querySelector('[aria-live="polite"]')
    const assertiveRegion = document.querySelector('[aria-live="assertive"]')

    expect(politeRegion).toBeInTheDocument()
    expect(assertiveRegion).toBeInTheDocument()
    expect(politeRegion).toHaveAttribute('role', 'status')
    expect(assertiveRegion).toHaveAttribute('role', 'alert')
  })

  it('sets up global announce function', () => {
    render(<ScreenReaderAnnouncer />)

    expect((window as any).announceToScreenReader).toBeDefined()
    expect(typeof (window as any).announceToScreenReader).toBe('function')
  })

  it('cleans up global announce function on unmount', () => {
    const { unmount } = render(<ScreenReaderAnnouncer />)

    expect((window as any).announceToScreenReader).toBeDefined()

    unmount()

    expect((window as any).announceToScreenReader).toBeUndefined()
  })

  it('processes announcement queue', async () => {
    render(<ScreenReaderAnnouncer />)

    const politeRegion = document.querySelector('[aria-live="polite"]')

    act(() => {
      ;(window as any).announceToScreenReader('Test message', 'polite')
    })

    await waitFor(() => {
      expect(politeRegion).toHaveTextContent('Test message')
    })

    // Message should be cleared after processing
    await waitFor(
      () => {
        expect(politeRegion).toHaveTextContent('')
      },
      { timeout: 200 }
    )
  })

  it('handles assertive announcements', async () => {
    render(<ScreenReaderAnnouncer />)

    const assertiveRegion = document.querySelector('[aria-live="assertive"]')

    act(() => {
      ;(window as any).announceToScreenReader('Urgent message', 'assertive')
    })

    await waitFor(() => {
      expect(assertiveRegion).toHaveTextContent('Urgent message')
    })
  })

  it('handles delayed announcements', async () => {
    render(<ScreenReaderAnnouncer />)

    const politeRegion = document.querySelector('[aria-live="polite"]')

    act(() => {
      ;(window as any).announceToScreenReader('Delayed message', 'polite', 100)
    })

    // Should not appear immediately
    expect(politeRegion).toHaveTextContent('')

    // Should appear after delay
    await waitFor(
      () => {
        expect(politeRegion).toHaveTextContent('Delayed message')
      },
      { timeout: 200 }
    )
  })
})

describe('useScreenReaderAnnouncer', () => {
  function TestComponent() {
    const {
      announce,
      announcePolite,
      announceAssertive,
      announceDataUpdate,
      announceChartInteraction,
      announceNavigation,
      announceFilterChange,
      announceLoading,
      announceError,
    } = useScreenReaderAnnouncer()

    return (
      <div>
        <button onClick={() => announce('Test message')}>Announce</button>
        <button onClick={() => announcePolite('Polite message')}>
          Announce Polite
        </button>
        <button onClick={() => announceAssertive('Assertive message')}>
          Announce Assertive
        </button>
        <button onClick={() => announceDataUpdate('chart data', 'updated')}>
          Data Update
        </button>
        <button
          onClick={() =>
            announceChartInteraction('Selected', 'bar', 100, 'sales chart')
          }
        >
          Chart Interaction
        </button>
        <button onClick={() => announceNavigation('dashboard')}>
          Navigation
        </button>
        <button onClick={() => announceFilterChange('status', 'active', 5)}>
          Filter Change
        </button>
        <button onClick={() => announceLoading('data', true)}>Loading</button>
        <button onClick={() => announceError('Network error', 'API')}>
          Error
        </button>
      </div>
    )
  }

  beforeEach(() => {
    render(<ScreenReaderAnnouncer />)
  })

  it('announces generic messages', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Announce'))

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Test message',
      'polite',
      undefined
    )
  })

  it('announces polite messages', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Announce Polite'))

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Polite message',
      'polite',
      undefined
    )
  })

  it('announces assertive messages', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Announce Assertive'))

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Assertive message',
      'assertive',
      undefined
    )
  })

  it('announces data updates', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Data Update'))

    expect(mockAnnounce).toHaveBeenCalledWith('chart data updated', 'polite')
  })

  it('announces chart interactions', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Chart Interaction'))

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Selected bar with value 100 in sales chart',
      'polite'
    )
  })

  it('announces navigation changes', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Navigation'))

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Navigated to dashboard',
      'polite'
    )
  })

  it('announces filter changes', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Filter Change'))

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Filter applied: status set to active. Showing 5 results',
      'polite'
    )
  })

  it('announces loading states', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Loading'))

    expect(mockAnnounce).toHaveBeenCalledWith('Loading data', 'polite')
  })

  it('announces errors', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    await user.click(screen.getByText('Error'))

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Error: Network error in API',
      'assertive'
    )
  })
})

describe('DataAnnouncer', () => {
  beforeEach(() => {
    render(<ScreenReaderAnnouncer />)
  })

  it('announces data loading', () => {
    const { rerender } = render(
      <DataAnnouncer data={null} dataType="chart" loading={false}>
        <div>Content</div>
      </DataAnnouncer>
    )

    rerender(
      <DataAnnouncer data={null} dataType="chart" loading={true}>
        <div>Content</div>
      </DataAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith('Loading chart', 'polite')
  })

  it('announces data loaded', () => {
    const { rerender } = render(
      <DataAnnouncer data={null} dataType="chart" loading={true}>
        <div>Content</div>
      </DataAnnouncer>
    )

    rerender(
      <DataAnnouncer data={[1, 2, 3]} dataType="chart" loading={false}>
        <div>Content</div>
      </DataAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith('chart loaded', 'polite')
  })

  it('announces data updates', () => {
    const { rerender } = render(
      <DataAnnouncer data={[1, 2, 3]} dataType="chart" loading={false}>
        <div>Content</div>
      </DataAnnouncer>
    )

    rerender(
      <DataAnnouncer data={[1, 2, 3, 4]} dataType="chart" loading={false}>
        <div>Content</div>
      </DataAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith('chart updated', 'polite')
  })

  it('announces errors', () => {
    render(
      <DataAnnouncer data={null} dataType="chart" error="Failed to load">
        <div>Content</div>
      </DataAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Error: Failed to load in chart',
      'assertive'
    )
  })
})

describe('ChartAnnouncer', () => {
  beforeEach(() => {
    render(<ScreenReaderAnnouncer />)
  })

  it('announces chart element selection', () => {
    const { rerender } = render(
      <ChartAnnouncer chartType="bar" data={[]} selectedElement={null}>
        <div>Chart</div>
      </ChartAnnouncer>
    )

    const selectedElement = { type: 'bar', value: 100 }
    rerender(
      <ChartAnnouncer
        chartType="bar"
        data={[]}
        selectedElement={selectedElement}
      >
        <div>Chart</div>
      </ChartAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Selected bar with value 100 in bar chart',
      'polite'
    )
  })

  it('handles different element types', () => {
    const { rerender } = render(
      <ChartAnnouncer chartType="line" data={[]} selectedElement={null}>
        <div>Chart</div>
      </ChartAnnouncer>
    )

    const selectedElement = { y: 50, data: 'point data' }
    rerender(
      <ChartAnnouncer
        chartType="line"
        data={[]}
        selectedElement={selectedElement}
      >
        <div>Chart</div>
      </ChartAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Selected element with value 50 in line chart',
      'polite'
    )
  })
})

describe('FilterAnnouncer', () => {
  beforeEach(() => {
    render(<ScreenReaderAnnouncer />)
  })

  it('announces filter changes', () => {
    const { rerender } = render(
      <FilterAnnouncer filters={{ status: 'all' }} resultCount={10}>
        <div>Content</div>
      </FilterAnnouncer>
    )

    rerender(
      <FilterAnnouncer filters={{ status: 'active' }} resultCount={5}>
        <div>Content</div>
      </FilterAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Filter applied: status set to active. Showing 5 results',
      'polite'
    )
  })

  it('handles multiple filter changes', () => {
    const { rerender } = render(
      <FilterAnnouncer filters={{ status: 'all', type: 'all' }}>
        <div>Content</div>
      </FilterAnnouncer>
    )

    rerender(
      <FilterAnnouncer filters={{ status: 'active', type: 'premium' }}>
        <div>Content</div>
      </FilterAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Filter applied: status set to active',
      'polite'
    )
    expect(mockAnnounce).toHaveBeenCalledWith(
      'Filter applied: type set to premium',
      'polite'
    )
  })

  it('announces filter changes without result count', () => {
    const { rerender } = render(
      <FilterAnnouncer filters={{ category: 'all' }}>
        <div>Content</div>
      </FilterAnnouncer>
    )

    rerender(
      <FilterAnnouncer filters={{ category: 'electronics' }}>
        <div>Content</div>
      </FilterAnnouncer>
    )

    expect(mockAnnounce).toHaveBeenCalledWith(
      'Filter applied: category set to electronics',
      'polite'
    )
  })
})
