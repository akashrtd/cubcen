'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterState, FilterValue, FilterPreset, FilterConfiguration } from '@/types/dashboard'

// Filter Actions
type FilterAction =
  | { type: 'SET_FILTER'; key: string; value: FilterValue }
  | { type: 'REMOVE_FILTER'; key: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_DATE_RANGE'; start: Date; end: Date }
  | { type: 'SET_CATEGORIES'; categories: string[] }
  | { type: 'SET_STATUS'; status: string[] }
  | { type: 'SET_PRIORITY'; priority: string[] }
  | { type: 'SET_PLATFORMS'; platforms: string[] }
  | { type: 'SET_AGENTS'; agents: string[] }
  | { type: 'APPLY_PRESET'; preset: FilterPreset }
  | { type: 'LOAD_FROM_URL'; filters: FilterState }

// Filter Context Interface
interface FilterContextValue {
  filters: FilterState
  configuration: FilterConfiguration
  presets: FilterPreset[]
  setFilter: (key: string, value: FilterValue) => void
  removeFilter: (key: string) => void
  clearFilters: () => void
  setDateRange: (start: Date, end: Date) => void
  setCategories: (categories: string[]) => void
  setStatus: (status: string[]) => void
  setPriority: (priority: string[]) => void
  setPlatforms: (platforms: string[]) => void
  setAgents: (agents: string[]) => void
  applyPreset: (preset: FilterPreset) => void
  savePreset: (name: string, description?: string) => void
  deletePreset: (presetId: string) => void
  isFiltered: boolean
  activeFilterCount: number
}

// Filter Reducer
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        customFilters: {
          ...state.customFilters,
          [action.key]: action.value,
        },
      }
    case 'REMOVE_FILTER':
      const { [action.key]: removed, ...remainingFilters } = state.customFilters || {}
      return {
        ...state,
        customFilters: remainingFilters,
      }
    case 'CLEAR_FILTERS':
      return {}
    case 'SET_DATE_RANGE':
      return {
        ...state,
        dateRange: {
          start: action.start,
          end: action.end,
        },
      }
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.categories,
      }
    case 'SET_STATUS':
      return {
        ...state,
        status: action.status,
      }
    case 'SET_PRIORITY':
      return {
        ...state,
        priority: action.priority,
      }
    case 'SET_PLATFORMS':
      return {
        ...state,
        platforms: action.platforms,
      }
    case 'SET_AGENTS':
      return {
        ...state,
        agents: action.agents,
      }
    case 'APPLY_PRESET':
      return action.preset.filters
    case 'LOAD_FROM_URL':
      return action.filters
    default:
      return state
  }
}

// Create Context
const FilterContext = createContext<FilterContextValue | undefined>(undefined)

// Default Configuration
const defaultConfiguration: FilterConfiguration = {
  enabled: true,
  persistent: true,
  shareable: true,
  presets: [],
}

// Default Presets
const defaultPresets: FilterPreset[] = [
  {
    id: 'last-7-days',
    name: 'Last 7 Days',
    description: 'Show data from the last 7 days',
    filters: {
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    },
  },
  {
    id: 'last-30-days',
    name: 'Last 30 Days',
    description: 'Show data from the last 30 days',
    filters: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    },
  },
  {
    id: 'high-priority',
    name: 'High Priority',
    description: 'Show only high and critical priority items',
    filters: {
      priority: ['high', 'critical'],
    },
  },
  {
    id: 'active-agents',
    name: 'Active Agents',
    description: 'Show only active agents and tasks',
    filters: {
      status: ['active', 'running'],
    },
  },
]

// Provider Props
interface FilterProviderProps {
  children: React.ReactNode
  configuration?: Partial<FilterConfiguration>
  initialFilters?: FilterState
  storageKey?: string
  enableUrlSync?: boolean
}

// Utility Functions
function serializeFilters(filters: FilterState): string {
  const serializable = {
    ...filters,
    dateRange: filters.dateRange
      ? {
          start: filters.dateRange.start.toISOString(),
          end: filters.dateRange.end.toISOString(),
        }
      : undefined,
  }
  return JSON.stringify(serializable)
}

function deserializeFilters(serialized: string): FilterState {
  try {
    const parsed = JSON.parse(serialized)
    return {
      ...parsed,
      dateRange: parsed.dateRange
        ? {
            start: new Date(parsed.dateRange.start),
            end: new Date(parsed.dateRange.end),
          }
        : undefined,
    }
  } catch {
    return {}
  }
}

