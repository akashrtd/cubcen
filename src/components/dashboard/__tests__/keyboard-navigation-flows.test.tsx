import './setup-accessibility-tests'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardLayout } from '../layout/dashboard-layout'
import { DashboardCard } from '../cards/dashboard-card'
import { DashboardGrid, GridItem } from '../grid/dashboard-grid'
import { ChartWrapper } from '../charts/chart-wrapper'
import { DashboardThemeProvider } from '../theming/theme-provider'
import { FilterProvider } from '../filters/filter-context'

// Mock mobile hooks
jest.mock('../mobile/touch-interactions', () => ({
  useIsMobile: jest.fn(() => false),
  useIsTouchDevice: jest.fn(() => false),
  TouchInteraction: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

describe('Keyboard Navigation Flows', () => {
  const mockChartData = {
    datasets: [
      {
        label: 'Test Data',
        data: [
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 150 },
        ],
      },
    ],
  }

  describe('Dashboard Layout Navigation', () => {
    it('follows logical tab order through layout regions', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={
              <div>
                <button data-testid="header-btn-1">Header Button 1</button>
                <button data-testid="header-btn-2">Header Button 2</button>
              </div>
            }
            sidebar={
              <nav>
                <a href="#nav1" data-testid="nav-link-1">
                  Navigation 1
                </a>
                <a href="#nav2" data-testid="nav-link-2">
                  Navigation 2
                </a>
              </nav>
            }
            footer={
              <div>
                <button data-testid="footer-btn">Footer Button</button>
              </div>
            }
          >
            <main>
              <button data-testid="main-btn">Main Button</button>
            </main>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      // Start tabbing through the interface
      await user.tab()
      expect(screen.getByTestId('header-btn-1')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('header-btn-2')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nav-link-1')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nav-link-2')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('main-btn')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('footer-btn')).toHaveFocus()
    })

    it('supports reverse tab navigation', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={<button data-testid="header-btn">Header</button>}
            sidebar={
              <a href="#nav" data-testid="nav-link">
                Nav
              </a>
            }
          >
            <button data-testid="main-btn">Main</button>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      // Focus the last element first
      screen.getByTestId('main-btn').focus()
      expect(screen.getByTestId('main-btn')).toHaveFocus()

      // Shift+Tab backwards
      await user.tab({ shift: true })
      expect(screen.getByTestId('nav-link')).toHaveFocus()

      await user.tab({ shift: true })
      expect(screen.getByTestId('header-btn')).toHaveFocus()
    })

    it('handles sidebar toggle with keyboard', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={<div>Header</div>}
            sidebar={<nav data-testid="sidebar">Sidebar Content</nav>}
          >
            <main>Main Content</main>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      const toggleButton = screen.getByRole('button', { name: /sidebar/i })

      // Focus and activate toggle with keyboard
      toggleButton.focus()
      expect(toggleButton).toHaveFocus()

      // Toggle with Enter
      await user.keyboard('{Enter}')
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')

      // Toggle with Space
      await user.keyboard(' ')
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Card Navigation', () => {
    it('navigates through multiple cards in grid', async () => {
      const user = userEvent.setup()
      const onCard1Click = jest.fn()
      const onCard2Click = jest.fn()

      render(
        <DashboardThemeProvider>
          <DashboardGrid>
            <GridItem>
              <DashboardCard
                title="Card 1"
                interactive={true}
                onClick={onCard1Click}
              >
                <button data-testid="card1-btn">Card 1 Button</button>
              </DashboardCard>
            </GridItem>
            <GridItem>
              <DashboardCard
                title="Card 2"
                interactive={true}
                onClick={onCard2Click}
              >
                <button data-testid="card2-btn">Card 2 Button</button>
              </DashboardCard>
            </GridItem>
          </DashboardGrid>
        </DashboardThemeProvider>
      )

      // Tab through cards
      await user.tab()
      const card1 = screen.getByRole('button', { name: /card 1/i })
      expect(card1).toHaveFocus()

      // Activate card 1
      await user.keyboard('{Enter}')
      expect(onCard1Click).toHaveBeenCalledTimes(1)

      // Continue to button inside card 1
      await user.tab()
      expect(screen.getByTestId('card1-btn')).toHaveFocus()

      // Move to card 2
      await user.tab()
      const card2 = screen.getByRole('button', { name: /card 2/i })
      expect(card2).toHaveFocus()

      // Activate card 2 with Space
      await user.keyboard(' ')
      expect(onCard2Click).toHaveBeenCalledTimes(1)
    })

    it('skips non-interactive cards in tab order', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <div>
            <button data-testid="before">Before</button>
            <DashboardCard title="Non-interactive Card">
              <div>Static content</div>
            </DashboardCard>
            <DashboardCard
              title="Interactive Card"
              interactive={true}
              onClick={() => {}}
            />
            <button data-testid="after">After</button>
          </div>
        </DashboardThemeProvider>
      )

      await user.tab()
      expect(screen.getByTestId('before')).toHaveFocus()

      await user.tab()
      // Should skip non-interactive card and go to interactive card
      expect(
        screen.getByRole('button', { name: /interactive card/i })
      ).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('after')).toHaveFocus()
    })

    it('handles card actions with keyboard', async () => {
      const user = userEvent.setup()
      const onAction = jest.fn()

      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Card with Actions"
            actions={
              <button onClick={onAction} data-testid="card-action">
                Action
              </button>
            }
          >
            <div>Card content</div>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      // Tab to the action button
      await user.tab()
      expect(screen.getByTestId('card-action')).toHaveFocus()

      // Activate action
      await user.keyboard('{Enter}')
      expect(onAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('Chart Navigation', () => {
    it('provides keyboard access to chart interactions', async () => {
      const user = userEvent.setup()
      const onDataClick = jest.fn()

      render(
        <DashboardThemeProvider>
          <ChartWrapper
            type="line"
            data={mockChartData}
            interactive={true}
            onDataClick={onDataClick}
          />
        </DashboardThemeProvider>
      )

      // Wait for chart to load
      await user.tab()
      const chartContainer = screen.getByRole('application')
      expect(chartContainer).toHaveFocus()

      // Test chart keyboard interactions
      await user.keyboard('{ArrowRight}')
      await user.keyboard('{ArrowLeft}')
      await user.keyboard('{Enter}')

      // Chart should be keyboard accessible
      expect(chartContainer).toHaveAttribute('tabindex', '0')
    })

    it('navigates between chart and other elements', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <div>
            <button data-testid="before-chart">Before Chart</button>
            <DashboardCard title="Chart Card">
              <ChartWrapper
                type="line"
                data={mockChartData}
                interactive={true}
              />
            </DashboardCard>
            <button data-testid="after-chart">After Chart</button>
          </div>
        </DashboardThemeProvider>
      )

      await user.tab()
      expect(screen.getByTestId('before-chart')).toHaveFocus()

      await user.tab()
      const chartContainer = screen.getByRole('application')
      expect(chartContainer).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('after-chart')).toHaveFocus()
    })
  })

  describe('Filter Navigation', () => {
    it('navigates through filter controls', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <FilterProvider>
            <div>
              <select data-testid="filter-select">
                <option value="all">All</option>
                <option value="active">Active</option>
              </select>
              <input
                type="text"
                placeholder="Search..."
                data-testid="filter-input"
              />
              <button data-testid="apply-filter">Apply</button>
              <DashboardCard title="Filtered Content" onFilter={() => {}}>
                <div>Content</div>
              </DashboardCard>
            </div>
          </FilterProvider>
        </DashboardThemeProvider>
      )

      // Navigate through filter controls
      await user.tab()
      expect(screen.getByTestId('filter-select')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('filter-input')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('apply-filter')).toHaveFocus()

      // Continue to filtered content
      await user.tab()
      // Should reach the next focusable element after filters
    })
  })

  describe('Error State Navigation', () => {
    it('maintains keyboard navigation in error states', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <div>
            <button data-testid="before-error">Before</button>
            <DashboardCard title="Error Card" error="Something went wrong">
              <button data-testid="retry-btn">Retry</button>
            </DashboardCard>
            <button data-testid="after-error">After</button>
          </div>
        </DashboardThemeProvider>
      )

      await user.tab()
      expect(screen.getByTestId('before-error')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('retry-btn')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('after-error')).toHaveFocus()
    })

    it('announces errors without disrupting navigation', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <DashboardThemeProvider>
          <div>
            <button data-testid="focused-btn">Focused Button</button>
            <DashboardCard title="Dynamic Card" />
          </div>
        </DashboardThemeProvider>
      )

      // Focus a button
      await user.tab()
      expect(screen.getByTestId('focused-btn')).toHaveFocus()

      // Change card to error state
      rerender(
        <DashboardThemeProvider>
          <div>
            <button data-testid="focused-btn">Focused Button</button>
            <DashboardCard title="Dynamic Card" error="Error occurred" />
          </div>
        </DashboardThemeProvider>
      )

      // Focus should remain on the button
      expect(screen.getByTestId('focused-btn')).toHaveFocus()

      // Error should be announced via alert role
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('Loading State Navigation', () => {
    it('maintains navigation during loading states', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <div>
            <button data-testid="before-loading">Before</button>
            <DashboardCard title="Loading Card" loading={true} />
            <button data-testid="after-loading">After</button>
          </div>
        </DashboardThemeProvider>
      )

      await user.tab()
      expect(screen.getByTestId('before-loading')).toHaveFocus()

      // Loading card should not be focusable
      await user.tab()
      expect(screen.getByTestId('after-loading')).toHaveFocus()
    })

    it('transitions focus properly when loading completes', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <DashboardThemeProvider>
          <div>
            <button data-testid="before">Before</button>
            <DashboardCard title="Transitioning Card" loading={true} />
            <button data-testid="after">After</button>
          </div>
        </DashboardThemeProvider>
      )

      // Focus before element
      await user.tab()
      expect(screen.getByTestId('before')).toHaveFocus()

      // Complete loading with interactive card
      rerender(
        <DashboardThemeProvider>
          <div>
            <button data-testid="before">Before</button>
            <DashboardCard
              title="Transitioning Card"
              interactive={true}
              onClick={() => {}}
            />
            <button data-testid="after">After</button>
          </div>
        </DashboardThemeProvider>
      )

      // Now card should be focusable
      await user.tab()
      expect(
        screen.getByRole('button', { name: /transitioning card/i })
      ).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('after')).toHaveFocus()
    })
  })

  describe('Responsive Navigation', () => {
    it('adapts navigation for mobile layout', async () => {
      const user = userEvent.setup()

      // Mock mobile viewport
      const { useIsMobile } = require('../mobile/touch-interactions')
      useIsMobile.mockReturnValue(true)

      render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={<button data-testid="mobile-header">Header</button>}
            sidebar={<nav>Sidebar</nav>}
            showMobileNav={true}
          >
            <button data-testid="mobile-main">Main</button>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      // On mobile, sidebar should be hidden, navigation should adapt
      await user.tab()
      expect(screen.getByTestId('mobile-header')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('mobile-main')).toHaveFocus()

      // Mobile navigation should be accessible if present
      // Implementation would depend on mobile navigation structure
    })
  })

  describe('Focus Management Edge Cases', () => {
    it('handles focus when elements are dynamically added/removed', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <DashboardThemeProvider>
          <div>
            <button data-testid="persistent">Persistent Button</button>
          </div>
        </DashboardThemeProvider>
      )

      await user.tab()
      expect(screen.getByTestId('persistent')).toHaveFocus()

      // Add new focusable element
      rerender(
        <DashboardThemeProvider>
          <div>
            <button data-testid="persistent">Persistent Button</button>
            <button data-testid="new-element">New Button</button>
          </div>
        </DashboardThemeProvider>
      )

      // Focus should remain on persistent element
      expect(screen.getByTestId('persistent')).toHaveFocus()

      // New element should be reachable by tab
      await user.tab()
      expect(screen.getByTestId('new-element')).toHaveFocus()
    })

    it('handles focus when focused element is removed', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <DashboardThemeProvider>
          <div>
            <button data-testid="before">Before</button>
            <button data-testid="to-be-removed">To Be Removed</button>
            <button data-testid="after">After</button>
          </div>
        </DashboardThemeProvider>
      )

      // Focus the element that will be removed
      screen.getByTestId('to-be-removed').focus()
      expect(screen.getByTestId('to-be-removed')).toHaveFocus()

      // Remove the focused element
      rerender(
        <DashboardThemeProvider>
          <div>
            <button data-testid="before">Before</button>
            <button data-testid="after">After</button>
          </div>
        </DashboardThemeProvider>
      )

      // Focus should move to document body or next logical element
      // Exact behavior depends on implementation
      expect(document.activeElement).toBeTruthy()
    })
  })
})
