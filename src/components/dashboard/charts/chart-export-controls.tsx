import React, { useState } from 'react'
import { Download, FileImage, FileText, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  useChartExport,
  type ExportFormat,
  type ExportOptions,
} from './chart-export'
import { cn } from '@/lib/utils'

interface ChartExportControlsProps {
  chartRef: React.RefObject<HTMLElement>
  filename?: string
  className?: string
  disabled?: boolean
  onExportStart?: (format: ExportFormat) => void
  onExportComplete?: (format: ExportFormat) => void
  onExportError?: (error: Error, format: ExportFormat) => void
}

const formatIcons = {
  png: Image,
  svg: FileImage,
  pdf: FileText,
}

const formatLabels = {
  png: 'PNG Image',
  svg: 'SVG Vector',
  pdf: 'PDF Document',
}

export function ChartExportControls({
  chartRef,
  filename = 'chart',
  className,
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
}: ChartExportControlsProps) {
  const { exportChart, isSupported, availableFormats } = useChartExport()
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null
  )

  const handleExport = async (format: ExportFormat) => {
    if (disabled || isExporting) return

    try {
      setIsExporting(true)
      setExportingFormat(format)
      onExportStart?.(format)

      const options: ExportOptions = {
        filename,
        format,
        quality: format === 'png' ? 2.0 : 1.0, // Higher quality for PNG
      }

      await exportChart(chartRef, options)
      onExportComplete?.(format)
    } catch (error) {
      const exportError =
        error instanceof Error ? error : new Error('Export failed')
      onExportError?.(exportError, format)
    } finally {
      setIsExporting(false)
      setExportingFormat(null)
    }
  }

  if (!isSupported || availableFormats.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting}
          className={cn('gap-2', className)}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableFormats.map(format => {
          const Icon = formatIcons[format]
          const isCurrentlyExporting = isExporting && exportingFormat === format

          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={disabled || isExporting}
              className="gap-2 cursor-pointer"
            >
              <Icon className="h-4 w-4" />
              <span>{formatLabels[format]}</span>
              {isCurrentlyExporting && (
                <div className="ml-auto">
                  <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                </div>
              )}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Export chart as image or document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
