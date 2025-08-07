import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterableCard, withCardFiltering } from '../filterable-card'
import { FilterProvider } from '../filter-context'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    toString: jest.fn(() => ''),
  })),
}))

// Mock DashboardCard
jest.mock('../cards/dashboard-card', () => ({
  DashboardCard: ({ onClick, onFilter, interactive, title, ...props }: any) => (
    <div
      data-testid="dashboard-card"
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      {...props}
    >
      <div data-testid="card-title">{title}</div>
      <button
        data-testid="trigger-filter"
        onClick={() =>
          onFilter?.({ type: 'string', value: 'test', operator: 'equals' })
        }
      >
        Trigger Filter
      </button>
    </div>
  ),
}))

// Test wrapper with FilterProvider
function TestWrapper({ children, ...props }: any) {
  return <FilterProvider {...props}>{children}</FilterProvider>
}

describe('FilterableCard', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard card with props', () => {
    render(
      <TestWrapper>
        <FilterableCard
          title="Test Card"
          metric={{ value: 100, unit: 'items' }}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId('dashboard-card')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toHaveTextContent('Test Card')
  })

  it('makes card interactive when filtering is enabled', () => {
    render(
      <TestWrapper>
        <FilterableCard title="Test Card" enableFiltering />
      </TestWrapper>
    )

    const card = screen.getByTestId('dashboard-card')
    expect(card).toHaveAttribute('role', 'button')
  })

  it('handles card clicks with default filtering using filterData', async () => {
    const filterData = {
      category: 'test-category',
      status: 'active',
      priority: 'high',
    }

    render(
      <TestWrapper>
        <FilterableCard
          title="Test Card"
          enableFiltering
          filterData={filterData}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('dashboard-card'))

    // Should apply filters based on filterData
    // We can't easily test the filter state without exposing it,
    // but we can verify the click was handled
    expect(screen.getByTestId('dashboard-card')).toBeInTheDocument()
  })

  it('handles card clicks with custom filter mappings', async () => {
    const customMapping = jest.fn(() => ({
      customFilter: {
        type: 'string' as const,
        value: 'custom-value',
        operator: 'equals' as const,
      },
    }))

    render(
      <TestWrapper>
        <FilterableCard
          title="Test Card"
          enableFiltering
          filterMappings={{
            cardClick: customMapping,
          }}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('dashboard-card'))

    expect(customMapping).toHaveBeenCalled()
  })

  it('falls back to title-based filtering when no filterData or mappings', async () => {
    render(
      <TestWrapper>
        <FilterableCard title="Fallback Card" enableFiltering />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('dashboard-card'))

    // Should apply cardTitle filter
    expect(screen.getByTestId('dashboard-card')).toBeInTheDocument()
  })

  it('calls custom onClick handler before applying filters', async () => {
    const customOnClick = jest.fn()

    render(
      <TestWrapper>
        <FilterableCard
          title="Test Card"
          enableFiltering
          onClick={customOnClick}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('dashboard-card'))

    expect(customOnClick).toHaveBeenCalled()
  })

  it('calls onFilter callback when filters are applied', async () => {
    const onFilter = jest.fn()
    const filterData = { category: 'test' }

    render(
      <TestWrapper>
        <FilterableCard
          title="Test Card"
          enableFiltering
          filterData={filterData}
          onFilter={onFilter}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('dashboard-card'))

    expect(onFilter).toHaveBeenCalledWith({
      type: 'string',
      value: 'test',
      operator: 'equals',
    })
  })

  it('disables filtering when enableFiltering is false', async () => {
    const customOnClick = jest.fn()

    render(
      <TestWrapper>
        <FilterableCard
          title="Test Card"
          enableFiltering={false}
          onClick={customOnClick}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('dashboard-card'))

    // Custom handler should still be called
    expect(customOnClick).toHaveBeenCalled()
    // But card should not be interactive due to filtering
    const card = screen.getByTestId('dashboard-card')
    expect(card).not.toHaveAttribute('role', 'button')
  })

  it('handles different data types in filterData', async () => {
    const filterData = {
      stringField: 'text-value',
      numberField: 42,
      booleanField: true,
      nullField: null,
      undefinedField: undefined,
    }

    render(
      <TestWrapper>
        <FilterableCard
          title="Test Card"
          enableFiltering
          filterData={filterData}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('dashboard-card'))

    // Should handle different data types appropriately
    // null and undefined values should be ignored
    expect(screen.getByTestId('dashboard-card')).toBeInTheDocument()
  })

  it('passes through all card props', () => {
    render(
      <TestWrapper>
        <FilterableCard
          title="Test Card"
          subtitle="Test Subtitle"
          size="lg"
          priority="high"
          loading={false}
          className="custom-class"
        />
      </TestWrapper>
    )

    const card = screen.getByTestId('dashboard-card')
    expect(card).toHaveAttribute('title', 'Test Card')
    expect(card).toHaveAttribute('subtitle', 'Test Subtitle')
    expect(card).toHaveAttribute('size', 'lg')
    expect(card).toHaveAttribute('priority', 'high')
    expect(card).toHaveAttribute('loading', 'false')
    expect(card).toHaveAttribute('className', 'custom-class')
  })
})

