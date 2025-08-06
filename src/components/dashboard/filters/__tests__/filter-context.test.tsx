import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterProvider, useFilters, useFilterValue, useIsFilterActive } from '../filter-context'
import { FilterState, FilterValue } from '@/types/dashboard'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

const mockRouter = {
  replace: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
  toString: jest.fn(() => ''),
}

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Test component that uses the filter context
function TestComponent() {
  const {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    setDateRange,
    setCategories,
    setStatus,
    setPriority,
    setPlatforms,
    setAgents,
    applyPreset,
    savePreset,
    deletePreset,
    isFiltered,
    activeFilterCount,
    presets,
  } = useFilters()

  const searchValue = useFilterValue<string>('search')
  const isSearchActive = useIsFilterActive('search')

  return (
    <div>
      <div data-testid="filters">{JSON.stringify(filters)}</div>
      <div data-testid="is-filtered">{isFiltered.toString()}</div>
      <div data-testid="active-count">{activeFilterCount}</div>
      <div data-testid="search-value">{searchValue || 'none'}</div>
      <div data-testid="search-active">{isSearchActive.toString()}</div>
      <div data-testid="presets-count">{presets.length}</div>
      
      <button
        data-testid="set-filter"
        onClick={() => setFilter('search', { type: 'string', value: 'test', operator: 'contains' })}
      >
        Set Filter
      </button>
      
      <button
        data-testid="remove-filter"
        onClick={() => removeFilter('search')}
      >
        Remove Filter
      </button>
      
      <button
        data-testid="clear-filters"
        onClick={clearFilters}
      >
        Clear Filters
      </button>
      
      <button
        data-testid="set-date-range"
        onClick={() => setDateRange(new Date('2023-01-01'), new Date('2023-12-31'))}
      >
        Set Date Range
      </button>
      
      <button
        data-testid="set-categories"
        onClick={() => setCategories(['category1', 'category2'])}
      >
        Set Categories
      </button>
      
      <button
        data-testid="set-status"
        onClick={() => setStatus(['active', 'running'])}
      >
        Set Status
      </button>
      
      <button
        data-testid="set-priority"
        onClick={() => setPriority(['high', 'critical'])}
      >
        Set Priority
      </button>
      
      <button
        data-testid="set-platforms"
        onClick={() => setPlatforms(['n8n', 'make'])}
      >
        Set Platforms
      </button>
      
      <button
        data-testid="set-agents"
        onClick={() => setAgents(['agent1', 'agent2'])}
      >
        Set Agents
      </button>
      
      <button
        data-testid="apply-preset"
        onClick={() => applyPreset({
          id: 'test-preset',
          name: 'Test Preset',
          filters: { status: ['active'] }
        })}
      >
        Apply Preset
      </button>
      
      <button
        data-testid="save-preset"
        onClick={() => savePreset('My Preset', 'Test description')}
      >
        Save Preset
      </button>
    </div>
  )
}

