import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContrastValidator } from '../contrast-validator'

// Mock the theme provider context
const mockGetContrastRatio = jest.fn()

jest.mock('../theme-provider', () => ({
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
      },
    },
    getContrastRatio: mockGetContrastRatio,
  }),
}))

describe('ContrastValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock good contrast ratios by default
    mockGetContrastRatio.mockReturnValue(7.0)
  })

  it('renders validator title and description', () => {
    render(<ContrastValidator />)

    expect(screen.getByText('Contrast Validation')).toBeInTheDocument()
    expect(
      screen.getByText('WCAG 2.1 accessibility compliance check')
    ).toBeInTheDocument()
  })

  it('shows validate button', () => {
    render(<ContrastValidator />)

    expect(screen.getByText('Validate')).toBeInTheDocument()
  })

  it('displays WCAG guidelines', () => {
    render(<ContrastValidator />)

    expect(
      screen.getByText('WCAG 2.1 Contrast Requirements')
    ).toBeInTheDocument()
    expect(screen.getByText('AA: 4.5:1 minimum')).toBeInTheDocument()
    expect(screen.getByText('AAA: 7:1 minimum')).toBeInTheDocument()
  })

  it('runs validation automatically when autoValidate is true', async () => {
    render(<ContrastValidator autoValidate={true} />)

    await waitFor(() => {
      expect(mockGetContrastRatio).toHaveBeenCalled()
    })

    // Should show summary after validation
    expect(screen.getByText('Passed Tests')).toBeInTheDocument()
  })

  it('does not run validation automatically when autoValidate is false', () => {
    render(<ContrastValidator autoValidate={false} />)

    expect(mockGetContrastRatio).not.toHaveBeenCalled()
  })

  it('runs validation when validate button is clicked', async () => {
    render(<ContrastValidator autoValidate={false} />)

    fireEvent.click(screen.getByText('Validate'))

    await waitFor(() => {
      expect(mockGetContrastRatio).toHaveBeenCalled()
    })
  })

  it('displays validation summary with good contrast', async () => {
    mockGetContrastRatio.mockReturnValue(7.0) // Good contrast

    render(<ContrastValidator autoValidate={true} />)

    await waitFor(() => {
      expect(screen.getByText('Passed Tests')).toBeInTheDocument()
      expect(screen.getByText('Failed Tests')).toBeInTheDocument()
      expect(screen.getByText('AAA Level')).toBeInTheDocument()
    })

    // Should show high number of passed tests
    const passedCount = screen.getAllByText(/^\d+$/)[0] // First number should be passed tests
    expect(passedCount).toBeInTheDocument()
  })

  it('displays failed tests with poor contrast', async () => {
    mockGetContrastRatio.mockReturnValue(2.0) // Poor contrast

    render(<ContrastValidator autoValidate={true} />)

    await waitFor(() => {
      expect(screen.getByText('Failed Tests')).toBeInTheDocument()
    })

    // Should show failed tests section
    await waitFor(() => {
      const failedSection = screen.queryByText(/Failed Tests \(\d+\)/)
      expect(failedSection).toBeInTheDocument()
    })
  })

  it('shows detailed results when showDetails is true', async () => {
    render(<ContrastValidator showDetails={true} autoValidate={true} />)

    await waitFor(() => {
      expect(screen.getByText('Detailed Results')).toBeInTheDocument()
    })
  })

  it('hides detailed results when showDetails is false', async () => {
    render(<ContrastValidator showDetails={false} autoValidate={true} />)

    await waitFor(() => {
      expect(mockGetContrastRatio).toHaveBeenCalled()
    })

    expect(screen.queryByText('Detailed Results')).not.toBeInTheDocument()
  })

  it('calls onValidationComplete callback', async () => {
    const mockCallback = jest.fn()

    render(
      <ContrastValidator
        autoValidate={true}
        onValidationComplete={mockCallback}
      />
    )

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            contrastRatio: expect.any(Number),
            wcagLevel: expect.any(String),
            isValid: expect.any(Boolean),
          }),
        ])
      )
    })
  })

  it('shows loading state during validation', async () => {
    // Make the contrast ratio calculation async to test loading state
    mockGetContrastRatio.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(7.0), 100))
    })

    render(<ContrastValidator autoValidate={false} />)

    fireEvent.click(screen.getByText('Validate'))

    expect(screen.getByText('Validating...')).toBeInTheDocument()
    expect(screen.getByText('Validating...')).toBeDisabled()
  })

  it('generates appropriate recommendations for failed tests', async () => {
    mockGetContrastRatio.mockReturnValue(2.0) // Poor contrast

    render(<ContrastValidator autoValidate={true} showDetails={true} />)

    await waitFor(() => {
      expect(
        screen.getByText(/Increase contrast by approximately/)
      ).toBeInTheDocument()
    })
  })

  it('generates appropriate recommendations for AA level tests', async () => {
    mockGetContrastRatio.mockReturnValue(5.0) // AA level but not AAA

    render(<ContrastValidator autoValidate={true} showDetails={true} />)

    await waitFor(() => {
      expect(
        screen.getByText(/Consider increasing contrast by/)
      ).toBeInTheDocument()
    })
  })

  it('shows excellent message for AAA level tests', async () => {
    mockGetContrastRatio.mockReturnValue(8.0) // AAA level

    render(<ContrastValidator autoValidate={true} showDetails={true} />)

    await waitFor(() => {
      expect(
        screen.getByText(/Excellent contrast - meets WCAG AAA standards/)
      ).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<ContrastValidator className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('validates different color combinations', async () => {
    render(<ContrastValidator autoValidate={true} />)

    await waitFor(() => {
      expect(mockGetContrastRatio).toHaveBeenCalled()
    })

    // Should test text colors against backgrounds
    expect(mockGetContrastRatio).toHaveBeenCalledWith('#1A1A1A', '#FFFFFF') // primary text on background
    expect(mockGetContrastRatio).toHaveBeenCalledWith('#6B7280', '#FFFFFF') // secondary text on background
    expect(mockGetContrastRatio).toHaveBeenCalledWith('#1A1A1A', '#F8F9FA') // primary text on surface

    // Should test UI colors
    expect(mockGetContrastRatio).toHaveBeenCalledWith('#3F51B5', '#FFFFFF') // primary on background
    expect(mockGetContrastRatio).toHaveBeenCalledWith('#10B981', '#FFFFFF') // success on background
  })

  it('displays color swatches in results', async () => {
    render(<ContrastValidator autoValidate={true} showDetails={true} />)

    await waitFor(() => {
      // Should show color swatches in the detailed results
      const colorSwatches = screen
        .getAllByRole('generic')
        .filter(
          el => el.style.backgroundColor && el.className.includes('w-4 h-4')
        )
      expect(colorSwatches.length).toBeGreaterThan(0)
    })
  })

  it('categorizes results by WCAG level correctly', async () => {
    // Mock different contrast ratios for different tests
    mockGetContrastRatio
      .mockReturnValueOnce(8.0) // AAA
      .mockReturnValueOnce(5.0) // AA
      .mockReturnValueOnce(2.0) // FAIL
      .mockReturnValue(7.0) // Default AAA for remaining tests

    render(<ContrastValidator autoValidate={true} showDetails={true} />)

    await waitFor(() => {
      expect(screen.getByText('AAA')).toBeInTheDocument()
      expect(screen.getByText('AA')).toBeInTheDocument()
      expect(screen.getByText('FAIL')).toBeInTheDocument()
    })
  })
})
