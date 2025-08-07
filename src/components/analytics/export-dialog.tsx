'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Database, Loader2 } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateRange?: DateRange
}

type ExportFormat = 'csv' | 'json'
type DataType = 'overview' | 'agents' | 'tasks' | 'trends' | 'errors'

export function ExportDialog({
  open,
  onOpenChange,
  dateRange,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [dataType, setDataType] = useState<DataType>('overview')
  const [includeCharts, setIncludeCharts] = useState(false)
  const [loading, setLoading] = useState(false)

  const dataTypeOptions = [
    {
      value: 'overview',
      label: 'Complete Analytics Overview',
      description:
        'All analytics data including KPIs, trends, and performance metrics',
    },
    {
      value: 'agents',
      label: 'Agent Performance Data',
      description: 'Detailed performance metrics for all agents',
    },
    {
      value: 'tasks',
      label: 'Task Analytics',
      description: 'Task status and priority distribution data',
    },
    {
      value: 'trends',
      label: 'Trend Data',
      description: 'Daily task trends and historical data',
    },
    {
      value: 'errors',
      label: 'Error Patterns',
      description: 'Error analysis and pattern data',
    },
  ]

  const handleExport = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (dateRange?.from) {
        params.append('startDate', dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        params.append('endDate', dateRange.to.toISOString())
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(
        `/api/cubcen/v1/analytics/export?${params}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            format,
            dataType,
          }),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `Export failed: ${response.statusText}`

        try {
          const errorData = await response.json()
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch {
          // Use default error message if response is not JSON
        }

        throw new Error(errorMessage)
      }

      // Validate response content type
      const contentType = response.headers.get('Content-Type')
      const expectedContentType =
        format === 'csv' ? 'text/csv' : 'application/json'

      if (!contentType?.includes(expectedContentType.split('/')[0])) {
        throw new Error(
          `Invalid response format. Expected ${expectedContentType}, got ${contentType}`
        )
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `cubcen-analytics-${dataType}-${new Date().toISOString().split('T')[0]}.${format}`

      // Create blob and download
      const blob = await response.blob()

      // Validate blob size
      if (blob.size === 0) {
        throw new Error(
          'Export file is empty. No data available for the selected criteria.'
        )
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      toast.success('Export completed successfully', {
        description: `Downloaded ${filename} (${(blob.size / 1024).toFixed(1)} KB)`,
      })

      onOpenChange(false)
    } catch (error) {
      let errorMessage = 'Export failed'

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage =
            'Export timed out. Please try again with a smaller date range.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your connection and try again.'
        } else {
          errorMessage = error.message
        }
      }

      toast.error('Export failed', {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedDataType = dataTypeOptions.find(
    option => option.value === dataType
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5 text-cubcen-primary" />
            Export Analytics Data
          </DialogTitle>
          <DialogDescription>
            Choose the format and data type for your analytics export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Data Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Data Type</Label>
            <Select
              value={dataType}
              onValueChange={(value: DataType) => setDataType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDataType && (
              <p className="text-xs text-muted-foreground">
                {selectedDataType.description}
              </p>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value: ExportFormat) => setFormat(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label
                  htmlFor="csv"
                  className="flex items-center cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">CSV Format</div>
                    <div className="text-xs text-muted-foreground">
                      Comma-separated values, ideal for Excel and data analysis
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label
                  htmlFor="json"
                  className="flex items-center cursor-pointer"
                >
                  <Database className="mr-2 h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">JSON Format</div>
                    <div className="text-xs text-muted-foreground">
                      Structured data format, ideal for developers and APIs
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={checked =>
                  setIncludeCharts(checked as boolean)
                }
                disabled // Not implemented yet
              />
              <Label
                htmlFor="include-charts"
                className="text-sm text-muted-foreground"
              >
                Include chart data (Coming soon)
              </Label>
            </div>
          </div>

          {/* Date Range Info */}
          {dateRange && (
            <div className="bg-muted/50 rounded-lg p-3">
              <Label className="text-sm font-medium">Date Range</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {dateRange.from?.toLocaleDateString()} -{' '}
                {dateRange.to?.toLocaleDateString()}
              </p>
            </div>
          )}

          {/* File Size Estimate */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <Database className="mr-2 h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium text-blue-800">
                  Export Information
                </div>
                <div className="text-blue-600">
                  {format === 'csv'
                    ? 'CSV files are optimized for spreadsheet applications and data analysis tools.'
                    : 'JSON files preserve data structure and are ideal for programmatic access.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading}
            className="bg-cubcen-primary hover:bg-cubcen-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
