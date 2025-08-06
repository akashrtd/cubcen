'use client'

import React, { useCallback } from 'react'
import { ChartWrapper } from '../charts/chart-wrapper'
import { useFilters } from './filter-context'
import type {
  ChartType,
  ChartData,
  ChartConfiguration,
  ChartDataPoint,
  LegendItem,
  FilterValue,
} from '@/types/dashboard'

interface FilterableChartProps {
  type: ChartType
  data: ChartData
  config?: ChartConfiguration
  loading?: boolean
  error?: string
  height?: number
  responsive?: boolean
  interactive?: boolean
  exportable?: boolean
  exportFilename?: string
  onExportStart?: (format: string) => void
  onExportComplete?: (format: string) => void
  onExportError?: (error: Error, format: string) => void
  className?: string
  // Filtering props
  enableFiltering?: boolean
  filterMappings?: {
    dataClick?: (dataPoint: ChartDataPoint) => Record<string, FilterValue>
    legendClick?: (legendItem: LegendItem) => Record<string, FilterValue>
  }
  onDataClick?: (data: ChartDataPoint) => void
  onLegendClick?: (legendItem: LegendItem) => void
}

export function FilterableChart({
  enableFiltering = true,
  filterMappings,
  onDataClick,
  onLegendClick,
  ...chartProps
}: FilterableChartProps) {
  const { setFilter, removeFilter, filters } = useFilters()

  // Handle data point clicks with filtering
  const handleDataClick = useCallback((dataPoint: ChartDataPoint) => {
    // Call custom handler first
    onDataClick?.(dataPoint)

    if (!enableFiltering) return

    // Apply default or custom filter mapping
    let filtersToApply: Record<string, FilterValue> = {}

    if (filterMappings?.dataClick) {
      filtersToApply = filterMappings.dataClick(dataPoint)
    } else {
      // Default mapping: filter by the clicked data point's category/label
      if (dataPoint.label) {
        filtersToApply.category = {
          type: 'string',
          value: dataPoint.label,
          operator: 'equals',
        }
      }
      
      // If the data point has metadata, use it for filtering
      if (dataPoint.metadata) {
        Object.entries(dataPoint.metadata).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            filtersToApply[key] = {
              type: typeof value === 'number' ? 'number' : 'string',
              value,
              operator: 'equals',
            }
          }
        })
      }
    }

    // Apply filters
    Object.entries(filtersToApply).forEach(([key, filterValue]) => {
      // Toggle filter if it's already active with the same value
      const existingFilter = filters.customFilters?.[key]
      if (existingFilter && existingFilter.value === filterValue.value) {
        removeFilter(key)
      } else {
        setFilter(key, filterValue)
      }
    })
  }, [enableFiltering, filterMappings, onDataClick, setFilter, removeFilter, filters])

  // Handle legend clicks with filtering
  const handleLegendClick = useCallback((legendItem: LegendItem) => {
    // Call custom handler first
    onLegendClick?.(legendItem)

    if (!enableFiltering) return

    // Apply default or custom filter mapping
    let filtersToApply: Record<string, FilterValue> = {}

    if (filterMappings?.legendClick) {
      filtersToApply = filterMappings.legendClick(legendItem)
    } else {
      // Default mapping: filter by the legend item's label
      filtersToApply.series = {
        type: 'string',
        value: legendItem.label,
        operator: 'equals',
      }
    }

    // Apply filters
    Object.entries(filtersToApply).forEach(([key, filterValue]) => {
      // Toggle filter if it's already active with the same value
      const existingFilter = filters.customFilters?.[key]
      if (existingFilter && existingFilter.value === filterValue.value) {
        removeFilter(key)
      } else {
        setFilter(key, filterValue)
      }
    })
  }, [enableFiltering, filterMappings, onLegendClick, setFilter, removeFilter, filters])

  return (
    <ChartWrapper
      {...chartProps}
      onDataClick={handleDataClick}
      onLegendClick={handleLegendClick}
    />
  )
}

// Higher-order component for adding filtering to existing charts
export function withFiltering<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  defaultFilterMappings?: FilterableChartProps['filterMappings']
) {
  return function FilterableComponent(props: T & Partial<FilterableChartProps>) {
    const {
      enableFiltering = true,
      filterMappings = defaultFilterMappings,
      onDataClick,
      onLegendClick,
      ...wrappedProps
    } = props

    const { setFilter, removeFilter, filters } = useFilters()

    const handleDataClick = useCallback((dataPoint: ChartDataPoint) => {
      onDataClick?.(dataPoint)

      if (!enableFiltering) return

      let filtersToApply: Record<string, FilterValue> = {}

      if (filterMappings?.dataClick) {
        filtersToApply = filterMappings.dataClick(dataPoint)
      } else {
        if (dataPoint.label) {
          filtersToApply.category = {
            type: 'string',
            value: dataPoint.label,
            operator: 'equals',
          }
        }
      }

      Object.entries(filtersToApply).forEach(([key, filterValue]) => {
        const existingFilter = filters.customFilters?.[key]
        if (existingFilter && existingFilter.value === filterValue.value) {
          removeFilter(key)
        } else {
          setFilter(key, filterValue)
        }
      })
    }, [enableFiltering, filterMappings, onDataClick, setFilter, removeFilter, filters])

    const handleLegendClick = useCallback((legendItem: LegendItem) => {
      onLegendClick?.(legendItem)

      if (!enableFiltering) return

      let filtersToApply: Record<string, FilterValue> = {}

      if (filterMappings?.legendClick) {
        filtersToApply = filterMappings.legendClick(legendItem)
      } else {
        filtersToApply.series = {
          type: 'string',
          value: legendItem.label,
          operator: 'equals',
        }
      }

      Object.entries(filtersToApply).forEach(([key, filterValue]) => {
        const existingFilter = filters.customFilters?.[key]
        if (existingFilter && existingFilter.value === filterValue.value) {
          removeFilter(key)
        } else {
          setFilter(key, filterValue)
        }
      })
    }, [enableFiltering, filterMappings, onLegendClick, setFilter, removeFilter, filters])

    return (
      <WrappedComponent
        {...(wrappedProps as T)}
        onDataClick={handleDataClick}
        onLegendClick={handleLegendClick}
      />
    )
  }
}