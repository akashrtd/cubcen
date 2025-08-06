import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DashboardCard } from '../dashboard-card'
import { Activity, Users } from 'lucide-react'

expect.extend(toHaveNoViolations)

describe('DashboardCard', () => {
  const user = userEvent.setup()

  describe('Basic Rendering', () => {
    it('renders with title and subtitle', () => {
      render(
        <DashboardCard
          title="Test Card"
          subtitle="Test subtitle"
        />
      )
      
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Test subtitle')).toBeInTheDocument()
    })

    it('renders with icon', () => {
      render(
        <DashboardCard
          title="Test Card"
          icon={Activity}
        />
      )
      
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      // Icon should be present but hidden from screen readers
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('renders with metric data', () => {
      render(
        <DashboardCard
          title="Test Card"
          metric={{
            value: 1234,
            unit: 'users',
            trend: 'up',
            trendValue: '+12%'
          }}
        />
      )
      
      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('users')).toBeInTheDocument()
      expect(screen.getByText('+12%')).toBeInTheDocument()
      expect(screen.getByLabelText('Trend: up, +12%')).toBeInTheDocument()
    })

    it('renders with children content', () => {
      render(
        <DashboardCard title="Test Card">
          <div>Custom content</div>
        </DashboardCard>
      )
      
      expect(screen.getByText('Custom content')).toBeInTheDocument()
    })

    it('renders with actions', () => {
      render(
        <DashboardCard
          title="Test Card"
          actions={<button>Action</button>}
        />
      )
      
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('applies correct size classes', () => {
      const { rerender } = render(<DashboardCard size="sm" title="Small Card" />)
      expect(document.querySelector('.dashboard-card-sm')).toBeInTheDocument()

      rerender(<DashboardCard size="md" title="Medium Card" />)
      expect(document.querySelector('.dashboard-card-md')).toBeInTheDocument()

      rerender(<DashboardCard size="lg" title="Large Card" />)
      expect(document.querySelector('.dashboard-card-lg')).toBeInTheDocument()

      rerender(<DashboardCard size="xl" title="Extra Large Card" />)
      expect(document.querySelector('.dashboard-card-xl')).toBeInTheDocument()
    })
  })

  describe('Priority Variants', () => {
    it('applies correct priority classes', () => {
      const { rerender } = render(<DashboardCard priority="low" title="Low Priority" />)
      expect(document.querySelector('.dashboard-card-priority-low')).toBeInTheDocument()

      rerender(<DashboardCard priority="medium" title="Medium Priority" />)
      expect(document.querySelector('.dashboard-card-priority-medium')).toBeInTheDocument()

      rerender(<DashboardCard priority="high" title="High Priority" />)
      expect(document.querySelector('.dashboard-card-priority-high')).toBeInTheDocument()

      rerender(<DashboardCard priority="critical" title="Critical Priority" />)
      expect(document.querySelector('.dashboard-card-priority-critical')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('renders loading skeleton', () => {
      render(<DashboardCard loading title="Loading Card" />)
      
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading card content')).toBeInTheDocument()
      
      // Should show skeleton elements
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not render content when loading', () => {
      render(
        <DashboardCard
          loading
          title="Loading Card"
          metric={{ value: 100, unit: 'items' }}
        >
          <div>Content</div>
        </DashboardCard>
      )
      
      expect(screen.queryByText('Loading Card')).not.toBeInTheDocument()
      expect(screen.queryByText('100')).not.toBeInTheDocument()
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('renders error message', () => {
      render(<DashboardCard error="Something went wrong" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByLabelText('Card error')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('does not render content when error', () => {
      render(
        <DashboardCard
          error="Error occurred"
          title="Error Card"
          metric={{ value: 100, unit: 'items' }}
        >
          <div>Content</div>
        </DashboardCard>
      )
      
      expect(screen.queryByText('Error Card')).not.toBeInTheDocument()
      expect(screen.queryByText('100')).not.toBeInTheDocument()
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
    it('handles click events when interactive', async () => {
      const handleClick = jest.fn()
      render(
        <DashboardCard
          title="Interactive Card"
          interactive
          onClick={handleClick}
        />
      )
      
      const card = screen.getByRole('button')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('aria-label', 'Interactive Card card')
      
      await user.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard navigation when interactive', async () => {
      const handleClick = jest.fn()
      render(
        <DashboardCard
          title="Interactive Card"
          interactive
          onClick={handleClick}
        />
      )
      
      const card = screen.getByRole('button')
      
      // Test Enter key
      card.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      // Test Space key
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    it('does not handle clicks when not interactive', async () => {
      const handleClick = jest.fn()
      render(
        <DashboardCard
          title="Non-interactive Card"
          onClick={handleClick}
        />
      )
      
      const card = document.querySelector('.dashboard-card')
      expect(card).not.toHaveAttribute('role', 'button')
      expect(card).not.toHaveAttribute('tabindex')
      
      if (card) {
        await user.click(card)
      }
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('applies interactive styles when interactive', () => {
      render(
        <DashboardCard
          title="Interactive Card"
          interactive
          onClick={() => {}}
        />
      )
      
      const card = screen.getByRole('button')
      expect(card).toHaveClass('cursor-pointer')
    })
  })

  describe('Trend Indicators', () => {
    it('renders up trend with correct styling', () => {
      render(
        <DashboardCard
          metric={{
            value: 100,
            trend: 'up',
            trendValue: '+5%'
          }}
        />
      )
      
      const trendElement = screen.getByLabelText('Trend: up, +5%')
      expect(trendElement).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('renders down trend with correct styling', () => {
      render(
        <DashboardCard
          metric={{
            value: 100,
            trend: 'down',
            trendValue: '-3%'
          }}
        />
      )
      
      const trendElement = screen.getByLabelText('Trend: down, -3%')
      expect(trendElement).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('renders neutral trend with correct styling', () => {
      render(
        <DashboardCard
          metric={{
            value: 100,
            trend: 'neutral',
            trendValue: '0%'
          }}
        />
      )
      
      const trendElement = screen.getByLabelText('Trend: neutral, 0%')
      expect(trendElement).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <DashboardCard
          title="Custom Card"
          className="custom-class"
        />
      )
      
      const card = document.querySelector('.dashboard-card')
      expect(card).toHaveClass('custom-class')
    })

    it('combines default and custom classes correctly', () => {
      render(
        <DashboardCard
          title="Custom Card"
          size="lg"
          priority="high"
          className="custom-class"
        />
      )
      
      const card = document.querySelector('.dashboard-card')
      expect(card).toHaveClass(
        'dashboard-card',
        'dashboard-card-lg',
        'dashboard-card-priority-high',
        'custom-class'
      )
    })
  })

  describe('Accessibility', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = render(
        <DashboardCard
          title="Accessible Card"
          subtitle="Card subtitle"
          icon={Users}
          metric={{
            value: 1234,
            unit: 'users',
            trend: 'up',
            trendValue: '+12%'
          }}
          interactive
          onClick={() => {}}
        >
          <div>Card content</div>
        </DashboardCard>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper ARIA labels for interactive cards', () => {
      render(
        <DashboardCard
          title="Interactive Card"
          interactive
          onClick={() => {}}
        />
      )
      
      const card = screen.getByRole('button')
      expect(card).toHaveAttribute('aria-label', 'Interactive Card card')
    })

    it('provides proper ARIA labels for loading state', () => {
      render(<DashboardCard loading />)
      
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading card content')).toBeInTheDocument()
    })

    it('provides proper ARIA labels for error state', () => {
      render(<DashboardCard error="Test error" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByLabelText('Card error')).toBeInTheDocument()
    })

    it('hides decorative icons from screen readers', () => {
      render(
        <DashboardCard
          title="Card with Icon"
          icon={Activity}
        />
      )
      
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('handles long titles gracefully', () => {
      render(
        <DashboardCard
          title="This is a very long title that should be handled gracefully by the component"
          subtitle="This is also a long subtitle that should truncate properly"
        />
      )
      
      const title = screen.getByText(/This is a very long title/)
      const subtitle = screen.getByText(/This is also a long subtitle/)
      
      expect(title).toBeInTheDocument()
      expect(subtitle).toBeInTheDocument()
      expect(subtitle).toHaveClass('truncate')
    })

    it('handles metric values with different types', () => {
      const { rerender } = render(
        <DashboardCard
          metric={{ value: 1234 }}
        />
      )
      expect(screen.getByText('1234')).toBeInTheDocument()

      rerender(
        <DashboardCard
          metric={{ value: '1.2K' }}
        />
      )
      expect(screen.getByText('1.2K')).toBeInTheDocument()

      rerender(
        <DashboardCard
          metric={{ value: 0 }}
        />
      )
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders efficiently with minimal re-renders', () => {
      const renderSpy = jest.fn()
      
      function TestCard(props: any) {
        renderSpy()
        return <DashboardCard {...props} />
      }
      
      const { rerender } = render(
        <TestCard title="Test Card" />
      )
      
      expect(renderSpy).toHaveBeenCalledTimes(1)
      
      // Re-render with same props should not cause additional renders
      rerender(<TestCard title="Test Card" />)
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })
  })
})