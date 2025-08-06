import {
  calculateColSpan,
  calculateRowSpan,
  calculateOrder,
  generateColSpanClasses,
  generateRowSpanClasses,
  generateOrderClasses,
  calculateOptimalCardSpan,
  getCurrentBreakpoint,
  isResponsiveValue,
  resolveResponsiveValue,
  generateGridCustomProperties,
  validateGridConfig,
  autoArrangeCards,
  DEFAULT_BREAKPOINTS,
  DEFAULT_GRID_COLUMNS,
} from '../grid-utils'

describe('Grid Utils', () => {
  describe('calculateColSpan', () => {
    it('calculates column span for numeric values', () => {
      expect(calculateColSpan(4, 'desktop')).toBe(4)
      expect(calculateColSpan(15, 'desktop', 12)).toBe(12) // Clamped to max
    })

    it('calculates column span for responsive values', () => {
      const responsive = { mobile: 1, tablet: 3, desktop: 6 }
      
      expect(calculateColSpan(responsive, 'mobile')).toBe(1)
      expect(calculateColSpan(responsive, 'tablet')).toBe(3)
      expect(calculateColSpan(responsive, 'desktop')).toBe(6)
    })

    it('falls back to other breakpoints when value is missing', () => {
      const responsive = { desktop: 8 }
      
      expect(calculateColSpan(responsive, 'mobile')).toBe(8)
      expect(calculateColSpan(responsive, 'tablet')).toBe(8)
    })

    it('uses fallback value when no responsive values match', () => {
      const responsive = {}
      
      expect(calculateColSpan(responsive, 'mobile')).toBe(1)
    })
  })

  describe('calculateRowSpan', () => {
    it('calculates row span for numeric values', () => {
      expect(calculateRowSpan(2, 'desktop')).toBe(2)
      expect(calculateRowSpan(10, 'desktop', 6)).toBe(6) // Clamped to max
    })

    it('calculates row span for responsive values', () => {
      const responsive = { mobile: 1, tablet: 2, desktop: 3 }
      
      expect(calculateRowSpan(responsive, 'mobile')).toBe(1)
      expect(calculateRowSpan(responsive, 'tablet')).toBe(2)
      expect(calculateRowSpan(responsive, 'desktop')).toBe(3)
    })
  })

  describe('calculateOrder', () => {
    it('calculates order for numeric values', () => {
      expect(calculateOrder(3, 'desktop')).toBe(3)
      expect(calculateOrder(undefined, 'desktop')).toBeUndefined()
    })

    it('calculates order for responsive values', () => {
      const responsive = { mobile: 1, tablet: 2, desktop: 3 }
      
      expect(calculateOrder(responsive, 'mobile')).toBe(1)
      expect(calculateOrder(responsive, 'tablet')).toBe(2)
      expect(calculateOrder(responsive, 'desktop')).toBe(3)
    })
  })

  describe('generateColSpanClasses', () => {
    it('generates classes for numeric column span', () => {
      expect(generateColSpanClasses(4)).toBe('col-span-4')
      expect(generateColSpanClasses(15)).toBe('col-span-12') // Clamped
    })

    it('generates classes for responsive column span', () => {
      const responsive = { mobile: 1, tablet: 3, desktop: 6 }
      const result = generateColSpanClasses(responsive)
      
      expect(result).toBe('col-span-1 md:col-span-3 lg:col-span-6')
    })

    it('handles partial responsive values', () => {
      const responsive = { desktop: 8 }
      const result = generateColSpanClasses(responsive)
      
      expect(result).toBe('lg:col-span-8')
    })

    it('clamps values to maximum limits', () => {
      const responsive = { mobile: 5, tablet: 10, desktop: 20 }
      const result = generateColSpanClasses(responsive)
      
      expect(result).toBe('col-span-1 md:col-span-6 lg:col-span-12')
    })
  })

  describe('generateRowSpanClasses', () => {
    it('generates classes for numeric row span', () => {
      expect(generateRowSpanClasses(2)).toBe('row-span-2')
      expect(generateRowSpanClasses(1)).toBe('') // No class for span 1
      expect(generateRowSpanClasses(10)).toBe('row-span-6') // Clamped
    })

    it('generates classes for responsive row span', () => {
      const responsive = { mobile: 2, tablet: 3, desktop: 4 }
      const result = generateRowSpanClasses(responsive)
      
      expect(result).toBe('row-span-2 md:row-span-3 lg:row-span-4')
    })

    it('skips classes for span value of 1', () => {
      const responsive = { mobile: 1, tablet: 2, desktop: 3 }
      const result = generateRowSpanClasses(responsive)
      
      expect(result).toBe('md:row-span-2 lg:row-span-3')
    })
  })

  describe('generateOrderClasses', () => {
    it('generates classes for numeric order', () => {
      expect(generateOrderClasses(3)).toBe('order-3')
      expect(generateOrderClasses(undefined)).toBe('')
      expect(generateOrderClasses(15)).toBe('order-12') // Clamped
    })

    it('generates classes for responsive order', () => {
      const responsive = { mobile: 1, tablet: 2, desktop: 3 }
      const result = generateOrderClasses(responsive)
      
      expect(result).toBe('order-1 md:order-2 lg:order-3')
    })
  })

  describe('calculateOptimalCardSpan', () => {
    it('calculates optimal card span for different breakpoints', () => {
      expect(calculateOptimalCardSpan(6, 'mobile')).toBe(1) // 1/1 = 1
      expect(calculateOptimalCardSpan(6, 'tablet')).toBe(3) // 6/2 = 3
      expect(calculateOptimalCardSpan(6, 'desktop')).toBe(4) // 12/3 = 4
    })

    it('handles different card counts', () => {
      expect(calculateOptimalCardSpan(3, 'desktop')).toBe(4)
      expect(calculateOptimalCardSpan(9, 'desktop')).toBe(4)
    })
  })

  describe('getCurrentBreakpoint', () => {
    it('returns correct breakpoint for different widths', () => {
      expect(getCurrentBreakpoint(500)).toBe('mobile')
      expect(getCurrentBreakpoint(800)).toBe('tablet')
      expect(getCurrentBreakpoint(1400)).toBe('desktop')
    })

    it('handles edge cases', () => {
      expect(getCurrentBreakpoint(768)).toBe('tablet') // Exactly at mobile breakpoint
      expect(getCurrentBreakpoint(1280)).toBe('desktop') // Exactly at desktop breakpoint
    })
  })

  describe('isResponsiveValue', () => {
    it('identifies responsive value objects', () => {
      expect(isResponsiveValue({ mobile: 1, desktop: 2 })).toBe(true)
      expect(isResponsiveValue({})).toBe(true)
      expect(isResponsiveValue(5)).toBe(false)
      expect(isResponsiveValue('string')).toBe(false)
      expect(isResponsiveValue(null)).toBe(false)
      expect(isResponsiveValue([1, 2, 3])).toBe(false)
    })
  })

  describe('resolveResponsiveValue', () => {
    it('resolves responsive values for specific breakpoints', () => {
      const responsive = { mobile: 1, tablet: 2, desktop: 3 }
      
      expect(resolveResponsiveValue(responsive, 'mobile', 0)).toBe(1)
      expect(resolveResponsiveValue(responsive, 'tablet', 0)).toBe(2)
      expect(resolveResponsiveValue(responsive, 'desktop', 0)).toBe(3)
    })

    it('returns non-responsive values as-is', () => {
      expect(resolveResponsiveValue(5, 'desktop', 0)).toBe(5)
      expect(resolveResponsiveValue('test', 'mobile', 'fallback')).toBe('test')
    })

    it('uses fallback when no matching value found', () => {
      const responsive = {}
      
      expect(resolveResponsiveValue(responsive, 'mobile', 'fallback')).toBe('fallback')
    })

    it('falls back through breakpoints', () => {
      const responsive = { desktop: 'desktop-value' }
      
      expect(resolveResponsiveValue(responsive, 'mobile', 'fallback')).toBe('desktop-value')
    })
  })

  describe('generateGridCustomProperties', () => {
    it('generates CSS custom properties for grid columns', () => {
      const responsive = { mobile: 1, tablet: 6, desktop: 12 }
      const result = generateGridCustomProperties(responsive)
      
      expect(result).toEqual({
        '--dashboard-grid-columns-mobile': '1',
        '--dashboard-grid-columns-tablet': '6',
        '--dashboard-grid-columns-desktop': '12'
      })
    })
  })

  describe('validateGridConfig', () => {
    it('validates valid grid configurations', () => {
      expect(validateGridConfig({ columns: 12 })).toBe(true)
      expect(validateGridConfig({ 
        responsive: { mobile: 1, tablet: 6, desktop: 12 }
      })).toBe(true)
    })

    it('rejects invalid column counts', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      expect(validateGridConfig({ columns: 0 })).toBe(false)
      expect(validateGridConfig({ columns: 25 })).toBe(false)
      
      expect(consoleSpy).toHaveBeenCalledWith('Grid columns should be between 1 and 24')
      
      consoleSpy.mockRestore()
    })

    it('rejects invalid responsive values', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      expect(validateGridConfig({ 
        responsive: { mobile: 0, tablet: 6, desktop: 12 }
      })).toBe(false)
      
      expect(validateGridConfig({ 
        responsive: { mobile: 1, tablet: 15, desktop: 12 }
      })).toBe(false)
      
      expect(validateGridConfig({ 
        responsive: { mobile: 1, tablet: 6, desktop: 30 }
      })).toBe(false)
      
      expect(consoleSpy).toHaveBeenCalledWith('Mobile grid columns should be between 1 and 12')
      expect(consoleSpy).toHaveBeenCalledWith('Tablet grid columns should be between 1 and 12')
      expect(consoleSpy).toHaveBeenCalledWith('Desktop grid columns should be between 1 and 24')
      
      consoleSpy.mockRestore()
    })
  })

  describe('autoArrangeCards', () => {
    it('auto-arranges cards with optimal spans', () => {
      const result = autoArrangeCards(6, 'desktop')
      
      expect(result).toHaveLength(6)
      expect(result[0]).toEqual({ colSpan: 4, priority: 'critical' })
      expect(result[1]).toEqual({ colSpan: 4, priority: 'high' })
      expect(result[2]).toEqual({ colSpan: 4, priority: 'high' })
      expect(result[3]).toEqual({ colSpan: 4, priority: 'medium' })
    })

    it('handles different breakpoints', () => {
      const mobileResult = autoArrangeCards(3, 'mobile')
      const tabletResult = autoArrangeCards(3, 'tablet')
      const desktopResult = autoArrangeCards(3, 'desktop')
      
      expect(mobileResult[0].colSpan).toBe(1)
      expect(tabletResult[0].colSpan).toBe(3)
      expect(desktopResult[0].colSpan).toBe(4)
    })

    it('assigns priorities correctly', () => {
      const result = autoArrangeCards(5, 'desktop')
      
      expect(result[0].priority).toBe('critical')
      expect(result[1].priority).toBe('high')
      expect(result[2].priority).toBe('high')
      expect(result[3].priority).toBe('medium')
      expect(result[4].priority).toBe('medium')
    })
  })

  describe('Constants', () => {
    it('exports correct default breakpoints', () => {
      expect(DEFAULT_BREAKPOINTS).toEqual({
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      })
    })

    it('exports correct default grid columns', () => {
      expect(DEFAULT_GRID_COLUMNS).toEqual({
        mobile: 1,
        tablet: 6,
        desktop: 12
      })
    })
  })
})