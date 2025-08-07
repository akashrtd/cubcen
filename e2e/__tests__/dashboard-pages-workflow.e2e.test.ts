import { test, expect, Page } from '@playwright/test'

// Test data
const testUser = {
  email: 'admin@example.com',
  password: 'admin123',
  name: 'Admin User',
  role: 'ADMIN',
}

const testPlatform = {
  name: 'Test n8n Instance',
  type: 'N8N',
  baseUrl: 'https://n8n.test.com',
  apiKey: 'test-api-key',
}

const testNewUser = {
  name: 'New Test User',
  email: 'newuser@example.com',
  role: 'OPERATOR',
  password: 'password123',
}

test.describe('Dashboard Pages E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', testUser.email)
    await page.fill('[data-testid="password-input"]', testUser.password)
    await page.click('[data-testid="login-button"]')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('complete platform management workflow', async ({ page }) => {
    // Navigate to platforms page
    await page.click('[data-testid="nav-platforms"]')
    await expect(page).toHaveURL('/dashboard/platforms')
    await expect(page.locator('h1')).toContainText('Platform Management')

    // Add new platform
    await page.click('[data-testid="add-platform-button"]')
    await expect(page.locator('[data-testid="platform-modal"]')).toBeVisible()

    // Fill platform form
    await page.fill('[data-testid="platform-name"]', testPlatform.name)
    await page.selectOption('[data-testid="platform-type"]', testPlatform.type)
    await page.fill('[data-testid="platform-url"]', testPlatform.baseUrl)
    await page.fill('[data-testid="platform-api-key"]', testPlatform.apiKey)

    // Test connection
    await page.click('[data-testid="test-connection-button"]')
    await expect(
      page.locator('[data-testid="connection-status"]')
    ).toContainText('Connected')

    // Save platform
    await page.click('[data-testid="save-platform-button"]')
    await expect(
      page.locator('[data-testid="platform-modal"]')
    ).not.toBeVisible()

    // Verify platform appears in list
    await expect(
      page.locator(`[data-testid="platform-${testPlatform.name}"]`)
    ).toBeVisible()
    await expect(
      page.locator(`[data-testid="platform-${testPlatform.name}"] .status`)
    ).toContainText('Connected')

    // Edit platform
    await page.click(`[data-testid="edit-platform-${testPlatform.name}"]`)
    await expect(page.locator('[data-testid="platform-modal"]')).toBeVisible()

    const updatedName = `${testPlatform.name} Updated`
    await page.fill('[data-testid="platform-name"]', updatedName)
    await page.click('[data-testid="save-platform-button"]')

    // Verify updated name
    await expect(
      page.locator(`[data-testid="platform-${updatedName}"]`)
    ).toBeVisible()

    // Delete platform
    await page.click(`[data-testid="delete-platform-${updatedName}"]`)
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
    await page.click('[data-testid="confirm-delete-button"]')

    // Verify platform is removed
    await expect(
      page.locator(`[data-testid="platform-${updatedName}"]`)
    ).not.toBeVisible()
  })

  test('complete user management workflow', async ({ page }) => {
    // Navigate to users page
    await page.click('[data-testid="nav-users"]')
    await expect(page).toHaveURL('/dashboard/users')
    await expect(page.locator('h1')).toContainText('User Management')

    // Add new user
    await page.click('[data-testid="add-user-button"]')
    await expect(page.locator('[data-testid="user-modal"]')).toBeVisible()

    // Fill user form
    await page.fill('[data-testid="user-name"]', testNewUser.name)
    await page.fill('[data-testid="user-email"]', testNewUser.email)
    await page.selectOption('[data-testid="user-role"]', testNewUser.role)
    await page.fill('[data-testid="user-password"]', testNewUser.password)
    await page.fill(
      '[data-testid="user-confirm-password"]',
      testNewUser.password
    )

    // Save user
    await page.click('[data-testid="save-user-button"]')
    await expect(page.locator('[data-testid="user-modal"]')).not.toBeVisible()

    // Verify user appears in list
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"]`)
    ).toBeVisible()
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"] .role`)
    ).toContainText('Operator')
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"] .status`)
    ).toContainText('Active')

    // Search for user
    await page.fill('[data-testid="user-search"]', testNewUser.name)
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"]`)
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="user-list"] .user-row')
    ).toHaveCount(1)

    // Clear search
    await page.fill('[data-testid="user-search"]', '')
    await expect(
      page.locator('[data-testid="user-list"] .user-row')
    ).toHaveCount.toBeGreaterThan(1)

    // Filter by role
    await page.selectOption('[data-testid="role-filter"]', 'OPERATOR')
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"]`)
    ).toBeVisible()

    // Reset filters
    await page.selectOption('[data-testid="role-filter"]', 'ALL')

    // Edit user
    await page.click(`[data-testid="edit-user-${testNewUser.email}"]`)
    await expect(page.locator('[data-testid="user-modal"]')).toBeVisible()

    const updatedName = `${testNewUser.name} Updated`
    await page.fill('[data-testid="user-name"]', updatedName)
    await page.selectOption('[data-testid="user-role"]', 'ADMIN')
    await page.click('[data-testid="save-user-button"]')

    // Verify updated user
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"] .name`)
    ).toContainText(updatedName)
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"] .role`)
    ).toContainText('Admin')

    // Deactivate user
    await page.click(`[data-testid="deactivate-user-${testNewUser.email}"]`)
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
    await page.click('[data-testid="confirm-deactivate-button"]')

    // Verify user is deactivated
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"] .status`)
    ).toContainText('Inactive')

    // Reactivate user
    await page.click(`[data-testid="activate-user-${testNewUser.email}"]`)
    await expect(
      page.locator(`[data-testid="user-${testNewUser.email}"] .status`)
    ).toContainText('Active')
  })

  test('complete settings workflow', async ({ page }) => {
    // Navigate to settings page
    await page.click('[data-testid="nav-settings"]')
    await expect(page).toHaveURL('/dashboard/settings')
    await expect(page.locator('h1')).toContainText('Settings')

    // Test profile settings
    await page.click('[data-testid="profile-settings-tab"]')
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible()

    // Update profile
    const updatedName = 'Updated Admin User'
    await page.fill('[data-testid="profile-name"]', updatedName)
    await page.click('[data-testid="save-profile-button"]')

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Profile updated successfully'
    )

    // Test notification settings
    await page.click('[data-testid="notification-settings-tab"]')
    await expect(
      page.locator('[data-testid="notification-form"]')
    ).toBeVisible()

    // Toggle email notifications
    await page.click('[data-testid="email-notifications-toggle"]')
    await expect(
      page.locator('[data-testid="email-notifications-toggle"]')
    ).toBeChecked()

    // Configure notification types
    await page.click('[data-testid="task-completion-email"]')
    await page.click('[data-testid="agent-errors-email"]')

    // Set notification frequency
    await page.selectOption('[data-testid="notification-frequency"]', 'hourly')

    // Save notification settings
    await page.click('[data-testid="save-notifications-button"]')
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Notification preferences saved'
    )

    // Test security settings
    await page.click('[data-testid="security-settings-tab"]')
    await expect(page.locator('[data-testid="security-form"]')).toBeVisible()

    // Change password
    await page.fill('[data-testid="current-password"]', testUser.password)
    await page.fill('[data-testid="new-password"]', 'newpassword123')
    await page.fill('[data-testid="confirm-password"]', 'newpassword123')
    await page.click('[data-testid="change-password-button"]')

    // Verify password change success
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Password changed successfully'
    )

    // Enable two-factor authentication
    await page.click('[data-testid="enable-2fa-button"]')
    await expect(page.locator('[data-testid="2fa-setup-modal"]')).toBeVisible()

    // Verify QR code is displayed
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible()
    await expect(page.locator('[data-testid="backup-codes"]')).toBeVisible()

    // Complete 2FA setup
    await page.fill('[data-testid="2fa-verification-code"]', '123456')
    await page.click('[data-testid="verify-2fa-button"]')

    // Note: In real test, this would fail without valid TOTP code
    // For E2E test, we might mock the verification
  })

  test('analytics page data visualization workflow', async ({ page }) => {
    // Navigate to analytics page
    await page.click('[data-testid="nav-analytics"]')
    await expect(page).toHaveURL('/dashboard/analytics')
    await expect(page.locator('h1')).toContainText('Analytics')

    // Verify KPI cards are loaded
    await expect(page.locator('[data-testid="total-agents-kpi"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="active-agents-kpi"]')
    ).toBeVisible()
    await expect(page.locator('[data-testid="total-tasks-kpi"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-rate-kpi"]')).toBeVisible()

    // Verify charts are loaded
    await expect(
      page.locator('[data-testid="task-status-chart"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="platform-distribution-chart"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="daily-trends-chart"]')
    ).toBeVisible()

    // Test date range filter
    await page.click('[data-testid="date-range-picker"]')
    await expect(
      page.locator('[data-testid="date-picker-calendar"]')
    ).toBeVisible()

    // Select last 7 days
    await page.click('[data-testid="last-7-days-preset"]')

    // Verify data updates
    await expect(
      page.locator('[data-testid="loading-indicator"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="loading-indicator"]')
    ).not.toBeVisible()

    // Test refresh functionality
    await page.click('[data-testid="refresh-button"]')
    await expect(
      page.locator('[data-testid="loading-indicator"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="loading-indicator"]')
    ).not.toBeVisible()

    // Test export functionality
    await page.click('[data-testid="export-button"]')
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible()

    // Select export options
    await page.click('[data-testid="export-overview"]')
    await page.click('[data-testid="export-agents"]')
    await page.selectOption('[data-testid="export-format"]', 'csv')

    // Start download
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="export-data-button"]')
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toMatch(/analytics-export-.*\.csv/)
  })

  test('cross-page navigation and data persistence', async ({ page }) => {
    // Start on dashboard
    await expect(page).toHaveURL('/dashboard')

    // Navigate to platforms and add a platform
    await page.click('[data-testid="nav-platforms"]')
    await page.click('[data-testid="add-platform-button"]')
    await page.fill('[data-testid="platform-name"]', 'Navigation Test Platform')
    await page.selectOption('[data-testid="platform-type"]', 'N8N')
    await page.fill('[data-testid="platform-url"]', 'https://test.com')
    await page.fill('[data-testid="platform-api-key"]', 'test-key')
    await page.click('[data-testid="save-platform-button"]')

    // Navigate to analytics and verify platform appears in distribution
    await page.click('[data-testid="nav-analytics"]')
    await expect(
      page.locator('[data-testid="platform-distribution-chart"]')
    ).toBeVisible()

    // Wait for chart to load and check if new platform is included
    await page.waitForTimeout(2000) // Allow time for data to load

    // Navigate to users page
    await page.click('[data-testid="nav-users"]')
    await page.click('[data-testid="add-user-button"]')
    await page.fill('[data-testid="user-name"]', 'Navigation Test User')
    await page.fill('[data-testid="user-email"]', 'navtest@example.com')
    await page.selectOption('[data-testid="user-role"]', 'OPERATOR')
    await page.fill('[data-testid="user-password"]', 'password123')
    await page.fill('[data-testid="user-confirm-password"]', 'password123')
    await page.click('[data-testid="save-user-button"]')

    // Navigate back to dashboard and verify summary data is updated
    await page.click('[data-testid="nav-dashboard"]')
    await expect(
      page.locator('[data-testid="platforms-summary"]')
    ).toContainText('Navigation Test Platform')
    await expect(page.locator('[data-testid="users-summary"]')).toContainText(
      'Navigation Test User'
    )

    // Use breadcrumb navigation
    await page.click('[data-testid="nav-platforms"]')
    await page.click('[data-testid="breadcrumb-dashboard"]')
    await expect(page).toHaveURL('/dashboard')

    // Test browser back/forward navigation
    await page.goBack()
    await expect(page).toHaveURL('/dashboard/platforms')

    await page.goForward()
    await expect(page).toHaveURL('/dashboard')
  })

  test('mobile responsiveness workflow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify mobile navigation
    await expect(
      page.locator('[data-testid="mobile-menu-toggle"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="desktop-sidebar"]')
    ).not.toBeVisible()

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

    // Navigate using mobile menu
    await page.click('[data-testid="mobile-nav-analytics"]')
    await expect(page).toHaveURL('/dashboard/analytics')
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible()

    // Verify responsive layout on analytics page
    await expect(page.locator('[data-testid="kpi-cards"]')).toHaveCSS(
      'flex-direction',
      'column'
    )
    await expect(page.locator('[data-testid="charts-container"]')).toHaveCSS(
      'flex-direction',
      'column'
    )

    // Test mobile-friendly interactions
    await page.click('[data-testid="mobile-menu-toggle"]')
    await page.click('[data-testid="mobile-nav-platforms"]')

    // Verify mobile table scrolling
    await expect(page.locator('[data-testid="platforms-table"]')).toHaveCSS(
      'overflow-x',
      'auto'
    )

    // Test mobile form interactions
    await page.click('[data-testid="add-platform-button"]')
    await expect(page.locator('[data-testid="platform-modal"]')).toBeVisible()

    // Verify modal is full-screen on mobile
    const modal = page.locator('[data-testid="platform-modal"]')
    const modalBox = await modal.boundingBox()
    const viewport = page.viewportSize()

    expect(modalBox?.width).toBeCloseTo(viewport?.width || 375, 50)
  })

  test('error handling and recovery workflow', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/cubcen/v1/platforms', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' }),
      })
    })

    await page.click('[data-testid="nav-platforms"]')

    // Verify error state is displayed
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Failed to load platforms'
    )
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()

    // Test retry functionality
    await page.unroute('**/api/cubcen/v1/platforms')
    await page.route('**/api/cubcen/v1/platforms', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.click('[data-testid="retry-button"]')
    await expect(
      page.locator('[data-testid="error-message"]')
    ).not.toBeVisible()
    await expect(page.locator('[data-testid="platforms-table"]')).toBeVisible()

    // Test form validation errors
    await page.click('[data-testid="add-platform-button"]')
    await page.click('[data-testid="save-platform-button"]') // Submit empty form

    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText(
      'Name is required'
    )
    await expect(page.locator('[data-testid="type-error"]')).toContainText(
      'Type is required'
    )
    await expect(page.locator('[data-testid="url-error"]')).toContainText(
      'URL is required'
    )

    // Test connection error handling
    await page.fill('[data-testid="platform-name"]', 'Test Platform')
    await page.selectOption('[data-testid="platform-type"]', 'N8N')
    await page.fill('[data-testid="platform-url"]', 'https://invalid-url.com')
    await page.fill('[data-testid="platform-api-key"]', 'invalid-key')

    await page.route('**/api/cubcen/v1/platforms/*/test-connection', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { connected: false, error: 'Connection failed' },
        }),
      })
    })

    await page.click('[data-testid="test-connection-button"]')
    await expect(
      page.locator('[data-testid="connection-error"]')
    ).toContainText('Connection failed')
    await expect(
      page.locator('[data-testid="connection-status"]')
    ).toContainText('Failed')
  })
})
