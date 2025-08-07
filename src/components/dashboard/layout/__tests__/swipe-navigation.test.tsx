import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  SwipeNavigation,
  useSwipeNavigation,
  createDashboardSections,
} from '../swipe-navigation'
import { useIsMobile } from '../../mobile/touch-interactions'

// Mock the mobile hook
jest.mock('../../mobile/touch-interactions', () => ({
  useIsMobile: jest.fn(),
  TouchInteraction: ({ children, onSwipeLeft, onSwipeRight }: any) => (
    <div
      data-testid="touch-wrapper"
      onTouchStart={() => {
        // Simulate swipe gestures for testing
        if (Math.random() > 0.5) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
      }}
    >
      {children}
    </div>
  ),
}))

const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>

const mockSections = [
  {
    id: 'section1',
    title: 'Section 1',
    content: <div>Content 1</div>,
  },
  {
    id: 'section2',
    title: 'Section 2',
    content: <div>Content 2</div>,
  },
  {
    id: 'section3',
    title: 'Section 3',
    content: <div>Content 3</div>,
    disabled: true,
  },
]

describe('SwipeNavigation', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(true)
    jest.clearAllMocks()
  })

  it('renders initial section correctly', () => {
    render(
      <SwipeNavigation sections={mockSections} initialSection="section1" />
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('shows section indicators when enabled', () => {
    render(<SwipeNavigation sections={mockSections} showIndicators={true} />)

    const indicators = screen.getAllByRole('tab')
    expect(indicators).toHaveLength(3)
    expect(indicators[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('hides section indicators when disabled', () => {
    render(<SwipeNavigation sections={mockSections} showIndicators={false} />)

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('navigates to section when indicator is clicked', async () => {
    const onSectionChange = jest.fn()

    render(
      <SwipeNavigation
        sections={mockSections}
        onSectionChange={onSectionChange}
        showIndicators={true}
      />
    )

    const indicators = screen.getAllByRole('tab')
    await userEvent.click(indicators[1])

    await waitFor(() => {
      expect(onSectionChange).toHaveBeenCalledWith('section2')
    })
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()

    render(
      <SwipeNavigation
        sections={mockSections}
        enableKeyboardNavigation={true}
      />
    )

    const container = screen.getByRole('region')
    container.focus()

    // Navigate right
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    // Navigate left
    await user.keyboard('{ArrowLeft}')

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })
  })

  it('handles Home and End keys', async () => {
    const user = userEvent.setup()

    render(
      <SwipeNavigation
        sections={mockSections}
        initialSection="section2"
        enableKeyboardNavigation={true}
      />
    )

    const container = screen.getByRole('region')
    container.focus()

    // Go to end
    await user.keyboard('{End}')

    await waitFor(() => {
      expect(screen.getByText('Content 3')).toBeInTheDocument()
    })

    // Go to home
    await user.keyboard('{Home}')

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })
  })

  it('skips disabled sections', async () => {
    const user = userEvent.setup()

    render(
      <SwipeNavigation
        sections={mockSections}
        initialSection="section2"
        enableKeyboardNavigation={true}
      />
    )

    const container = screen.getByRole('region')
    container.focus()

    // Try to navigate to disabled section
    await user.keyboard('{ArrowRight}')

    // Should stay on section2 since section3 is disabled
    expect(screen.getByText('Content 2')).toBeInTheDocument()
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
  })

  it('prevents navigation during transitions', async () => {
    const user = userEvent.setup()

    render(
      <SwipeNavigation
        sections={mockSections}
        animationDuration={100}
        enableKeyboardNavigation={true}
      />
    )

    const container = screen.getByRole('region')
    container.focus()

    // Start navigation
    await user.keyboard('{ArrowRight}')

    // Try to navigate again immediately (should be ignored)
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  it('renders desktop version when not mobile', () => {
    mockUseIsMobile.mockReturnValue(false)

    render(
      <SwipeNavigation sections={mockSections} initialSection="section1" />
    )

    // Should render content directly without swipe functionality
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('updates section when initialSection prop changes', async () => {
    const { rerender } = render(
      <SwipeNavigation sections={mockSections} initialSection="section1" />
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()

    rerender(
      <SwipeNavigation sections={mockSections} initialSection="section2" />
    )

    await waitFor(() => {
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  it('shows section title during transitions', async () => {
    const user = userEvent.setup()

    render(
      <SwipeNavigation
        sections={mockSections}
        enableKeyboardNavigation={true}
        animationDuration={200}
      />
    )

    const container = screen.getByRole('region')
    container.focus()

    await user.keyboard('{ArrowRight}')

    // Section title should be visible during transition
    expect(screen.getByText('Section 2')).toBeInTheDocument()
  })
})

describe('useSwipeNavigation', () => {
  it('manages current section state', () => {
    const TestComponent = () => {
      const { currentSectionId, navigateToSection } = useSwipeNavigation(
        mockSections,
        'section1'
      )

      return (
        <div>
          <div data-testid="current">{currentSectionId}</div>
          <button onClick={() => navigateToSection('section2')}>
            Navigate
          </button>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('current')).toHaveTextContent('section1')

    fireEvent.click(screen.getByText('Navigate'))

    expect(screen.getByTestId('current')).toHaveTextContent('section2')
  })

  it('maintains navigation history', () => {
    const TestComponent = () => {
      const { currentSectionId, navigateToSection, goBack, canGoBack } =
        useSwipeNavigation(mockSections, 'section1')

      return (
        <div>
          <div data-testid="current">{currentSectionId}</div>
          <div data-testid="can-go-back">{canGoBack.toString()}</div>
          <button onClick={() => navigateToSection('section2')}>
            Navigate to 2
          </button>
          <button onClick={goBack} disabled={!canGoBack}>
            Go Back
          </button>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false')

    // Navigate to section 2
    fireEvent.click(screen.getByText('Navigate to 2'))

    expect(screen.getByTestId('current')).toHaveTextContent('section2')
    expect(screen.getByTestId('can-go-back')).toHaveTextContent('true')

    // Go back
    fireEvent.click(screen.getByText('Go Back'))

    expect(screen.getByTestId('current')).toHaveTextContent('section1')
    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false')
  })
})

describe('createDashboardSections', () => {
  it('creates sections from dashboard pages', () => {
    const TestComponent = () => <div>Test Component</div>

    const pages = [
      {
        id: 'page1',
        title: 'Page 1',
        component: TestComponent,
      },
      {
        id: 'page2',
        title: 'Page 2',
        component: TestComponent,
        disabled: true,
      },
    ]

    const sections = createDashboardSections(pages)

    expect(sections).toHaveLength(2)
    expect(sections[0]).toMatchObject({
      id: 'page1',
      title: 'Page 1',
      disabled: undefined,
    })
    expect(sections[1]).toMatchObject({
      id: 'page2',
      title: 'Page 2',
      disabled: true,
    })
  })
})