function countActiveFilters(filters: FilterState): number {
  let count = 0
  if (filters.dateRange) count++
  if (filters.categories?.length) count++
  if (filters.status?.length) count++
  if (filters.priority?.length) count++
  if (filters.platforms?.length) count++
  if (filters.agents?.length) count++
  if (filters.customFilters) {
    count += Object.keys(filters.customFilters).length
  }
  return count
}

// Filter Provider Component
export function FilterProvider({
  children,
  configuration = {},
  initialFilters = {},
  storageKey = 'dashboard-filters',
  enableUrlSync = true,
}: FilterProviderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Merge configuration with defaults
  const config: FilterConfiguration = {
    ...defaultConfiguration,
    ...configuration,
    presets: [...defaultPresets, ...(configuration.presets || [])],
  }

  // Initialize state
  const [filters, dispatch] = useReducer(filterReducer, initialFilters)
  const [presets, setPresets] = React.useState<FilterPreset[]>(config.presets || [])

  // Load filters from localStorage on mount
  useEffect(() => {
    if (!config.persistent) return

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const storedFilters = deserializeFilters(stored)
        dispatch({ type: 'LOAD_FROM_URL', filters: storedFilters })
      }
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error)
    }
  }, [storageKey, config.persistent])

  // Load filters from URL on mount
  useEffect(() => {
    if (!enableUrlSync) return

    const filtersParam = searchParams.get('filters')
    if (filtersParam) {
      try {
        const urlFilters = deserializeFilters(decodeURIComponent(filtersParam))
        dispatch({ type: 'LOAD_FROM_URL', filters: urlFilters })
      } catch (error) {
        console.warn('Failed to load filters from URL:', error)
      }
    }
  }, [searchParams, enableUrlSync])

  // Save filters to localStorage when they change
  useEffect(() => {
    if (!config.persistent) return

    try {
      const serialized = serializeFilters(filters)
      localStorage.setItem(storageKey, serialized)
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error)
    }
  }, [filters, storageKey, config.persistent])

  // Update URL when filters change
  useEffect(() => {
    if (!enableUrlSync) return

    const serialized = serializeFilters(filters)
    const currentParams = new URLSearchParams(searchParams.toString())
    
    if (Object.keys(filters).length === 0) {
      currentParams.delete('filters')
    } else {
      currentParams.set('filters', encodeURIComponent(serialized))
    }

    const newUrl = `${window.location.pathname}?${currentParams.toString()}`
    router.replace(newUrl, { scroll: false })
  }, [filters, router, searchParams, enableUrlSync])

  // Context Methods
  const setFilter = useCallback((key: string, value: FilterValue) => {
    dispatch({ type: 'SET_FILTER', key, value })
  }, [])

  const removeFilter = useCallback((key: string) => {
    dispatch({ type: 'REMOVE_FILTER', key })
  }, [])

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }, [])

  const setDateRange = useCallback((start: Date, end: Date) => {
    dispatch({ type: 'SET_DATE_RANGE', start, end })
  }, [])

  const setCategories = useCallback((categories: string[]) => {
    dispatch({ type: 'SET_CATEGORIES', categories })
  }, [])

  const setStatus = useCallback((status: string[]) => {
    dispatch({ type: 'SET_STATUS', status })
  }, [])

  const setPriority = useCallback((priority: string[]) => {
    dispatch({ type: 'SET_PRIORITY', priority })
  }, [])

  const setPlatforms = useCallback((platforms: string[]) => {
    dispatch({ type: 'SET_PLATFORMS', platforms })
  }, [])

  const setAgents = useCallback((agents: string[]) => {
    dispatch({ type: 'SET_AGENTS', agents })
  }, [])

  const applyPreset = useCallback((preset: FilterPreset) => {
    dispatch({ type: 'APPLY_PRESET', preset })
  }, [])

  const savePreset = useCallback((name: string, description?: string) => {
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      filters: { ...filters },
    }
    setPresets(prev => [...prev, newPreset])
  }, [filters])

  const deletePreset = useCallback((presetId: string) => {
    setPresets(prev => prev.filter(preset => preset.id !== presetId))
  }, [])

  // Computed Values
  const isFiltered = countActiveFilters(filters) > 0
  const activeFilterCount = countActiveFilters(filters)

  const contextValue: FilterContextValue = {
    filters,
    configuration: config,
    presets,
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
  }

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  )
}

// Hook to use filter context
export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}

// Hook to use specific filter values
export function useFilterValue<T = any>(key: string): T | undefined {
  const { filters } = useFilters()
  return filters.customFilters?.[key]?.value as T
}

// Hook to check if a specific filter is active
export function useIsFilterActive(key: string): boolean {
  const { filters } = useFilters()
  return key in (filters.customFilters || {})
}