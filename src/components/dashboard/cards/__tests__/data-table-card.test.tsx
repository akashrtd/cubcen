import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DataTableCard } from '../data-table-card'
import { Table } from 'lucide-react'

expect.extend(toHaveNoViolations)

// Mock URL.createObjectURL and URL.revokeObjectURL for export tests
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock document.createElement for export tests
const mockClick = jest.fn()
const mockAnchor = {
  href: '',
  download: '',
  click: mockClick
}

// Store original createElement
const originalCreateElement = document.createElement

jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'a') {
    return mockAnchor as any
  }
  return originalCreateElement.call(document, tagName)
})

describe('DataTableCard', () => {
  const user = userEvent.setup()
  
  const mockColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'email', label: 'Email', sortable: true, searchable: true },
    { key: 'status', label: 'Status', sortable: false },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false,
      render: (value: any, row: any) => (
        <button data-testid={`action-${row.id}`}>Edit</button>
      )
    }
  ]

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Pending' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Active' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with title and table data', () => {
      render(
        <DataTableCard
          title="User Table"
          columns={mockColumns}
          data={mockData}
        />
      )
      
      expect(screen.getByText('User Table')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders with subtitle and icon', () => {
      render(
        <DataTableCard
          title="Data Table"
          subtitle="User management"
          icon={Table}
          columns={mockColumns}
          data={mockData}
        />
      )
      
      expect(screen.getByText('Data Table')).toBeInTheDocument()
      expect(screen.getByText('User management')).toBeInTheDocument()
      
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('renders column headers correctly', () => {
      render(
        <DataTableCard
          title="Table Headers"
          columns={mockColumns}
          data={mockData}
        />
      )
      
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('renders custom cell content using render function', () => {
      render(
        <DataTableCard
          title="Custom Cells"
          columns={mockColumns}
          data={mockData}
        />
      )
      
      expect(screen.getByTestId('action-1')).toBeInTheDocument()
      expect(screen.getByTestId('action-2')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('renders search input when searchable', () => {
      render(
        <DataTableCard
          title="Searchable Table"
          columns={mockColumns}
          data={mockData}
          searchable
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toBeInTheDocument()
    })

    it('filters data based on search term', async () => {
      render(
        <DataTableCard
          title="Searchable Table"
          columns={mockColumns}
          data={mockData}
          searchable
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'john')
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('searches across searchable columns only', async () => {
      render(
        <DataTableCard
          title="Searchable Table"
          columns={mockColumns}
          data={mockData}
          searchable
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'Active')
      
      // Should not find results since 'status' column is not marked as searchable
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('does not render search when searchable is false', () => {
      render(
        <DataTableCard
          title="Non-searchable Table"
          columns={mockColumns}
          data={mockData}
          searchable={false}
        />
      )
      
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })
  })

  describe('Sorting Functionality', () => {
    it('renders sort indicators for sortable columns', () => {
      render(
        <DataTableCard
          title="Sortable Table"
          columns={mockColumns}
          data={mockData}
          sortable
        />
      )
      
      // Check for sort icons in sortable columns
      const nameHeader = screen.getByText('Name').closest('th')
      expect(nameHeader).toHaveClass('cursor-pointer')
    })

    it('sorts data when column header is clicked', async () => {
      render(
        <DataTableCard
          title="Sortable Table"
          columns={mockColumns}
          data={mockData}
          sortable
        />
      )
      
      const nameHeader = screen.getByText('Name').closest('th')
      await user.click(nameHeader!)
      
      // Should sort alphabetically - Alice should be first
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Alice Brown')
    })

    it('toggles sort direction on repeated clicks', async () => {
      render(
        <DataTableCard
          title="Sortable Table"
          columns={mockColumns}
          data={mockData}
          sortable
        />
      )
      
      const nameHeader = screen.getByText('Name').closest('th')
      
      // First click - ascending
      await user.click(nameHeader!)
      let rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Alice Brown')
      
      // Second click - descending
      await user.click(nameHeader!)
      rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('John Doe')
      
      // Third click - no sort
      await user.click(nameHeader!)
      rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('John Doe') // Back to original order
    })

    it('does not sort non-sortable columns', async () => {
      render(
        <DataTableCard
          title="Mixed Sortable Table"
          columns={mockColumns}
          data={mockData}
          sortable
        />
      )
      
      const statusHeader = screen.getByText('Status').closest('th')
      expect(statusHeader).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Pagination', () => {
    const largeDataset = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: i % 2 === 0 ? 'Active' : 'Inactive'
    }))

    it('paginates data when dataset is large', () => {
      render(
        <DataTableCard
          title="Paginated Table"
          columns={mockColumns}
          data={largeDataset}
          pageSize={10}
        />
      )
      
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getByText('User 10')).toBeInTheDocument()
      expect(screen.queryByText('User 11')).not.toBeInTheDocument()
      
      expect(screen.getByText('Showing 1 to 10 of 25 entries')).toBeInTheDocument()
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    })

    it('navigates between pages', async () => {
      render(
        <DataTableCard
          title="Paginated Table"
          columns={mockColumns}
          data={largeDataset}
          pageSize={10}
        />
      )
      
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)
      
      expect(screen.getByText('User 11')).toBeInTheDocument()
      expect(screen.getByText('User 20')).toBeInTheDocument()
      expect(screen.queryByText('User 1')).not.toBeInTheDocument()
      
      expect(screen.getByText('Showing 11 to 20 of 25 entries')).toBeInTheDocument()
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    })

    it('disables navigation buttons appropriately', async () => {
      render(
        <DataTableCard
          title="Paginated Table"
          columns={mockColumns}
          data={largeDataset}
          pageSize={10}
        />
      )
      
      const prevButton = screen.getByText('Previous')
      const nextButton = screen.getByText('Next')
      
      expect(prevButton).toBeDisabled()
      expect(nextButton).not.toBeDisabled()
      
      // Go to last page
      await user.click(nextButton)
      await user.click(nextButton)
      
      expect(prevButton).not.toBeDisabled()
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Export Functionality', () => {
    it('renders export button when exportable', () => {
      render(
        <DataTableCard
          title="Exportable Table"
          columns={mockColumns}
          data={mockData}
          exportable
        />
      )
      
      const exportButton = screen.getByLabelText('Export table data')
      expect(exportButton).toBeInTheDocument()
    })

    it('shows export options when clicked', async () => {
      render(
        <DataTableCard
          title="Exportable Table"
          columns={mockColumns}
          data={mockData}
          exportable
        />
      )
      
      const exportButton = screen.getByLabelText('Export table data')
      await user.click(exportButton)
      
      expect(screen.getByText('Export as CSV')).toBeInTheDocument()
      expect(screen.getByText('Export as JSON')).toBeInTheDocument()
    })

    it('handles CSV export', async () => {
      render(
        <DataTableCard
          title="Exportable Table"
          columns={mockColumns}
          data={mockData}
          exportable
        />
      )
      
      const exportButton = screen.getByLabelText('Export table data')
      await user.click(exportButton)
      
      const csvOption = screen.getByText('Export as CSV')
      await user.click(csvOption)
      
      expect(mockClick).toHaveBeenCalled()
      expect(mockAnchor.download).toBe('exportable_table.csv')
    })

    it('handles JSON export', async () => {
      render(
        <DataTableCard
          title="Exportable Table"
          columns={mockColumns}
          data={mockData}
          exportable
        />
      )
      
      const exportButton = screen.getByLabelText('Export table data')
      await user.click(exportButton)
      
      const jsonOption = screen.getByText('Export as JSON')
      await user.click(jsonOption)
      
      expect(mockClick).toHaveBeenCalled()
      expect(mockAnchor.download).toBe('exportable_table.json')
    })

    it('calls custom export handler when provided', async () => {
      const mockOnExport = jest.fn()
      
      render(
        <DataTableCard
          title="Custom Export Table"
          columns={mockColumns}
          data={mockData}
          exportable
          onExport={mockOnExport}
        />
      )
      
      const exportButton = screen.getByLabelText('Export table data')
      await user.click(exportButton)
      
      const csvOption = screen.getByText('Export as CSV')
      await user.click(csvOption)
      
      expect(mockOnExport).toHaveBeenCalledWith('csv')
    })
  })

  describe('Row Interaction', () => {
    it('handles row clicks when onRowClick is provided', async () => {
      const mockOnRowClick = jest.fn()
      
      render(
        <DataTableCard
          title="Interactive Table"
          columns={mockColumns}
          data={mockData}
          onRowClick={mockOnRowClick}
        />
      )
      
      const firstRow = screen.getAllByRole('row')[1] // Skip header row
      await user.click(firstRow)
      
      expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0])
    })

    it('applies hover styles to clickable rows', () => {
      render(
        <DataTableCard
          title="Interactive Table"
          columns={mockColumns}
          data={mockData}
          onRowClick={() => {}}
        />
      )
      
      const firstRow = screen.getAllByRole('row')[1]
      expect(firstRow).toHaveClass('cursor-pointer')
    })
  })

  describe('Loading and Error States', () => {
    it('renders loading skeleton', () => {
      render(
        <DataTableCard
          title="Loading Table"
          columns={mockColumns}
          data={mockData}
          loading
        />
      )
      
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('renders error state', () => {
      render(
        <DataTableCard
          title="Error Table"
          columns={mockColumns}
          data={mockData}
          error="Failed to load table data"
        />
      )
      
      expect(screen.getByText('Unable to load table data')).toBeInTheDocument()
      expect(screen.getByText('Failed to load table data')).toBeInTheDocument()
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('renders empty state when no data', () => {
      render(
        <DataTableCard
          title="Empty Table"
          columns={mockColumns}
          data={[]}
          emptyMessage="No users found"
        />
      )
      
      expect(screen.getByText('No users found')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = render(
        <DataTableCard
          title="Accessible Table"
          subtitle="User data"
          icon={Table}
          columns={mockColumns}
          data={mockData}
          searchable
          sortable
          exportable
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper ARIA labels for interactive elements', () => {
      render(
        <DataTableCard
          title="Accessible Table"
          columns={mockColumns}
          data={mockData}
          searchable
          exportable
        />
      )
      
      expect(screen.getByLabelText('Export table data')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <DataTableCard
          title="Custom Table"
          columns={mockColumns}
          data={mockData}
          className="custom-table-class"
        />
      )
      
      const card = document.querySelector('.data-table-card')
      expect(card).toHaveClass('custom-table-class')
    })

    it('applies column-specific classes', () => {
      const columnsWithClasses = [
        { key: 'id', label: 'ID', className: 'text-center' },
        { key: 'name', label: 'Name', className: 'font-bold' }
      ]
      
      render(
        <DataTableCard
          title="Styled Columns"
          columns={columnsWithClasses}
          data={mockData}
        />
      )
      
      const idHeader = screen.getByText('ID').closest('th')
      const nameHeader = screen.getByText('Name').closest('th')
      
      expect(idHeader).toHaveClass('text-center')
      expect(nameHeader).toHaveClass('font-bold')
    })
  })
})