'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { AnalyticsData } from '@/services/analytics'

interface ErrorPatternsChartProps {
  data: AnalyticsData['errorPatterns']
  loading?: boolean
}

export function ErrorPatternsChart({ data, loading }: ErrorPatternsChartProps) {
  const [showAll, setShowAll] = useState(false)
  const [selectedError, setSelectedError] = useState<string | null>(null)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-green-600" />
            Error Patterns
          </CardTitle>
          <CardDescription>
            Most common error patterns and their frequency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-green-600">No Errors Found</h3>
            <p className="text-muted-foreground">
              Great! No error patterns detected in the selected time period.
            </p>
            <Badge className="mt-4 bg-green-100 text-green-800 border-green-200">
              System Healthy
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayData = showAll ? data : data.slice(0, 5)
  const totalErrors = data.reduce((sum, item) => sum + item.count, 0)

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.count / totalErrors) * 100).toFixed(1)
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
          <p className="font-medium text-sm mb-1">Error Details</p>
          <p className="text-xs text-muted-foreground mb-2">{data.error}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm">Count: {data.count}</span>
            <Badge variant="destructive" className="text-xs">
              {percentage}%
            </Badge>
          </div>
        </div>
      )
    }
    return null
  }

  const handleErrorClick = (error: string) => {
    setSelectedError(selectedError === error ? null : error)
  }

  const getSeverityBadge = (count: number) => {
    const percentage = (count / totalErrors) * 100
    if (percentage >= 30) {
      return <Badge variant="destructive">Critical</Badge>
    } else if (percentage >= 15) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
    } else if (percentage >= 5) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
    } else {
      return <Badge variant="outline">Low</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          Error Patterns Analysis
        </CardTitle>
        <CardDescription>
          Most common error patterns and their frequency ({totalErrors} total errors)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="error" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#F44336"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Error List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Error Details</h4>
              {data.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-cubcen-primary"
                >
                  {showAll ? (
                    <>
                      Show Less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show All ({data.length}) <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {displayData.map((error, index) => {
                const percentage = ((error.count / totalErrors) * 100).toFixed(1)
                const isSelected = selectedError === error.error
                
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isSelected ? 'border-red-200 bg-red-50' : 'border-border hover:border-red-200'
                    }`}
                    onClick={() => handleErrorClick(error.error)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">#{index + 1}</span>
                          {getSeverityBadge(error.count)}
                          <Badge variant="outline" className="text-xs">
                            {error.count} occurrences
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {percentage}%
                          </Badge>
                        </div>
                        <p className={`text-sm ${isSelected ? 'text-red-800' : 'text-muted-foreground'} break-words`}>
                          {error.error}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {isSelected ? (
                          <ChevronUp className="h-4 w-4 text-red-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Frequency:</span>
                            <div className="mt-1">
                              <div className="bg-red-200 rounded-full h-2">
                                <div 
                                  className="bg-red-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-red-700 mt-1 block">{percentage}% of all errors</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Impact:</span>
                            <div className="mt-1 text-red-700">
                              {error.count > 50 ? 'High impact - needs immediate attention' :
                               error.count > 10 ? 'Medium impact - should be investigated' :
                               'Low impact - monitor for trends'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Error Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Errors:</span>
                <div className="font-semibold text-red-600">{totalErrors}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Unique Patterns:</span>
                <div className="font-semibold">{data.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Most Common:</span>
                <div className="font-semibold text-red-600">
                  {data[0]?.error.substring(0, 30)}{data[0]?.error.length > 30 ? '...' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}