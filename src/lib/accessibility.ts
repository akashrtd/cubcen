/**
 * Accessibility utilities for WCAG compliance
 */

/**
 * Generate unique IDs for form elements and ARIA attributes
 */
export function generateId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Announce content to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private focusStack: HTMLElement[] = []
  private trapElement: HTMLElement | null = null
  private previousFocus: HTMLElement | null = null

  /**
   * Save current focus and set new focus
   */
  saveFocus(newFocus?: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus)
    }

    if (newFocus) {
      newFocus.focus()
    }
  }

  /**
   * Restore previous focus
   */
  restoreFocus() {
    const previousFocus = this.focusStack.pop()
    if (previousFocus) {
      previousFocus.focus()
    }
  }

  /**
   * Trap focus within an element (for modals, dialogs)
   */
  trapFocus(element: HTMLElement) {
    this.trapElement = element
    this.previousFocus = document.activeElement as HTMLElement

    const focusableElements = this.getFocusableElements(element)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    element.addEventListener('keydown', this.handleTrapKeydown.bind(this))
  }

  /**
   * Release focus trap
   */
  releaseFocusTrap() {
    if (this.trapElement) {
      this.trapElement.removeEventListener('keydown', this.handleTrapKeydown.bind(this))
      this.trapElement = null
    }

    if (this.previousFocus) {
      this.previousFocus.focus()
      this.previousFocus = null
    }
  }

  private handleTrapKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !this.trapElement) return

    const focusableElements = this.getFocusableElements(this.trapElement)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  private getFocusableElements(element: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ')

    return Array.from(element.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigation {
  /**
   * Handle arrow key navigation for lists and grids
   */
  static handleArrowNavigation(
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical',
    gridColumns?: number
  ): number {
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          event.preventDefault()
          if (orientation === 'grid' && gridColumns) {
            newIndex = Math.max(0, currentIndex - gridColumns)
          } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1
          }
        }
        break

      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          event.preventDefault()
          if (orientation === 'grid' && gridColumns) {
            newIndex = Math.min(elements.length - 1, currentIndex + gridColumns)
          } else {
            newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0
          }
        }
        break

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          event.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1
        }
        break

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          event.preventDefault()
          newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0
        }
        break

      case 'Home':
        event.preventDefault()
        newIndex = 0
        break

      case 'End':
        event.preventDefault()
        newIndex = elements.length - 1
        break
    }

    if (newIndex !== currentIndex && elements[newIndex]) {
      elements[newIndex].focus()
    }

    return newIndex
  }

  /**
   * Handle Enter and Space key activation
   */
  static handleActivation(event: KeyboardEvent, callback: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  }
}

/**
 * Color contrast utilities
 */
export class ColorContrast {
  /**
   * Calculate relative luminance of a color
   */
  static getRelativeLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex)
    if (!rgb) return 0

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const l1 = this.getRelativeLuminance(color1)
    const l2 = this.getRelativeLuminance(color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Check if contrast ratio meets WCAG standards
   */
  static meetsWCAG(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
    const ratio = this.getContrastRatio(color1, color2)
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5
    }
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
}

/**
 * ARIA utilities
 */
export class AriaUtils {
  /**
   * Set ARIA expanded state
   */
  static setExpanded(element: HTMLElement, expanded: boolean) {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  /**
   * Set ARIA selected state
   */
  static setSelected(element: HTMLElement, selected: boolean) {
    element.setAttribute('aria-selected', selected.toString())
  }

  /**
   * Set ARIA pressed state for toggle buttons
   */
  static setPressed(element: HTMLElement, pressed: boolean) {
    element.setAttribute('aria-pressed', pressed.toString())
  }

  /**
   * Set ARIA checked state
   */
  static setChecked(element: HTMLElement, checked: boolean | 'mixed') {
    element.setAttribute('aria-checked', checked.toString())
  }

  /**
   * Set ARIA disabled state
   */
  static setDisabled(element: HTMLElement, disabled: boolean) {
    if (disabled) {
      element.setAttribute('aria-disabled', 'true')
    } else {
      element.removeAttribute('aria-disabled')
    }
  }

  /**
   * Set ARIA live region
   */
  static setLiveRegion(element: HTMLElement, politeness: 'polite' | 'assertive' | 'off' = 'polite') {
    element.setAttribute('aria-live', politeness)
    element.setAttribute('aria-atomic', 'true')
  }

  /**
   * Associate label with control
   */
  static associateLabel(control: HTMLElement, label: HTMLElement) {
    const labelId = label.id || generateId('label')
    label.id = labelId
    control.setAttribute('aria-labelledby', labelId)
  }

  /**
   * Associate description with control
   */
  static associateDescription(control: HTMLElement, description: HTMLElement) {
    const descId = description.id || generateId('desc')
    description.id = descId
    
    const existingDescribedBy = control.getAttribute('aria-describedby')
    const describedBy = existingDescribedBy ? `${existingDescribedBy} ${descId}` : descId
    control.setAttribute('aria-describedby', describedBy)
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReaderUtils {
  /**
   * Create visually hidden text for screen readers
   */
  static createScreenReaderText(text: string): HTMLSpanElement {
    const span = document.createElement('span')
    span.className = 'sr-only'
    span.textContent = text
    return span
  }

  /**
   * Check if screen reader is active
   */
  static isScreenReaderActive(): boolean {
    // This is a heuristic - not 100% reliable
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking ||
           false
  }

  /**
   * Announce status changes
   */
  static announceStatus(message: string, priority: 'polite' | 'assertive' = 'polite') {
    announceToScreenReader(message, priority)
  }
}

// Create singleton instances
export const focusManager = new FocusManager()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    focusManager.releaseFocusTrap()
  })
}