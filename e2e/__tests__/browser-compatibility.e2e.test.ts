import { test, expect, devices } from '@playwright/test'

// Test different browser configurations
const browsers = [
  { name: 'Chrome Desktop', ...devices['Desktop Chrome'] },
  { name: 'Firefox Desktop', ...devices['Desktop Firefox'] },
  { name: 'Safari Desktop', ...devices['Desktop Safari'] },
  { name: 'Chrome Mobile', ...devices['Pixel 5'] },
  { name: 'Safari Mobile', ...devices['iPhone 12'] },
  { name: 'Edge Desktop', ...devices['Desktop Edge'] },
]

const testUser = {
  email: 'admin@example.com',
  password: 'admin123',
}

browsers.forEach(({ name, ...device }) => {
  test.describe(`Browser Compatibility - ${name}`, () => {
    test.use(device)

    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/auth/login')
      await page.fill('[data-testid="email-input"]', testUser.email)
      await page.fill('[data-testid="password-input"]', testUser.password)
      await page.click('[data-testid="login-button"]')
      await expect(page).toHaveURL('/dashboard')
    })

    test(`dashboard loads correctly on ${name}`, async ({ page }) => {
      // Verify main dashboard elements
      await expect(page.locator('h1')).toContainText('Dashboard')
      await expect(page.locator('[data-testid="nav-sidebar"]')).toBeVisible()

      // Check if it's mobile or desktop layout
      if (name.includes('Mobile')) {
        await expect(
          page.locator('[data-testid="mobile-menu-toggle"]')
        ).toBeVisible()
      } else {
        await expect(
          page.locator('[data-testid="desktop-sidebar"]')
        ).toBeVisible()
      }

      // Verify KPI cards are visible
      await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible()
      await expect(
        page.locator('[data-testid="recent-activity"]')
      ).toBeVisible()
    })

    test(`navigation works on ${name}`, async ({ page }) => {
      // Test navigation to different pages
      const pages = [
        {
          link: '[data-testid="nav-analytics"]',
          url: '/dashboard/analytics',
          title: 'Analytics',
        },
        {
          link: '[data-testid="nav-platforms"]',
          url: '/dashboard/platforms',
          title: 'Platform Management',
        },
        {
          link: '[data-testid="nav-users"]',
          url: '/dashboard/users',
          title: 'User Management',
        },
        {
          link: '[data-testid="nav-settings"]',
          url: '/dashboard/settings',
          title: 'Settings',
        },
      ]

      for (const { link, url, title } of pages) {
        if (name.includes('Mobile')) {
          // Open mobile menu first
          await page.click('[data-testid="mobile-menu-toggle"]')
          await expect(
            page.locator('[data-testid="mobile-menu"]')
          ).toBeVisible()
        }

        await page.click(link)
        await expect(page).toHaveURL(url)
        await expect(page.locator('h1')).toContainText(title)

        // Navigate back to dashboard
        await page.click('[data-testid="nav-dashboard"]')
        await expect(page).toHaveURL('/dashboard')
      }
    })

    test(`forms work correctly on ${name}`, async ({ page }) => {
      // Test platform form
      if (name.includes('Mobile')) {
        await page.click('[data-testid="mobile-menu-toggle"]')
      }

      await page.click('[data-testid="nav-platforms"]')
      await page.click('[data-testid="add-platform-button"]')

      // Verify modal opens
      await expect(page.locator('[data-testid="platform-modal"]')).toBeVisible()

      // Fill form
      await page.fill('[data-testid="platform-name"]', `Test Platform ${name}`)
      await page.selectOption('[data-testid="platform-type"]', 'N8N')
      await page.fill(
        '[data-testid="platform-url"]',
        'https://test.example.com'
      )
      await page.fill('[data-testid="platform-api-key"]', 'test-key')

      // Test form validation
      await page.fill('[data-testid="platform-name"]', '') // Clear required field
      await page.click('[data-testid="save-platform-button"]')
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible()

      // Fix validation and save
      await page.fill('[data-testid="platform-name"]', `Test Platform ${name}`)
      await page.click('[data-testid="save-platform-button"]')

      // Verify modal closes
      await expect(
        page.locator('[data-testid="platform-modal"]')
      ).not.toBeVisible()
    })

    test(`charts and visualizations render on ${name}`, async ({ page }) => {
      // Navigate to analytics
      if (name.includes('Mobile')) {
        await page.click('[data-testid="mobile-menu-toggle"]')
      }

      await page.click('[data-testid="nav-analytics"]')
      await expect(page).toHaveURL('/dashboard/analytics')

      // Wait for charts to load
      await page.waitForTimeout(2000)

      // Verify charts are rendered
      await expect(
        page.locator('[data-testid="task-status-chart"]')
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="platform-distribution-chart"]')
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="daily-trends-chart"]')
      ).toBeVisible()

      // Check if charts have content (not just empty containers)
      const chartElements = await page
        .locator('[data-testid="task-status-chart"] svg')
        .count()
      expect(chartElements).toBeGreaterThan(0)

      // Test chart interactions (if supported on the device)
      if (!name.includes('Mobile')) {
        // Hover over chart elements (desktop only)
        await page.hover(
          '[data-testid="task-status-chart"] .recharts-pie-sector'
        )
        await expect(page.locator('.recharts-tooltip')).toBeVisible()
      }
    })

    test(`responsive design works on ${name}`, async ({ page }) => {
      const viewport = page.viewportSize()

      if (viewport && viewport.width < 768) {
        // Mobile-specific tests
        await expect(
          page.locator('[data-testid="mobile-menu-toggle"]')
        ).toBeVisible()
        await expect(
          page.locator('[data-testid="desktop-sidebar"]')
        ).not.toBeVisible()

        // Test mobile menu
        await page.click('[data-testid="mobile-menu-toggle"]')
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

        // Verify mobile layout for cards
        const kpiCards = page.locator('[data-testid="kpi-cards"]')
        await expect(kpiCards).toHaveCSS('flex-direction', 'column')
      } else {
        // Desktop-specific tests
        await expect(
          page.locator('[data-testid="desktop-sidebar"]')
        ).toBeVisible()
        await expect(
          page.locator('[data-testid="mobile-menu-toggle"]')
        ).not.toBeVisible()

        // Verify desktop layout
        const kpiCards = page.locator('[data-testid="kpi-cards"]')
        await expect(kpiCards).toHaveCSS('display', 'grid')
      }
    })

    test(`accessibility features work on ${name}`, async ({ page }) => {
      // Test keyboard navigation
      await page.keyboard.press('Tab')

      // Verify focus is visible
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Test skip links
      await page.keyboard.press('Tab')
      const skipLink = page.locator('[data-testid="skip-to-content"]')
      if (await skipLink.isVisible()) {
        await skipLink.click()
        const mainContent = page.locator('main')
        await expect(mainContent).toBeFocused()
      }

      // Test ARIA labels and roles
      await expect(page.locator('[role="navigation"]')).toBeVisible()
      await expect(page.locator('[role="main"]')).toBeVisible()

      // Test form labels
      if (name.includes('Mobile')) {
        await page.click('[data-testid="mobile-menu-toggle"]')
      }

      await page.click('[data-testid="nav-platforms"]')
      await page.click('[data-testid="add-platform-button"]')

      const nameInput = page.locator('[data-testid="platform-name"]')
      const nameLabel = page.locator('label[for="platform-name"]')

      await expect(nameLabel).toBeVisible()
      await expect(nameInput).toHaveAttribute('aria-describedby')
    })

    test(`performance is acceptable on ${name}`, async ({ page }) => {
      // Measure page load performance
      const startTime = Date.now()

      await page.goto('/dashboard/analytics')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Performance thresholds (adjust based on requirements)
      const maxLoadTime = name.includes('Mobile') ? 5000 : 3000
      expect(loadTime).toBeLessThan(maxLoadTime)

      // Check for console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      // Navigate through pages to check for errors
      await page.click('[data-testid="nav-platforms"]')
      await page.waitForLoadState('networkidle')

      await page.click('[data-testid="nav-users"]')
      await page.waitForLoadState('networkidle')

      // Allow some common non-critical errors but fail on critical ones
      const criticalErrors = errors.filter(
        error =>
          !error.includes('favicon') &&
          !error.includes('analytics') && // Allow analytics tracking errors
          !error.includes('third-party')
      )

      expect(criticalErrors).toHaveLength(0)
    })

    test(`local storage and session management work on ${name}`, async ({
      page,
    }) => {
      // Test theme persistence
      await page.click('[data-testid="theme-toggle"]')
      await page.click('[data-testid="theme-dark"]')

      // Verify dark theme is applied
      await expect(page.locator('html')).toHaveClass(/dark/)

      // Reload page and verify theme persists
      await page.reload()
      await expect(page.locator('html')).toHaveClass(/dark/)

      // Test user preferences
      await page.click('[data-testid="nav-settings"]')
      await page.click('[data-testid="notification-settings-tab"]')

      // Change a setting
      await page.click('[data-testid="email-notifications-toggle"]')
      await page.click('[data-testid="save-notifications-button"]')

      // Navigate away and back
      await page.click('[data-testid="nav-dashboard"]')
      await page.click('[data-testid="nav-settings"]')
      await page.click('[data-testid="notification-settings-tab"]')

      // Verify setting persisted
      await expect(
        page.locator('[data-testid="email-notifications-toggle"]')
      ).toBeChecked()
    })

    test(`error boundaries work correctly on ${name}`, async ({ page }) => {
      // Simulate a JavaScript error
      await page.addInitScript(() => {
        // Override a method to throw an error
        const originalFetch = window.fetch
        window.fetch = function (...args) {
          if (args[0]?.toString().includes('/api/cubcen/v1/error-test')) {
            throw new Error('Simulated error for testing')
          }
          return originalFetch.apply(this, args)
        }
      })

      // Trigger an error by navigating to a page that would cause the error
      await page.route('**/api/cubcen/v1/platforms', route => {
        route.fulfill({
          status: 500,
          body: 'Internal Server Error',
        })
      })

      await page.click('[data-testid="nav-platforms"]')

      // Verify error boundary catches the error
      await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        'Something went wrong'
      )

      // Test error recovery
      await page.unroute('**/api/cubcen/v1/platforms')
      await page.click('[data-testid="retry-button"]')

      // Verify page recovers
      await expect(
        page.locator('[data-testid="error-boundary"]')
      ).not.toBeVisible()
      await expect(
        page.locator('[data-testid="platforms-table"]')
      ).toBeVisible()
    })
  })
})

