'use client'

import React, { useState } from 'react'
import { Calendar, Filter, X, RotateCcw, Bookmark, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useFilters } from './filter-context'
import { FilterPreset } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface DashboardFiltersProps {
  className?: string
  compact?: boolean
  showPresets?: boolean
  showShareButton?: boolean
  availableCategories?: string[]
  availableStatuses?: string[]
  availablePriorities?: string[]
  availablePlatforms?: string[]
  availableAgents?: string[]
}

export function DashboardFilters({
  className,
  compact = false,
  showPresets = true,
  showShareButton = true,
  availableCategories = [],
  availableStatuses = ['active', 'inactive', 'running', 'stopped', 'error'],
  availablePriorities = ['low', 'medium', 'high', 'critical'],
  availablePlatforms = ['n8n', 'make', 'zapier'],
  availableAgents = [],
}: DashboardFiltersProps) {
  const {
    filters,
    presets,
    setDateRange,
    setCategories,
    setStatus,
    setPriority,
    setPlatforms,
    setAgents,
    applyPreset,
    savePreset,
    clearFilters,
    isFiltered,
    activeFilterCount,
  } = useFilters()

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetDescription, setNewPresetDescription] = useState('')

  // Handle date range selection
  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setDateRange(range.from, range.to)
      setIsDatePickerOpen(false)
    }
  }

  // Handle multi-select changes
  const handleMultiSelectChange = (
    value: string,
    currentValues: string[] = [],
    onChange: (values: string[]) => void
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    onChange(newValues)
  }

  // Handle preset save
  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      savePreset(newPresetName.trim(), newPresetDescription.trim() || undefined)
      setNewPresetName('')
      setNewPresetDescription('')
      setIsPresetDialogOpen(false)
    }
  }

  // Handle share filters
  const handleShareFilters = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
      console.log('Filter URL copied to clipboard')
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <DashboardFilters
              compact={false}
              showPresets={showPresets}
              showShareButton={showShareButton}
              availableCategories={availableCategories}
              availableStatuses={availableStatuses}
              availablePriorities={availablePriorities}
              availablePlatforms={availablePlatforms}
              availableAgents={availableAgents}
            />
          </PopoverContent>
        </Popover>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Filters</CardTitle>
          <div className="flex items-center gap-2">
            {showShareButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareFilters}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            )}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Presets */}
        {showPresets && presets.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Filters</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="gap-2"
                >
                  <Bookmark className="h-3 w-3" />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Range</Label>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.dateRange && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {filters.dateRange
                  ? `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
                  : 'Select date range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={filters.dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Categories */}
        {availableCategories.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Categories</Label>
            <div className="space-y-2">
              {availableCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories?.includes(category) || false}
                    onCheckedChange={() =>
                      handleMultiSelectChange(
                        category,
                        filters.categories,
                        setCategories
                      )
                    }
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal capitalize"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="space-y-2">
            {availableStatuses.map(status => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.status?.includes(status) || false}
                  onCheckedChange={() =>
                    handleMultiSelectChange(status, filters.status, setStatus)
                  }
                />
                <Label
                  htmlFor={`status-${status}`}
                  className="text-sm font-normal capitalize"
                >
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Priority</Label>
          <div className="space-y-2">
            {availablePriorities.map(priority => (
              <div key={priority} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={filters.priority?.includes(priority) || false}
                  onCheckedChange={() =>
                    handleMultiSelectChange(
                      priority,
                      filters.priority,
                      setPriority
                    )
                  }
                />
                <Label
                  htmlFor={`priority-${priority}`}
                  className="text-sm font-normal capitalize"
                >
                  {priority}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Platforms</Label>
          <div className="space-y-2">
            {availablePlatforms.map(platform => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox
                  id={`platform-${platform}`}
                  checked={filters.platforms?.includes(platform) || false}
                  onCheckedChange={() =>
                    handleMultiSelectChange(
                      platform,
                      filters.platforms,
                      setPlatforms
                    )
                  }
                />
                <Label
                  htmlFor={`platform-${platform}`}
                  className="text-sm font-normal capitalize"
                >
                  {platform}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Agents */}
        {availableAgents.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Agents</Label>
            <div className="space-y-2">
              {availableAgents.map(agent => (
                <div key={agent} className="flex items-center space-x-2">
                  <Checkbox
                    id={`agent-${agent}`}
                    checked={filters.agents?.includes(agent) || false}
                    onCheckedChange={() =>
                      handleMultiSelectChange(agent, filters.agents, setAgents)
                    }
                  />
                  <Label
                    htmlFor={`agent-${agent}`}
                    className="text-sm font-normal"
                  >
                    {agent}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {isFiltered && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.dateRange && (
                  <Badge variant="secondary" className="gap-1">
                    Date Range
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setDateRange(new Date(0), new Date(0))}
                    />
                  </Badge>
                )}
                {filters.categories?.map(category => (
                  <Badge key={category} variant="secondary" className="gap-1">
                    {category}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setCategories(
                          filters.categories?.filter(c => c !== category) || []
                        )
                      }
                    />
                  </Badge>
                ))}
                {filters.status?.map(status => (
                  <Badge key={status} variant="secondary" className="gap-1">
                    {status}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setStatus(
                          filters.status?.filter(s => s !== status) || []
                        )
                      }
                    />
                  </Badge>
                ))}
                {filters.priority?.map(priority => (
                  <Badge key={priority} variant="secondary" className="gap-1">
                    {priority}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setPriority(
                          filters.priority?.filter(p => p !== priority) || []
                        )
                      }
                    />
                  </Badge>
                ))}
                {filters.platforms?.map(platform => (
                  <Badge key={platform} variant="secondary" className="gap-1">
                    {platform}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setPlatforms(
                          filters.platforms?.filter(p => p !== platform) || []
                        )
                      }
                    />
                  </Badge>
                ))}
                {filters.agents?.map(agent => (
                  <Badge key={agent} variant="secondary" className="gap-1">
                    {agent}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAgents(
                          filters.agents?.filter(a => a !== agent) || []
                        )
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Save Preset */}
        {isFiltered && (
          <>
            <Separator />
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPresetDialogOpen(true)}
                className="w-full gap-2"
              >
                <Bookmark className="h-4 w-4" />
                Save as Preset
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Save Preset Dialog */}
      {isPresetDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Save Filter Preset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Name</Label>
                <Input
                  id="preset-name"
                  value={newPresetName}
                  onChange={e => setNewPresetName(e.target.value)}
                  placeholder="Enter preset name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preset-description">
                  Description (optional)
                </Label>
                <Input
                  id="preset-description"
                  value={newPresetDescription}
                  onChange={e => setNewPresetDescription(e.target.value)}
                  placeholder="Enter preset description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPresetDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePreset}
                  disabled={!newPresetName.trim()}
                >
                  Save Preset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}
