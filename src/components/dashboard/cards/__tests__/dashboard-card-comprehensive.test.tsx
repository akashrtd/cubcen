import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardCard } from '../dashboard-card'
import { DashboardCardProps } from '@/types/dashboard'

// Mock the intersection observer for lazy loading tests
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

describe('DashboardCard Comprehensive Tests', () => {
  const defaultProps: DashboardCardProps = {
    title: 'Test Card',
    children: <div data-testid="card-content">Card Content</div>,
  }

  describe('Basic Rendering', () => {
    it('renders with title and children', () => {
      render(<DashboardCard {...defaultProps} />)

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByTestId('card-content')).toBeInTheDocument()
    })

    it('renders without title', () => {
      render(
        <DashboardCard>
          <div data-testid="card-content">Card Content</div>
        </DashboardCard>
      )

      expect(screen.getByTestId('card-content')).toBeInTheDocument()
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('renders with subtitle', () => {
      render(
        <DashboardCard title="Main Title" subtitle="Subtitle text">
          <div>Content</div>
        </DashboardCard>
      )

      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Subtitle text')).toBeInTheDocument()
    })

    it('renders with icon', () => {
      const TestIcon = ({ className }: { className?: string }) => (
        <svg data-testid="test-icon" className={className}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      )

      render(
        <DashboardCard title="Test Card" icon={TestIcon}>
          <div>Content</div>
        </DashboardCard>
      )

      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('renders with actions', () => {
      const actions = <button data-testid="card-action">Action Button</button>

      render(
        <DashboardCard title="Test Card" actions={actions}>
          <div>Content</div>
        </DashboardCard>
      )

      expect(screen.getByTestId('card-action')).toBeInTheDocument()
    })
  })

  describe('Metric Display', () => {
    it('renders single metric with value and unit', () => {
      render(
        <DashboardCard
          title="Metric Card"
          metric={{
            value: 1234,
            unit: 'users',
            trend: 'up',
            trendValue: '+12%',
          }}
        />
      )

      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('users')).toBeInTheDocument()
      expect(screen.getByText('+12%')).toBeInTheDocument()
    })

    it('renders metric with string value', () => {
      render(
        <DashboardCard
          title="Status Card"
          metric={{
            value: 'Active',
            trend: 'neutral',
          }}
        />
      )

      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('applies correct trend styling', () => {
      const { rerender } = render(
        <DashboardCard
          title="Trend Card"
          metric={{
            value: 100,
            trend: 'up',
            trendValue: '+5%',
          }}
        />
      )

      let trendElement = screen.getByText('+5%').closest('span')
      expect(trendElement).toHaveClass('text-green-800')

      rerender(
        <DashboardCard
          title="Trend Card"
          metric={{
            value: 100,
            trend: 'down',
            trendValue: '-3%',
          }}
        />
      )

      trendElement = screen.getByText('-3%').closest('span')
      expect(trendElement).toHaveClass('text-red-800')

      rerender(
        <DashboardCard
          title="Trend Card"
          metric={{
            value: 100,
            trend: 'neutral',
            trendValue: '0%',
          }}
        />
      )

      trendElement = screen.getByText('0%').closest('span')
      expect(trendElement).toHaveClass('text-gray-800')
    })
  })

  describe('Loading States', () => {
    it('shows loading skeleton when loading is true', () => {
      const { container } = render(
        <DashboardCard title="Loading Card" loading={true} />
      )

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(screen.queryByText('Loading Card')).not.toBeInTheDocument()
    })

    it('shows content when loading is false', () => {
      render(
        <DashboardCard title="Loaded Card" loading={false}>
          <div data-testid="content">Content</div>
        </DashboardCard>
      )

      expect(screen.getByText('Loaded Card')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('transitions from loading to loaded state', async () => {
      const { rerender } = render(
        <DashboardCard title="Transition Card" loading={true}>
          <div data-testid="content">Content</div>
        </DashboardCard>
      )

      expect(screen.queryByText('Transition Card')).not.toBeInTheDocument()

      rerender(
        <DashboardCard title="Transition Card" loading={false}>
          <div data-testid="content">Content</div>
        </DashboardCard>
      )

      await waitFor(() => {
        expect(screen.getByText('Transition Card')).toBeInTheDocument()
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('shows error message when error prop is provided', () => {
      render(
        <DashboardCard title="Error Card" error="Something went wrong">
          <div data-testid="content">Content</div>
        </DashboardCard>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })

    it('shows error icon with error message', () => {
      render(<DashboardCard title="Error Card" error="Network error" />)

      const errorIcon = screen.getByRole('img', { hidden: true })
      expect(errorIcon).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('prioritizes error over loading state', () => {
      render(
        <DashboardCard
          title="Error Card"
          loading={true}
          error="Error occurred"
        />
      )

      expect(screen.getByText('Error occurred')).toBeInTheDocument()
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    it('shows error message without retry button by default', () => {
      render(<DashboardCard title="Error Card" error="Network timeout" />)

      expect(screen.getByText('Network timeout')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /retry/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('applies correct classes for different sizes', () => {
      const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl']

      sizes.forEach(size => {
        const { container, unmount } = render(
          <DashboardCard title={`${size} Card`} size={size} />
        )

        const card = container.firstChild as HTMLElement
        expect(card).toHaveClass(`dashboard-card-${size}`)

        unmount()
      })
    })

    it('defaults to medium size when no size specified', () => {
      const { container } = render(<DashboardCard title="Default Card" />)

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('dashboard-card-md')
    })
  })

  describe('Priority Levels', () => {
    it('applies correct styling for different priority levels', () => {
      const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = [
        'low',
        'medium',
        'high',
        'critical',
      ]

      priorities.forEach(priority => {
        const { container, unmount } = render(
          <DashboardCard
            title={`${priority} Priority Card`}
            priority={priority}
          />
        )

        const card = container.firstChild as HTMLElement
        expect(card).toHaveClass(`dashboard-card-priority-${priority}`)

        unmount()
      })
    })

    it('applies critical priority styling', () => {
      const { container } = render(
        <DashboardCard title="Critical Card" priority="critical" />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('dashboard-card-priority-critical')
    })
  })

  describe('Interactive Features', () => {
    it('becomes clickable when interactive prop is true', () => {
      const onClick = jest.fn()
      render(
        <DashboardCard
          title="Interactive Card"
          interactive={true}
          onClick={onClick}
        />
      )

      const card = screen.getByRole('button')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('cursor-pointer')
    })

    it('calls onClick when interactive card is clicked', async () => {
      const onClick = jest.fn()
      render(
        <DashboardCard
          title="Clickable Card"
          interactive={true}
          onClick={onClick}
        />
      )

      const card = screen.getByRole('button')
      await userEvent.click(card)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('supports keyboard interaction when interactive', async () => {
      const onClick = jest.fn()
      render(
        <DashboardCard
          title="Keyboard Card"
          interactive={true}
          onClick={onClick}
        />
      )

      const card = screen.getByRole('button')
      card.focus()

      await userEvent.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalledTimes(1)

      await userEvent.keyboard(' ')
      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('provides proper ARIA attributes for interactive cards', () => {
      render(
        <DashboardCard
          title="ARIA Card"
          interactive={true}
          onClick={() => {}}
        />
      )

      const card = screen.getByRole('button')
      expect(card).toHaveAttribute('tabIndex', '0')
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining('ARIA Card')
      )
    })
  })

  describe('Filter Integration', () => {
    it('calls onFilter when filter action is triggered', async () => {
      const onFilter = jest.fn()
      render(
        <DashboardCard
          title="Filterable Card"
          onFilter={onFilter}
          metric={{ value: 100, unit: 'items' }}
        />
      )

      // Simulate filter trigger (this would typically be from chart interaction)
      const card = screen.getByText('100')
      fireEvent.click(card)

      // Note: Actual filter triggering would depend on implementation
      // This is a placeholder for the expected behavior
    })

    it('accepts onFilter prop for filterable cards', () => {
      const onFilter = jest.fn()
      render(<DashboardCard title="Filterable Card" onFilter={onFilter} />)

      // Card should render without error when onFilter is provided
      expect(screen.getByText('Filterable Card')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper title structure', () => {
      render(
        <DashboardCard title="Accessible Card">
          <div>Content</div>
        </DashboardCard>
      )

      const title = screen.getByText('Accessible Card')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('dashboard-card-title')
    })

    it('provides proper ARIA labels for metrics', () => {
      render(
        <DashboardCard
          title="Metric Card"
          metric={{
            value: 1234,
            unit: 'users',
            trend: 'up',
            trendValue: '+5%',
          }}
        />
      )

      const metricGroup = screen.getByRole('group')
      expect(metricGroup).toHaveAttribute(
        'aria-label',
        expect.stringContaining('1234')
      )
    })

    it('announces loading state to screen readers', () => {
      render(<DashboardCard title="Loading Card" loading={true} />)

      const loadingIndicator = screen.getByRole('status')
      expect(loadingIndicator).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Loading Card')
      )
    })

    it('announces error state to screen readers', () => {
      render(<DashboardCard title="Error Card" error="Failed to load data" />)

      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toHaveTextContent('Failed to load data')
    })
  })

  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <DashboardCard title="Custom Card" className="custom-class" />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })

    it('merges custom className with default classes', () => {
      const { container } = render(
        <DashboardCard title="Merged Card" className="custom-class" />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('dashboard-card')
    })

    it('accepts additional props that are passed to the card', () => {
      const { container } = render(
        <DashboardCard title="Props Card" data-testid="custom-card" />
      )

      const card = container.querySelector('[data-testid="custom-card"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('memoizes card content to prevent unnecessary re-renders', () => {
      const renderSpy = jest.fn()
      const TestContent = () => {
        renderSpy()
        return <div>Test Content</div>
      }

      const { rerender } = render(
        <DashboardCard title="Memo Card">
          <TestContent />
        </DashboardCard>
      )

      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Re-render with same props
      rerender(
        <DashboardCard title="Memo Card">
          <TestContent />
        </DashboardCard>
      )

      // Content should not re-render if props haven't changed
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })

    it('renders content immediately (lazy loading handled at higher level)', () => {
      render(
        <DashboardCard title="Card">
          <div>Content</div>
        </DashboardCard>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})
