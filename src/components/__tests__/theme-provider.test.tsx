import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../theme-provider'

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
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

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset document classes
    document.documentElement.className = ''
  })

  it('provides default theme context', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })

  it('uses defaultTheme prop', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
  })

  it('loads theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('light')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
  })

  it('allows changing theme to light', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const lightButton = screen.getByText('Set Light')
    fireEvent.click(lightButton)

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'light')
  })

  it('allows changing theme to dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const darkButton = screen.getByText('Set Dark')
    fireEvent.click(darkButton)

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'dark')
  })

  it('allows changing theme to system', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    )

    const systemButton = screen.getByText('Set System')
    fireEvent.click(systemButton)

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'system')
  })

  it('applies dark class to document when theme is dark', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from document when theme is light', () => {
    // Start with dark theme
    document.documentElement.classList.add('dark')

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('applies system theme based on media query', () => {
    // Mock system preference for dark mode
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
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('updates theme when system preference changes', () => {
    let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null

    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn().mockImplementation((event, callback) => {
        if (event === 'change') {
          mediaQueryCallback = callback
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    )

    // Initially light (matches: false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // Simulate system preference change to dark
    if (mediaQueryCallback) {
      mediaQueryCallback({ matches: true } as MediaQueryListEvent)
    }

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('uses custom storageKey prop', () => {
    render(
      <ThemeProvider storageKey="custom-theme">
        <TestComponent />
      </ThemeProvider>
    )

    const lightButton = screen.getByText('Set Light')
    fireEvent.click(lightButton)

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'custom-theme',
      'light'
    )
  })

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    expect(() => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
    }).not.toThrow()

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })

  it('handles setItem localStorage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const lightButton = screen.getByText('Set Light')

    expect(() => {
      fireEvent.click(lightButton)
    }).not.toThrow()

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
  })

  it('provides theme attribute for CSS styling', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent />
      </ThemeProvider>
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('disables system theme when disableTransitionOnChange is true', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    )

    const darkButton = screen.getByText('Set Dark')
    fireEvent.click(darkButton)

    // Should temporarily add style to disable transitions
    expect(document.documentElement.style.cssText).toContain('transition: none')
  })

  it('throws error when useTheme is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const ComponentWithoutProvider = () => {
      useTheme()
      return <div>Test</div>
    }

    expect(() => {
      try {
      render(<ComponentWithoutProvider />)
    } catch (e) {
      // ignore
    }
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleSpy.mockRestore()
  })

  it('cleans up event listeners on unmount', () => {
    const removeEventListener = jest.fn()

    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener,
      dispatchEvent: jest.fn(),
    }))

    const { unmount } = render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    )

    unmount()

    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('handles invalid theme values gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-theme')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Should fall back to default theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })
})
