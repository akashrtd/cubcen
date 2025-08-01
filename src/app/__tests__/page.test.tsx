import { render, screen } from '@testing-library/react'
import Home from '../page'

// Mock the theme toggle component
jest.mock('../../../components/theme-toggle', () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Theme</button>,
}))

describe('Home', () => {
  it('renders Cubcen branding', () => {
    render(<Home />)

    expect(screen.getByText('Cubcen')).toBeInTheDocument()
    expect(screen.getByText('AI Agent Management Platform')).toBeInTheDocument()
    expect(screen.getByText('MVP')).toBeInTheDocument()
  })

  it('renders main heading and description', () => {
    render(<Home />)

    expect(screen.getByText('AI Agent Management Platform')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Centralized platform to manage, monitor, and orchestrate/
      )
    ).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(<Home />)

    expect(screen.getByText('Multi-Platform Integration')).toBeInTheDocument()
    expect(screen.getByText('Real-time Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Task Scheduling')).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<Home />)

    const dashboardButton = screen.getByRole('link', {
      name: /launch dashboard/i,
    })
    const signInButton = screen.getByRole('link', { name: /sign in/i })

    expect(dashboardButton).toHaveAttribute('href', '/dashboard')
    expect(signInButton).toHaveAttribute('href', '/auth/login')
  })

  it('renders footer', () => {
    render(<Home />)

    expect(
      screen.getByText('© 2024 Cubcen. AI Agent Management Platform.')
    ).toBeInTheDocument()
  })

  it('has theme toggle in header', () => {
    render(<Home />)

    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeToggle).toBeInTheDocument()
  })
})