// Cross-browser compatibility test
test.describe('Cross-Browser Feature Compatibility', () => {
  test('CSS Grid and Flexbox support', async ({ page }) => {
    await page.goto('/dashboard')

    // Test CSS Grid support
    const gridContainer = page.locator('[data-testid="kpi-cards"]')
    await expect(gridContainer).toHaveCSS('display', 'grid')

    // Test Flexbox support
    const flexContainer = page.locator('[data-testid="nav-sidebar"]')
    await expect(flexContainer).toHaveCSS('display', 'flex')
  })

  test('Modern JavaScript features work', async ({ page }) => {
    // Test that modern JS features are supported or polyfilled
    const jsFeatures = await page.evaluate(() => {
      return {
        asyncAwait: typeof (async () => {}) === 'function',
        arrow: typeof (() => {}) === 'function',
        destructuring: (() => {
          try {
            const [a] = [1]
            return true
          } catch {
            return false
          }
        })(),
        templateLiterals: (() => {
          try {
            return `test` === 'test'
          } catch {
            return false
          }
        })(),
        fetch: typeof fetch === 'function',
        promise: typeof Promise === 'function',
      }
    })

    expect(jsFeatures.asyncAwait).toBe(true)
    expect(jsFeatures.arrow).toBe(true)
    expect(jsFeatures.destructuring).toBe(true)
    expect(jsFeatures.templateLiterals).toBe(true)
    expect(jsFeatures.fetch).toBe(true)
    expect(jsFeatures.promise).toBe(true)
  })

  test('Web APIs are available or polyfilled', async ({ page }) => {
    const webApis = await page.evaluate(() => {
      return {
        localStorage: typeof localStorage === 'object',
        sessionStorage: typeof sessionStorage === 'object',
        history: typeof history === 'object',
        location: typeof location === 'object',
        console: typeof console === 'object',
        JSON: typeof JSON === 'object',
      }
    })

    expect(webApis.localStorage).toBe(true)
    expect(webApis.sessionStorage).toBe(true)
    expect(webApis.history).toBe(true)
    expect(webApis.location).toBe(true)
    expect(webApis.console).toBe(true)
    expect(webApis.JSON).toBe(true)
  })
})
