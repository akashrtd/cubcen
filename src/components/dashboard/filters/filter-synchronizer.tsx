'use client'

import React, { useEffect, useCallback, useRef } from 'react'
import { useFilters } from './filter-context'
import type { FilterState, FilterValue } from '@/types/dashboard'

interface FilterSynchronizerProps {
  children: React.ReactNode
  // Synchronization options
  syncAcrossCards?: boolean
  syncAcrossCharts?: boolean
  syncDelay?: number // Debounce delay in ms
  onFilterChange?: (filters: FilterState) => void
  onFilterApplied?: (key: string, value: FilterValue) => void
  onFilterRemoved?: (key: string) => void
}

export function FilterSynchronizer({
  children,
  syncAcrossCards = true,
  syncAcrossCharts = true,
  syncDelay = 300,
  onFilterChange,
  onFilterApplied,
  onFilterRemoved,
}: FilterSynchronizerProps) {
  const { filters } = useFilters()
  const previousFiltersRef = useRef<FilterState>({})
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounced filter change handler
  const debouncedFilterChange = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onFilterChange?.(filters)
    }, syncDelay)
  }, [filters, syncDelay, onFilterChange])

  // Track filter changes and call appropriate callbacks
  useEffect(() => {
    const previousFilters = previousFiltersRef.current
    const currentFilters = filters

    // Check for added/changed filters
    if (currentFilters.customFilters) {
      Object.entries(currentFilters.customFilters).forEach(([key, value]) => {
        const previousValue = previousFilters.customFilters?.[key]
        if (
          !previousValue ||
          JSON.stringify(previousValue) !== JSON.stringify(value)
        ) {
          onFilterApplied?.(key, value)
        }
      })
    }

    // Check for removed filters
    if (previousFilters.customFilters) {
      Object.keys(previousFilters.customFilters).forEach(key => {
        if (!currentFilters.customFilters?.[key]) {
          onFilterRemoved?.(key)
        }
      })
    }

    // Check for other filter changes
    const filterKeys: (keyof FilterState)[] = [
      'dateRange',
      'categories',
      'status',
      'priority',
      'platforms',
      'agents',
    ]

    filterKeys.forEach(key => {
      const currentValue = currentFilters[key]
      const previousValue = previousFilters[key]

      if (JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
        if (currentValue && key !== 'dateRange') {
          // For array filters, create a filter value
          const filterValue: FilterValue = {
            type: 'array',
            value: currentValue,
            operator: 'equals',
          }
          onFilterApplied?.(key, filterValue)
        } else if (currentValue && key === 'dateRange') {
          // For date range, create a special filter value
          const filterValue: FilterValue = {
            type: 'date',
            value: currentValue,
            operator: 'between',
          }
          onFilterApplied?.(key, filterValue)
        } else if (!currentValue && previousValue) {
          onFilterRemoved?.(key)
        }
      }
    })

    // Update previous filters reference
    previousFiltersRef.current = { ...currentFilters }

    // Call debounced change handler
    debouncedFilterChange()
  }, [filters, onFilterApplied, onFilterRemoved, debouncedFilterChange])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return <>{children}</>
}

// Hook for components to react to filter changes
export function useFilterSync(
  callback: (filters: FilterState) => void,
  dependencies: React.DependencyList = []
) {
  const { filters } = useFilters()
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Call callback when filters change
  useEffect(() => {
    callbackRef.current(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, ...dependencies])
}

// Hook for components to get filtered data that updates automatically
export function useSyncedFilteredData<T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[] = [],
  customFilterLogic?: (item: T, filters: FilterState) => boolean
): T[] {
  const { filters } = useFilters()

  return React.useMemo(() => {
    if (!data) return []

    return data.filter(item => {
      // Custom filter logic takes precedence
      if (customFilterLogic) {
        return customFilterLogic(item, filters)
      }

      // Search filter
      if (filters.customFilters?.search) {
        const searchValue = filters.customFilters.search.value.toLowerCase()
        const matchesSearch = searchFields.some(field => {
          const fieldValue = String(item[field] || '').toLowerCase()
          return fieldValue.includes(searchValue)
        })
        if (!matchesSearch) return false
      }

      // Date range filter
      if (filters.dateRange && item.createdAt) {
        const itemDate = new Date(item.createdAt)
        if (
          itemDate < filters.dateRange.start ||
          itemDate > filters.dateRange.end
        ) {
          return false
        }
      }

      // Array-based filters
      const arrayFilters: Array<{ key: keyof FilterState; itemKey: keyof T }> =
        [
          { key: 'categories', itemKey: 'category' },
          { key: 'status', itemKey: 'status' },
          { key: 'priority', itemKey: 'priority' },
          { key: 'platforms', itemKey: 'platform' },
          { key: 'agents', itemKey: 'agent' },
        ]

      for (const { key, itemKey } of arrayFilters) {
        const filterValues = filters[key] as string[] | undefined
        if (filterValues?.length && item[itemKey]) {
          if (!filterValues.includes(String(item[itemKey]))) return false
        }
      }

      // Custom filters
      if (filters.customFilters) {
        for (const [key, filter] of Object.entries(filters.customFilters)) {
          if (key === 'search') continue // Already handled above

          const itemValue = item[key as keyof T]
          if (itemValue === undefined || itemValue === null) continue

          switch (filter.operator) {
            case 'equals':
              if (itemValue !== filter.value) return false
              break
            case 'contains':
              if (
                !String(itemValue)
                  .toLowerCase()
                  .includes(String(filter.value).toLowerCase())
              ) {
                return false
              }
              break
            case 'greaterThan':
              if (Number(itemValue) <= Number(filter.value)) return false
              break
            case 'lessThan':
              if (Number(itemValue) >= Number(filter.value)) return false
              break
            case 'between':
              if (Array.isArray(filter.value) && filter.value.length === 2) {
                const [min, max] = filter.value
                const numValue = Number(itemValue)
                if (numValue < Number(min) || numValue > Number(max))
                  return false
              }
              break
          }
        }
      }

      return true
    })
  }, [data, filters, searchFields, customFilterLogic])
}

