import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterControls, useFilteredData } from '../filter-controls'
import { FilterProvider } from '../filter-context'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    toString: jest.fn(() => ''),
  })),
}))

// Test wrapper with FilterProvider
function TestWrapper({ children, ...props }: any) {
  return <FilterProvider {...props}>{children}</FilterProvider>
}

// Test component for useFilteredData hook
function FilteredDataTest({
  data,
  searchFields,
}: {
  data: any[]
  searchFields: string[]
}) {
  const filteredData = useFilteredData(data, searchFields)

  return (
    <div>
      <div data-testid="filtered-count">{filteredData.length}</div>
      <div data-testid="filtered-data">{JSON.stringify(filteredData)}</div>
    </div>
  )
}

describe('FilterControls', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input', () => {
    render(
      <TestWrapper>
        <FilterControls />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders with custom search placeholder', () => {
    render(
      <TestWrapper>
        <FilterControls searchPlaceholder="Custom search..." />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('Custom search...')).toBeInTheDocument()
  })

  it('shows advanced filters button when enabled', () => {
    render(
      <TestWrapper>
        <FilterControls showAdvancedFilters />
      </TestWrapper>
    )

    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('hides advanced filters button when disabled', () => {
    render(
      <TestWrapper>
        <FilterControls showAdvancedFilters={false} />
      </TestWrapper>
    )

    expect(screen.queryByText('Advanced')).not.toBeInTheDocument()
  })

  it('handles search input changes', async () => {
    render(
      <TestWrapper>
        <FilterControls />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test search')

    expect(searchInput).toHaveValue('test search')
  })

  it('shows clear button when search has value', async () => {
    render(
      <TestWrapper>
        <FilterControls />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')

    // Clear button should appear
    const clearButton =
      screen.getByRole('button', { name: /clear search/i }) ||
      searchInput.parentElement?.querySelector('button')
    expect(clearButton).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    render(
      <TestWrapper>
        <FilterControls />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')

    // Find and click clear button
    const clearButton = searchInput.parentElement?.querySelector('button')
    if (clearButton) {
      await user.click(clearButton)
    }

    expect(searchInput).toHaveValue('')
  })

  it('shows Clear All button when filters are active', async () => {
    render(
      <TestWrapper>
        <FilterControls />
      </TestWrapper>
    )

    // Add a search filter
    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')

    // Clear All button should appear
    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })
  })

  it('opens advanced filters popover', async () => {
    render(
      <TestWrapper>
        <FilterControls showAdvancedFilters />
      </TestWrapper>
    )

    await user.click(screen.getByText('Advanced'))

    expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
    expect(screen.getByText('Add Custom Filter')).toBeInTheDocument()
  })

  it('renders custom filter options', async () => {
    const customOptions = [
      {
        key: 'department',
        label: 'Department',
        type: 'select' as const,
        options: ['IT', 'HR', 'Finance'],
      },
      { key: 'score', label: 'Score', type: 'number' as const },
      { key: 'description', label: 'Description', type: 'string' as const },
    ]

    render(
      <TestWrapper>
        <FilterControls
          showAdvancedFilters
          customFilterOptions={customOptions}
        />
      </TestWrapper>
    )

    await user.click(screen.getByText('Advanced'))

    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('handles select-type custom filters', async () => {
    const customOptions = [
      {
        key: 'department',
        label: 'Department',
        type: 'select' as const,
        options: ['IT', 'HR'],
      },
    ]

    render(
      <TestWrapper>
        <FilterControls
          showAdvancedFilters
          customFilterOptions={customOptions}
        />
      </TestWrapper>
    )

    await user.click(screen.getByText('Advanced'))

    // Find and click the department select
    const departmentSelect = screen.getByRole('combobox', {
      name: /department/i,
    })
    await user.click(departmentSelect)

    // Select IT option
    await user.click(screen.getByText('IT'))

    // Should show active filter
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
      expect(screen.getByText('department: IT')).toBeInTheDocument()
    })
  })

  it('adds custom filters through the builder', async () => {
    render(
      <TestWrapper>
        <FilterControls showAdvancedFilters />
      </TestWrapper>
    )

    await user.click(screen.getByText('Advanced'))

    // Fill in custom filter form
    const nameInput = screen.getByPlaceholderText('Filter name')
    const valueInput = screen.getByPlaceholderText('Filter value')

    await user.type(nameInput, 'custom-field')
    await user.type(valueInput, 'custom-value')

    // Click Add Filter button
    await user.click(screen.getByText('Add Filter'))

    // Should show active filter
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
      expect(screen.getByText('custom-field: custom-value')).toBeInTheDocument()
    })
  })

  it('handles different filter types in custom builder', async () => {
    render(
      <TestWrapper>
        <FilterControls showAdvancedFilters />
      </TestWrapper>
    )

    await user.click(screen.getByText('Advanced'))

    // Change filter type to number
    const typeSelect = screen.getByDisplayValue('Text')
    await user.click(typeSelect)
    await user.click(screen.getByText('Number'))

    // Value input should now be number type
    const valueInput = screen.getByPlaceholderText('Filter value')
    expect(valueInput).toHaveAttribute('type', 'number')
  })

  it('shows different operators for number filters', async () => {
    render(
      <TestWrapper>
        <FilterControls showAdvancedFilters />
      </TestWrapper>
    )

    await user.click(screen.getByText('Advanced'))

    // Change filter type to number
    const typeSelect = screen.getByDisplayValue('Text')
    await user.click(typeSelect)
    await user.click(screen.getByText('Number'))

    // Operator select should show number-specific options
    const operatorSelect = screen.getByDisplayValue('Contains')
    await user.click(operatorSelect)

    expect(screen.getByText('Greater Than')).toBeInTheDocument()
    expect(screen.getByText('Less Than')).toBeInTheDocument()
  })

  it('removes active filters when X is clicked', async () => {
    render(
      <TestWrapper>
        <FilterControls />
      </TestWrapper>
    )

    // Add a search filter
    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')

    // Wait for active filters to appear
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
    })

    // Find and click X button
    const removeButton = screen
      .getByText('search: test')
      .parentElement?.querySelector('svg')
    if (removeButton) {
      await user.click(removeButton)
    }

    // Filter should be removed
    await waitFor(() => {
      expect(screen.queryByText('Active Filters')).not.toBeInTheDocument()
    })
  })

  it('disables Add Filter button when fields are empty', async () => {
    render(
      <TestWrapper>
        <FilterControls showAdvancedFilters />
      </TestWrapper>
    )

    await user.click(screen.getByText('Advanced'))

    const addButton = screen.getByText('Add Filter')
    expect(addButton).toBeDisabled()

    // Fill in name only
    const nameInput = screen.getByPlaceholderText('Filter name')
    await user.type(nameInput, 'test')

    expect(addButton).toBeDisabled()

    // Fill in value
    const valueInput = screen.getByPlaceholderText('Filter value')
    await user.type(valueInput, 'value')

    expect(addButton).not.toBeDisabled()
  })
})

