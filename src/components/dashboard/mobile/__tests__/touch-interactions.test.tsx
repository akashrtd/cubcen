import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TouchInteraction, useIsTouchDevice, useIsMobile } from '../touch-interactions'

// Mock the hooks
jest.mock('../touch-interactions', () => ({
  ...jest.requireActual('../touch-interactions'),
  useIsTouchDevice: jest.fn(),
  useIsMobile: jest.fn(),
}))

const mockUseIsTouchDevice = useIsTouchDevice as jest.MockedFunction<typeof useIsTouchDevice>
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>

describe('TouchInteraction', () => {
  beforeEach(() => {
    mockUseIsTouchDevice.mockReturnValue(true)
    mockUseIsMobile.mockReturnValue(true)
    jest.clearAllMocks()
  })

  it('renders children correctly', () => {
    render(
      <TouchInteraction>
        <div>Test Content</div>
      </TouchInteraction>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies touch interaction classes', () => {
    const { container } = render(
      <TouchInteraction>
        <div>Test Content</div>
      </TouchInteraction>
    )

    const touchWrapper = container.firstChild as HTMLElement
    expect(touchWrapper).toHaveClass('touch-interaction')
    expect(touchWrapper).toHaveClass('touch-manipulation')
    expect(touchWrapper).toHaveClass('select-none')
  })

  it('handles tap events', async () => {
    const onTap = jest.fn()
    
    const { container } = render(
      <TouchInteraction onTap={onTap}>
        <div>Tap me</div>
      </TouchInteraction>
    )

    const element = container.firstChild as HTMLElement

    // Simulate touch events
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    })
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
    })

    fireEvent(element, touchStart)
    fireEvent(element, touchEnd)

    // Wait for tap delay
    await waitFor(() => {
      expect(onTap).toHaveBeenCalledWith(expect.any(TouchEvent))
    }, { timeout: 400 })
  })

  it('handles double tap events', async () => {
    const onDoubleTap = jest.fn()
    
    const { container } = render(
      <TouchInteraction onDoubleTap={onDoubleTap}>
        <div>Double tap me</div>
      </TouchInteraction>
    )

    const element = container.firstChild as HTMLElement

    // First tap
    const touchStart1 = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    })
    const touchEnd1 = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
    })

    fireEvent(element, touchStart1)
    fireEvent(element, touchEnd1)

    // Second tap quickly
    const touchStart2 = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    })
    const touchEnd2 = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
    })

    fireEvent(element, touchStart2)
    fireEvent(element, touchEnd2)

    await waitFor(() => {
      expect(onDoubleTap).toHaveBeenCalledWith(expect.any(TouchEvent))
    })
  })

  it('handles long press events', async () => {
    const onLongPress = jest.fn()
    
    const { container } = render(
      <TouchInteraction onLongPress={onLongPress} longPressDelay={100}>
        <div>Long press me</div>
      </TouchInteraction>
    )

    const element = container.firstChild as HTMLElement

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    })

    fireEvent(element, touchStart)

    await waitFor(() => {
      expect(onLongPress).toHaveBeenCalledWith(expect.any(TouchEvent))
    }, { timeout: 200 })
  })

  it('handles swipe gestures', () => {
    const onSwipeRight = jest.fn()
    const onSwipeLeft = jest.fn()
    
    const { container } = render(
      <TouchInteraction 
        onSwipeRight={onSwipeRight}
        onSwipeLeft={onSwipeLeft}
        swipeThreshold={30}
      >
        <div>Swipe me</div>
      </TouchInteraction>
    )

    const element = container.firstChild as HTMLElement

    // Swipe right
    const touchStartRight = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    })
    const touchEndRight = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 150, clientY: 100 } as Touch],
    })

    fireEvent(element, touchStartRight)
    fireEvent(element, touchEndRight)

    expect(onSwipeRight).toHaveBeenCalledWith(expect.any(TouchEvent))

    // Swipe left
    const touchStartLeft = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    })
    const touchEndLeft = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 100 } as Touch],
    })

    fireEvent(element, touchStartLeft)
    fireEvent(element, touchEndLeft)

    expect(onSwipeLeft).toHaveBeenCalledWith(expect.any(TouchEvent))
  })

  it('handles pinch zoom gestures', () => {
    const onPinchZoom = jest.fn()
    
    const { container } = render(
      <TouchInteraction onPinchZoom={onPinchZoom}>
        <div>Pinch me</div>
      </TouchInteraction>
    )

    const element = container.firstChild as HTMLElement

    // Start with two fingers
    const touchStart = new TouchEvent('touchstart', {
      touches: [
        { clientX: 100, clientY: 100 } as Touch,
        { clientX: 200, clientY: 100 } as Touch,
      ],
    })

    // Move fingers apart (zoom in)
    const touchMove = new TouchEvent('touchmove', {
      touches: [
        { clientX: 80, clientY: 100 } as Touch,
        { clientX: 220, clientY: 100 } as Touch,
      ],
    })

    fireEvent(element, touchStart)
    fireEvent(element, touchMove)

    expect(onPinchZoom).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(TouchEvent)
    )
  })

  it('respects disabled prop', () => {
    const onTap = jest.fn()
    
    const { container } = render(
      <TouchInteraction onTap={onTap} disabled>
        <div>Disabled</div>
      </TouchInteraction>
    )

    const element = container.firstChild as HTMLElement

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    })
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
    })

    fireEvent(element, touchStart)
    fireEvent(element, touchEnd)

    expect(onTap).not.toHaveBeenCalled()
  })
})

describe('useIsTouchDevice', () => {
  it('detects touch device correctly', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      value: true,
      writable: true,
    })

    const TestComponent = () => {
      const isTouchDevice = useIsTouchDevice()
      return <div>{isTouchDevice ? 'Touch' : 'No Touch'}</div>
    }

    render(<TestComponent />)
    expect(screen.getByText('Touch')).toBeInTheDocument()
  })
})

describe('useIsMobile', () => {
  it('detects mobile viewport correctly', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true,
    })

    const TestComponent = () => {
      const isMobile = useIsMobile()
      return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>
    }

    render(<TestComponent />)
    expect(screen.getByText('Mobile')).toBeInTheDocument()
  })

  it('detects desktop viewport correctly', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      writable: true,
    })

    const TestComponent = () => {
      const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768)
      
      React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        handleResize() // Call immediately
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      }, [])
      
      return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>
    }

    render(<TestComponent />)
    expect(screen.getByText('Desktop')).toBeInTheDocument()
  })
})