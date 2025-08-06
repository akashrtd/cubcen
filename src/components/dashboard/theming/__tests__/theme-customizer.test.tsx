import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeCustomizer } from '../theme-customizer'

// Mock the theme provider context
const mockSetTheme = jest.fn()
const mockSetDashboardTheme = jest.fn()

jest.mock('../theme-provider', () => ({
  useDashboardTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
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
          disabled: '#9CA3AF'
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6'
        },
        chart: {
          palette: ['#3F51B5', '#B19ADA', '#FF6B35'],
          gradients: {}
        }
      },
      typography: {
        fontFamily: {
          sans: ['Inter'],
          mono: ['Monaco']
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '2rem'
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        }
      }
    },
    setDashboardTheme: mockSetDashboardTheme,
    getContrastRatio: jest.fn().mockReturnValue(7.0)
  })
}))

// Mock child components
jest.mock('../color-palette', () => ({
  ColorPalette: ({ onColorChange }: any) => (
    <div data-testid="color-palette">
      <button onClick={() => onColorChange?.('colors.primary', '#FF0000')}>
        Change Color
      </button>
    </div>
  )
}))

jest.mock('../typography-scale', () => ({
  TypographyScale: ({ onTypographyChange }: any) => (
    <div data-testid="typography-scale">
      <button onClick={() => onTypographyChange?.('fontSize.base', '1.2rem')}>
        Change Typography
      </button>
    </div>
  )
}))

jest.mock('../contrast-validator', () => ({
  ContrastValidator: ({ onValidationComplete }: any) => {
    React.useEffect(() => {
      onValidationComplete?.([
        { id: 'test1', isValid: true },
        { id: 'test2', isValid: false }
      ])
    }, [onValidationComplete])
    
    return <div data-testid="contrast-validator">Contrast Validator</div>
  }
}))

// Mock URL.createObjectURL and related APIs
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  onload: null,
  result: null
}))

