import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  FilterSynchronizer,
  useFilterSync,
  useSyncedFilteredData,
  FilterDebugger,
} from '../filter-synchronizer'
import { FilterProvider, useFilters } from '../filter-context'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    toString: jest.fn(() => ''),
  })),
}))

// Test wrapper with FilterProvider
function TestWrapper({ children, ...props }: any) {
  return <FilterProvider {...props}>{children}</FilterProvider>
}

// Test component that uses filters
function TestFilterComponent() {
  const { setFilter, setCategories, setStatus, clearFilters } = useFilters()

  return (
    <div>
      <button
        data-testid="set-custom-filter"
        onClick={() =>
          setFilter('test', {
            type: 'string',
            value: 'test-value',
            operator: 'equals',
          })
        }
      >
        Set Custom Filter
      </button>
      <button
        data-testid="set-categories"
        onClick={() => setCategories(['cat1', 'cat2'])}
      >
        Set Categories
      </button>
      <button data-testid="set-status" onClick={() => setStatus(['active'])}>
        Set Status
      </button>
      <button data-testid="clear-filters" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  )
}

// Test component for useFilterSync hook
function FilterSyncTest({ callback }: { callback: (filters: any) => void }) {
  useFilterSync(callback)
  return <div data-testid="filter-sync-test">Filter Sync Test</div>
}

// Test component for useSyncedFilteredData hook
function SyncedFilteredDataTest({
  data,
  searchFields,
  customLogic,
}: {
  data: any[]
  searchFields?: string[]
  customLogic?: (item: any, filters: any) => boolean
}) {
  const filteredData = useSyncedFilteredData(data, searchFields, customLogic)

  return (
    <div>
      <div data-testid="filtered-count">{filteredData.length}</div>
      <div data-testid="filtered-data">{JSON.stringify(filteredData)}</div>
    </div>
  )
}

describe('FilterSynchronizer', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders children without issues', () => {
    render(
      <TestWrapper>
        <FilterSynchronizer>
          <div data-testid="child-content">Child Content</div>
        </FilterSynchronizer>
      </TestWrapper>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('calls onFilterChange when filters change', async () => {
    const onFilterChange = jest.fn()

    render(
      <TestWrapper>
        <FilterSynchronizer onFilterChange={onFilterChange}>
          <TestFilterComponent />
        </FilterSynchronizer>
      </TestWrapper>
    )

    await user.click(screen.getByTestId('set-custom-filter'))

    // Fast-forward timers to trigger debounced callback
    jest.advanceTimersByTime(300)

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalled()
    })
  })

  it('calls onFilterApplied when filters are added', async () => {
    const onFilterApplied = jest.fn()

    render(
      <TestWrapper>
        <FilterSynchronizer onFilterApplied={onFilterApplied}>
          <TestFilterComponent />
        </FilterSynchronizer>
      </TestWrapper>
    )

    await user.click(screen.getByTestId('set-custom-filter'))

    await waitFor(() => {
      expect(onFilterApplied).toHaveBeenCalledWith('test', {
        type: 'string',
        value: 'test-value',
        operator: 'equals',
      })
    })
  })

  it('calls onFilterRemoved when filters are removed', async () => {
    const onFilterRemoved = jest.fn()

    render(
      <TestWrapper>
        <FilterSynchronizer onFilterRemoved={onFilterRemoved}>
          <TestFilterComponent />
        </FilterSynchronizer>
      </TestWrapper>
    )

    // Add a filter first
    await user.click(screen.getByTestId('set-custom-filter'))

    // Then clear all filters
    await user.click(screen.getByTestId('clear-filters'))

    await waitFor(() => {
      expect(onFilterRemoved).toHaveBeenCalledWith('test')
    })
  })

  it('handles array-based filter changes', async () => {
    const onFilterApplied = jest.fn()

    render(
      <TestWrapper>
        <FilterSynchronizer onFilterApplied={onFilterApplied}>
          <TestFilterComponent />
        </FilterSynchronizer>
      </TestWrapper>
    )

    await user.click(screen.getByTestId('set-categories'))

    await waitFor(() => {
      expect(onFilterApplied).toHaveBeenCalledWith('categories', {
        type: 'array',
        value: ['cat1', 'cat2'],
        operator: 'equals',
      })
    })
  })

  it('debounces filter change callbacks', async () => {
    const onFilterChange = jest.fn()

    render(
      <TestWrapper>
        <FilterSynchronizer onFilterChange={onFilterChange} syncDelay={500}>
          <TestFilterComponent />
        </FilterSynchronizer>
      </TestWrapper>
    )

    // Trigger multiple filter changes quickly
    await user.click(screen.getByTestId('set-custom-filter'))
    await user.click(screen.getByTestId('set-categories'))
    await user.click(screen.getByTestId('set-status'))

    // Should not have been called yet
    expect(onFilterChange).not.toHaveBeenCalled()

    // Fast-forward timers
    jest.advanceTimersByTime(500)

    await waitFor(() => {
      // Should only be called once due to debouncing
      expect(onFilterChange).toHaveBeenCalledTimes(1)
    })
  })

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount } = render(
      <TestWrapper>
        <FilterSynchronizer onFilterChange={jest.fn()}>
          <TestFilterComponent />
        </FilterSynchronizer>
      </TestWrapper>
    )

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})