describe('useFilteredData', () => {
  const testData = [
    {
      id: 1,
      name: 'John Doe',
      status: 'active',
      priority: 'high',
      category: 'user',
      createdAt: '2023-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      status: 'inactive',
      priority: 'low',
      category: 'admin',
      createdAt: '2023-02-20',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      status: 'active',
      priority: 'medium',
      category: 'user',
      createdAt: '2023-03-10',
    },
  ]

  it('returns all data when no filters are applied', () => {
    render(
      <TestWrapper>
        <FilteredDataTest data={testData} searchFields={['name']} />
      </TestWrapper>
    )

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('3')
  })

  it('filters data by search term', async () => {
    const TestComponent = () => {
      return (
        <TestWrapper>
          <FilterControls />
          <FilteredDataTest data={testData} searchFields={['name']} />
        </TestWrapper>
      )
    }

    render(<TestComponent />)

    // Add search filter
    const searchInput = screen.getByPlaceholderText('Search...')
    await userEvent.type(searchInput, 'John')

    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('2')
    })
  })

  it('filters data by status', async () => {
    const TestComponent = () => {
      return (
        <TestWrapper>
          <FilterControls showAdvancedFilters />
          <FilteredDataTest data={testData} searchFields={['name']} />
        </TestWrapper>
      )
    }

    render(<TestComponent />)

    // Add status filter through advanced filters
    await userEvent.click(screen.getByText('Advanced'))

    const nameInput = screen.getByPlaceholderText('Filter name')
    const valueInput = screen.getByPlaceholderText('Filter value')

    await userEvent.type(nameInput, 'status')
    await userEvent.type(valueInput, 'active')
    await userEvent.click(screen.getByText('Add Filter'))

    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('2')
    })
  })

  it('filters data by multiple criteria', async () => {
    const TestComponent = () => {
      return (
        <TestWrapper>
          <FilterControls showAdvancedFilters />
          <FilteredDataTest data={testData} searchFields={['name']} />
        </TestWrapper>
      )
    }

    render(<TestComponent />)

    // Add search filter
    const searchInput = screen.getByPlaceholderText('Search...')
    await userEvent.type(searchInput, 'John')

    // Add status filter
    await userEvent.click(screen.getByText('Advanced'))

    const nameInput = screen.getByPlaceholderText('Filter name')
    const valueInput = screen.getByPlaceholderText('Filter value')

    await userEvent.type(nameInput, 'status')
    await userEvent.type(valueInput, 'active')
    await userEvent.click(screen.getByText('Add Filter'))

    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('1')
    })
  })

  it('handles empty data gracefully', () => {
    render(
      <TestWrapper>
        <FilteredDataTest data={[]} searchFields={['name']} />
      </TestWrapper>
    )

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('0')
  })

  it('handles null/undefined data gracefully', () => {
    render(
      <TestWrapper>
        <FilteredDataTest data={null as any} searchFields={['name']} />
      </TestWrapper>
    )

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('0')
  })
})
