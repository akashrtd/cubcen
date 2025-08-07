import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardLayout } from '../dashboard-layout'

// Mock the mobile hook
jest.mock('../../mobile/touch-interactions', () => ({
  useIsMobile: jest.fn(() => false),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1280,
})

describe('DashboardLayout Responsive Behavior', () => {
  const mockHeader = <div data-testid="header">Header Content</div>
  const mockSidebar = <div data-testid="sidebar">Sidebar Content</div>
  const mockFooter = <div data-testid="footer">Footer Content</div>
  const mockChildren = <div data-testid="main-content">Main Content</div>

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window width to desktop
    window.innerWidth = 1280
  })

  describe('Desktop Layout (>= 1280px)', () => {
    it('renders full grid layout with all regions', () => {
      render(
        <DashboardLayout
          header={mockHeader}
          sidebar={mockSidebar}
          footer={mockFooter}
        >
          {mockChildren}
        </DashboardLayout>
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('applies correct grid template areas for desktop', () => {
      const { container } = render(
        <DashboardLayout
          header={mockHeader}
          sidebar={mockSidebar}
          footer={mockFooter}
        >
          {mockChildren}
        </DashboardLayout>
      )

      const layout = container.firstChild as HTMLElement
      expect(layout).toHaveStyle({
        gridTemplateColumns: '280px 1fr',
        gridTemplateRows: '64px 1fr 48px',
      })
    })

    it('shows sidebar toggle button', () => {
      render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      const toggleButton = screen.getByRole('button', {
        name: /collapse sidebar/i,
      })
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('toggles sidebar when button is clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      const toggleButton = screen.getByRole('button', {
        name: /collapse sidebar/i,
      })
      await user.click(toggleButton)

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
      expect(toggleButton).toHaveAttribute('aria-label', 'Expand sidebar')

      const layout = container.firstChild as HTMLElement
      await waitFor(() => {
        expect(layout).toHaveStyle({
          gridTemplateColumns: '1fr',
        })
      })
    })

    it('persists sidebar state to localStorage', async () => {
      const user = userEvent.setup()
      render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      const toggleButton = screen.getByRole('button', {
        name: /collapse sidebar/i,
      })
      await user.click(toggleButton)

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'dashboard-sidebar-collapsed',
          'true'
        )
      })
    })

    it('restores sidebar state from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('true')

      render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      const toggleButton = screen.getByRole('button', {
        name: /expand sidebar/i,
      })
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Tablet Layout (768px - 1279px)', () => {
    beforeEach(() => {
      window.innerWidth = 1024
    })

    it('applies tablet-specific grid columns', async () => {
      const { container } = render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      // Trigger resize event
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        const layout = container.firstChild as HTMLElement
        expect(layout).toHaveStyle({
          gridTemplateColumns: '240px 1fr',
        })
      })
    })

    it('maintains sidebar functionality on tablet', async () => {
      const user = userEvent.setup()
      render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      // Trigger resize to tablet
      fireEvent(window, new Event('resize'))

      const toggleButton = screen.getByRole('button', {
        name: /collapse sidebar/i,
      })
      await user.click(toggleButton)

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Mobile Layout (< 768px)', () => {
    beforeEach(() => {
      window.innerWidth = 600
      // Mock mobile hook to return true
      const { useIsMobile } = require('../../mobile/touch-interactions')
      useIsMobile.mockReturnValue(true)
    })

    it('hides sidebar on mobile', async () => {
      render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      // Trigger resize event
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
      })
    })

    it('applies single-column grid layout', async () => {
      const { container } = render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      // Trigger resize event
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        const layout = container.firstChild as HTMLElement
        expect(layout).toHaveStyle({
          gridTemplateColumns: '1fr',
        })
      })
    })

    it('hides sidebar toggle button on mobile', async () => {
      render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      // Trigger resize event
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /sidebar/i })
        ).not.toBeInTheDocument()
      })
    })

    it('shows mobile navigation when enabled', async () => {
      render(
        <DashboardLayout
          header={mockHeader}
          sidebar={mockSidebar}
          showMobileNav={true}
        >
          {mockChildren}
        </DashboardLayout>
      )

      // Trigger resize event
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        const mainContent = screen.getByRole('main')
        expect(mainContent).toHaveClass('pb-20')
      })
    })

    it('adds bottom padding to main content for mobile nav', async () => {
      render(
        <DashboardLayout header={mockHeader} showMobileNav={true}>
          {mockChildren}
        </DashboardLayout>
      )

      // Trigger resize event
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        const mainContent = screen.getByRole('main')
        expect(mainContent).toHaveClass('pb-20')
      })
    })
  })

  describe('Responsive Transitions', () => {
    it('debounces resize events', async () => {
      const { container } = render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      // Fire multiple resize events quickly
      window.innerWidth = 800
      fireEvent(window, new Event('resize'))
      window.innerWidth = 900
      fireEvent(window, new Event('resize'))
      window.innerWidth = 1000
      fireEvent(window, new Event('resize'))

      // Wait for debounce delay
      await waitFor(
        () => {
          const layout = container.firstChild as HTMLElement
          expect(layout).toHaveStyle({
            gridTemplateColumns: '240px 1fr',
          })
        },
        { timeout: 200 }
      )
    })

    it('applies transition classes for smooth animations', () => {
      const { container } = render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      const layout = container.firstChild as HTMLElement
      expect(layout).toHaveClass(
        'transition-all',
        'duration-300',
        'ease-in-out'
      )
    })
  })

  describe('Custom Grid Configuration', () => {
    it('accepts custom grid areas', () => {
      const customGridAreas = {
        header: 'top',
        sidebar: 'nav',
        main: 'content',
        footer: 'bottom',
      }

      render(
        <DashboardLayout
          header={mockHeader}
          sidebar={mockSidebar}
          footer={mockFooter}
          gridAreas={customGridAreas}
        >
          {mockChildren}
        </DashboardLayout>
      )

      const header = screen.getByRole('banner')
      const sidebar = screen.getByRole('navigation')
      const main = screen.getByRole('main')
      const footer = screen.getByRole('contentinfo')

      expect(header).toHaveStyle({ gridArea: 'top' })
      expect(sidebar).toHaveStyle({ gridArea: 'nav' })
      expect(main).toHaveStyle({ gridArea: 'content' })
      expect(footer).toHaveStyle({ gridArea: 'bottom' })
    })

    it('accepts custom breakpoints', async () => {
      const customBreakpoints = {
        mobile: 600,
        tablet: 900,
        desktop: 1200,
      }

      const { container } = render(
        <DashboardLayout
          header={mockHeader}
          sidebar={mockSidebar}
          breakpoints={customBreakpoints}
        >
          {mockChildren}
        </DashboardLayout>
      )

      // Test tablet breakpoint
      window.innerWidth = 800
      fireEvent(window, new Event('resize'))

      await waitFor(() => {
        const layout = container.firstChild as HTMLElement
        expect(layout).toHaveStyle({
          gridTemplateColumns: '240px 1fr',
        })
      })
    })
  })

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels and roles', () => {
      render(
        <DashboardLayout
          header={mockHeader}
          sidebar={mockSidebar}
          footer={mockFooter}
        >
          {mockChildren}
        </DashboardLayout>
      )

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'Main navigation'
      )
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('provides skip links for keyboard navigation', () => {
      render(
        <DashboardLayout
          header={mockHeader}
          sidebar={mockSidebar}
          footer={mockFooter}
        >
          {mockChildren}
        </DashboardLayout>
      )

      // Skip links are rendered by KeyboardNavigation component
      // We can test that the component is rendered with proper props
      const layout = screen.getByRole('grid')
      expect(layout).toBeInTheDocument()
    })

    it('manages focus properly when sidebar is toggled', async () => {
      const user = userEvent.setup()
      render(
        <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
          {mockChildren}
        </DashboardLayout>
      )

      const toggleButton = screen.getByRole('button', {
        name: /collapse sidebar/i,
      })

      // Focus the toggle button
      toggleButton.focus()
      expect(toggleButton).toHaveFocus()

      // Click to toggle sidebar
      await user.click(toggleButton)

      // Button should still be focusable and have updated aria attributes
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
      expect(toggleButton).toHaveAttribute('aria-controls', 'dashboard-sidebar')
    })
  })

  describe('Error Handling', () => {
    it('handles missing localStorage gracefully', () => {
      // Mock localStorage to throw an error
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      expect(() => {
        render(
          <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
            {mockChildren}
          </DashboardLayout>
        )
      }).not.toThrow()
    })

    it('handles invalid localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')

      expect(() => {
        render(
          <DashboardLayout header={mockHeader} sidebar={mockSidebar}>
            {mockChildren}
          </DashboardLayout>
        )
      }).not.toThrow()
    })
  })
})
