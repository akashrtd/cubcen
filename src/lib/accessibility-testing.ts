/**
 * Accessibility testing utilities for automated WCAG compliance checks
 */

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  rule: string
  message: string
  element?: HTMLElement
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
}

interface AccessibilityReport {
  issues: AccessibilityIssue[]
  score: number
  totalChecks: number
  passedChecks: number
  timestamp: Date
}

export class AccessibilityTester {
  private issues: AccessibilityIssue[] = []

  /**
   * Run comprehensive accessibility audit
   */
  async audit(
    container: HTMLElement = document.body
  ): Promise<AccessibilityReport> {
    this.issues = []

    // Run all accessibility checks
    this.checkHeadingStructure(container)
    this.checkImageAltText(container)
    this.checkFormLabels(container)
    this.checkColorContrast(container)
    this.checkKeyboardNavigation(container)
    this.checkAriaAttributes(container)
    this.checkFocusManagement(container)
    this.checkSemanticHTML(container)
    this.checkTableAccessibility(container)
    this.checkLinkAccessibility(container)

    const totalChecks = 10
    const passedChecks =
      totalChecks - this.issues.filter(issue => issue.type === 'error').length
    const score = Math.round((passedChecks / totalChecks) * 100)

    return {
      issues: this.issues,
      score,
      totalChecks,
      passedChecks,
      timestamp: new Date(),
    }
  }

