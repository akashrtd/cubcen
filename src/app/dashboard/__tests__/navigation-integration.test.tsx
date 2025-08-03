import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../layout'
import DashboardPage from '../page'
import AnalyticsPage from '../analytics/page'
import PlatformsPage from '../platforms/page'
import UsersPage from '../users/page'
import SettingsPage from '../settings/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock auth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
    },
    isAuthenticated: true,
    loading: false,
  })),
}))

// Mock fetch
global.fetch = jest.fn()

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
}

describe('Dashboard Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    })
  })

  describe('Dashboard Layout Navigation', () => {
    it('renders navigation sidebar with all menu items', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Platforms')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('navigates to analytics page when analytics link is clicked', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const analyticsLink = screen.getByRole('link', { name: /analytics/i })
      fireEvent.click(analyticsLink)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/analytics')
    })

    it('navigates to platforms page when platforms link is clicked', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const platformsLink = screen.getByRole('link', { name: /platforms/i })
      fireEvent.click(platformsLink)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/platforms')
    })

    it('navigates to users page when users link is clicked', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const usersLink = screen.getByRole('link', { name: /users/i })
      fireEvent.click(usersLink)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/users')
    })

    it('navigates to settings page when settings link is clicked', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const settingsLink = screen.getByRole('link', { name: /settings/i })
      fireEvent.click(settingsLink)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/settings')
    })

    it('highlights active navigation item', () => {
      // Mock current pathname
      jest.doMock('next/navigation', () => ({
        useRouter: () => mockRouter,
        usePathname: () => '/dashboard/analytics',
      }))

      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const analyticsLink = screen.getByRole('link', { name: /analytics/i })
      expect(analyticsLink).toHaveClass('bg-accent') // Active state class
    })
  })

  describe('Page Navigation Flow', () => {
    it('navigates from dashboard to analytics page', async () => {
      const { rerender } = render(<DashboardPage />)

      // Click on analytics card or link
      const analyticsCard = screen.getByText(/view analytics/i)
      fireEvent.click(analyticsCard)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/analytics')

      // Simulate navigation by rendering analytics page
      rerender(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument()
      })
    })

    it('navigates from dashboard to platforms page', async () => {
      const { rerender } = render(<DashboardPage />)

      // Click on platforms card or link
      const platformsCard = screen.getByText(/manage platforms/i)
      fireEvent.click(platformsCard)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/platforms')

      // Simulate navigation by rendering platforms page
      rerender(<PlatformsPage />)

      await waitFor(() => {
        expect(screen.getByText('Platform Management')).toBeInTheDocument()
      })
    })

    it('navigates from dashboard to users page', async () => {
      const { rerender } = render(<DashboardPage />)

      // Click on users card or link
      const usersCard = screen.getByText(/manage users/i)
      fireEvent.click(usersCard)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/users')

      // Simulate navigation by rendering users page
      rerender(<UsersPage />)

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
      })
    })

    it('navigates from dashboard to settings page', async () => {
      const { rerender } = render(<DashboardPage />)

      // Click on settings card or link
      const settingsCard = screen.getByText(/settings/i)
      fireEvent.click(settingsCard)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/settings')

      // Simulate navigation by rendering settings page
      rerender(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
    })
  })

  describe('Breadcrumb Navigation', () => {
    it('displays correct breadcrumbs on analytics page', () => {
      render(
        <DashboardLayout>
          <AnalyticsPage />
        </DashboardLayout>
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('displays correct breadcrumbs on platforms page', () => {
      render(
        <DashboardLayout>
          <PlatformsPage />
        </DashboardLayout>
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Platforms')).toBeInTheDocument()
    })

    it('allows navigation via breadcrumbs', async () => {
      render(
        <DashboardLayout>
          <AnalyticsPage />
        </DashboardLayout>
      )

      const dashboardBreadcrumb = screen.getByRole('link', { name: /dashboard/i })
      fireEvent.click(dashboardBreadcrumb)

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('Mobile Navigation', () => {
    it('shows mobile menu toggle on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const menuToggle = screen.getByRole('button', { name: /toggle menu/i })
      expect(menuToggle).toBeInTheDocument()
    })

    it('opens mobile menu when toggle is clicked', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const menuToggle = screen.getByRole('button', { name: /toggle menu/i })
      fireEvent.click(menuToggle)

      await waitFor(() => {
        const mobileMenu = screen.getByRole('navigation', { name: /mobile menu/i })
        expect(mobileMenu).toBeVisible()
      })
    })

    it('closes mobile menu when navigation item is clicked', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      // Open mobile menu
      const menuToggle = screen.getByRole('button', { name: /toggle menu/i })
      fireEvent.click(menuToggle)

      await waitFor(() => {
        const mobileMenu = screen.getByRole('navigation', { name: /mobile menu/i })
        expect(mobileMenu).toBeVisible()
      })

      // Click navigation item
      const analyticsLink = screen.getByRole('link', { name: /analytics/i })
      fireEvent.click(analyticsLink)

      await waitFor(() => {
        const mobileMenu = screen.queryByRole('navigation', { name: /mobile menu/i })
        expect(mobileMenu).not.toBeVisible()
      })
    })
  })

  describe('User Menu Navigation', () => {
    it('displays user menu with profile and logout options', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const userMenuButton = screen.getByRole('button', { name: /user menu/i })
      fireEvent.click(userMenuButton)

      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('navigates to settings when profile settings is clicked', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const userMenuButton = screen.getByRole('button', { name: /user menu/i })
      fireEvent.click(userMenuButton)

      const settingsOption = screen.getByText('Settings')
      fireEvent.click(settingsOption)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/settings')
    })

    it('handles logout when logout is clicked', async () => {
      const mockLogout = jest.fn()
      
      // Mock auth hook with logout function
      jest.doMock('@/hooks/use-auth', () => ({
        useAuth: jest.fn(() => ({
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'ADMIN',
          },
          isAuthenticated: true,
          loading: false,
          logout: mockLogout,
        })),
      }))

      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const userMenuButton = screen.getByRole('button', { name: /user menu/i })
      fireEvent.click(userMenuButton)

      const logoutOption = screen.getByText('Logout')
      fireEvent.click(logoutOption)

      expect(mockLogout).toHaveBeenCalled()
    })
  })

  describe('Search Navigation', () => {
    it('displays search bar in header', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const searchInput = screen.getByPlaceholderText(/search/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('navigates to search results when search is performed', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'test query' } })
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })

      expect(mockPush).toHaveBeenCalledWith('/dashboard/search?q=test%20query')
    })
  })

  describe('Error Handling', () => {
    it('displays error message when navigation fails', async () => {
      mockPush.mockRejectedValue(new Error('Navigation failed'))

      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const analyticsLink = screen.getByRole('link', { name: /analytics/i })
      fireEvent.click(analyticsLink)

      await waitFor(() => {
        expect(screen.getByText(/navigation error/i)).toBeInTheDocument()
      })
    })

    it('handles back button navigation', () => {
      render(
        <DashboardLayout>
          <AnalyticsPage />
        </DashboardLayout>
      )

      const backButton = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backButton)

      expect(mockRouter.back).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation through menu items', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const firstMenuItem = screen.getByRole('link', { name: /dashboard/i })
      firstMenuItem.focus()

      // Tab to next menu item
      fireEvent.keyDown(firstMenuItem, { key: 'Tab', code: 'Tab' })

      const analyticsMenuItem = screen.getByRole('link', { name: /analytics/i })
      expect(analyticsMenuItem).toHaveFocus()
    })

    it('activates menu items with Enter key', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      )

      const analyticsLink = screen.getByRole('link', { name: /analytics/i })
      analyticsLink.focus()
      fireEvent.keyDown(analyticsLink, { key: 'Enter', code: 'Enter' })

      expect(mockPush).toHaveBeenCalledWith('/dashboard/analytics')
    })
  })
})