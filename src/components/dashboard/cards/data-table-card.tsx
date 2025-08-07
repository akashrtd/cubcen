import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { DashboardCard } from './dashboard-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  MoreHorizontal,
  ArrowUpDown,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardCardProps } from '@/types/dashboard'

interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  searchable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  className?: string
}

interface DataTableRow {
  id: string | number
  [key: string]: any
}

interface DataTableCardProps extends Omit<DashboardCardProps, 'metric'> {
  columns: DataTableColumn[]
  data: DataTableRow[]
  searchable?: boolean
  sortable?: boolean
  exportable?: boolean
  pageSize?: number
  emptyMessage?: string
  onRowClick?: (row: DataTableRow) => void
  onExport?: (format: 'csv' | 'json') => void
}

type SortDirection = 'asc' | 'desc' | null

export function DataTableCard({
  title,
  subtitle,
  icon,
  columns,
  data,
  searchable = true,
  sortable = true,
  exportable = false,
  pageSize = 10,
  emptyMessage = 'No data available',
  children,
  actions,
  loading = false,
  error,
  className,
  size = 'md',
  priority = 'medium',
  interactive = false,
  onClick,
  onFilter,
  onRowClick,
  onExport,
}: DataTableCardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm && searchable) {
      const searchableColumns = columns.filter(col => col.searchable !== false)
      filtered = data.filter(row =>
        searchableColumns.some(col =>
          String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortColumn && sortDirection && sortable) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        if (aValue === bValue) return 0

        const comparison = aValue < bValue ? -1 : 1
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [
    data,
    searchTerm,
    sortColumn,
    sortDirection,
    columns,
    searchable,
    sortable,
  ])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return processedData.slice(startIndex, startIndex + pageSize)
  }, [processedData, currentPage, pageSize])

  const totalPages = Math.ceil(processedData.length / pageSize)

  const handleSort = (columnKey: string) => {
    if (!sortable) return

    const column = columns.find(col => col.key === columnKey)
    if (!column?.sortable) return

    if (sortColumn === columnKey) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      )
      if (sortDirection === 'desc') {
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleExport = (format: 'csv' | 'json') => {
    if (onExport) {
      onExport(format)
    } else {
      // Default export implementation
      const dataToExport = processedData
      const filename = `${title?.replace(/\s+/g, '_').toLowerCase() || 'data'}.${format}`

      if (format === 'csv') {
        const headers = columns.map(col => col.label).join(',')
        const rows = dataToExport
          .map(row => columns.map(col => `"${row[col.key] || ''}"`).join(','))
          .join('\n')
        const csv = `${headers}\n${rows}`

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'json') {
        const json = JSON.stringify(dataToExport, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }
    }
  }

  const renderTableActions = () => {
    const tableActions = (
      <div className="flex items-center space-x-2">
        {searchable && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 h-8 w-32"
            />
          </div>
        )}

        {exportable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Export table data"
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {actions && (
          <>
            {(searchable || exportable) && (
              <div className="w-px h-4 bg-border" />
            )}
            {actions}
          </>
        )}
      </div>
    )

    return tableActions
  }

  const renderTable = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <div className="flex space-x-4">
            {columns.map((col, index) => (
              <Skeleton key={index} className="h-4 flex-1" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex space-x-4">
              {columns.map((col, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <div className="text-center">
            <p className="text-sm font-medium">Unable to load table data</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )
    }

    if (paginatedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.className,
                      sortable &&
                        column.sortable !== false &&
                        'cursor-pointer hover:bg-muted/50'
                    )}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable && column.sortable !== false && (
                        <div className="flex flex-col">
                          {sortColumn === column.key ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : sortDirection === 'desc' ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map(row => (
                <TableRow
                  key={row.id}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-muted/50'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(column => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, processedData.length)} of{' '}
              {processedData.length} entries
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={renderTableActions()}
      loading={false} // Handle loading internally
      error={undefined} // Handle error internally
      className={cn('data-table-card', className)}
      size={size}
      priority={priority}
      interactive={interactive}
      onClick={onClick}
      onFilter={onFilter}
    >
      <div className="data-table-content">
        {renderTable()}
        {children}
      </div>
    </DashboardCard>
  )
}

export type { DataTableColumn, DataTableRow, DataTableCardProps }