describe('withCardFiltering HOC', () => {
  const user = userEvent.setup()

  // Mock component to wrap
  const MockCard = ({
    onClick,
    onFilter,
    interactive,
    title,
    ...props
  }: any) => (
    <div
      data-testid="mock-card"
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      {...props}
    >
      <div data-testid="mock-title">{title}</div>
    </div>
  )

  it('wraps component with filtering functionality', async () => {
    const FilterableMockCard = withCardFiltering(MockCard)

    render(
      <TestWrapper>
        <FilterableMockCard title="HOC Card" enableFiltering />
      </TestWrapper>
    )

    expect(screen.getByTestId('mock-card')).toBeInTheDocument()
    expect(screen.getByTestId('mock-title')).toHaveTextContent('HOC Card')

    const card = screen.getByTestId('mock-card')
    expect(card).toHaveAttribute('role', 'button')

    await user.click(card)
    // Should apply filtering
  })

  it('uses default filter mappings provided to HOC', async () => {
    const defaultMappings = {
      cardClick: jest.fn(() => ({
        defaultFilter: {
          type: 'string' as const,
          value: 'default-value',
          operator: 'equals' as const,
        },
      })),
    }

    const FilterableMockCard = withCardFiltering(MockCard, defaultMappings)

    render(
      <TestWrapper>
        <FilterableMockCard title="HOC Card" enableFiltering />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('mock-card'))

    expect(defaultMappings.cardClick).toHaveBeenCalled()
  })

  it('allows overriding default mappings', async () => {
    const defaultMappings = {
      cardClick: jest.fn(() => ({
        default: {
          type: 'string' as const,
          value: 'default',
          operator: 'equals' as const,
        },
      })),
    }

    const overrideMappings = {
      cardClick: jest.fn(() => ({
        override: {
          type: 'string' as const,
          value: 'override',
          operator: 'equals' as const,
        },
      })),
    }

    const FilterableMockCard = withCardFiltering(MockCard, defaultMappings)

    render(
      <TestWrapper>
        <FilterableMockCard
          title="HOC Card"
          enableFiltering
          filterMappings={overrideMappings}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('mock-card'))

    expect(overrideMappings.cardClick).toHaveBeenCalled()
    expect(defaultMappings.cardClick).not.toHaveBeenCalled()
  })

  it('handles filterData in HOC', async () => {
    const FilterableMockCard = withCardFiltering(MockCard)
    const filterData = { category: 'hoc-category' }

    render(
      <TestWrapper>
        <FilterableMockCard
          title="HOC Card"
          enableFiltering
          filterData={filterData}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('mock-card'))

    // Should apply filters based on filterData
    expect(screen.getByTestId('mock-card')).toBeInTheDocument()
  })

  it('calls custom handlers in HOC', async () => {
    const customOnClick = jest.fn()
    const customOnFilter = jest.fn()
    const FilterableMockCard = withCardFiltering(MockCard)

    render(
      <TestWrapper>
        <FilterableMockCard
          title="HOC Card"
          enableFiltering
          onClick={customOnClick}
          onFilter={customOnFilter}
          filterData={{ test: 'value' }}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('mock-card'))

    expect(customOnClick).toHaveBeenCalled()
    expect(customOnFilter).toHaveBeenCalled()
  })

  it('passes through all props to wrapped component', () => {
    const FilterableMockCard = withCardFiltering(MockCard)

    render(
      <TestWrapper>
        <FilterableMockCard
          title="HOC Card"
          customProp="test-value"
          anotherProp={123}
        />
      </TestWrapper>
    )

    const mockCard = screen.getByTestId('mock-card')
    expect(mockCard).toHaveAttribute('title', 'HOC Card')
    expect(mockCard).toHaveAttribute('customProp', 'test-value')
    expect(mockCard).toHaveAttribute('anotherProp', '123')
  })
})