describe('FilterProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    mockLocalStorage.getItem.mockReturnValue(null)
    mockSearchParams.get.mockReturnValue(null)
  })

  it('provides initial filter state', () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    expect(screen.getByTestId('filters')).toHaveTextContent('{}')
    expect(screen.getByTestId('is-filtered')).toHaveTextContent('false')
    expect(screen.getByTestId('active-count')).toHaveTextContent('0')
    expect(screen.getByTestId('search-value')).toHaveTextContent('none')
    expect(screen.getByTestId('search-active')).toHaveTextContent('false')
  })

  it('includes default presets', () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    // Should have default presets (last-7-days, last-30-days, high-priority, active-agents)
    expect(screen.getByTestId('presets-count')).toHaveTextContent('4')
  })

  it('sets and removes custom filters', () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    // Set a filter
    fireEvent.click(screen.getByTestId('set-filter'))
    
    expect(screen.getByTestId('is-filtered')).toHaveTextContent('true')
    expect(screen.getByTestId('active-count')).toHaveTextContent('1')
    expect(screen.getByTestId('search-value')).toHaveTextContent('test')
    expect(screen.getByTestId('search-active')).toHaveTextContent('true')

    // Remove the filter
    fireEvent.click(screen.getByTestId('remove-filter'))
    
    expect(screen.getByTestId('is-filtered')).toHaveTextContent('false')
    expect(screen.getByTestId('active-count')).toHaveTextContent('0')
    expect(screen.getByTestId('search-value')).toHaveTextContent('none')
    expect(screen.getByTestId('search-active')).toHaveTextContent('false')
  })

  it('sets date range filter', () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    fireEvent.click(screen.getByTestId('set-date-range'))
    
    expect(screen.getByTestId('is-filtered')).toHaveTextContent('true')
    expect(screen.getByTestId('active-count')).toHaveTextContent('1')
    
    const filters = JSON.parse(screen.getByTestId('filters').textContent || '{}')
    expect(filters.dateRange).toBeDefined()
    expect(new Date(filters.dateRange.start)).toEqual(new Date('2023-01-01'))
    expect(new Date(filters.dateRange.end)).toEqual(new Date('2023-12-31'))
  })

  it('sets array-based filters', () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    // Set categories
    fireEvent.click(screen.getByTestId('set-categories'))
    expect(screen.getByTestId('active-count')).toHaveTextContent('1')
    
    // Set status
    fireEvent.click(screen.getByTestId('set-status'))
    expect(screen.getByTestId('active-count')).toHaveTextContent('2')
    
    // Set priority
    fireEvent.click(screen.getByTestId('set-priority'))
    expect(screen.getByTestId('active-count')).toHaveTextContent('3')
    
    // Set platforms
    fireEvent.click(screen.getByTestId('set-platforms'))
    expect(screen.getByTestId('active-count')).toHaveTextContent('4')
    
    // Set agents
    fireEvent.click(screen.getByTestId('set-agents'))
    expect(screen.getByTestId('active-count')).toHaveTextContent('5')

    const filters = JSON.parse(screen.getByTestId('filters').textContent || '{}')
    expect(filters.categories).toEqual(['category1', 'category2'])
    expect(filters.status).toEqual(['active', 'running'])
    expect(filters.priority).toEqual(['high', 'critical'])
    expect(filters.platforms).toEqual(['n8n', 'make'])
    expect(filters.agents).toEqual(['agent1', 'agent2'])
  })

  it('clears all filters', () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    // Set multiple filters
    fireEvent.click(screen.getByTestId('set-filter'))
    fireEvent.click(screen.getByTestId('set-categories'))
    fireEvent.click(screen.getByTestId('set-status'))
    
    expect(screen.getByTestId('active-count')).toHaveTextContent('3')

    // Clear all filters
    fireEvent.click(screen.getByTestId('clear-filters'))
    
    expect(screen.getByTestId('is-filtered')).toHaveTextContent('false')
    expect(screen.getByTestId('active-count')).toHaveTextContent('0')
    expect(screen.getByTestId('filters')).toHaveTextContent('{}')
  })

  it('applies presets', () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    fireEvent.click(screen.getByTestId('apply-preset'))
    
    expect(screen.getByTestId('is-filtered')).toHaveTextContent('true')
    expect(screen.getByTestId('active-count')).toHaveTextContent('1')
    
    const filters = JSON.parse(screen.getByTestId('filters').textContent || '{}')
    expect(filters.status).toEqual(['active'])
  })

  it('saves custom presets', () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    // Set some filters first
    fireEvent.click(screen.getByTestId('set-filter'))
    fireEvent.click(screen.getByTestId('set-categories'))
    
    // Save as preset
    fireEvent.click(screen.getByTestId('save-preset'))
    
    // Should have 5 presets now (4 default + 1 custom)
    expect(screen.getByTestId('presets-count')).toHaveTextContent('5')
  })

  it('loads filters from localStorage', () => {
    const storedFilters: FilterState = {
      categories: ['stored-category'],
      status: ['stored-status'],
    }
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedFilters))

    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    expect(screen.getByTestId('is-filtered')).toHaveTextContent('true')
    expect(screen.getByTestId('active-count')).toHaveTextContent('2')
    
    const filters = JSON.parse(screen.getByTestId('filters').textContent || '{}')
    expect(filters.categories).toEqual(['stored-category'])
    expect(filters.status).toEqual(['stored-status'])
  })

  it('loads filters from URL', () => {
    const urlFilters: FilterState = {
      priority: ['url-priority'],
    }
    
    mockSearchParams.get.mockReturnValue(encodeURIComponent(JSON.stringify(urlFilters)))

    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    expect(screen.getByTestId('is-filtered')).toHaveTextContent('true')
    expect(screen.getByTestId('active-count')).toHaveTextContent('1')
    
    const filters = JSON.parse(screen.getByTestId('filters').textContent || '{}')
    expect(filters.priority).toEqual(['url-priority'])
  })

  it('saves filters to localStorage when they change', async () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    fireEvent.click(screen.getByTestId('set-filter'))
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dashboard-filters',
        expect.stringContaining('search')
      )
    })
  })

  it('updates URL when filters change', async () => {
    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    fireEvent.click(screen.getByTestId('set-filter'))
    
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('filters='),
        { scroll: false }
      )
    })
  })

  it('handles configuration options', () => {
    const customPresets = [
      {
        id: 'custom-preset',
        name: 'Custom Preset',
        filters: { status: ['custom'] },
      },
    ]

    render(
      <FilterProvider
        configuration={{
          persistent: false,
          shareable: false,
          presets: customPresets,
        }}
        storageKey="custom-key"
        enableUrlSync={false}
      >
        <TestComponent />
      </FilterProvider>
    )

    // Should have 4 default + 1 custom preset
    expect(screen.getByTestId('presets-count')).toHaveTextContent('5')
  })

  it('handles invalid localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json')

    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    // Should still render with empty filters
    expect(screen.getByTestId('filters')).toHaveTextContent('{}')
    expect(screen.getByTestId('is-filtered')).toHaveTextContent('false')
  })

  it('handles invalid URL data gracefully', () => {
    mockSearchParams.get.mockReturnValue('invalid-encoded-data')

    render(
      <FilterProvider>
        <TestComponent />
      </FilterProvider>
    )

    // Should still render with empty filters
    expect(screen.getByTestId('filters')).toHaveTextContent('{}')
    expect(screen.getByTestId('is-filtered')).toHaveTextContent('false')
  })
})