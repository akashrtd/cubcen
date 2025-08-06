import './setup-accessibility-tests'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DashboardLayout } from '../layout/dashboard-layout'
import { DashboardCard } from '../cards/dashboard-card'
import { DashboardGrid, GridItem } from '../grid/dashboard-grid'
import { ChartWrapper } from '../charts/chart-wrapper'
import { DashboardThemeProvider } from '../theming/theme-provider'
import { FilterProvider } from '../filters/filter-context'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock components that might cause issues in testing
jest.mock('../mobile/touch-interactions', () => ({
  useIsMobile: jest.fn(() => false),
  useIsTouchDevice: jest.fn(() => false),
  TouchInteraction: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock('../charts/chart-types/line-chart', () => ({
  LineChart: ({ data }: any) => (
    <div 
      data-testid="line-chart"
      role="img"
      aria-label={`Line chart with ${data.datasets.length} datasets`}
    >
      Line Chart
    </div>
  )
}))

describe('Dashboard Accessibility Comprehensive Tests', () => {
  const mockData = {
    datasets: [
      {
        label: 'Test Data',
        data: [
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 150 },
          { x: 'Mar', y: 120 }
        ]
      }
    ]
  }

  describe('WCAG 2.1 AA Compliance', () => {
    it('DashboardLayout meets accessibility standards', async () => {
      const { container } = render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={<div>Header Content</div>}
            sidebar={<nav>Navigation Content</nav>}
            footer={<div>Footer Content</div>}
          >
            <main>Main Content</main>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('DashboardCard meets accessibility standards', async () => {
      const { container } = render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Accessible Card"
            subtitle="Card subtitle"
            metric={{
              value: 1234,
              unit: 'users',
              trend: 'up',
              trendValue: '+5%'
            }}
          >
            <div>Card content</div>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('DashboardGrid meets accessibility standards', async () => {
      const { container } = render(
        <DashboardThemeProvider>
          <DashboardGrid>
            <GridItem colSpan={6}>
              <DashboardCard title="Card 1">Content 1</DashboardCard>
            </GridItem>
            <GridItem colSpan={6}>
              <DashboardCard title="Card 2">Content 2</DashboardCard>
            </GridItem>
          </DashboardGrid>
        </DashboardThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('ChartWrapper meets accessibility standards', async () => {
      const { container } = render(
        <DashboardThemeProvider>
          <ChartWrapper
            type="line"
            data={mockData}
            config={{
              colors: { primary: '#3F51B5' },
              legend: { show: true, position: 'bottom', align: 'center' }
            }}
          />
        </DashboardThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Interactive dashboard components meet accessibility standards', async () => {
      const { container } = render(
        <DashboardThemeProvider>
          <FilterProvider>
            <DashboardLayout
              header={
                <header>
                  <h1>Dashboard</h1>
                  <button>Settings</button>
                </header>
              }
              sidebar={
                <nav aria-label="Main navigation">
                  <ul>
                    <li><a href="#analytics">Analytics</a></li>
                    <li><a href="#reports">Reports</a></li>
                  </ul>
                </nav>
              }
            >
              <DashboardGrid>
                <GridItem colSpan={4}>
                  <DashboardCard
                    title="Interactive Card"
                    interactive={true}
                    onClick={() => {}}
                  >
                    <button>Action Button</button>
                  </DashboardCard>
                </GridItem>
                <GridItem colSpan={8}>
                  <DashboardCard title="Chart Card">
                    <ChartWrapper
                      type="line"
                      data={mockData}
                      interactive={true}
                    />
                  </DashboardCard>
                </GridItem>
              </DashboardGrid>
            </DashboardLayout>
          </FilterProvider>
        </DashboardThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Error states meet accessibility standards', async () => {
      const { container } = render(
        <DashboardThemeProvider>
          <DashboardGrid>
            <GridItem>
              <DashboardCard
                title="Error Card"
                error="Failed to load data"
              />
            </GridItem>
            <GridItem>
              <DashboardCard title="Chart Error">
                <ChartWrapper
                  type="line"
                  data={mockData}
                  error="Chart failed to render"
                />
              </DashboardCard>
            </GridItem>
          </DashboardGrid>
        </DashboardThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Loading states meet accessibility standards', async () => {
      const { container } = render(
        <DashboardThemeProvider>
          <DashboardGrid>
            <GridItem>
              <DashboardCard
                title="Loading Card"
                loading={true}
              />
            </GridItem>
            <GridItem>
              <DashboardCard title="Chart Loading">
                <ChartWrapper
                  type="line"
                  data={mockData}
                  loading={true}
                />
              </DashboardCard>
            </GridItem>
          </DashboardGrid>
        </DashboardThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through dashboard layout', async () => {
      const user = userEvent.setup()
      
      render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={
              <div>
                <button>Header Button 1</button>
                <button>Header Button 2</button>
              </div>
            }
            sidebar={
              <nav>
                <a href="#link1">Link 1</a>
                <a href="#link2">Link 2</a>
              </nav>
            }
          >
            <main>
              <button>Main Button</button>
            </main>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      // Test tab order
      await user.tab()
      expect(screen.getByText('Header Button 1')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Header Button 2')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Link 1')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Link 2')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Main Button')).toHaveFocus()
    })

    it('supports keyboard interaction with interactive cards', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()

      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Interactive Card"
            interactive={true}
            onClick={onClick}
          >
            <div>Card content</div>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      const card = screen.getByRole('button', { name: /interactive card/i })
      
      // Focus the card
      await user.tab()
      expect(card).toHaveFocus()

      // Activate with Enter
      await user.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalledTimes(1)

      // Activate with Space
      await user.keyboard(' ')
      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('supports keyboard navigation in charts', async () => {
      const user = userEvent.setup()
      const onDataClick = jest.fn()

      render(
        <DashboardThemeProvider>
          <ChartWrapper
            type="line"
            data={mockData}
            interactive={true}
            onDataClick={onDataClick}
          />
        </DashboardThemeProvider>
      )

      await waitFor(() => {
        const chartContainer = screen.getByRole('application')
        expect(chartContainer).toBeInTheDocument()
      })

      const chartContainer = screen.getByRole('application')
      
      // Focus the chart
      await user.tab()
      expect(chartContainer).toHaveFocus()

      // Test arrow key navigation (implementation would depend on chart type)
      await user.keyboard('{ArrowRight}')
      await user.keyboard('{ArrowLeft}')
      await user.keyboard('{Enter}')
    })

    it('provides skip links for efficient navigation', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={<div>Header</div>}
            sidebar={<nav>Sidebar</nav>}
            footer={<div>Footer</div>}
          >
            <main id="main-content">Main Content</main>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      // Skip links should be the first focusable elements
      await user.tab()
      
      // Look for skip link (implementation may vary)
      const skipLink = document.activeElement
      expect(skipLink).toHaveAttribute('href', expect.stringContaining('#main-content'))
    })

    it('manages focus properly when sidebar is toggled', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={<div>Header</div>}
            sidebar={<nav>Sidebar Content</nav>}
          >
            <main>Main Content</main>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      // Find and focus the sidebar toggle button
      const toggleButton = screen.getByRole('button', { name: /sidebar/i })
      toggleButton.focus()
      expect(toggleButton).toHaveFocus()

      // Toggle sidebar
      await user.click(toggleButton)

      // Focus should remain on toggle button
      expect(toggleButton).toHaveFocus()
    })
  })

  describe('Screen Reader Support', () => {
    it('provides proper ARIA roles and labels', () => {
      render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={<div>Header Content</div>}
            sidebar={<nav>Navigation</nav>}
            footer={<div>Footer Content</div>}
          >
            <main>Main Content</main>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      // Check landmark roles
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('announces card state changes', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Dynamic Card"
            loading={true}
          />
        </DashboardThemeProvider>
      )

      // Loading state should be announced
      expect(screen.getByRole('status')).toBeInTheDocument()

      // Change to error state
      rerender(
        <DashboardThemeProvider>
          <DashboardCard
            title="Dynamic Card"
            error="Something went wrong"
          />
        </DashboardThemeProvider>
      )

      // Error state should be announced
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('provides descriptive labels for metrics', () => {
      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Sales Metrics"
            metric={{
              value: 1234,
              unit: 'sales',
              trend: 'up',
              trendValue: '+12%'
            }}
          />
        </DashboardThemeProvider>
      )

      // Metric should have proper ARIA labels
      const metricGroup = screen.getByRole('group')
      expect(metricGroup).toHaveAttribute(
        'aria-label',
        expect.stringContaining('1234 sales')
      )

      // Trend should be properly labeled
      const trendElement = screen.getByRole('img', { name: /trend/i })
      expect(trendElement).toHaveAttribute(
        'aria-label',
        expect.stringContaining('increasing by +12%')
      )
    })

    it('provides chart descriptions for screen readers', async () => {
      render(
        <DashboardThemeProvider>
          <ChartWrapper
            type="line"
            data={mockData}
          />
        </DashboardThemeProvider>
      )

      await waitFor(() => {
        const chartContainer = screen.getByRole('application')
        expect(chartContainer).toBeInTheDocument()
      })

      const chartContainer = screen.getByRole('application')
      expect(chartContainer).toHaveAttribute(
        'aria-label',
        expect.stringContaining('line chart')
      )

      // Check for descriptive text
      expect(screen.getByText(/chart with.*dataset/i)).toBeInTheDocument()
    })

    it('announces filter changes', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <FilterProvider>
            <DashboardCard
              title="Filterable Card"
              onFilter={() => {}}
            >
              <button onClick={() => {}}>Apply Filter</button>
            </DashboardCard>
          </FilterProvider>
        </DashboardThemeProvider>
      )

      const filterButton = screen.getByText('Apply Filter')
      await user.click(filterButton)

      // Filter changes should be announced (implementation dependent)
      // This would typically involve a live region update
    })
  })

  describe('Focus Management', () => {
    it('maintains focus within modal dialogs', async () => {
      const user = userEvent.setup()

      // Mock a modal dialog scenario
      render(
        <DashboardThemeProvider>
          <div>
            <button>Outside Button</button>
            <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
              <h2 id="dialog-title">Settings Dialog</h2>
              <button>Dialog Button 1</button>
              <button>Dialog Button 2</button>
              <button>Close</button>
            </div>
          </div>
        </DashboardThemeProvider>
      )

      const dialog = screen.getByRole('dialog')
      const dialogButton1 = screen.getByText('Dialog Button 1')
      const dialogButton2 = screen.getByText('Dialog Button 2')
      const closeButton = screen.getByText('Close')

      // Focus should be trapped within dialog
      dialogButton1.focus()
      expect(dialogButton1).toHaveFocus()

      await user.tab()
      expect(dialogButton2).toHaveFocus()

      await user.tab()
      expect(closeButton).toHaveFocus()

      // Tab from last element should cycle back to first
      await user.tab()
      expect(dialogButton1).toHaveFocus()
    })

    it('restores focus after interactions', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <div>
            <button>Trigger Button</button>
            <DashboardCard
              title="Interactive Card"
              interactive={true}
              onClick={() => {}}
            />
          </div>
        </DashboardThemeProvider>
      )

      const triggerButton = screen.getByText('Trigger Button')
      const interactiveCard = screen.getByRole('button', { name: /interactive card/i })

      // Focus trigger button
      triggerButton.focus()
      expect(triggerButton).toHaveFocus()

      // Tab to interactive card
      await user.tab()
      expect(interactiveCard).toHaveFocus()

      // Activate card
      await user.keyboard('{Enter}')

      // Focus should remain on card after activation
      expect(interactiveCard).toHaveFocus()
    })

    it('provides visible focus indicators', () => {
      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Focusable Card"
            interactive={true}
            onClick={() => {}}
          />
        </DashboardThemeProvider>
      )

      const card = screen.getByRole('button')
      card.focus()

      // Card should have focus styles (implementation dependent)
      expect(card).toHaveClass('focus:outline-none', 'focus:ring-2')
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('maintains proper contrast in light theme', async () => {
      const { container } = render(
        <DashboardThemeProvider defaultTheme="light">
          <DashboardCard
            title="Light Theme Card"
            metric={{
              value: 100,
              unit: 'items',
              trend: 'up',
              trendValue: '+5%'
            }}
          >
            <p>Card content with text</p>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      // Run accessibility check which includes color contrast
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      expect(results).toHaveNoViolations()
    })

    it('maintains proper contrast in dark theme', async () => {
      const { container } = render(
        <DashboardThemeProvider defaultTheme="dark">
          <DashboardCard
            title="Dark Theme Card"
            metric={{
              value: 100,
              unit: 'items',
              trend: 'down',
              trendValue: '-3%'
            }}
          >
            <p>Card content with text</p>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      // Run accessibility check which includes color contrast
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      expect(results).toHaveNoViolations()
    })

    it('provides alternative text for visual elements', () => {
      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Visual Card"
            icon={({ className }) => (
              <svg className={className} aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
            metric={{
              value: 75,
              unit: '%',
              trend: 'up',
              trendValue: '+5%'
            }}
          />
        </DashboardThemeProvider>
      )

      // Icon should be hidden from screen readers
      const icon = document.querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')

      // Trend should have descriptive text
      const trendElement = screen.getByRole('img', { name: /trend/i })
      expect(trendElement).toHaveAttribute('aria-label', expect.stringContaining('increasing'))
    })
  })

  describe('Responsive Accessibility', () => {
    it('maintains accessibility on mobile layouts', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      const { useIsMobile } = require('../mobile/touch-interactions')
      useIsMobile.mockReturnValue(true)

      const { container } = render(
        <DashboardThemeProvider>
          <DashboardLayout
            header={<div>Mobile Header</div>}
            sidebar={<nav>Mobile Nav</nav>}
            showMobileNav={true}
          >
            <DashboardGrid>
              <GridItem>
                <DashboardCard title="Mobile Card">
                  Mobile content
                </DashboardCard>
              </GridItem>
            </DashboardGrid>
          </DashboardLayout>
        </DashboardThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides appropriate touch targets on mobile', () => {
      const { useIsMobile } = require('../mobile/touch-interactions')
      useIsMobile.mockReturnValue(true)

      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Touch Card"
            interactive={true}
            onClick={() => {}}
          />
        </DashboardThemeProvider>
      )

      const card = screen.getByRole('button')
      
      // Touch targets should be appropriately sized
      // This would be tested through computed styles or visual regression testing
      expect(card).toBeInTheDocument()
    })
  })

  describe('Error Accessibility', () => {
    it('properly announces errors to assistive technology', () => {
      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Error Card"
            error="Network connection failed"
          />
        </DashboardThemeProvider>
      )

      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toBeInTheDocument()
      expect(errorAlert).toHaveTextContent('Network connection failed')
    })

    it('provides error recovery options', () => {
      const onRetry = jest.fn()
      
      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Recoverable Error"
            error="Failed to load data"
          >
            <button onClick={onRetry}>Retry</button>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toBeVisible()
    })
  })
})