import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import {
  VirtualizedList,
  VirtualizedTable,
  VirtualizedGrid,
  useDynamicSizing,
  useVirtualizationPerformance,
  calculateOptimalItemSize,
  estimateVirtualizationMemory,
} from '../virtualization'

// Mock data
const mockListItems = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  value: Math.random() * 100,
}))

const mockTableData = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `Row ${i}`,
  email: `user${i}@example.com`,
  status: i % 2 === 0 ? 'active' : 'inactive',
}))

const mockTableColumns = [
  { key: 'id', header: 'ID', width: 60 },
  { key: 'name', header: 'Name', width: 150 },
  { key: 'email', header: 'Email', width: 200 },
  { key: 'status', header: 'Status', width: 100 },
]

describe('Virtualization', () => {
  describe('VirtualizedList', () => {
    it('should render virtualized list', () => {
      const renderItem = (item: any, index: number, style: React.CSSProperties) => (
        <div style={style} data-testid={`item-${index}`}>
          {item.name}
        </div>
      )

      render(
        <VirtualizedList
          items={mockListItems.slice(0, 10)}
          itemHeight={50}
          containerHeight={300}
          renderItem={renderItem}
        />
      )

      // Should render visible items
      expect(screen.getByTestId('item-0')).toBeInTheDocument()
      expect(screen.getByText('Item 0')).toBeInTheDocument()
    })

    it('should handle scroll events', () => {
      const onScroll = jest.fn()
      const renderItem = (item: any, index: number, style: React.CSSProperties) => (
        <div style={style} data-testid={`item-${index}`}>
          {item.name}
        </div>
      )

      render(
        <VirtualizedList
          items={mockListItems}
          itemHeight={50}
          containerHeight={300}
          renderItem={renderItem}
          onScroll={onScroll}
        />
      )

      const container = screen.getByRole('list')
      fireEvent.scroll(container, { target: { scrollTop: 100 } })

      expect(onScroll).toHaveBeenCalledWith(100)
    })

    it('should use custom item key function', () => {
      const renderItem = (item: any, index: number, style: React.CSSProperties) => (
        <div style={style} data-testid={`item-${item.id}`}>
          {item.name}
        </div>
      )

      const getItemKey = (item: any) => `custom-${item.id}`

      render(
        <VirtualizedList
          items={mockListItems.slice(0, 5)}
          itemHeight={50}
          containerHeight={300}
          renderItem={renderItem}
          getItemKey={getItemKey}
        />
      )

      expect(screen.getByTestId('item-0')).toBeInTheDocument()
    })
  })

  describe('VirtualizedTable', () => {
    it('should render virtualized table', () => {
      render(
        <VirtualizedTable
          data={mockTableData.slice(0, 10)}
          columns={mockTableColumns}
          rowHeight={40}
          containerHeight={400}
        />
      )

      // Should render table headers
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()

      // Should render first row
      expect(screen.getByText('Row 0')).toBeInTheDocument()
      expect(screen.getByText('user0@example.com')).toBeInTheDocument()
    })

    it('should handle row clicks', () => {
      const onRowClick = jest.fn()

      render(
        <VirtualizedTable
          data={mockTableData.slice(0, 10)}
          columns={mockTableColumns}
          rowHeight={40}
          containerHeight={400}
          onRowClick={onRowClick}
        />
      )

      const firstRow = screen.getByText('Row 0').closest('[role="row"]')
      if (firstRow) {
        fireEvent.click(firstRow)
        expect(onRowClick).toHaveBeenCalledWith(mockTableData[0], 0)
      }
    })

    it('should handle keyboard navigation', () => {
      const onRowClick = jest.fn()

      render(
        <VirtualizedTable
          data={mockTableData.slice(0, 10)}
          columns={mockTableColumns}
          rowHeight={40}
          containerHeight={400}
          onRowClick={onRowClick}
        />
      )

      const firstRow = screen.getByText('Row 0').closest('[role="row"]')
      if (firstRow) {
        fireEvent.keyDown(firstRow, { key: 'Enter' })
        expect(onRowClick).toHaveBeenCalledWith(mockTableData[0], 0)

        fireEvent.keyDown(firstRow, { key: ' ' })
        expect(onRowClick).toHaveBeenCalledTimes(2)
      }
    })

    it('should render custom cell content', () => {
      const customColumns = [
        ...mockTableColumns,
        {
          key: 'custom',
          header: 'Custom',
          width: 100,
          render: (value: any, item: any) => (
            <span data-testid={`custom-${item.id}`}>Custom {item.id}</span>
          ),
        },
      ]

      render(
        <VirtualizedTable
          data={mockTableData.slice(0, 5)}
          columns={customColumns}
          rowHeight={40}
          containerHeight={400}
        />
      )

      expect(screen.getByTestId('custom-0')).toHaveTextContent('Custom 0')
    })
  })

  describe('VirtualizedGrid', () => {
    it('should render virtualized grid', () => {
      const renderItem = (item: any, index: number, style: React.CSSProperties) => (
        <div style={style} data-testid={`grid-item-${index}`}>
          {item.name}
        </div>
      )

      render(
        <VirtualizedGrid
          items={mockListItems.slice(0, 20)}
          itemWidth={150}
          itemHeight={100}
          containerWidth={600}
          containerHeight={400}
          columnsCount={4}
          renderItem={renderItem}
        />
      )

      // Should render visible grid items
      expect(screen.getByTestId('grid-item-0')).toBeInTheDocument()
      expect(screen.getByText('Item 0')).toBeInTheDocument()
    })

    it('should handle grid with gap', () => {
      const renderItem = (item: any, index: number, style: React.CSSProperties) => (
        <div style={style} data-testid={`grid-item-${index}`}>
          {item.name}
        </div>
      )

      render(
        <VirtualizedGrid
          items={mockListItems.slice(0, 12)}
          itemWidth={150}
          itemHeight={100}
          containerWidth={600}
          containerHeight={400}
          columnsCount={3}
          renderItem={renderItem}
          gap={10}
        />
      )

      expect(screen.getByTestId('grid-item-0')).toBeInTheDocument()
    })
  })

  describe('useDynamicSizing', () => {
    const TestComponent = ({ items }: { items: any[] }) => {
      const measureItem = (item: any) => item.height || 50

      const { itemHeights, totalHeight, measureItemHeight, getItemOffset } = useDynamicSizing(
        items,
        50,
        measureItem
      )

      return (
        <div>
          <div data-testid="total-height">{totalHeight}</div>
          <div data-testid="item-heights">{itemHeights.size}</div>
          <button
            onClick={() => measureItemHeight(0)}
            data-testid="measure-button"
          >
            Measure
          </button>
        </div>
      )
    }

    it('should handle dynamic item sizing', () => {
      const items = [
        { id: 1, height: 60 },
        { id: 2, height: 80 },
        { id: 3, height: 40 },
      ]

      render(<TestComponent items={items} />)

      // Initial total height should be estimated
      expect(screen.getByTestId('total-height')).toHaveTextContent('150') // 3 * 50

      // Measure an item
      fireEvent.click(screen.getByTestId('measure-button'))

      // Should have measured one item
      expect(screen.getByTestId('item-heights')).toHaveTextContent('1')
    })
  })

  describe('useVirtualizationPerformance', () => {
    const TestComponent = ({ name }: { name: string }) => {
      const { trackScroll } = useVirtualizationPerformance(name)

      return (
        <div>
          <button onClick={trackScroll} data-testid="track-scroll">
            Track Scroll
          </button>
        </div>
      )
    }

    it('should track virtualization performance', () => {
      render(<TestComponent name="TestVirtualization" />)

      // Should not throw when tracking scroll
      fireEvent.click(screen.getByTestId('track-scroll'))
    })
  })

  describe('calculateOptimalItemSize', () => {
    it('should calculate optimal item size', () => {
      const result = calculateOptimalItemSize(1000, 10, 50, 200)
      expect(result).toBe(100) // 1000 / 10 = 100, within min/max bounds

      const resultWithMin = calculateOptimalItemSize(1000, 50, 50, 200)
      expect(resultWithMin).toBe(50) // Would be 20, but clamped to min

      const resultWithMax = calculateOptimalItemSize(1000, 2, 50, 200)
      expect(resultWithMax).toBe(200) // Would be 500, but clamped to max
    })
  })

  describe('estimateVirtualizationMemory', () => {
    it('should estimate memory usage', () => {
      const result = estimateVirtualizationMemory(1000, 50, 1024) // 1KB per item

      expect(result.totalMemory).toBe(1024000) // 1000 * 1024
      expect(result.virtualizedMemory).toBe(51200) // 50 * 1024
      expect(result.memorySaved).toBe(972800) // totalMemory - virtualizedMemory
      expect(result.savingsPercentage).toBe(95) // 95% savings
    })
  })
})