import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DatePickerWithRange } from '../date-range-picker'

describe('DatePickerWithRange', () => {
  const mockOnDateChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders date picker button', () => {
    render(<DatePickerWithRange onDateChange={mockOnDateChange} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Pick a date')
  })

  it('displays selected date range', () => {
    const dateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
    }

    render(
      <DatePickerWithRange date={dateRange} onDateChange={mockOnDateChange} />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Jan 1, 2024 - Jan 31, 2024')
  })

  it('displays single date when only from date is selected', () => {
    const dateRange = {
      from: new Date('2024-01-01'),
      to: undefined,
    }

    render(
      <DatePickerWithRange date={dateRange} onDateChange={mockOnDateChange} />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Jan 1, 2024')
  })

  it('opens calendar popover when button is clicked', async () => {
    render(<DatePickerWithRange onDateChange={mockOnDateChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Calendar should be visible
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  it('calls onDateChange when date is selected', async () => {
    render(<DatePickerWithRange onDateChange={mockOnDateChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    // Find and click a date cell
    const dateCell = screen.getByRole('gridcell', { name: '15' })
    fireEvent.click(dateCell)

    expect(mockOnDateChange).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <DatePickerWithRange
        onDateChange={mockOnDateChange}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles keyboard navigation', () => {
    render(<DatePickerWithRange onDateChange={mockOnDateChange} />)

    const button = screen.getByRole('button')

    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })

    // Should not throw errors
    expect(button).toBeInTheDocument()
  })

  it('displays calendar icon', () => {
    render(<DatePickerWithRange onDateChange={mockOnDateChange} />)

    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('handles date range selection', async () => {
    render(<DatePickerWithRange onDateChange={mockOnDateChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    // Select first date
    const firstDate = screen.getByRole('gridcell', { name: '10' })
    fireEvent.click(firstDate)

    // Select second date
    const secondDate = screen.getByRole('gridcell', { name: '20' })
    fireEvent.click(secondDate)

    expect(mockOnDateChange).toHaveBeenCalled()
  })

  it('handles preset date ranges', async () => {
    render(<DatePickerWithRange onDateChange={mockOnDateChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      // Look for preset buttons like "Last 7 days", "Last 30 days", etc.
      const presetButtons = screen.queryAllByRole('button')
      expect(presetButtons.length).toBeGreaterThan(1)
    })
  })

  it('closes popover when clicking outside', async () => {
    render(
      <div>
        <DatePickerWithRange onDateChange={mockOnDateChange} />
        <div data-testid="outside">Outside element</div>
      </div>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    // Click outside
    const outsideElement = screen.getByTestId('outside')
    fireEvent.click(outsideElement)

    // Calendar should close
    await waitFor(() => {
      expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    })
  })

  it('handles invalid date ranges gracefully', () => {
    const invalidDateRange = {
      from: new Date('invalid'),
      to: new Date('2024-01-31'),
    }

    expect(() => {
      render(
        <DatePickerWithRange
          date={invalidDateRange}
          onDateChange={mockOnDateChange}
        />
      )
    }).not.toThrow()
  })

  it('supports disabled state', () => {
    render(<DatePickerWithRange onDateChange={mockOnDateChange} disabled />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
