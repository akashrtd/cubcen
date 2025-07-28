import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home Page', () => {
  it('renders the Cubcen homepage', () => {
    render(<Home />)
    
    // Check for main heading
    expect(screen.getByText('AI Agent Management Platform')).toBeInTheDocument()
    
    // Check for Cubcen branding
    expect(screen.getByText('Cubcen')).toBeInTheDocument()
    
    // Check for feature cards
    expect(screen.getByText('Multi-Platform Integration')).toBeInTheDocument()
    expect(screen.getByText('Real-time Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Task Scheduling')).toBeInTheDocument()
    
    // Check for CTA buttons
    expect(screen.getByText('Launch Dashboard')).toBeInTheDocument()
    expect(screen.getByText('View Documentation')).toBeInTheDocument()
  })

  it('displays MVP badge', () => {
    render(<Home />)
    expect(screen.getByText('MVP')).toBeInTheDocument()
  })

  it('shows correct description', () => {
    render(<Home />)
    expect(screen.getByText(/Centralized platform to manage, monitor, and orchestrate AI agents/)).toBeInTheDocument()
  })
})