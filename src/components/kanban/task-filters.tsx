'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { X, Search, Filter, User } from 'lucide-react'
import { TaskPriority } from '@/lib/database'
import { TaskFilter } from './task-board'

interface TaskFiltersProps {
  filters: TaskFilter
  onFiltersChange: (filters: TaskFilter) => void
  agents: Array<{ id: string; name: string; platformId: string }>
  onClose: () => void
}

const PRIORITY_OPTIONS: Array<{
  value: TaskPriority
  label: string
}> = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

export function TaskFilters({
  filters,
  onFiltersChange,
  agents,
  onClose,
}: TaskFiltersProps) {
  const updateFilter = (key: keyof TaskFilter, value: string | TaskPriority | Date | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  )

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  const handleDateChange = (key: 'dateFrom' | 'dateTo', value: string) => {
    updateFilter(key, value ? new Date(value) : undefined)
  }

  return (
    <Card className="border-cubcen-primary/20 bg-cubcen-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cubcen-primary" />
            Task Filters
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs font-medium">
              Search Tasks
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or description"
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Agent Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Agent</Label>
            <Select
              value={filters.agentId || ''}
              onValueChange={(value) => updateFilter('agentId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{agent.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({agent.platformId})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Priority</Label>
            <Select
              value={filters.priority || ''}
              onValueChange={(value: TaskPriority) => updateFilter('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Date Range</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="From"
                  value={formatDateForInput(filters.dateFrom)}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="To"
                  value={formatDateForInput(filters.dateTo)}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {hasActiveFilters ? (
              <span>Filters applied</span>
            ) : (
              <span>No filters applied</span>
            )}
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}