// Hook for cross-card data filtering with enhanced capabilities
export function useCrossCardFiltering<T extends Record<string, any>>(
  data: T[],
  options: {
    searchFields?: (keyof T)[]
    filterMappings?: Record<
      string,
      (item: T, filterValue: FilterValue) => boolean
    >
    enabledFilters?: string[]
    customLogic?: (item: T, filters: FilterState) => boolean
  } = {}
): {
  filteredData: T[]
  activeFilters: Record<string, FilterValue>
  filterCount: number
} {
  const { filters } = useFilters()
  const {
    searchFields = [],
    filterMappings = {},
    enabledFilters,
    customLogic,
  } = options

  const result = React.useMemo(() => {
    if (!data) return { filteredData: [], activeFilters: {}, filterCount: 0 }

    const activeFilters = filters.customFilters || {}
    const filterCount = Object.keys(activeFilters).length

    // Filter data based on active filters
    const filteredData = data.filter(item => {
      // Custom logic takes precedence
      if (customLogic) {
        return customLogic(item, filters)
      }

      // Check each active filter
      return Object.entries(activeFilters).every(([filterKey, filterValue]) => {
        // Skip if this filter is not enabled
        if (enabledFilters && !enabledFilters.includes(filterKey)) {
          return true
        }

        // Use custom mapping if provided
        if (filterMappings[filterKey]) {
          return filterMappings[filterKey](item, filterValue)
        }

        // Default filtering logic
        const itemValue = item[filterKey as keyof T]

        if (itemValue === undefined || itemValue === null) return true

        switch (filterValue.operator) {
          case 'equals':
            return itemValue === filterValue.value
          case 'contains':
            return String(itemValue)
              .toLowerCase()
              .includes(String(filterValue.value).toLowerCase())
          case 'greaterThan':
            return Number(itemValue) > Number(filterValue.value)
          case 'lessThan':
            return Number(itemValue) < Number(filterValue.value)
          case 'between':
            if (
              Array.isArray(filterValue.value) &&
              filterValue.value.length === 2
            ) {
              const [min, max] = filterValue.value
              return (
                Number(itemValue) >= Number(min) &&
                Number(itemValue) <= Number(max)
              )
            }
            return true
          default:
            return itemValue === filterValue.value
        }
      })
    })

    return { filteredData, activeFilters, filterCount }
  }, [data, filters.customFilters, filterMappings, enabledFilters, customLogic])

  return result
}

// Component for visual filter state indicators
export function FilterStateIndicator({
  filterKey,
  className,
}: {
  filterKey: string
  className?: string
}) {
  const { filters, removeFilter } = useFilters()
  const filterValue = filters.customFilters?.[filterKey]

  if (!filterValue) return null

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full ${className}`}
    >
      <span>
        {filterKey}: {String(filterValue.value)}
      </span>
      <button
        onClick={() => removeFilter(filterKey)}
        className="hover:bg-primary/20 rounded-full p-0.5"
        aria-label={`Remove ${filterKey} filter`}
      >
        ×
      </button>
    </div>
  )
}

// Component for displaying all active filters
export function ActiveFiltersDisplay({
  className,
  showClearAll = true,
}: {
  className?: string
  showClearAll?: boolean
}) {
  const { filters, clearFilters } = useFilters()
  const activeFilters = filters.customFilters || {}

  if (Object.keys(activeFilters).length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {Object.keys(activeFilters).map(key => (
        <FilterStateIndicator key={key} filterKey={key} />
      ))}
      {showClearAll && (
        <button
          onClick={clearFilters}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

// Component for debugging filter state
export function FilterDebugger({ enabled = false }: { enabled?: boolean }) {
  const { filters, isFiltered, activeFilterCount } = useFilters()

  if (!enabled) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-semibold text-sm mb-2">Filter Debug</h3>
      <div className="space-y-1 text-xs">
        <div>Active: {isFiltered ? 'Yes' : 'No'}</div>
        <div>Count: {activeFilterCount}</div>
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">Filter State</summary>
          <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
