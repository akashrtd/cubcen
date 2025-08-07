import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TypographyScale } from '../typography-scale'

// Mock the theme provider context
const mockSetDashboardTheme = jest.fn()

jest.mock('../theme-provider', () => ({
  useDashboardTheme: () => ({
    dashboardTheme: {
      typography: {
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '2rem',
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
    },
    setDashboardTheme: mockSetDashboardTheme,
  }),
}))

describe('TypographyScale', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders typography scale title and description', () => {
    render(<TypographyScale />)

    expect(screen.getByText('Typography Scale')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Consistent typography hierarchy following WCAG accessibility guidelines/
      )
    ).toBeInTheDocument()
  })

  it('displays font family information', () => {
    render(<TypographyScale />)

    expect(screen.getByText('Font Families')).toBeInTheDocument()
    expect(screen.getByText('Sans Serif (Primary)')).toBeInTheDocument()
    expect(screen.getByText('Monospace (Code)')).toBeInTheDocument()

    // Should show font family lists
    expect(
      screen.getByText('Inter, system-ui, -apple-system, sans-serif')
    ).toBeInTheDocument()
    expect(
      screen.getByText('JetBrains Mono, Monaco, Consolas, monospace')
    ).toBeInTheDocument()
  })

  it('renders all typography items', () => {
    render(<TypographyScale />)

    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    expect(screen.getByText('Heading 2')).toBeInTheDocument()
    expect(screen.getByText('Heading 3')).toBeInTheDocument()
    expect(screen.getByText('Large Text')).toBeInTheDocument()
    expect(screen.getByText('Body Text')).toBeInTheDocument()
    expect(screen.getByText('Small Text / Labels')).toBeInTheDocument()
    expect(screen.getByText('Extra Small Text')).toBeInTheDocument()
  })

  it('displays typography specifications', () => {
    render(<TypographyScale />)

    // Should show font sizes
    expect(screen.getByText('2rem')).toBeInTheDocument() // H1
    expect(screen.getByText('1.5rem')).toBeInTheDocument() // H2
    expect(screen.getAllByText('1rem')).toHaveLength(2) // Body (appears twice)

    // Should show pixel equivalents
    expect(screen.getByText('(32px)')).toBeInTheDocument() // H1
    expect(screen.getByText('(24px)')).toBeInTheDocument() // H2
    expect(screen.getByText('(16px)')).toBeInTheDocument() // Body

    // Should show font weights
    expect(screen.getByText('700')).toBeInTheDocument() // Bold
    expect(screen.getAllByText('600')).toHaveLength(2) // Semibold (appears twice)
    expect(screen.getAllByText('400')).toHaveLength(2) // Normal (appears twice)
  })

  it('shows typography examples with correct styling', () => {
    render(<TypographyScale />)

    // Check that examples are rendered
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('displays WCAG compliance information when showSpecs is true', () => {
    render(<TypographyScale showSpecs={true} />)

    expect(screen.getByText('WCAG 2.1 AA Compliance')).toBeInTheDocument()
    expect(
      screen.getByText(/All text sizes meet minimum size requirements/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Line heights provide adequate spacing/)
    ).toBeInTheDocument()
  })

  it('hides WCAG compliance information when showSpecs is false', () => {
    render(<TypographyScale showSpecs={false} />)

    expect(screen.queryByText('WCAG 2.1 AA Compliance')).not.toBeInTheDocument()
  })

  it('enables interactive mode when interactive is true', () => {
    render(<TypographyScale interactive={true} />)

    // Should show Edit buttons
    const editButtons = screen.getAllByText('Edit')
    expect(editButtons.length).toBeGreaterThan(0)
  })

  it('allows editing typography values in interactive mode', async () => {
    const mockOnTypographyChange = jest.fn()

    render(
      <TypographyScale
        interactive={true}
        onTypographyChange={mockOnTypographyChange}
      />
    )

    // Find and click an Edit button
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    // Should show Save and Cancel buttons
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()

    // Should show input fields
    const sizeInput = screen.getByPlaceholderText('e.g., 1rem')
    expect(sizeInput).toBeInTheDocument()

    // Change the font size
    fireEvent.change(sizeInput, { target: { value: '2.5rem' } })

    // Click Save
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockSetDashboardTheme).toHaveBeenCalled()
    })
  })

  it('cancels editing when Cancel button is clicked', async () => {
    render(<TypographyScale interactive={true} />)

    // Start editing
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    // Change a value
    const sizeInput = screen.getByPlaceholderText('e.g., 1rem')
    fireEvent.change(sizeInput, { target: { value: '2.5rem' } })

    // Click Cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Should not call setDashboardTheme
    expect(mockSetDashboardTheme).not.toHaveBeenCalled()

    // Should return to Edit button
    expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
  })

  it('allows changing font weight in interactive mode', async () => {
    render(<TypographyScale interactive={true} />)

    // Start editing
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    // Find font weight select - look for the select element with the bold option
    const weightSelects = screen.getAllByRole('combobox')
    const weightSelect = weightSelects.find(select =>
      select.querySelector('option[value="700"]')
    )
    expect(weightSelect).toBeInTheDocument()

    fireEvent.change(weightSelect!, { target: { value: '600' } })

    // Save changes
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockSetDashboardTheme).toHaveBeenCalled()
    })
  })

  it('allows changing line height in interactive mode', async () => {
    render(<TypographyScale interactive={true} />)

    // Start editing
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    // Find line height input - look for number input with step="0.1"
    const lineHeightInputs = screen.getAllByRole('spinbutton')
    const lineHeightInput = lineHeightInputs.find(
      input => input.getAttribute('step') === '0.1'
    )
    expect(lineHeightInput).toBeInTheDocument()

    fireEvent.change(lineHeightInput!, { target: { value: '1.4' } })

    // Save changes
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockSetDashboardTheme).toHaveBeenCalled()
    })
  })

  it('displays font weight labels correctly', () => {
    render(<TypographyScale />)

    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getAllByText('Semibold')).toHaveLength(2) // Appears twice
    expect(screen.getAllByText('Normal')).toHaveLength(2) // Appears twice
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('displays line height labels correctly', () => {
    render(<TypographyScale />)

    expect(screen.getAllByText('Tight')).toHaveLength(2) // Appears twice
    expect(screen.getAllByText('Normal')).toHaveLength(4) // Appears multiple times (font weight + line height)
  })

  it('applies custom className', () => {
    const { container } = render(<TypographyScale className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('shows proper descriptions for each typography level', () => {
    render(<TypographyScale />)

    expect(
      screen.getByText('Main page headings and hero titles')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Section headings and card titles')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Default text for paragraphs and content')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Form labels, captions, and secondary information')
    ).toBeInTheDocument()
  })

  it('displays all WCAG compliance checkmarks', () => {
    render(<TypographyScale showSpecs={true} />)

    // Should show multiple checkmarks for compliance items
    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBe(5) // 5 compliance items
  })

  it('handles font family display correctly', () => {
    render(<TypographyScale />)

    // Should show font examples with correct styling
    const sansExample = screen.getByText(
      'The quick brown fox jumps over the lazy dog'
    )
    const monoExample = screen.getByText("const theme = 'dashboard'")

    expect(sansExample).toBeInTheDocument()
    expect(monoExample).toBeInTheDocument()
  })
})