  /**
   * Check heading structure (h1-h6)
   */
  private checkHeadingStructure(container: HTMLElement) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))

      // Check for missing h1
      if (index === 0 && level !== 1) {
        this.addIssue({
          type: 'error',
          rule: 'heading-structure',
          message: 'Page should start with h1 heading',
          element: heading as HTMLElement,
          severity: 'serious',
        })
      }

      // Check for skipped heading levels
      if (level > previousLevel + 1) {
        this.addIssue({
          type: 'error',
          rule: 'heading-structure',
          message: `Heading level skipped from h${previousLevel} to h${level}`,
          element: heading as HTMLElement,
          severity: 'moderate',
        })
      }

      // Check for empty headings
      if (!heading.textContent?.trim()) {
        this.addIssue({
          type: 'error',
          rule: 'heading-content',
          message: 'Heading element is empty',
          element: heading as HTMLElement,
          severity: 'serious',
        })
      }

      previousLevel = level
    })
  }

  /**
   * Check image alt text
   */
  private checkImageAltText(container: HTMLElement) {
    const images = container.querySelectorAll('img')

    images.forEach(img => {
      const alt = img.getAttribute('alt')
      const ariaLabel = img.getAttribute('aria-label')
      const ariaLabelledBy = img.getAttribute('aria-labelledby')

      // Check for missing alt text
      if (alt === null && !ariaLabel && !ariaLabelledBy) {
        this.addIssue({
          type: 'error',
          rule: 'image-alt',
          message: 'Image missing alt text or aria-label',
          element: img,
          severity: 'critical',
        })
      }

      // Check for redundant alt text
      if (
        alt &&
        (alt.toLowerCase().includes('image') ||
          alt.toLowerCase().includes('picture'))
      ) {
        this.addIssue({
          type: 'warning',
          rule: 'image-alt',
          message: 'Alt text should not contain "image" or "picture"',
          element: img,
          severity: 'minor',
        })
      }
    })
  }

  /**
   * Check form labels
   */
  private checkFormLabels(container: HTMLElement) {
    const formControls = container.querySelectorAll('input, select, textarea')

    formControls.forEach(control => {
      const id = control.getAttribute('id')
      const ariaLabel = control.getAttribute('aria-label')
      const ariaLabelledBy = control.getAttribute('aria-labelledby')
      const label = id ? container.querySelector(`label[for="${id}"]`) : null

      if (!label && !ariaLabel && !ariaLabelledBy) {
        this.addIssue({
          type: 'error',
          rule: 'form-label',
          message: 'Form control missing label',
          element: control as HTMLElement,
          severity: 'critical',
        })
      }
    })
  }

  /**
   * Check color contrast (basic implementation)
   */
  private checkColorContrast(container: HTMLElement) {
    const textElements = container.querySelectorAll(
      'p, span, div, h1, h2, h3, h4, h5, h6, a, button, label'
    )

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // Skip if no text content
      if (!element.textContent?.trim()) return

      // Basic check - this would need a proper contrast calculation in production
      if (color === backgroundColor) {
        this.addIssue({
          type: 'error',
          rule: 'color-contrast',
          message: 'Text color same as background color',
          element: element as HTMLElement,
          severity: 'critical',
        })
      }
    })
  }

  /**
   * Check keyboard navigation
   */
  private checkKeyboardNavigation(container: HTMLElement) {
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]'
    )

    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex')

      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.addIssue({
          type: 'warning',
          rule: 'keyboard-navigation',
          message: 'Avoid positive tabindex values',
          element: element as HTMLElement,
          severity: 'moderate',
        })
      }

      // Check for missing focus styles
      const styles = window.getComputedStyle(element, ':focus-visible')
      if (!styles.outline && !styles.boxShadow) {
        this.addIssue({
          type: 'warning',
          rule: 'focus-visible',
          message: 'Interactive element missing focus styles',
          element: element as HTMLElement,
          severity: 'moderate',
        })
      }
    })
  }

  /**
   * Check ARIA attributes
   */
  private checkAriaAttributes(container: HTMLElement) {
    const elementsWithAria = container.querySelectorAll(
      '[aria-labelledby], [aria-describedby]'
    )

    elementsWithAria.forEach(element => {
      const labelledBy = element.getAttribute('aria-labelledby')
      const describedBy = element.getAttribute('aria-describedby')

      // Check if referenced elements exist
      if (labelledBy) {
        const labelElement = container.querySelector(`#${labelledBy}`)
        if (!labelElement) {
          this.addIssue({
            type: 'error',
            rule: 'aria-labelledby',
            message: `aria-labelledby references non-existent element: ${labelledBy}`,
            element: element as HTMLElement,
            severity: 'serious',
          })
        }
      }

      if (describedBy) {
        const descElement = container.querySelector(`#${describedBy}`)
        if (!descElement) {
          this.addIssue({
            type: 'error',
            rule: 'aria-describedby',
            message: `aria-describedby references non-existent element: ${describedBy}`,
            element: element as HTMLElement,
            severity: 'serious',
          })
        }
      }
    })
  }

  /**
   * Check focus management
   */
  private checkFocusManagement(container: HTMLElement) {
    const modals = container.querySelectorAll(
      '[role="dialog"], [role="alertdialog"]'
    )

    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length === 0) {
        this.addIssue({
          type: 'warning',
          rule: 'focus-management',
          message: 'Modal/dialog contains no focusable elements',
          element: modal as HTMLElement,
          severity: 'moderate',
        })
      }
    })
  }

  /**
   * Check semantic HTML
   */
  private checkSemanticHTML(container: HTMLElement) {
    // Check for proper landmark usage
    const main = container.querySelector('main')
    if (!main) {
      this.addIssue({
        type: 'warning',
        rule: 'semantic-html',
        message: 'Page missing main landmark',
        severity: 'moderate',
      })
    }

    // Check for generic div/span overuse
    const buttons = container.querySelectorAll('div[onclick], span[onclick]')
    buttons.forEach(button => {
      this.addIssue({
        type: 'error',
        rule: 'semantic-html',
        message: 'Use button element instead of div/span with click handler',
        element: button as HTMLElement,
        severity: 'serious',
      })
    })
  }

  /**
   * Check table accessibility
   */
  private checkTableAccessibility(container: HTMLElement) {
    const tables = container.querySelectorAll('table')

    tables.forEach(table => {
      const caption = table.querySelector('caption')
      const headers = table.querySelectorAll('th')

      if (
        !caption &&
        !table.getAttribute('aria-label') &&
        !table.getAttribute('aria-labelledby')
      ) {
        this.addIssue({
          type: 'warning',
          rule: 'table-caption',
          message: 'Table missing caption or aria-label',
          element: table,
          severity: 'moderate',
        })
      }

      if (headers.length === 0) {
        this.addIssue({
          type: 'error',
          rule: 'table-headers',
          message: 'Table missing header cells (th)',
          element: table,
          severity: 'serious',
        })
      }
    })
  }

  /**
   * Check link accessibility
   */
  private checkLinkAccessibility(container: HTMLElement) {
    const links = container.querySelectorAll('a')

    links.forEach(link => {
      const href = link.getAttribute('href')
      const text = link.textContent?.trim()

      // Check for empty links
      if (!text && !link.getAttribute('aria-label')) {
        this.addIssue({
          type: 'error',
          rule: 'link-text',
          message: 'Link missing accessible text',
          element: link,
          severity: 'critical',
        })
      }

      // Check for generic link text
      if (
        text &&
        ['click here', 'read more', 'more'].includes(text.toLowerCase())
      ) {
        this.addIssue({
          type: 'warning',
          rule: 'link-text',
          message: 'Link text should be descriptive',
          element: link,
          severity: 'minor',
        })
      }

      // Check for external links
      if (
        href &&
        (href.startsWith('http') || href.startsWith('//')) &&
        !link.getAttribute('aria-label')?.includes('external')
      ) {
        this.addIssue({
          type: 'info',
          rule: 'external-links',
          message: 'Consider indicating external links to users',
          element: link,
          severity: 'minor',
        })
      }
    })
  }

  private addIssue(issue: AccessibilityIssue) {
    this.issues.push(issue)
  }

  /**
   * Generate accessibility report
   */
  generateReport(report: AccessibilityReport): string {
    const { issues, score, totalChecks, passedChecks } = report

    let reportText = `Accessibility Audit Report\n`
    reportText += `Generated: ${report.timestamp.toLocaleString()}\n`
    reportText += `Score: ${score}/100 (${passedChecks}/${totalChecks} checks passed)\n\n`

    if (issues.length === 0) {
      reportText += 'No accessibility issues found! 🎉\n'
      return reportText
    }

    const groupedIssues = issues.reduce(
      (groups, issue) => {
        const key = issue.severity
        if (!groups[key]) groups[key] = []
        groups[key].push(issue)
        return groups
      },
      {} as Record<string, AccessibilityIssue[]>
    )

    const severityOrder = ['critical', 'serious', 'moderate', 'minor']

    severityOrder.forEach(severity => {
      const severityIssues = groupedIssues[severity]
      if (!severityIssues) return

      reportText += `${severity.toUpperCase()} Issues (${severityIssues.length}):\n`
      severityIssues.forEach((issue, index) => {
        reportText += `  ${index + 1}. [${issue.rule}] ${issue.message}\n`
        if (issue.element) {
          reportText += `     Element: ${issue.element.tagName.toLowerCase()}`
          if (issue.element.id) reportText += `#${issue.element.id}`
          if (issue.element.className)
            reportText += `.${issue.element.className.split(' ')[0]}`
          reportText += '\n'
        }
      })
      reportText += '\n'
    })

    return reportText
  }
}

// Create singleton instance
export const accessibilityTester = new AccessibilityTester()

// Development helper
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add global accessibility testing function
  ;(window as any).testAccessibility = async () => {
    const report = await accessibilityTester.audit()
    console.log(accessibilityTester.generateReport(report))
    return report
  }
}
