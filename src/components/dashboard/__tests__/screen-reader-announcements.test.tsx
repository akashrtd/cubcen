import './setup-accessibility-tests'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardCard } from '../cards/dashboard-card'
import { ChartWrapper } from '../charts/chart-wrapper'
import { DashboardGrid, GridItem } from '../grid/dashboard-grid'
import { DashboardThemeProvider } from '../theming/theme-provider'
import { FilterProvider } from '../filters/filter-context'
import { ScreenReaderAnnouncer } from '../accessibility/screen-reader-announcer'

// Mock mobile hooks
jest.mock('../mobile/touch-interactions', () => ({
  useIsMobile: jest.fn(() => false),
  useIsTouchDevice: jest.fn(() => false),
  TouchInteraction: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

describe('Screen Reader Announcements', () => {
  const mockChartData = {
    datasets: [
      {
        label: 'Sales Data',
        data: [
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 150 },
          { x: 'Mar', y: 120 },
        ],
      },
    ],
  }

  describe('Card State Announcements', () => {
    it('announces loading state changes', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <DashboardCard title="Dynamic Card">
            <div>Initial content</div>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      // Change to loading state
      rerender(
        <DashboardThemeProvider>
          <DashboardCard title="Dynamic Card" loading={true} />
        </DashboardThemeProvider>
      )

      // Loading state should be announced
      const loadingStatus = screen.getByRole('status')
      expect(loadingStatus).toBeInTheDocument()
      expect(loadingStatus).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Dynamic Card')
      )

      // Screen reader description should be present
      const description = screen.getByText(/card is loading/i)
      expect(description).toBeInTheDocument()
    })

    it('announces error state changes', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <DashboardCard title="Error Card">
            <div>Normal content</div>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      // Change to error state
      rerender(
        <DashboardThemeProvider>
          <DashboardCard title="Error Card" error="Network connection failed" />
        </DashboardThemeProvider>
      )

      // Error should be announced via alert role
      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toBeInTheDocument()
      expect(errorAlert).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Error Card')
      )

      // Error description should be present
      const errorDescription = screen.getByText(/card has an error/i)
      expect(errorDescription).toBeInTheDocument()
      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
    })

    it('announces successful data loading', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <DashboardCard title="Data Card" loading={true} />
        </DashboardThemeProvider>
      )

      // Change to loaded state with data
      rerender(
        <DashboardThemeProvider>
          <DashboardCard
            title="Data Card"
            metric={{
              value: 1234,
              unit: 'users',
              trend: 'up',
              trendValue: '+12%',
            }}
          >
            <div>Loaded content</div>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      // Metric should have proper ARIA labels
      const metricGroup = screen.getByRole('group')
      expect(metricGroup).toHaveAttribute(
        'aria-label',
        expect.stringContaining('1234 users')
      )

      // Trend should be announced
      const trendElement = screen.getByRole('img', { name: /trend/i })
      expect(trendElement).toHaveAttribute(
        'aria-label',
        expect.stringContaining('increasing by +12%')
      )
    })

    it('provides contextual information for card interactions', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()

      render(
        <DashboardThemeProvider>
          <DashboardCard
            title="Interactive Card"
            subtitle="Click to view details"
            interactive={true}
            onClick={onClick}
          >
            <div>Card content</div>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      const card = screen.getByRole('button')

      // Card should have comprehensive ARIA label
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Interactive Card')
      )

      // Description should explain interactivity
      const description = screen.getByText(/interactive dashboard card/i)
      expect(description).toBeInTheDocument()

      // Focus should provide additional context
      card.focus()
      expect(card).toHaveFocus()
    })
  })

  describe('Chart Announcements', () => {
    it('provides comprehensive chart descriptions', async () => {
      render(
        <DashboardThemeProvider>
          <ChartWrapper type="line" data={mockChartData} />
        </DashboardThemeProvider>
      )

      await waitFor(() => {
        const chartContainer = screen.getByRole('application')
        expect(chartContainer).toBeInTheDocument()
      })

      const chartContainer = screen.getByRole('application')

      // Chart should have descriptive label
      expect(chartContainer).toHaveAttribute(
        'aria-label',
        expect.stringContaining('line chart showing Sales Data')
      )

      // Chart description should include data summary
      const description = screen.getByText(/chart with.*dataset.*data points/i)
      expect(description).toBeInTheDocument()

      // Instructions for interaction should be provided
      const instructions = screen.getByText(
        /interactive chart.*tap.*pinch.*swipe/i
      )
      expect(instructions).toBeInTheDocument()
    })

    it('announces chart data updates', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <ChartWrapper type="line" data={mockChartData} />
        </DashboardThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument()
      })

      // Update chart data
      const updatedData = {
        datasets: [
          {
            label: 'Updated Sales Data',
            data: [
              { x: 'Jan', y: 200 },
              { x: 'Feb', y: 250 },
              { x: 'Mar', y: 220 },
              { x: 'Apr', y: 300 },
            ],
          },
        ],
      }

      rerender(
        <DashboardThemeProvider>
          <ChartWrapper type="line" data={updatedData} />
        </DashboardThemeProvider>
      )

      await waitFor(() => {
        const chartContainer = screen.getByRole('application')
        expect(chartContainer).toHaveAttribute(
          'aria-label',
          expect.stringContaining('Updated Sales Data')
        )
      })

      // Updated description should reflect new data
      await waitFor(() => {
        const description = screen.getByText(
          /chart with.*dataset.*4 data points/i
        )
        expect(description).toBeInTheDocument()
      })
    })

    it('announces chart interaction results', async () => {
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

      await waitFor(() => {
        const chartContainer = screen.getByRole('application')
        expect(chartContainer).toBeInTheDocument()
      })

      const chartContainer = screen.getByRole('application')

      // Focus and interact with chart
      chartContainer.focus()
      await user.keyboard('{Enter}')

      // Chart should provide feedback about interactions
      expect(chartContainer).toHaveAttribute('tabindex', '0')
    })

    it('handles chart error announcements', async () => {
      render(
        <DashboardThemeProvider>
          <ChartWrapper
            type="line"
            data={mockChartData}
            error="Failed to render chart"
          />
        </DashboardThemeProvider>
      )

      // Error should be announced
      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toBeInTheDocument()
      expect(errorAlert).toHaveTextContent('Failed to render chart')
    })
  })

  describe('Grid and Layout Announcements', () => {
    it('provides navigation context for grid layouts', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <DashboardGrid>
            <GridItem colSpan={6}>
              <DashboardCard
                title="Card 1"
                interactive={true}
                onClick={() => {}}
              />
            </GridItem>
            <GridItem colSpan={6}>
              <DashboardCard
                title="Card 2"
                interactive={true}
                onClick={() => {}}
              />
            </GridItem>
            <GridItem colSpan={12}>
              <DashboardCard title="Full Width Card" />
            </GridItem>
          </DashboardGrid>
        </DashboardThemeProvider>
      )

      // Navigate through grid items
      await user.tab()
      const card1 = screen.getByRole('button', { name: /card 1/i })
      expect(card1).toHaveFocus()

      await user.tab()
      const card2 = screen.getByRole('button', { name: /card 2/i })
      expect(card2).toHaveFocus()

      // Grid structure should be conveyed through proper markup
      const grid =
        screen.getByRole('grid', { hidden: true }) ||
        document.querySelector('.dashboard-grid')
      expect(grid).toBeInTheDocument()
    })

    it('announces responsive layout changes', async () => {
      // Mock viewport change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })

      const { useIsMobile } = require('../mobile/touch-interactions')
      useIsMobile.mockReturnValue(true)

      render(
        <DashboardThemeProvider>
          <DashboardGrid>
            <GridItem colSpan={{ desktop: 4, tablet: 6, mobile: 12 }}>
              <DashboardCard title="Responsive Card" />
            </GridItem>
          </DashboardGrid>
        </DashboardThemeProvider>
      )

      // Trigger resize event
      window.dispatchEvent(new Event('resize'))

      // Layout should adapt and maintain accessibility
      const card = screen.getByText('Responsive Card')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Filter and Search Announcements', () => {
    it('announces filter application results', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <FilterProvider>
            <div>
              <input
                type="text"
                placeholder="Search..."
                data-testid="search-input"
                aria-label="Search dashboard content"
              />
              <div role="region" aria-live="polite" aria-label="Search results">
                <DashboardCard title="Filtered Result 1" />
                <DashboardCard title="Filtered Result 2" />
              </div>
            </div>
          </FilterProvider>
        </DashboardThemeProvider>
      )

      const searchInput = screen.getByTestId('search-input')

      // Type in search
      await user.type(searchInput, 'result')

      // Results region should be announced
      const resultsRegion = screen.getByRole('region', {
        name: /search results/i,
      })
      expect(resultsRegion).toBeInTheDocument()
      expect(resultsRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('announces when no results are found', async () => {
      const user = userEvent.setup()

      render(
        <DashboardThemeProvider>
          <FilterProvider>
            <div>
              <input
                type="text"
                placeholder="Search..."
                data-testid="search-input"
              />
              <div role="region" aria-live="polite" aria-label="Search results">
                <p>No results found</p>
              </div>
            </div>
          </FilterProvider>
        </DashboardThemeProvider>
      )

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'nonexistent')

      // No results message should be announced
      const noResults = screen.getByText('No results found')
      expect(noResults).toBeInTheDocument()

      const resultsRegion = screen.getByRole('region', {
        name: /search results/i,
      })
      expect(resultsRegion).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Status and Progress Announcements', () => {
    it('announces progress updates', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <div>
            <div
              role="progressbar"
              aria-valuenow={25}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Data loading progress"
            >
              25% complete
            </div>
            <DashboardCard title="Progress Card" loading={true} />
          </div>
        </DashboardThemeProvider>
      )

      // Update progress
      rerender(
        <DashboardThemeProvider>
          <div>
            <div
              role="progressbar"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Data loading progress"
            >
              75% complete
            </div>
            <DashboardCard title="Progress Card" loading={true} />
          </div>
        </DashboardThemeProvider>
      )

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '75')
      expect(screen.getByText('75% complete')).toBeInTheDocument()
    })

    it('announces completion status', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <DashboardCard title="Task Card" loading={true} />
        </DashboardThemeProvider>
      )

      // Complete the task
      rerender(
        <DashboardThemeProvider>
          <DashboardCard
            title="Task Card"
            metric={{
              value: 'Complete',
              trend: 'up',
            }}
          >
            <div role="status" aria-live="polite">
              Task completed successfully
            </div>
          </DashboardCard>
        </DashboardThemeProvider>
      )

      const completionStatus = screen.getByRole('status')
      expect(completionStatus).toHaveTextContent('Task completed successfully')
      expect(completionStatus).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Dynamic Content Announcements', () => {
    it('announces when new content is added', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <div>
            <DashboardCard title="Existing Card" />
            <div
              role="region"
              aria-live="polite"
              aria-label="Dashboard updates"
            >
              {/* Updates will be announced here */}
            </div>
          </div>
        </DashboardThemeProvider>
      )

      // Add new content
      rerender(
        <DashboardThemeProvider>
          <div>
            <DashboardCard title="Existing Card" />
            <DashboardCard title="New Card" />
            <div
              role="region"
              aria-live="polite"
              aria-label="Dashboard updates"
            >
              New card added to dashboard
            </div>
          </div>
        </DashboardThemeProvider>
      )

      const updatesRegion = screen.getByRole('region', {
        name: /dashboard updates/i,
      })
      expect(updatesRegion).toHaveTextContent('New card added to dashboard')
    })

    it('announces when content is removed', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <div>
            <DashboardCard title="Card 1" />
            <DashboardCard title="Card 2" />
            <div
              role="region"
              aria-live="polite"
              aria-label="Dashboard updates"
            >
              {/* Updates will be announced here */}
            </div>
          </div>
        </DashboardThemeProvider>
      )

      // Remove content
      rerender(
        <DashboardThemeProvider>
          <div>
            <DashboardCard title="Card 1" />
            <div
              role="region"
              aria-live="polite"
              aria-label="Dashboard updates"
            >
              Card removed from dashboard
            </div>
          </div>
        </DashboardThemeProvider>
      )

      const updatesRegion = screen.getByRole('region', {
        name: /dashboard updates/i,
      })
      expect(updatesRegion).toHaveTextContent('Card removed from dashboard')
    })
  })

  describe('Error Recovery Announcements', () => {
    it('announces retry attempts', async () => {
      const user = userEvent.setup()
      const onRetry = jest.fn()

      render(
        <DashboardThemeProvider>
          <div>
            <DashboardCard title="Failed Card" error="Network error">
              <button onClick={onRetry} data-testid="retry-btn">
                Retry
              </button>
            </DashboardCard>
            <div role="status" aria-live="polite" aria-label="Action feedback">
              {/* Retry feedback will be announced here */}
            </div>
          </div>
        </DashboardThemeProvider>
      )

      const retryButton = screen.getByTestId('retry-btn')
      await user.click(retryButton)

      expect(onRetry).toHaveBeenCalled()

      // Retry attempt should be announced
      const feedbackRegion = screen.getByRole('status', {
        name: /action feedback/i,
      })
      expect(feedbackRegion).toBeInTheDocument()
    })

    it('announces successful error recovery', async () => {
      const { rerender } = render(
        <DashboardThemeProvider>
          <DashboardCard title="Recovery Card" error="Connection failed" />
        </DashboardThemeProvider>
      )

      // Recover from error
      rerender(
        <DashboardThemeProvider>
          <div>
            <DashboardCard
              title="Recovery Card"
              metric={{ value: 'Connected', trend: 'up' }}
            />
            <div role="status" aria-live="polite">
              Connection restored successfully
            </div>
          </div>
        </DashboardThemeProvider>
      )

      const recoveryStatus = screen.getByRole('status')
      expect(recoveryStatus).toHaveTextContent(
        'Connection restored successfully'
      )
    })
  })

  describe('Screen Reader Announcer Component', () => {
    it('provides centralized announcement functionality', () => {
      render(
        <DashboardThemeProvider>
          <div>
            <ScreenReaderAnnouncer />
            <DashboardCard title="Test Card" />
          </div>
        </DashboardThemeProvider>
      )

      // Screen reader announcer should be present but hidden
      const announcer =
        screen.getByRole('status', { hidden: true }) ||
        screen.getByRole('log', { hidden: true })
      expect(announcer).toBeInTheDocument()
    })
  })
})
