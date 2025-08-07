'use client'

import React, { useState } from 'react'
import { Search, SlidersHorizontal, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFilters } from './filter-context'
import { FilterValue } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface FilterControlsProps {
  className?: string
  searchPlaceholder?: string
  showAdvancedFilters?: boolean
  customFilterOptions?: Array<{
    key: string
    label: string
    type: 'string' | 'number' | 'select'
    options?: string[]
  }>
}

export function FilterControls({
  className,
  searchPlaceholder = 'Search...',
  showAdvancedFilters = true,
  customFilterOptions = [],
}: FilterControlsProps) {
  const { filters, setFilter, removeFilter, clearFilters, isFiltered } =
    useFilters()
  const [searchValue, setSearchValue] = useState('')
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [newFilterKey, setNewFilterKey] = useState('')
  const [newFilterValue, setNewFilterValue] = useState('')
  const [newFilterType, setNewFilterType] = useState<
    'string' | 'number' | 'boolean'
  >('string')
  const [newFilterOperator, setNewFilterOperator] = useState<
    'equals' | 'contains' | 'greaterThan' | 'lessThan'
  >('contains')

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (value.trim()) {
      setFilter('search', {
        type: 'string',
        value: value.trim(),
        operator: 'contains',
      })
    } else {
      removeFilter('search')
    }
  }

  // Handle adding custom filter
  const handleAddCustomFilter = () => {
    if (!newFilterKey.trim() || !newFilterValue.trim()) return

    const filterValue: FilterValue = {
      type: newFilterType,
      value:
        newFilterType === 'number' ? Number(newFilterValue) : newFilterValue,
      operator: newFilterOperator,
    }

    setFilter(newFilterKey.trim(), filterValue)
    setNewFilterKey('')
    setNewFilterValue('')
    setIsAdvancedOpen(false)
  }

  // Handle predefined custom filter
  const handleCustomFilterChange = (
    key: string,
    value: string,
    type: 'string' | 'number' | 'select'
  ) => {
    if (value) {
      const filterValue: FilterValue = {
        type,
        value: type === 'number' ? Number(value) : value,
        operator: type === 'number' ? 'equals' : 'contains',
      }
      setFilter(key, filterValue)
    } else {
      removeFilter(key)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearchChange('')}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showAdvancedFilters && (
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Advanced Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Predefined Custom Filters */}
                    {customFilterOptions.map(option => (
                      <div key={option.key} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {option.label}
                        </Label>
                        {option.type === 'select' && option.options ? (
                          <Select
                            value={
                              filters.customFilters?.[option.key]?.value || ''
                            }
                            onValueChange={value =>
                              handleCustomFilterChange(
                                option.key,
                                value,
                                option.type
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={`Select ${option.label.toLowerCase()}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All</SelectItem>
                              {option.options.map(opt => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={option.type === 'number' ? 'number' : 'text'}
                            placeholder={`Enter ${option.label.toLowerCase()}`}
                            value={
                              filters.customFilters?.[option.key]?.value || ''
                            }
                            onChange={e =>
                              handleCustomFilterChange(
                                option.key,
                                e.target.value,
                                option.type
                              )
                            }
                          />
                        )}
                      </div>
                    ))}

                    {/* Custom Filter Builder */}
                    <div className="space-y-3 border-t pt-4">
                      <Label className="text-sm font-medium">
                        Add Custom Filter
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Filter name"
                          value={newFilterKey}
                          onChange={e => setNewFilterKey(e.target.value)}
                        />
                        <Select
                          value={newFilterType}
                          onValueChange={(value: any) =>
                            setNewFilterType(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Filter value"
                          type={newFilterType === 'number' ? 'number' : 'text'}
                          value={newFilterValue}
                          onChange={e => setNewFilterValue(e.target.value)}
                        />
                        <Select
                          value={newFilterOperator}
                          onValueChange={(value: any) =>
                            setNewFilterOperator(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            {newFilterType === 'number' && (
                              <>
                                <SelectItem value="greaterThan">
                                  Greater Than
                                </SelectItem>
                                <SelectItem value="lessThan">
                                  Less Than
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleAddCustomFilter}
                        disabled={
                          !newFilterKey.trim() || !newFilterValue.trim()
                        }
                        className="w-full gap-2"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Filter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Custom Filters */}
      {filters.customFilters &&
        Object.keys(filters.customFilters).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Active Filters
            </Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters.customFilters).map(([key, filter]) => (
                <Badge key={key} variant="secondary" className="gap-1">
                  {key}: {String(filter.value)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeFilter(key)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}

// Hook for filtering data based on current filters
export function useFilteredData<T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[] = []
): T[] {
  const { filters } = useFilters()

  return React.useMemo(() => {
    if (!data) return []

    return data.filter(item => {
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

      // Category filter
      if (filters.categories?.length && item.category) {
        if (!filters.categories.includes(item.category)) return false
      }

      // Status filter
      if (filters.status?.length && item.status) {
        if (!filters.status.includes(item.status)) return false
      }

      // Priority filter
      if (filters.priority?.length && item.priority) {
        if (!filters.priority.includes(item.priority)) return false
      }

      // Platform filter
      if (filters.platforms?.length && item.platform) {
        if (!filters.platforms.includes(item.platform)) return false
      }

      // Agent filter
      if (filters.agents?.length && item.agent) {
        if (!filters.agents.includes(item.agent)) return false
      }

      // Custom filters
      if (filters.customFilters) {
        for (const [key, filter] of Object.entries(filters.customFilters)) {
          if (key === 'search') continue // Already handled above

          const itemValue = item[key]
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
          }
        }
      }

      return true
    })
  }, [data, filters, searchFields])
}
