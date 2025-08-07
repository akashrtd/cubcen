import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (
    item: T,
    index: number,
    style: React.CSSProperties
  ) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
  getItemKey?: (item: T, index: number) => string | number
}

interface VirtualizedTableProps<T> {
  data: T[]
  columns: Array<{
    key: string
    header: string
    width?: number
    render?: (value: any, item: T, index: number) => React.ReactNode
  }>
  rowHeight: number
  containerHeight: number
  overscan?: number
  className?: string
  onRowClick?: (item: T, index: number) => void
  getRowKey?: (item: T, index: number) => string | number
}

interface VirtualizedGridProps<T> {
  items: T[]
  itemWidth: number
  itemHeight: number
  containerWidth: number
  containerHeight: number
  columnsCount: number
  renderItem: (
    item: T,
    index: number,
    style: React.CSSProperties
  ) => React.ReactNode
  overscan?: number
  className?: string
  gap?: number
  getItemKey?: (item: T, index: number) => string | number
}

// Virtualized List Component
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  getItemKey,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight)
    const visibleEnd = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    )

    return {
      startIndex: Math.max(0, visibleStart - overscan),
      endIndex: Math.min(items.length - 1, visibleEnd + overscan),
      totalHeight: items.length * itemHeight,
    }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // Handle scroll events
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)
    },
    [onScroll]
  )

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = []

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i]
      if (!item) continue

      const style: React.CSSProperties = {
        position: 'absolute',
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      }

      const key = getItemKey ? getItemKey(item, i) : i

      items_to_render.push(
        <div key={key} style={style}>
          {renderItem(item, i, style)}
        </div>
      )
    }

    return items_to_render
  }, [items, startIndex, endIndex, itemHeight, renderItem, getItemKey])

  return (
    <div
      ref={containerRef}
      className={cn('virtualized-list', className)}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
      role="list"
      aria-label={`Virtualized list with ${items.length} items`}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleItems}
      </div>
    </div>
  )
}

// Virtualized Table Component
export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight,
  containerHeight,
  overscan = 5,
  className,
  onRowClick,
  getRowKey,
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / rowHeight)
    const visibleEnd = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight)
    )

    return {
      startIndex: Math.max(0, visibleStart - overscan),
      endIndex: Math.min(data.length - 1, visibleEnd + overscan),
      totalHeight: data.length * rowHeight,
    }
  }, [scrollTop, rowHeight, containerHeight, data.length, overscan])

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop
    setScrollTop(newScrollTop)
  }, [])

  // Calculate column widths
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 100), 0)

  // Render table header
  const tableHeader = (
    <div
      className="virtualized-table-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: 'var(--dashboard-surface)',
        borderBottom: '1px solid var(--dashboard-border)',
        display: 'flex',
        height: rowHeight,
        alignItems: 'center',
      }}
    >
      {columns.map((column, index) => (
        <div
          key={column.key}
          className="table-header-cell"
          style={{
            width: column.width || 100,
            padding: '0 8px',
            fontWeight: 'var(--dashboard-font-semibold)',
            fontSize: 'var(--dashboard-text-sm)',
          }}
        >
          {column.header}
        </div>
      ))}
    </div>
  )

  // Render visible rows
  const visibleRows = useMemo(() => {
    const rows = []

    for (let i = startIndex; i <= endIndex; i++) {
      const item = data[i]
      if (!item) continue

      const key = getRowKey ? getRowKey(item, i) : i

      rows.push(
        <div
          key={key}
          className="virtualized-table-row"
          style={{
            position: 'absolute',
            top: i * rowHeight,
            left: 0,
            right: 0,
            height: rowHeight,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--dashboard-border)',
            cursor: onRowClick ? 'pointer' : 'default',
          }}
          onClick={() => onRowClick?.(item, i)}
          role="row"
          tabIndex={onRowClick ? 0 : -1}
          onKeyDown={e => {
            if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              onRowClick(item, i)
            }
          }}
        >
          {columns.map(column => (
            <div
              key={column.key}
              className="table-cell"
              style={{
                width: column.width || 100,
                padding: '0 8px',
                fontSize: 'var(--dashboard-text-sm)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              role="cell"
            >
              {column.render
                ? column.render((item as any)[column.key], item, i)
                : (item as any)[column.key]}
            </div>
          ))}
        </div>
      )
    }

    return rows
  }, [data, columns, startIndex, endIndex, rowHeight, onRowClick, getRowKey])

  return (
    <div
      ref={containerRef}
      className={cn('virtualized-table', className)}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        border: '1px solid var(--dashboard-border)',
        borderRadius: 'var(--dashboard-radius-md)',
      }}
      onScroll={handleScroll}
      role="table"
      aria-label={`Virtualized table with ${data.length} rows`}
    >
      {tableHeader}
      <div
        style={{
          height: totalHeight,
          position: 'relative',
          marginTop: rowHeight, // Account for header
        }}
      >
        {visibleRows}
      </div>
    </div>
  )
}

