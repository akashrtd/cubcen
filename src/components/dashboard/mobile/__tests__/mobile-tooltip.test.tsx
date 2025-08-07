import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileTooltip, ChartMobileTooltip } from '../mobile-tooltip'
import { useIsTouchDevice } from '../touch-interactions'

// Mock the touch device hook
jest.mock('../touch-interactions', () => ({
  useIsTouchDevice: jest.fn(),
}))

const mockUseIsTouchDevice = useIsTouchDevice as jest.MockedFunction<
  typeof useIsTouchDevice
>

describe('MobileTooltip', () => {
  beforeEach(() => {
    mockUseIsTouchDevice.mockReturnValue(true)
    jest.clearAllMocks()
  })

  it('renders trigger content correctly', () => {
    render(
      <MobileTooltip content="Tooltip content">
        <button>Trigger</button>
      </MobileTooltip>
    )

    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  it('shows tooltip on touch for touch devices', async () => {
    render(
      <MobileTooltip content="Tooltip content" tapToShow>
        <button>Trigger</button>
      </MobileTooltip>
    )

    const trigger = screen.getByText('Trigger').parentElement!

    // Simulate touch start
    fireEvent.touchStart(trigger)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('shows tooltip on hover for non-touch devices', async () => {
    mockUseIsTouchDevice.mockReturnValue(false)

    render(
      <MobileTooltip content="Tooltip content">
        <button>Trigger</button>
      </MobileTooltip>
    )

    const trigger = screen.getByText('Trigger').parentElement!

    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('hides tooltip on touch when tapToHide is enabled', async () => {
    render(
      <MobileTooltip content="Tooltip content" tapToShow tapToHide>
        <button>Trigger</button>
      </MobileTooltip>
    )

    const trigger = screen.getByText('Trigger').parentElement!

    // Show tooltip
    fireEvent.touchStart(trigger)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    // Hide tooltip
    fireEvent.touchStart(trigger)

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('shows tooltip on focus for keyboard accessibility', async () => {
    const user = userEvent.setup()

    render(
      <MobileTooltip content="Tooltip content">
        <button>Trigger</button>
      </MobileTooltip>
    )

    const wrapper = screen.getByText('Trigger').parentElement!

    await user.click(wrapper)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('hides tooltip on blur', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <MobileTooltip content="Tooltip content">
          <button>Trigger</button>
        </MobileTooltip>
        <button>Other button</button>
      </div>
    )

    const wrapper = screen.getByText('Trigger').parentElement!
    const otherButton = screen.getByRole('button', { name: 'Other button' })

    // Focus trigger to show tooltip
    fireEvent.focus(wrapper)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    // Focus other button to hide tooltip
    fireEvent.blur(wrapper)
    fireEvent.focus(otherButton)

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('hides tooltip on escape key', async () => {
    const user = userEvent.setup()

    render(
      <MobileTooltip content="Tooltip content">
        <button>Trigger</button>
      </MobileTooltip>
    )

    const wrapper = screen.getByText('Trigger').parentElement!

    // Show tooltip
    fireEvent.focus(wrapper)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    // Press escape
    fireEvent.keyDown(wrapper, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('respects disabled prop', async () => {
    render(
      <MobileTooltip content="Tooltip content" disabled>
        <button>Trigger</button>
      </MobileTooltip>
    )

    const wrapper = screen.getByText('Trigger').parentElement!

    fireEvent.touchStart(wrapper)
    fireEvent.mouseEnter(wrapper)

    // Wait a bit to ensure tooltip doesn't appear
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
  })

  it('applies custom positioning', async () => {
    render(
      <MobileTooltip content="Tooltip content" side="bottom" align="start">
        <button>Trigger</button>
      </MobileTooltip>
    )

    const wrapper = screen.getByText('Trigger').parentElement!

    fireEvent.touchStart(wrapper)

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toBeInTheDocument()
    })
  })

  it('closes tooltip when clicking outside', async () => {
    render(
      <div>
        <MobileTooltip content="Tooltip content">
          <button>Trigger</button>
        </MobileTooltip>
        <div data-testid="outside">Outside</div>
      </div>
    )

    const wrapper = screen.getByText('Trigger').parentElement!
    const outside = screen.getByTestId('outside')

    // Show tooltip
    fireEvent.touchStart(wrapper)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    // Click outside
    fireEvent.mouseDown(outside)

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })
})

describe('ChartMobileTooltip', () => {
  beforeEach(() => {
    mockUseIsTouchDevice.mockReturnValue(true)
  })

  it('renders with chart data', async () => {
    const chartData = {
      value: 100,
      label: 'Test Data',
    }

    render(
      <ChartMobileTooltip data={chartData}>
        <div>Chart Element</div>
      </ChartMobileTooltip>
    )

    const trigger = screen.getByText('Chart Element')
    fireEvent.touchStart(trigger)

    await waitFor(() => {
      expect(screen.getByText('value:')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('label:')).toBeInTheDocument()
      expect(screen.getByText('Test Data')).toBeInTheDocument()
    })
  })

  it('uses custom formatter', async () => {
    const chartData = { value: 100 }
    const formatter = (data: any) => `Custom: ${data.value}`

    render(
      <ChartMobileTooltip data={chartData} formatter={formatter}>
        <div>Chart Element</div>
      </ChartMobileTooltip>
    )

    const trigger = screen.getByText('Chart Element')
    fireEvent.touchStart(trigger)

    await waitFor(() => {
      expect(screen.getByText('Custom: 100')).toBeInTheDocument()
    })
  })

  it('handles null data gracefully', () => {
    render(
      <ChartMobileTooltip data={null}>
        <div>Chart Element</div>
      </ChartMobileTooltip>
    )

    const trigger = screen.getByText('Chart Element')
    fireEvent.touchStart(trigger)

    // Should not show tooltip with null data
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('handles primitive data types', async () => {
    render(
      <ChartMobileTooltip data="Simple string">
        <div>Chart Element</div>
      </ChartMobileTooltip>
    )

    const trigger = screen.getByText('Chart Element')
    fireEvent.touchStart(trigger)

    await waitFor(() => {
      expect(screen.getByText('Simple string')).toBeInTheDocument()
    })
  })
})
