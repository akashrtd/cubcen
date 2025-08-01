import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import DashboardPage from '../page'

describe('DashboardPage', () => {
  it('shows loading state initially', () => {
    render(<DashboardPage />)

    // Check for skeleton loading states - they don't have testId, so check for skeleton class
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders dashboard content after loading', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(
        screen.getByText(
          "Welcome back! Here's what's happening with your AI agents."
        )
      ).toBeInTheDocument()
    })

    // Check stat cards
    expect(screen.getByText('Total Agents')).toBeInTheDocument()
    expect(screen.getByText('Tasks Today')).toBeInTheDocument()
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
    expect(screen.getByText('Avg Response')).toBeInTheDocument()
  })

  it('displays mock statistics', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('24')).toBeInTheDocument() // Total agents
      expect(screen.getByText('156')).toBeInTheDocument() // Total tasks
      expect(screen.getByText('91.0%')).toBeInTheDocument() // Success rate
      expect(screen.getByText('1.2s')).toBeInTheDocument() // Avg response time
    })
  })

  it('shows alert for failed tasks', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(
        screen.getByText(/8 tasks failed in the last hour/)
      ).toBeInTheDocument()
    })
  })

  it('displays recent tasks section', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Recent Tasks')).toBeInTheDocument()
      expect(
        screen.getByText('Data Sync - Customer Records')
      ).toBeInTheDocument()
      expect(screen.getByText('Email Campaign Trigger')).toBeInTheDocument()
    })
  })

  it('displays agent status section', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Agent Status')).toBeInTheDocument()
      expect(screen.getByText('Customer Data Sync')).toBeInTheDocument()
      expect(screen.getByText('Email Marketing')).toBeInTheDocument()
    })
  })

  it('handles refresh button click', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeInTheDocument()

      fireEvent.click(refreshButton)
      expect(refreshButton).toBeDisabled()
    })
  })

  it('shows correct status badges', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument()
      expect(screen.getByText('running')).toBeInTheDocument()
      expect(screen.getByText('failed')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
    })
  })
})