// Virtualized Grid Component
export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  columnsCount,
  renderItem,
  overscan = 5,
  className,
  gap = 0,
  getItemKey,
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate grid dimensions
  const rowsCount = Math.ceil(items.length / columnsCount)
  const totalHeight = rowsCount * (itemHeight + gap) - gap

  // Calculate visible range
  const { startRow, endRow } = useMemo(() => {
    const visibleStartRow = Math.floor(scrollTop / (itemHeight + gap))
    const visibleEndRow = Math.min(
      rowsCount - 1,
      Math.ceil((scrollTop + containerHeight) / (itemHeight + gap))
    )

    return {
      startRow: Math.max(0, visibleStartRow - overscan),
      endRow: Math.min(rowsCount - 1, visibleEndRow + overscan),
    }
  }, [scrollTop, itemHeight, gap, containerHeight, rowsCount, overscan])

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop
    setScrollTop(newScrollTop)
  }, [])

  // Render visible items
  const visibleItems = useMemo(() => {
    const itemsToRender = []

    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columnsCount; col++) {
        const index = row * columnsCount + col
        const item = items[index]

        if (!item) continue

        const style: React.CSSProperties = {
          position: 'absolute',
          top: row * (itemHeight + gap),
          left: col * (itemWidth + gap),
          width: itemWidth,
          height: itemHeight,
        }

        const key = getItemKey ? getItemKey(item, index) : index

        itemsToRender.push(
          <div key={key} style={style}>
            {renderItem(item, index, style)}
          </div>
        )
      }
    }

    return itemsToRender
  }, [
    items,
    startRow,
    endRow,
    columnsCount,
    itemWidth,
    itemHeight,
    gap,
    renderItem,
    getItemKey,
  ])

  return (
    <div
      ref={containerRef}
      className={cn('virtualized-grid', className)}
      style={{
        width: containerWidth,
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
      role="grid"
      aria-label={`Virtualized grid with ${items.length} items`}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleItems}
      </div>
    </div>
  )
}

// Hook for dynamic item sizing
export function useDynamicSizing<T>(
  items: T[],
  estimatedItemHeight: number,
  measureItem: (item: T, index: number) => number
) {
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map())
  const [totalHeight, setTotalHeight] = useState(
    items.length * estimatedItemHeight
  )

  // Measure items as they become visible
  const measureItemHeight = useCallback(
    (index: number) => {
      const item = items[index]
      if (!item) return estimatedItemHeight

      const height = measureItem(item, index)

      setItemHeights(prev => {
        const newHeights = new Map(prev)
        newHeights.set(index, height)
        return newHeights
      })

      return height
    },
    [items, measureItem, estimatedItemHeight]
  )

  // Recalculate total height when item heights change
  useEffect(() => {
    let total = 0
    for (let i = 0; i < items.length; i++) {
      total += itemHeights.get(i) || estimatedItemHeight
    }
    setTotalHeight(total)
  }, [items.length, itemHeights, estimatedItemHeight])

  // Get offset for a specific item
  const getItemOffset = useCallback(
    (index: number) => {
      let offset = 0
      for (let i = 0; i < index; i++) {
        offset += itemHeights.get(i) || estimatedItemHeight
      }
      return offset
    },
    [itemHeights, estimatedItemHeight]
  )

  return {
    itemHeights,
    totalHeight,
    measureItemHeight,
    getItemOffset,
  }
}

// Performance monitoring for virtualized components
export function useVirtualizationPerformance(componentName: string) {
  const renderCount = useRef(0)
  const scrollEvents = useRef(0)
  const lastScrollTime = useRef(0)

  const trackScroll = useCallback(() => {
    scrollEvents.current += 1
    const now = performance.now()

    if (lastScrollTime.current > 0) {
      const scrollDelta = now - lastScrollTime.current

      // Track scroll performance
      if (scrollDelta < 16) {
        // Less than 16ms = good performance
        console.log(
          `${componentName} smooth scroll: ${scrollDelta.toFixed(2)}ms`
        )
      } else if (scrollDelta > 32) {
        // More than 32ms = poor performance
        console.warn(
          `${componentName} janky scroll: ${scrollDelta.toFixed(2)}ms`
        )
      }
    }

    lastScrollTime.current = now
  }, [componentName])

  useEffect(() => {
    renderCount.current += 1

    if (renderCount.current % 10 === 0) {
      console.log(
        `${componentName} performance: ${renderCount.current} renders, ` +
          `${scrollEvents.current} scroll events`
      )
    }
  })

  return { trackScroll }
}

// Utility for calculating optimal item sizes
export function calculateOptimalItemSize(
  containerSize: number,
  itemCount: number,
  minItemSize: number,
  maxItemSize: number
): number {
  const idealSize = containerSize / itemCount
  return Math.max(minItemSize, Math.min(maxItemSize, idealSize))
}

// Utility for estimating memory usage
export function estimateVirtualizationMemory(
  totalItems: number,
  visibleItems: number,
  itemSizeBytes: number
): {
  totalMemory: number
  virtualizedMemory: number
  memorySaved: number
  savingsPercentage: number
} {
  const totalMemory = totalItems * itemSizeBytes
  const virtualizedMemory = visibleItems * itemSizeBytes
  const memorySaved = totalMemory - virtualizedMemory
  const savingsPercentage = (memorySaved / totalMemory) * 100

  return {
    totalMemory,
    virtualizedMemory,
    memorySaved,
    savingsPercentage,
  }
}