describe('useFilterSync', () => {
  const user = userEvent.setup()

  it('calls callback when filters change', async () => {
    const callback = jest.fn()

    render(
      <TestWrapper>
        <FilterSyncTest callback={callback} />
        <TestFilterComponent />
      </TestWrapper>
    )

    // Initial call
    expect(callback).toHaveBeenCalledWith({})

    await user.click(screen.getByTestId('set-custom-filter'))

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          customFilters: expect.objectContaining({
            test: { type: 'string', value: 'test-value', operator: 'equals' },
          }),
        })
      )
    })
  })

  it('updates callback when callback changes', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    const { rerender } = render(
      <TestWrapper>
        <FilterSyncTest callback={callback1} />
      </TestWrapper>
    )

    expect(callback1).toHaveBeenCalledWith({})

    rerender(
      <TestWrapper>
        <FilterSyncTest callback={callback2} />
      </TestWrapper>
    )

    expect(callback2).toHaveBeenCalledWith({})
  })
})

describe('useSyncedFilteredData', () => {
  const user = userEvent.setup()

  const testData = [
    { id: 1, name: 'John Doe', status: 'active', category: 'user' },
    { id: 2, name: 'Jane Smith', status: 'inactive', category: 'admin' },
    { id: 3, name: 'Bob Johnson', status: 'active', category: 'user' },
  ]

  it('returns all data when no filters are applied', () => {
    render(
      <TestWrapper>
        <SyncedFilteredDataTest data={testData} searchFields={['name']} />
      </TestWrapper>
    )

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('3')
  })

  it('filters data based on search filter', async () => {
    const TestComponent = () => {
      const { setFilter } = useFilters()

      return (
        <div>
          <button
            data-testid="set-search"
            onClick={() =>
              setFilter('search', {
                type: 'string',
                value: 'John',
                operator: 'contains',
              })
            }
          >
            Set Search
          </button>
          <SyncedFilteredDataTest data={testData} searchFields={['name']} />
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('set-search'))

    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('2')
    })
  })

  it('filters data based on status filter', async () => {
    const TestComponent = () => {
      const { setStatus } = useFilters()

      return (
        <div>
          <button
            data-testid="set-status-filter"
            onClick={() => setStatus(['active'])}
          >
            Set Status Filter
          </button>
          <SyncedFilteredDataTest data={testData} />
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('set-status-filter'))

    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('2')
    })
  })

  it('uses custom filter logic when provided', async () => {
    const customLogic = jest.fn((item, filters) => item.id > 1)

    render(
      <TestWrapper>
        <SyncedFilteredDataTest data={testData} customLogic={customLogic} />
      </TestWrapper>
    )

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2')
    expect(customLogic).toHaveBeenCalled()
  })

  it('handles empty data gracefully', () => {
    render(
      <TestWrapper>
        <SyncedFilteredDataTest data={[]} />
      </TestWrapper>
    )

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('0')
  })

  it('handles null data gracefully', () => {
    render(
      <TestWrapper>
        <SyncedFilteredDataTest data={null as any} />
      </TestWrapper>
    )

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('0')
  })

  it('filters by multiple criteria', async () => {
    const TestComponent = () => {
      const { setFilter, setStatus } = useFilters()

      return (
        <div>
          <button
            data-testid="set-multiple-filters"
            onClick={() => {
              setFilter('search', {
                type: 'string',
                value: 'John',
                operator: 'contains',
              })
              setStatus(['active'])
            }}
          >
            Set Multiple Filters
          </button>
          <SyncedFilteredDataTest data={testData} searchFields={['name']} />
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('set-multiple-filters'))

    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('1')
    })
  })
})

describe('FilterDebugger', () => {
  const user = userEvent.setup()

  it('renders nothing when disabled', () => {
    render(
      <TestWrapper>
        <FilterDebugger enabled={false} />
      </TestWrapper>
    )

    expect(screen.queryByText('Filter Debug')).not.toBeInTheDocument()
  })

  it('renders debug info when enabled', () => {
    render(
      <TestWrapper>
        <FilterDebugger enabled />
      </TestWrapper>
    )

    expect(screen.getByText('Filter Debug')).toBeInTheDocument()
    expect(screen.getByText('Active: No')).toBeInTheDocument()
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('updates debug info when filters change', async () => {
    render(
      <TestWrapper>
        <FilterDebugger enabled />
        <TestFilterComponent />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('set-custom-filter'))

    await waitFor(() => {
      expect(screen.getByText('Active: Yes')).toBeInTheDocument()
      expect(screen.getByText('Count: 1')).toBeInTheDocument()
    })
  })

  it('shows filter state in details', async () => {
    render(
      <TestWrapper>
        <FilterDebugger enabled />
        <TestFilterComponent />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('set-custom-filter'))

    // Open details
    const summary = screen.getByText('Filter State')
    await user.click(summary)

    await waitFor(() => {
      expect(screen.getByText(/"test"/)).toBeInTheDocument()
    })
  })
})
