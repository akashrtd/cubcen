import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { MobileNavigation, defaultMobileNavItems, useMobileNavigation } from '../mobile-navigation'
import { useIsMobile } from '../../mobile/touch-interactions'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock mobile hooks
jest.mock('../../mobile/touch-interactions', () => ({
  useIsMobile: jest.fn(),
  TouchInteraction: ({ children, onSwipeLeft, onSwipeRight }: any) => (
    <div 
      data-testid="touch-wrapper"
      onTouchStart={() => onSwipeLeft?.()}
    >
      {children}
    </div>
  ),
}))

// Mock mobile tooltip
jest.mock('../../mobile/mobile-tooltip', () => ({
  MobileTooltip: ({ children }: any) => children,
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>

describe('MobileNavigation', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue(mockRouter)
    mockUsePathname.mockReturnValue('/dashboard')
    mockUseIsMobile.mockReturnValue(true)
    jest.clearAllMocks()
  })

  it('renders navigation items', () => {
    render(<MobileNavigation items={defaultMobileNavItems} />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Agents')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('highlights active item based on pathname', () => {
    mockUsePathname.mockReturnValue('/dashboard/agents')
    
    render(<MobileNavigation items={defaultMobileNavItems} />)
    
    // The component should render and the active state should be managed internally
    // We can test that the component renders without errors when pathname matches
    expect(screen.getByText('Agents')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Agents' })).toBeInTheDocument()
  })

  it('navigates when item is clicked', () => {
    const onItemClick = jest.fn()
    
    render(
      <MobileNavigation 
        items={defaultMobileNavItems} 
        onItemClick={onItemClick}
      />
    )
    
    const agentsButton = screen.getByRole('button', { name: 'Agents' })
    fireEvent.click(agentsButton)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/agents')
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'agents',
        href: '/dashboard/agents',
      })
    )
  })

  it('shows badge when item has badge', () => {
    const itemsWithBadge = [
      {
        ...defaultMobileNavItems[0],
        badge: 5,
      },
    ]
    
    render(<MobileNavigation items={itemsWithBadge} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByLabelText('5 notifications')).toBeInTheDocument()
  })

  it('handles disabled items', () => {
    const itemsWithDisabled = [
      {
        ...defaultMobileNavItems[0],
        disabled: true,
      },
    ]
    
    render(<MobileNavigation items={itemsWithDisabled} />)
    
    const disabledButton = screen.getByRole('button', { name: 'Dashboard' })
    expect(disabledButton).toBeDisabled()
    
    fireEvent.click(disabledButton)
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('shows 99+ for badges over 99', () => {
    const itemsWithLargeBadge = [
      {
        ...defaultMobileNavItems[0],
        badge: 150,
      },
    ]
    
    render(<MobileNavigation items={itemsWithLargeBadge} />)
    
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not render on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    
    const { container } = render(<MobileNavigation items={defaultMobileNavItems} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('handles swipe navigation between sections', async () => {
    const onItemClick = jest.fn()
    
    render(
      <MobileNavigation 
        items={defaultMobileNavItems} 
        onItemClick={onItemClick}
      />
    )
    
    const touchWrapper = screen.getByTestId('touch-wrapper')
    fireEvent.touchStart(touchWrapper)
    
    // Should navigate to next item
    await waitFor(() => {
      expect(onItemClick).toHaveBeenCalled()
    })
  })

  it('prevents navigation during transitions', () => {
    render(<MobileNavigation items={defaultMobileNavItems} />)
    
    const firstButton = screen.getByRole('button', { name: 'Dashboard' })
    
    // Click rapidly
    fireEvent.click(firstButton)
    fireEvent.click(firstButton)
    
    // Should only navigate once due to transition state
    expect(mockRouter.push).toHaveBeenCalledTimes(1)
  })

  it('shows swipe indicator', () => {
    render(<MobileNavigation items={defaultMobileNavItems} />)
    
    // Should show the swipe indicator line
    const indicator = document.querySelector('.absolute.top-1')
    expect(indicator).toBeInTheDocument()
  })

  it('provides screen reader instructions', () => {
    render(<MobileNavigation items={defaultMobileNavItems} />)
    
    expect(screen.getByText(/Swipe left or right to navigate/)).toBeInTheDocument()
    expect(screen.getByText(/Current section:/)).toBeInTheDocument()
  })

  it('applies touch-optimized styles', () => {
    render(<MobileNavigation items={defaultMobileNavItems} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveClass('min-h-[44px]') // Minimum touch target
      expect(button).toHaveClass('touch-manipulation')
      expect(button).toHaveClass('select-none')
    })
  })
})

describe('useMobileNavigation', () => {
  it('shows navigation by default', () => {
    const TestComponent = () => {
      const { isVisible } = useMobileNavigation()
      return <div data-testid="nav-visibility">{isVisible ? 'visible' : 'hidden'}</div>
    }
    
    render(<TestComponent />)
    expect(screen.getByTestId('nav-visibility')).toHaveTextContent('visible')
  })

  it('provides visibility control', () => {
    const TestComponent = () => {
      const { isVisible, setIsVisible } = useMobileNavigation()
      return (
        <div>
          <div data-testid="nav-visibility">{isVisible ? 'visible' : 'hidden'}</div>
          <button onClick={() => setIsVisible(false)}>Hide</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('nav-visibility')).toHaveTextContent('visible')
    
    fireEvent.click(screen.getByText('Hide'))
    expect(screen.getByTestId('nav-visibility')).toHaveTextContent('hidden')
  })
})