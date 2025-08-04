'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Clock,
  Users,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { ErrorPattern } from '@/types/error'
import { format } from 'date-fns'

interface ErrorPatternsProps {
  className?: string
  timeRange?: { from: Date; to: Date }
}

const SEVERITY_COLORS = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
}

const SEVERITY_ICONS = {
  LOW: AlertCircle,
  MEDIUM: AlertTriangle,
  HIGH: AlertTriangle,
  CRITICAL: AlertTriangle,
}

export function ErrorPatterns({ className, timeRange }: ErrorPatternsProps) {
  const [patterns, setPatterns] = useState<ErrorPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedPatterns, setExpandedPatterns] = useState<Set<string>>(
    new Set()
  )

  // Default time range (last 24 hours)
  const defaultTimeRange = {
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date(),
  }

  const effectiveTimeRange = timeRange || defaultTimeRange

  // Fetch error patterns
  const fetchPatterns = useCallback(async () => {
    try {
      setLoading(true)
      setRefreshing(true)

      const params = new URLSearchParams({
        from: effectiveTimeRange.from.toISOString(),
        to: effectiveTimeRange.to.toISOString(),
      })

      const response = await fetch(`/api/errors/patterns?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch error patterns')
      }

      const data = await response.json()
      setPatterns(Array.isArray(data.patterns) ? data.patterns : [])
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch error patterns'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [effectiveTimeRange])

  // Initial load
  useEffect(() => {
    fetchPatterns()
  }, [fetchPatterns])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchPatterns()
  }, [fetchPatterns])

  // Toggle pattern expansion
  const togglePattern = useCallback((patternId: string) => {
    setExpandedPatterns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(patternId)) {
        newSet.delete(patternId)
      } else {
        newSet.add(patternId)
      }
      return newSet
    })
  }, [])

  // Get severity icon
  const getSeverityIcon = (severity: ErrorPattern['severity']) => {
    const Icon = SEVERITY_ICONS[severity]
    return <Icon className="h-4 w-4" />
  }

  // Format frequency text
  const formatFrequency = (frequency: number) => {
    if (frequency === 1) return '1 occurrence'
    return `${frequency} occurrences`
  }

  if (loading && patterns.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#3F51B5]" />
            Error Patterns
          </CardTitle>
          <CardDescription>
            Detected error patterns and recurring issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#3F51B5]" />
            Error Patterns
            {patterns.length > 0 && (
              <Badge variant="secondary" className="bg-[#B19ADA] text-white">
                {patterns.length}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-[#3F51B5] text-[#3F51B5] hover:bg-[#3F51B5] hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Detected error patterns and recurring issues in the last{' '}
          {Math.round(
            (effectiveTimeRange.to.getTime() -
              effectiveTimeRange.from.getTime()) /
              (1000 * 60 * 60)
          )}{' '}
          hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {patterns.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No Error Patterns Detected
            </h3>
            <p className="text-gray-500">
              No recurring error patterns found in the selected time range.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {patterns.map(pattern => {
              const isExpanded = expandedPatterns.has(pattern.id)

              return (
                <div
                  key={pattern.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => togglePattern(pattern.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`${SEVERITY_COLORS[pattern.severity]} flex items-center gap-1`}
                          >
                            {getSeverityIcon(pattern.severity)}
                            {pattern.severity}
                          </Badge>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatFrequency(pattern.frequency)}
                          </span>
                          {pattern.affectedAgents && pattern.affectedAgents.length > 0 && (
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {pattern.affectedAgents?.length || 0} agent
                              {(pattern.affectedAgents?.length || 0) !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1 truncate">
                          {pattern.description}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {pattern.pattern}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>
                            Last seen:{' '}
                            {format(
                              new Date(pattern.lastOccurrence),
                              'MMM dd, HH:mm'
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="space-y-4">
                        {/* Full Error Pattern */}
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">
                            Error Pattern
                          </label>
                          <div className="p-3 bg-white border rounded-lg">
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                              {pattern.pattern}
                            </pre>
                          </div>
                        </div>

                        {/* Affected Agents */}
                        {pattern.affectedAgents && pattern.affectedAgents.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">
                              Affected Agents ({pattern.affectedAgents?.length || 0})
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {(pattern.affectedAgents || [])
                                .slice(0, 10)
                                .map(agentId => (
                                  <Badge
                                    key={agentId}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {agentId.slice(0, 8)}...
                                  </Badge>
                                ))}
                              {(pattern.affectedAgents?.length || 0) > 10 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-gray-500"
                                >
                                  +{(pattern.affectedAgents?.length || 0) - 10} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Suggested Action */}
                        {pattern.suggestedAction && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block flex items-center gap-1">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Suggested Action
                            </label>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                {pattern.suggestedAction}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Pattern Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-[#3F51B5]">
                              {pattern.frequency}
                            </div>
                            <div className="text-xs text-gray-500">
                              Occurrences
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-[#B19ADA]">
                              {pattern.affectedAgents?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500">Agents</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-orange-600">
                              {pattern.severity}
                            </div>
                            <div className="text-xs text-gray-500">
                              Severity
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-600">
                              {format(
                                new Date(pattern.lastOccurrence),
                                'HH:mm'
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Last Seen
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
