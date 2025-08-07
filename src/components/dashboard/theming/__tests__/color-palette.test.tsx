import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ColorPalette } from '../color-palette'
import { DashboardThemeProvider } from '../theme-provider'

// Mock the theme provider context
const mockSetDashboardTheme = jest.fn()
const mockGetContrastRatio = jest.fn().mockReturnValue(4.5)

jest.mock('../theme-provider', () => ({
  ...jest.requireActual('../theme-provider'),
  useDashboardTheme: () => ({
    dashboardTheme: {
      colors: {
        primary: '#3F51B5',
        secondary: '#B19ADA',
        accent: '#FF6B35',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
          disabled: '#9CA3AF',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        chart: {
          palette: [
            '#3F51B5',
            '#B19ADA',
            '#FF6B35',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#3B82F6',
            '#8B5CF6',
            '#EC4899',
            '#14B8A6',
          ],
          gradients: {
            primary: 'linear-gradient(135deg, #3F51B5 0%, #B19ADA 100%)',
          },
        },
      },
    },
    setDashboardTheme: mockSetDashboardTheme,
    getContrastRatio: mockGetContrastRatio,
  }),
}))

describe('ColorPalette', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all color sections', () => {
    render(<ColorPalette />)

    expect(screen.getByText('Primary Colors')).toBeInTheDocument()
    expect(screen.getByText('Background Colors')).toBeInTheDocument()
    expect(screen.getByText('Text Colors')).toBeInTheDocument()
    expect(screen.getByText('Status Colors')).toBeInTheDocument()
    expect(screen.getByText('Chart Palette')).toBeInTheDocument()
  })

  it('displays color values correctly', () => {
    render(<ColorPalette />)

    expect(screen.getByText('#3F51B5')).toBeInTheDocument()
    expect(screen.getByText('#B19ADA')).toBeInTheDocument()
    expect(screen.getByText('#FF6B35')).toBeInTheDocument()
    expect(screen.getByText('#FFFFFF')).toBeInTheDocument()
  })

  it('shows accessibility information when showLabels is true', () => {
    render(<ColorPalette showLabels={true} />)

    expect(screen.getByText('Accessibility Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Colors with contrast ratios ≥4.5:1 meet WCAG AA standards/
      )
    ).toBeInTheDocument()
  })

  it('hides accessibility information when showLabels is false', () => {
    render(<ColorPalette showLabels={false} />)

    expect(
      screen.queryByText('Accessibility Information')
    ).not.toBeInTheDocument()
  })

  it('displays contrast ratios for colors', () => {
    render(<ColorPalette />)

    // Should show contrast ratios (mocked to return 4.5)
    const contrastRatios = screen.getAllByText('4.50:1')
    expect(contrastRatios.length).toBeGreaterThan(0)
  })

  it('shows contrast warnings for poor contrast', () => {
    // Mock poor contrast ratio
    mockGetContrastRatio.mockReturnValue(2.0)

    render(<ColorPalette />)

    // Should show warning indicators (!) for poor contrast
    const warningIndicators = screen.getAllByText('!')
    expect(warningIndicators.length).toBeGreaterThan(0)
  })

  it('enables interactive mode when interactive is true', () => {
    render(<ColorPalette interactive={true} />)

    // Color swatches should be clickable
    const colorSwatches = screen.getAllByRole('button')
    expect(colorSwatches.length).toBeGreaterThan(0)

    // Should show instruction about clicking
    expect(
      screen.getByText(/Click on any color swatch to edit it/)
    ).toBeInTheDocument()
  })

  it('calls onColorChange when color is changed in interactive mode', async () => {
    const mockOnColorChange = jest.fn()

    render(
      <ColorPalette interactive={true} onColorChange={mockOnColorChange} />
    )

    // Find and click a color swatch
    const primaryColorSwatch = screen.getByLabelText(/Primary color/)
    fireEvent.click(primaryColorSwatch)

    // Simulate color input change
    const colorInput = screen.getByLabelText(/Edit Primary color/)
    fireEvent.change(colorInput, { target: { value: '#FF0000' } })
    fireEvent.blur(colorInput)

    await waitFor(() => {
      expect(mockSetDashboardTheme).toHaveBeenCalled()
    })
  })

  it('handles keyboard navigation for interactive swatches', () => {
    render(<ColorPalette interactive={true} />)

    const primaryColorSwatch = screen.getByLabelText(/Primary color/)

    // Should be focusable
    expect(primaryColorSwatch).toHaveAttribute('tabIndex', '0')

    // Should respond to Enter key
    fireEvent.keyDown(primaryColorSwatch, { key: 'Enter' })

    // Color input should appear
    expect(screen.getByLabelText(/Edit Primary color/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ColorPalette className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders chart palette colors correctly', () => {
    render(<ColorPalette />)

    // Should show first 10 chart colors
    expect(screen.getByText('Chart 1')).toBeInTheDocument()
    expect(screen.getByText('Chart 10')).toBeInTheDocument()

    // Should not show Chart 11 (only first 10 are displayed)
    expect(screen.queryByText('Chart 11')).not.toBeInTheDocument()
  })

  it('handles color editing with keyboard shortcuts', async () => {
    const mockOnColorChange = jest.fn()

    render(
      <ColorPalette interactive={true} onColorChange={mockOnColorChange} />
    )

    // Click to start editing
    const primaryColorSwatch = screen.getByLabelText(/Primary color/)
    fireEvent.click(primaryColorSwatch)

    const colorInput = screen.getByLabelText(/Edit Primary color/)
    fireEvent.change(colorInput, { target: { value: '#FF0000' } })

    // Test Enter key to save
    fireEvent.keyDown(colorInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockSetDashboardTheme).toHaveBeenCalled()
    })
  })

  it('handles color editing cancellation with Escape key', async () => {
    render(<ColorPalette interactive={true} />)

    // Click to start editing
    const primaryColorSwatch = screen.getByLabelText(/Primary color/)
    fireEvent.click(primaryColorSwatch)

    const colorInput = screen.getByLabelText(/Edit Primary color/)
    fireEvent.change(colorInput, { target: { value: '#FF0000' } })

    // Test Escape key to cancel
    fireEvent.keyDown(colorInput, { key: 'Escape' })

    // Should not call setDashboardTheme
    expect(mockSetDashboardTheme).not.toHaveBeenCalled()
  })

  it('updates chart palette colors correctly', async () => {
    const mockOnColorChange = jest.fn()

    render(
      <ColorPalette interactive={true} onColorChange={mockOnColorChange} />
    )

    // Find a chart color swatch
    const chartColorSwatch = screen.getByLabelText(/Chart 1 color/)
    fireEvent.click(chartColorSwatch)

    const colorInput = screen.getByLabelText(/Edit Chart 1 color/)
    fireEvent.change(colorInput, { target: { value: '#FF0000' } })
    fireEvent.blur(colorInput)

    await waitFor(() => {
      expect(mockSetDashboardTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: expect.objectContaining({
            chart: expect.objectContaining({
              palette: expect.arrayContaining(['#FF0000']),
            }),
          }),
        })
      )
    })
  })

  it('displays proper ARIA labels for accessibility', () => {
    render(<ColorPalette />)

    expect(screen.getByLabelText('Primary color: #3F51B5')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Secondary color: #B19ADA')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Success color: #10B981')).toBeInTheDocument()
  })

  it('shows color names and hex values', () => {
    render(<ColorPalette />)

    // Should show color names
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()

    // Should show hex values in uppercase
    expect(screen.getByText('#3F51B5')).toBeInTheDocument()
    expect(screen.getByText('#B19ADA')).toBeInTheDocument()
    expect(screen.getByText('#10B981')).toBeInTheDocument()
  })
})
