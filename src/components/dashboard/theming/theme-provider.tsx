'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { DashboardTheme, ThemeProviderProps } from '@/types/dashboard'

type Theme = 'dark' | 'light' | 'system'

interface DashboardThemeProviderState {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  dashboardTheme: DashboardTheme
  setTheme: (theme: Theme) => void
  setDashboardTheme: (theme: Partial<DashboardTheme>) => void
  validateContrast: (foreground: string, background: string) => boolean
  getContrastRatio: (foreground: string, background: string) => number
}

// Default dashboard theme configuration
const defaultDashboardTheme: DashboardTheme = {
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
      palette: [
        '#3F51B5', '#B19ADA', '#FF6B35', '#10B981',
        '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6',
        '#EC4899', '#14B8A6'
      ],
      gradients: {
        primary: 'linear-gradient(135deg, #3F51B5 0%, #B19ADA 100%)',
        success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        error: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)'
      }
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px - Labels
      base: '1rem',     // 16px - Body
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px - H2 Semibold
      '3xl': '2rem'     // 32px - H1 Bold
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
  },
  spacing: {
    grid: {
      gap: '1.5rem',
      padding: '2rem',
      margin: '2rem'
    },
    card: {
      padding: '1.5rem',
      margin: '1rem'
    }
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
    wide: '1536px'
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}

// Dark theme overrides
const darkThemeOverrides: Partial<DashboardTheme> = {
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      disabled: '#64748B'
    }
  }
}

const initialState: DashboardThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  dashboardTheme: defaultDashboardTheme,
  setTheme: () => null,
  setDashboardTheme: () => null,
  validateContrast: () => false,
  getContrastRatio: () => 0
}

const DashboardThemeProviderContext = createContext<DashboardThemeProviderState>(initialState)

// Utility functions for color contrast validation
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

export function DashboardThemeProvider({
  children,
  theme: customTheme,
  defaultTheme = 'system',
  storageKey = 'cubcen-dashboard-theme',
  enableColorSchemeDetection = true,
  validateContrast = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage?.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  })

  const [dashboardTheme, setDashboardThemeState] = useState<DashboardTheme>(() => {
    return customTheme ? { ...defaultDashboardTheme, ...customTheme } : defaultDashboardTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

  // System theme detection
  useEffect(() => {
    if (!enableColorSchemeDetection) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(systemTheme)
        updateCSSVariables(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    handleChange() // Initial check

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, enableColorSchemeDetection, updateCSSVariables])

  // Update CSS variables when theme changes
  const updateCSSVariables = useCallback((currentTheme: 'dark' | 'light') => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    root.setAttribute('data-theme', currentTheme)
    root.classList.add(currentTheme)

    // Apply theme-specific overrides
    const themeToApply = currentTheme === 'dark' 
      ? { ...dashboardTheme, ...darkThemeOverrides }
      : dashboardTheme

    // Update CSS custom properties
    Object.entries(themeToApply.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--dashboard-${key}`, value)
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'string') {
            root.style.setProperty(`--dashboard-${key}-${subKey}`, subValue)
          } else if (Array.isArray(subValue)) {
            subValue.forEach((item, index) => {
              root.style.setProperty(`--dashboard-${key}-${index + 1}`, item)
            })
          } else if (typeof subValue === 'object') {
            Object.entries(subValue).forEach(([nestedKey, nestedValue]) => {
              root.style.setProperty(`--dashboard-${key}-${subKey}-${nestedKey}`, nestedValue as string)
            })
          }
        })
      }
    })

    // Update typography variables
    Object.entries(themeToApply.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--dashboard-text-${key}`, value)
    })

    Object.entries(themeToApply.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--dashboard-font-${key}`, value.toString())
    })

    Object.entries(themeToApply.typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--dashboard-line-height-${key}`, value.toString())
    })

    // Update spacing variables
    Object.entries(themeToApply.spacing.grid).forEach(([key, value]) => {
      root.style.setProperty(`--dashboard-grid-${key}`, value)
    })

    Object.entries(themeToApply.spacing.card).forEach(([key, value]) => {
      root.style.setProperty(`--dashboard-card-${key}`, value)
    })

    // Update animation variables
    Object.entries(themeToApply.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--dashboard-transition-${key}`, value)
    })

    Object.entries(themeToApply.animations.easing).forEach(([key, value]) => {
      root.style.setProperty(`--dashboard-ease-${key}`, value)
    })
  }, [dashboardTheme])

  // Apply theme changes
  useEffect(() => {
    const currentTheme = theme === 'system' ? resolvedTheme : theme as 'dark' | 'light'
    setResolvedTheme(currentTheme)
    updateCSSVariables(currentTheme)
  }, [theme, resolvedTheme, updateCSSVariables])

  // Contrast validation functions
  const validateContrastRatio = useCallback((foreground: string, background: string): boolean => {
    if (!validateContrast) return true
    const ratio = getContrastRatio(foreground, background)
    return ratio >= 4.5 // WCAG AA standard
  }, [validateContrast])

  const getContrastRatioValue = useCallback((foreground: string, background: string): number => {
    return getContrastRatio(foreground, background)
  }, [])

  // Theme setters
  const handleSetTheme = useCallback((newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage?.setItem(storageKey, newTheme)
    }
    setTheme(newTheme)
  }, [storageKey])

  const handleSetDashboardTheme = useCallback((newTheme: Partial<DashboardTheme>) => {
    const updatedTheme = { ...dashboardTheme, ...newTheme }
    
    // Validate contrast ratios if enabled
    if (validateContrast && newTheme.colors) {
      const { colors } = updatedTheme
      const background = colors.background
      
      // Validate text colors against background
      if (colors.text) {
        Object.entries(colors.text).forEach(([key, color]) => {
          const ratio = getContrastRatio(color, background)
          if (ratio < 4.5) {
            console.warn(`Dashboard theme: Text color "${key}" (${color}) does not meet WCAG AA contrast requirements against background (${background}). Ratio: ${ratio.toFixed(2)}`)
          }
        })
      }
      
      // Validate status colors against background
      if (colors.status) {
        Object.entries(colors.status).forEach(([key, color]) => {
          const ratio = getContrastRatio(color, background)
          if (ratio < 3.0) { // Lower requirement for non-text elements
            console.warn(`Dashboard theme: Status color "${key}" (${color}) may have insufficient contrast against background (${background}). Ratio: ${ratio.toFixed(2)}`)
          }
        })
      }
    }
    
    setDashboardThemeState(updatedTheme)
  }, [dashboardTheme, validateContrast])

  const value: DashboardThemeProviderState = {
    theme,
    resolvedTheme,
    dashboardTheme,
    setTheme: handleSetTheme,
    setDashboardTheme: handleSetDashboardTheme,
    validateContrast: validateContrastRatio,
    getContrastRatio: getContrastRatioValue
  }

  return (
    <DashboardThemeProviderContext.Provider {...props} value={value}>
      {children}
    </DashboardThemeProviderContext.Provider>
  )
}

export const useDashboardTheme = () => {
  const context = useContext(DashboardThemeProviderContext)

  if (context === undefined) {
    throw new Error('useDashboardTheme must be used within a DashboardThemeProvider')
  }

  return context
}

// Export for backward compatibility with existing theme provider
export { DashboardThemeProvider as ThemeProvider }
export const useTheme = () => {
  const { theme, setTheme } = useDashboardTheme()
  return { theme, setTheme }
}