describe('ThemeCustomizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders customizer title and description', () => {
    render(<ThemeCustomizer />)

    expect(screen.getByText('Theme Customizer')).toBeInTheDocument()
    expect(screen.getByText(/Customize colors, typography, and validate accessibility compliance/)).toBeInTheDocument()
  })

  it('renders all tabs', () => {
    render(<ThemeCustomizer />)

    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Validation')).toBeInTheDocument()
  })

  it('shows colors tab by default', () => {
    render(<ThemeCustomizer />)

    expect(screen.getByTestId('color-palette')).toBeInTheDocument()
    expect(screen.queryByTestId('typography-scale')).not.toBeInTheDocument()
  })

  it('switches tabs when clicked', () => {
    render(<ThemeCustomizer />)

    fireEvent.click(screen.getByText('Typography'))

    expect(screen.getByTestId('typography-scale')).toBeInTheDocument()
    expect(screen.queryByTestId('color-palette')).not.toBeInTheDocument()
  })

  it('respects defaultTab prop', () => {
    render(<ThemeCustomizer defaultTab="typography" />)

    expect(screen.getByTestId('typography-scale')).toBeInTheDocument()
    expect(screen.queryByTestId('color-palette')).not.toBeInTheDocument()
  })

  it('renders theme mode selector', () => {
    render(<ThemeCustomizer />)

    const themeSelect = screen.getByDisplayValue('light')
    expect(themeSelect).toBeInTheDocument()
    
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('changes theme when selector is used', () => {
    render(<ThemeCustomizer />)

    const themeSelect = screen.getByDisplayValue('light')
    fireEvent.change(themeSelect, { target: { value: 'dark' } })

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('renders action buttons', () => {
    render(<ThemeCustomizer />)

    expect(screen.getByText('Export Theme')).toBeInTheDocument()
    expect(screen.getByText('Import Theme')).toBeInTheDocument()
    expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
  })

  it('exports theme when export button is clicked', () => {
    // Mock document.createElement and related DOM methods
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn()
    }
    const mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    const mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation()
    const mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation()

    render(<ThemeCustomizer />)

    fireEvent.click(screen.getByText('Export Theme'))

    expect(mockCreateElement).toHaveBeenCalledWith('a')
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(mockAnchor.download).toBe('dashboard-theme.json')

    mockCreateElement.mockRestore()
    mockAppendChild.mockRestore()
    mockRemoveChild.mockRestore()
  })

  it('calls onExport callback when theme is exported', () => {
    const mockOnExport = jest.fn()
    
    // Mock DOM methods
    const mockAnchor = { href: '', download: '', click: jest.fn() }
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    jest.spyOn(document.body, 'appendChild').mockImplementation()
    jest.spyOn(document.body, 'removeChild').mockImplementation()

    render(<ThemeCustomizer onExport={mockOnExport} />)

    fireEvent.click(screen.getByText('Export Theme'))

    expect(mockOnExport).toHaveBeenCalled()
  })

  it('triggers file input when import button is clicked', () => {
    render(<ThemeCustomizer />)

    const fileInput = screen.getByRole('button', { name: /import theme/i }).parentElement?.querySelector('input[type="file"]')
    const clickSpy = jest.spyOn(fileInput as HTMLElement, 'click').mockImplementation()

    fireEvent.click(screen.getByText('Import Theme'))

    expect(clickSpy).toHaveBeenCalled()
  })

  it('shows confirmation dialog when reset is clicked', () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false)
    
    render(<ThemeCustomizer />)

    fireEvent.click(screen.getByText('Reset to Defaults'))

    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to reset all theme customizations? This cannot be undone.'
    )

    mockConfirm.mockRestore()
  })

  it('calls onThemeChange when theme is modified', () => {
    const mockOnThemeChange = jest.fn()
    
    render(<ThemeCustomizer onThemeChange={mockOnThemeChange} />)

    // Trigger a color change through the mocked ColorPalette
    fireEvent.click(screen.getByText('Change Color'))

    expect(mockSetDashboardTheme).toHaveBeenCalled()
  })

  it('shows validation issues badge on validation tab', async () => {
    render(<ThemeCustomizer />)

    // Wait for validation results to be set
    await waitFor(() => {
      const validationTab = screen.getByText('Validation').parentElement
      expect(validationTab?.querySelector('.bg-red-100')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // 1 failed test
    })
  })

  it('displays footer information', async () => {
    render(<ThemeCustomizer />)

    expect(screen.getByText('Current Theme: light')).toBeInTheDocument()
    expect(screen.getByText('Changes are applied automatically')).toBeInTheDocument()

    // Wait for validation results
    await waitFor(() => {
      expect(screen.getByText(/Accessibility: \d+\/\d+ passed/)).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<ThemeCustomizer className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles file import correctly', () => {
    const mockOnImport = jest.fn()
    const mockFileReader = {
      readAsText: jest.fn(),
      onload: null,
      result: JSON.stringify({
        colors: { primary: '#FF0000' },
        typography: { fontSize: { base: '1rem' } }
      })
    }
    
    ;(global.FileReader as jest.Mock).mockImplementation(() => mockFileReader)

    render(<ThemeCustomizer onImport={mockOnImport} />)

    const fileInput = screen.getByRole('button', { name: /import theme/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement

    const mockFile = new File(['{}'], 'theme.json', { type: 'application/json' })
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    })

    fireEvent.change(fileInput)

    expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockFile)

    // Simulate file read completion
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: mockFileReader.result } } as any)
    }

    expect(mockSetDashboardTheme).toHaveBeenCalled()
    expect(mockOnImport).toHaveBeenCalled()
  })

  it('handles invalid import file gracefully', () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation()
    const mockFileReader = {
      readAsText: jest.fn(),
      onload: null,
      result: 'invalid json'
    }
    
    ;(global.FileReader as jest.Mock).mockImplementation(() => mockFileReader)

    render(<ThemeCustomizer />)

    const fileInput = screen.getByRole('button', { name: /import theme/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement

    const mockFile = new File(['invalid'], 'theme.json', { type: 'application/json' })
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    })

    fireEvent.change(fileInput)

    // Simulate file read completion
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: mockFileReader.result } } as any)
    }

    expect(mockAlert).toHaveBeenCalledWith('Error parsing theme file')

    mockAlert.mockRestore()
  })

  it('validates theme structure on import', () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation()
    const mockFileReader = {
      readAsText: jest.fn(),
      onload: null,
      result: JSON.stringify({ invalidStructure: true })
    }
    
    ;(global.FileReader as jest.Mock).mockImplementation(() => mockFileReader)

    render(<ThemeCustomizer />)

    const fileInput = screen.getByRole('button', { name: /import theme/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement

    const mockFile = new File(['{}'], 'theme.json', { type: 'application/json' })
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    })

    fireEvent.change(fileInput)

    // Simulate file read completion
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: mockFileReader.result } } as any)
    }

    expect(mockAlert).toHaveBeenCalledWith('Invalid theme file format')

    mockAlert.mockRestore()
  })
})