'use client'

import React, { useCallback } from 'react'
import { DashboardCard } from '../cards/dashboard-card'
import { useFilters } from './filter-context'
import type { DashboardCardProps, FilterValue } from '@/types/dashboard'

interface FilterableCardProps extends DashboardCardProps {
  // Filtering props
  enableFiltering?: boolean
  filterMappings?: {
    cardClick?: () => Record<string, FilterValue>
    metricClick?: () => Record<string, FilterValue>
  }
  filterData?: Record<string, any> // Data to use for filtering
}

export function FilterableCard({
  enableFiltering = true,
  filterMappings,
  filterData,
  onClick,
  onFilter,
  ...cardProps
}: FilterableCardProps) {
  const { setFilter, removeFilter, filters } = useFilters()

  // Handle card clicks with filtering
  const handleCardClick = useCallback(() => {
    // Call custom handler first
    onClick?.()

    if (!enableFiltering) return

    // Apply default or custom filter mapping
    let filtersToApply: Record<string, FilterValue> = {}

    if (filterMappings?.cardClick) {
      filtersToApply = filterMappings.cardClick()
    } else if (filterData) {
      // Default mapping: use filterData to create filters
      Object.entries(filterData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          filtersToApply[key] = {
            type: typeof value === 'number' ? 'number' : 'string',
            value,
            operator: 'equals',
          }
        }
      })
    } else if (cardProps.title) {
      // Fallback: filter by card title
      filtersToApply.cardTitle = {
        type: 'string',
        value: cardProps.title,
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

    // Call the onFilter callback if provided
    if (Object.keys(filtersToApply).length > 0) {
      const firstFilter = Object.values(filtersToApply)[0]
      onFilter?.(firstFilter)
    }
  }, [
    enableFiltering,
    filterMappings,
    filterData,
    cardProps.title,
    onClick,
    onFilter,
    setFilter,
    removeFilter,
    filters,
  ])

  return (
    <DashboardCard
      {...cardProps}
      interactive={cardProps.interactive || enableFiltering}
      onClick={handleCardClick}
      onFilter={onFilter}
    />
  )
}

// Higher-order component for adding filtering to existing cards
export function withCardFiltering<T extends DashboardCardProps>(
  WrappedComponent: React.ComponentType<T>,
  defaultFilterMappings?: FilterableCardProps['filterMappings']
) {
  return function FilterableCardComponent(props: T & Partial<FilterableCardProps>) {
    const {
      enableFiltering = true,
      filterMappings = defaultFilterMappings,
      filterData,
      onClick,
      onFilter,
      ...wrappedProps
    } = props

    const { setFilter, removeFilter, filters } = useFilters()

    const handleCardClick = useCallback(() => {
      onClick?.()

      if (!enableFiltering) return

      let filtersToApply: Record<string, FilterValue> = {}

      if (filterMappings?.cardClick) {
        filtersToApply = filterMappings.cardClick()
      } else if (filterData) {
        Object.entries(filterData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            filtersToApply[key] = {
              type: typeof value === 'number' ? 'number' : 'string',
              value,
              operator: 'equals',
            }
          }
        })
      }

      Object.entries(filtersToApply).forEach(([key, filterValue]) => {
        const existingFilter = filters.customFilters?.[key]
        if (existingFilter && existingFilter.value === filterValue.value) {
          removeFilter(key)
        } else {
          setFilter(key, filterValue)
        }
      })

      if (Object.keys(filtersToApply).length > 0) {
        const firstFilter = Object.values(filtersToApply)[0]
        onFilter?.(firstFilter)
      }
    }, [
      enableFiltering,
      filterMappings,
      filterData,
      onClick,
      onFilter,
      setFilter,
      removeFilter,
      filters,
    ])

    return (
      <WrappedComponent
        {...(wrappedProps as T)}
        interactive={wrappedProps.interactive || enableFiltering}
        onClick={handleCardClick}
        onFilter={onFilter}
      />
    )
  }
}