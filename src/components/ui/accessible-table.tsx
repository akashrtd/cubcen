import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  KeyboardNavigation,
  AriaUtils,
  announceToScreenReader,
} from '@/lib/accessibility'

interface AccessibleTableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  caption?: string
  sortable?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: string[]) => void
}

interface AccessibleTableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

interface AccessibleTableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

interface AccessibleTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean
  selectable?: boolean
  rowId?: string
  onSelect?: (rowId: string, selected: boolean) => void
}

interface AccessibleTableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | 'none'
  onSort?: (direction: 'asc' | 'desc') => void
  children: React.ReactNode
}

interface AccessibleTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

// Table component
const AccessibleTable = React.forwardRef<
  HTMLTableElement,
  AccessibleTableProps
>(
  (
    {
      className,
      caption,
      sortable,
      selectable,
      onSelectionChange,
      children,
      ...props
    },
    ref
  ) => {
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
      new Set()
    )
    const tableRef = React.useRef<HTMLTableElement>(null)
    const combinedRef = (ref || tableRef) as React.RefObject<HTMLTableElement>

    const handleRowSelection = React.useCallback(
      (rowId: string, selected: boolean) => {
        setSelectedRows(prev => {
          const newSelection = new Set(prev)
          if (selected) {
            newSelection.add(rowId)
          } else {
            newSelection.delete(rowId)
          }

          onSelectionChange?.(Array.from(newSelection))

          // Announce selection change
          const count = newSelection.size
          announceToScreenReader(
            `${count} row${count !== 1 ? 's' : ''} selected`,
            'polite'
          )

          return newSelection
        })
      },
      [onSelectionChange]
    )

    // Keyboard navigation for table
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLTableElement>) => {
        const target = event.target as HTMLElement
        const table = combinedRef.current
        if (!table) return

        // Find all focusable cells
        const cells = Array.from(
          table.querySelectorAll('td[tabindex="0"], th[tabindex="0"]')
        ) as HTMLElement[]
        const currentIndex = cells.indexOf(target)

        if (currentIndex === -1) return

        // Calculate grid dimensions
        const rows = Array.from(table.querySelectorAll('tr'))
        const currentRow = target.closest('tr')
        const currentRowIndex = rows.indexOf(currentRow!)
        const cellsInRow = Array.from(
          currentRow!.querySelectorAll('td, th')
        ).length

        KeyboardNavigation.handleArrowNavigation(
          event.nativeEvent,
          cells,
          currentIndex,
          'grid',
          cellsInRow
        )
      },
      [combinedRef]
    )

    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={combinedRef}
          className={cn('w-full caption-bottom text-sm', className)}
          role="table"
          onKeyDown={handleKeyDown}
          {...props}
        >
          {caption && (
            <caption className="mt-4 text-sm text-muted-foreground">
              {caption}
            </caption>
          )}
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                selectedRows,
                onRowSelect: handleRowSelection,
                selectable,
                sortable,
              } as any)
            }
            return child
          })}
        </table>
      </div>
    )
  }
)
AccessibleTable.displayName = 'AccessibleTable'

// Table header component
const AccessibleTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  AccessibleTableHeaderProps
>(({ className, children, ...props }, ref) => {
  return (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props}>
      {children}
    </thead>
  )
})
AccessibleTableHeader.displayName = 'AccessibleTableHeader'

// Table body component
const AccessibleTableBody = React.forwardRef<
  HTMLTableSectionElement,
  AccessibleTableBodyProps
>(({ className, children, ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    >
      {children}
    </tbody>
  )
})
AccessibleTableBody.displayName = 'AccessibleTableBody'

// Table row component
const AccessibleTableRow = React.forwardRef<
  HTMLTableRowElement,
  AccessibleTableRowProps
>(
  (
    { className, selected, selectable, rowId, onSelect, children, ...props },
    ref
  ) => {
    const handleClick = React.useCallback(() => {
      if (selectable && rowId && onSelect) {
        onSelect(rowId, !selected)
      }
    }, [selectable, rowId, onSelect, selected])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLTableRowElement>) => {
        if (selectable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          handleClick()
        }
      },
      [selectable, handleClick]
    )

    return (
      <tr
        ref={ref}
        className={cn(
          'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
          selectable && 'cursor-pointer',
          selected && 'bg-muted',
          className
        )}
        role={selectable ? 'button' : undefined}
        tabIndex={selectable ? 0 : undefined}
        aria-selected={selectable ? selected : undefined}
        onClick={selectable ? handleClick : undefined}
        onKeyDown={selectable ? handleKeyDown : undefined}
        data-state={selected ? 'selected' : undefined}
        {...props}
      >
        {children}
      </tr>
    )
  }
)
AccessibleTableRow.displayName = 'AccessibleTableRow'

// Table head cell component
const AccessibleTableHead = React.forwardRef<
  HTMLTableCellElement,
  AccessibleTableHeadProps
>(
  (
    { className, sortable, sortDirection = 'none', onSort, children, ...props },
    ref
  ) => {
    const handleSort = React.useCallback(() => {
      if (!sortable || !onSort) return

      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      onSort(newDirection)

      // Announce sort change
      announceToScreenReader(
        `Column sorted ${newDirection === 'asc' ? 'ascending' : 'descending'}`,
        'polite'
      )
    }, [sortable, sortDirection, onSort])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLTableCellElement>) => {
        if (sortable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          handleSort()
        }
      },
      [sortable, handleSort]
    )

    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
          sortable && 'cursor-pointer hover:bg-muted/50',
          className
        )}
        role="columnheader"
        tabIndex={sortable ? 0 : undefined}
        aria-sort={
          sortable
            ? sortDirection === 'none'
              ? 'none'
              : sortDirection === 'asc'
                ? 'ascending'
                : 'descending'
            : undefined
        }
        onClick={sortable ? handleSort : undefined}
        onKeyDown={sortable ? handleKeyDown : undefined}
        {...props}
      >
        <div className="flex items-center space-x-2">
          <span>{children}</span>
          {sortable && (
            <span aria-hidden="true" className="text-xs">
              {sortDirection === 'asc'
                ? '↑'
                : sortDirection === 'desc'
                  ? '↓'
                  : '↕'}
            </span>
          )}
        </div>
      </th>
    )
  }
)
AccessibleTableHead.displayName = 'AccessibleTableHead'

// Table cell component
const AccessibleTableCell = React.forwardRef<
  HTMLTableCellElement,
  AccessibleTableCellProps
>(({ className, children, ...props }, ref) => {
  return (
    <td
      ref={ref}
      className={cn(
        'p-4 align-middle [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
})
AccessibleTableCell.displayName = 'AccessibleTableCell'

export {
  AccessibleTable,
  AccessibleTableHeader,
  AccessibleTableBody,
  AccessibleTableRow,
  AccessibleTableHead,
  AccessibleTableCell,
}
