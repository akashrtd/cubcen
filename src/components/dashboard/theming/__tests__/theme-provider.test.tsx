import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DashboardThemeProvider, useDashboardTheme } from '../theme-provider'
import { DashboardTheme } from '@/types/dashboard'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Test component that uses the theme
function TestComponent() {
  const { 
    theme, 
    resolvedTheme, 
    dashboardTheme, 
    setTheme, 
    setDashboardTheme,
    validateContrast,
    getContrastRatio
  } = useDashboardTheme()

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <div data-testid="primary-color">{dashboardTheme.colors.primary}</div>
      <div data-testid="background-color">{dashboardTheme.colors.background}</div>
      <div data-testid="font-size-base">{dashboardTheme.typography.fontSize.base}</div>
      
      <button 
        data-testid="set-dark-theme" 
        onClick={() => setTheme('dark')}
      >
        Set Dark
      </button>
      
      <button 
        data-testid="set-light-theme" 
        onClick={() => setTheme('light')}
      >
        Set Light
      </button>
      
      <button 
        data-testid="set-system-theme" 
        onClick={() => setTheme('system')}
      >
        Set System
      </button>
      
      <button 
        data-testid="change-primary-color" 
        onClick={() => setDashboardTheme({ 
          colors: { 
            ...dashboardTheme.colors, 
            primary: '#FF0000' 
          } 
        })}
      >
        Change Primary
      </button>
      
      <div data-testid="contrast-valid">
        {validateContrast('#000000', '#FFFFFF').toString()}
      </div>
      
      <div data-testid="contrast-ratio">
        {getContrastRatio('#000000', '#FFFFFF').toFixed(2)}
      </div>
    </div>
  )
}

describe('DashboardThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Reset document classes
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders with default theme', () => {
    render(
      <DashboardThemeProvider>
        <TestComponent />
      </DashboardThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#3F51B5')
    expect(screen.getByTestId('background-color')).toHaveTextContent('#FFFFFF')
  })

  it('applies custom default theme', () => {
    render(
      <DashboardThemeProvider defaultTheme="dark">
        <TestComponent />
      </DashboardThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('loads theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')

    render(
      <DashboardThemeProvider>
        <TestComponent />
      </DashboardThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('changes theme and saves to localStorage', async () => {
    render(
      <DashboardThemeProvider>
        <TestComponent />
      </DashboardThemeProvider>
    )

    fireEvent.click(screen.getByTestId('set-dark-theme'))

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cubcen-dashboard-theme', 'dark')
  })

  it('applies custom storage key', () => {
    const customKey = 'custom-theme-key'
    
    render(
      <DashboardThemeProvider storageKey={customKey}>
        <TestComponent />
      </DashboardThemeProvider>
    )

    fireEvent.click(screen.getByTestId('set-dark-theme'))

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(customKey, 'dark')
  })

  it('applies custom dashboard theme', () => {
    const customTheme: Partial<DashboardTheme> = {
      colors: {
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF',
        background: '#F0F0F0',
        surface: '#E0E0E0',
        text: {
          primary: '#333333',
          secondary: '#666666',
          disabled: '#999999'
        },
        status: {
          success: '#00AA00',
          warning: '#FFAA00',
          error: '#AA0000',
          info: '#0000AA'
        },
        chart: {
          palette: ['#FF0000', '#00FF00', '#0000FF'],
          gradients: {
            primary: 'linear-gradient(135deg, #FF0000 0%, #00FF00 100%)'
          }
        }
      }
    }

    render(
      <DashboardThemeProvider theme={customTheme}>
        <TestComponent />
      </DashboardThemeProvider>
    )

    expect(screen.getByTestId('primary-color')).toHaveTextContent('#FF0000')
    expect(screen.getByTestId('background-color')).toHaveTextContent('#F0F0F0')
  })

  it('updates dashboard theme dynamically', async () => {
    render(
      <DashboardThemeProvider>
        <TestComponent />
      </DashboardThemeProvider>
    )

    expect(screen.getByTestId('primary-color')).toHaveTextContent('#3F51B5')

    fireEvent.click(screen.getByTestId('change-primary-color'))

    await waitFor(() => {
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#FF0000')
    })
  })

  it('validates contrast ratios correctly', () => {
    render(
      <DashboardThemeProvider validateContrast={true}>
        <TestComponent />
      </DashboardThemeProvider>
    )

    // Black on white should have high contrast (valid)
    expect(screen.getByTestId('contrast-valid')).toHaveTextContent('true')
    expect(screen.getByTestId('contrast-ratio')).toHaveTextContent('21.00')
  })

  it('disables contrast validation when specified', () => {
    render(
      <DashboardThemeProvider validateContrast={false}>
        <TestComponent />
      </DashboardThemeProvider>
    )

    // Should still return true even with validation disabled
    expect(screen.getByTestId('contrast-valid')).toHaveTextContent('true')
  })

  it('applies CSS classes and data attributes correctly', async () => {
    render(
      <DashboardThemeProvider>
        <TestComponent />
      </DashboardThemeProvider>
    )

    // Should start with light theme
    expect(document.documentElement).toHaveClass('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    fireEvent.click(screen.getByTestId('set-dark-theme'))

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
      expect(document.documentElement).not.toHaveClass('light')
    })
  })

  it('handles system theme detection', () => {
    // Mock system dark mode
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    render(
      <DashboardThemeProvider defaultTheme="system">
        <TestComponent />
      </DashboardThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useDashboardTheme must be used within a DashboardThemeProvider')

    consoleSpy.mockRestore()
  })

  it('logs contrast warnings for invalid colors', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const TestComponentWithBadContrast = () => {
      const { setDashboardTheme, dashboardTheme } = useDashboardTheme()
      
      React.useEffect(() => {
        // Set a color combination with poor contrast
        setDashboardTheme({
          colors: {
            ...dashboardTheme.colors,
            background: '#FFFFFF',
            text: {
              ...dashboardTheme.colors.text,
              primary: '#CCCCCC' // Poor contrast against white
            }
          }
        })
      }, [setDashboardTheme, dashboardTheme])

      return <div>Test</div>
    }

    render(
      <DashboardThemeProvider validateContrast={true}>
        <TestComponentWithBadContrast />
      </DashboardThemeProvider>
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('does not meet WCAG AA contrast requirements')
    )

    consoleSpy.mockRestore()
  })

  it('maintains typography settings', () => {
    render(
      <DashboardThemeProvider>
        <TestComponent />
      </DashboardThemeProvider>
    )

    expect(screen.getByTestId('font-size-base')).toHaveTextContent('1rem')
  })

  it('handles theme switching between all modes', async () => {
    render(
      <DashboardThemeProvider>
        <TestComponent />
      </DashboardThemeProvider>
    )

    // Start with system (light)
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')

    // Switch to dark
    fireEvent.click(screen.getByTestId('set-dark-theme'))
    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    })

    // Switch to light
    fireEvent.click(screen.getByTestId('set-light-theme'))
    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    })

    // Switch back to system
    fireEvent.click(screen.getByTestId('set-system-theme'))
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('system')
    })
  })
})