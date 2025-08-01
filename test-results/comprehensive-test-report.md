# Cubcen Comprehensive Test Report

Generated: 8/1/2025, 5:53:16 PM
Total Duration: 38.72 seconds

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | 11 |
| Passed | 3 |
| Failed | 8 |
| Required Failures | 7 |

## Test Results

| Test Suite | Status | Duration | Required |
|------------|--------|----------|----------|
| Code Formatting | ❌ Fail | 2.33s | Yes |
| Linting | ✅ Pass | 1.76s | Yes |
| Type Checking | ❌ Fail | 1.61s | Yes |
| Security Audit | ✅ Pass | 1.25s | Yes |
| Unit Tests | ❌ Fail | 10.02s | Yes |
| Backend Integration Tests | ❌ Fail | 2.77s | Yes |
| Build Validation | ❌ Fail | 9.60s | Yes |
| Server Build | ❌ Fail | 1.21s | Yes |
| API Documentation | ✅ Pass | 0.10s | No |
| End-to-End Tests | ❌ Fail | 3.15s | Yes |
| Performance Tests | ❌ Fail | 2.84s | No |

## Failed Required Tests

### Code Formatting

**Error:** Command failed: npm run format:check
[warn] .github/workflows/ci.yml
[warn] .github/workflows/release.yml
[warn] .kiro/specs/ai-agent-management-platform/design.md
[warn] .kiro/specs/ai-agent-management-platform/requirements.md
[warn] .kiro/specs/ai-agent-management-platform/tasks.md
[warn] .kiro/steering/product.md
[warn] .kiro/steering/structure.md
[warn] .kiro/steering/tech.md
[warn] .prettierrc
[warn] .vscode/settings.json
[warn] components.json
[warn] context.md
[warn] DEPLOYMENT_SUMMARY.md
[warn] deployment-preparation-report.json
[warn] deployment-readiness-report.json
[warn] docker-compose.dev.yml
[warn] docker-compose.yml
[warn] docs/deployment.md
[warn] docs/n8n-integration-summary.md
[warn] docs/performance-optimization.md
[warn] docs/platform-adapter-development.md
[warn] docs/runbooks.md
[warn] docs/security-best-practices.md
[warn] docs/testing-strategy.md
[warn] docs/user-guide.md
[warn] e2e/__tests__/agent-management.e2e.test.ts
[warn] e2e/__tests__/auth-flow.e2e.test.ts
[warn] e2e/__tests__/performance.e2e.test.ts
[warn] e2e/__tests__/platform-integration.e2e.test.ts
[warn] e2e/__tests__/user-acceptance.e2e.test.ts
[warn] e2e/performance/load-test.ts
[warn] e2e/setup/global-setup.ts
[warn] e2e/setup/global-teardown.ts
[warn] e2e/setup/seed-test-data.ts
[warn] e2e/utils/test-helpers.ts
[warn] e2e/utils/test-server.ts
[warn] eslint.config.mjs
[warn] jest.backend.config.js
[warn] jest.backend.setup.js
[warn] jest.e2e.config.js
[warn] jest.setup.js
[warn] next.config.ts
[warn] postcss.config.mjs
[warn] prisma/seed.ts
[warn] scripts/deployment-readiness-check.ts
[warn] scripts/final-deployment-preparation.ts
[warn] scripts/fix-deployment-issues.ts
[warn] scripts/production-security-audit.ts
[warn] scripts/run-comprehensive-tests.ts
[warn] scripts/security-scan.ts
[warn] scripts/test-deployment-setup.ts
[warn] scripts/test-health-endpoints.ts
[warn] scripts/test-n8n-adapter.ts
[warn] scripts/test-performance.ts
[warn] scripts/validate-testing-setup.ts
[warn] scripts/verify-database.ts
[warn] security-audit-report.json
[warn] src/app/__tests__/page.test.tsx
[warn] src/app/auth/login/__tests__/page.test.tsx
[warn] src/app/auth/login/page.tsx
[warn] src/app/auth/register/page.tsx
[warn] src/app/dashboard/__tests__/page.test.tsx
[warn] src/app/dashboard/agents/page.tsx
[warn] src/app/dashboard/analytics/page.tsx
[warn] src/app/dashboard/errors/page.tsx
[warn] src/app/dashboard/layout.tsx
[warn] src/app/dashboard/page.tsx
[warn] src/app/dashboard/tasks/page.tsx
[warn] src/app/globals.css
[warn] src/app/layout.tsx
[warn] src/app/page.tsx
[warn] src/backend/__tests__/api-comprehensive.test.ts
[warn] src/backend/__tests__/api-documentation.test.ts
[warn] src/backend/__tests__/api-structure.test.ts
[warn] src/backend/__tests__/core-api.test.ts
[warn] src/backend/__tests__/error-handling.test.ts
[warn] src/backend/__tests__/health-api.test.ts
[warn] src/backend/__tests__/server.test.ts
[warn] src/backend/__tests__/test-helpers.ts
[warn] src/backend/adapters/__tests__/adapter-factory.test.ts
[warn] src/backend/adapters/__tests__/base-adapter.test.ts
[warn] src/backend/adapters/__tests__/make-adapter-demo.test.ts
[warn] src/backend/adapters/__tests__/make-adapter-simple.test.ts
[warn] src/backend/adapters/__tests__/make-adapter.test.ts
[warn] src/backend/adapters/__tests__/make-integration.test.ts
[warn] src/backend/adapters/__tests__/make-mock-server.helper.ts
[warn] src/backend/adapters/__tests__/mock-adapter.test.ts
[warn] src/backend/adapters/__tests__/n8n-adapter-demo.test.ts
[warn] src/backend/adapters/__tests__/n8n-adapter.test.ts
[warn] src/backend/adapters/__tests__/n8n-integration.test.ts
[warn] src/backend/adapters/__tests__/n8n-mock-server.helper.ts
[warn] src/backend/adapters/adapter-factory.ts
[warn] src/backend/adapters/base-adapter.ts
[warn] src/backend/adapters/make-adapter.ts
[warn] src/backend/adapters/mock-adapter.ts
[warn] src/backend/adapters/n8n-adapter.ts
[warn] src/backend/middleware/auth.ts
[warn] src/backend/middleware/security.ts
[warn] src/backend/middleware/validation.ts
[warn] src/backend/routes/__tests__/agents.test.ts
[warn] src/backend/routes/__tests__/analytics.test.ts
[warn] src/backend/routes/__tests__/notifications.test.ts
[warn] src/backend/routes/__tests__/performance.test.ts
[warn] src/backend/routes/__tests__/websocket.test.ts
[warn] src/backend/routes/__tests__/workflows.test.ts
[warn] src/backend/routes/agents.ts
[warn] src/backend/routes/analytics.ts
[warn] src/backend/routes/auth.ts
[warn] src/backend/routes/backup.ts
[warn] src/backend/routes/errors.ts
[warn] src/backend/routes/health.ts
[warn] src/backend/routes/notifications.ts
[warn] src/backend/routes/performance.ts
[warn] src/backend/routes/platforms.ts
[warn] src/backend/routes/tasks.ts
[warn] src/backend/routes/users.ts
[warn] src/backend/routes/websocket.ts
[warn] src/backend/routes/workflows.ts
[warn] src/components/__tests__/theme-toggle.test.tsx
[warn] src/components/agents/__tests__/agent-list.test.tsx
[warn] src/components/agents/__tests__/agent-monitoring-dashboard.test.tsx
[warn] src/components/agents/__tests__/agent-status-cards.test.tsx
[warn] src/components/agents/agent-detail-view.tsx
[warn] src/components/agents/agent-list.tsx
[warn] src/components/agents/agent-monitoring-dashboard.tsx
[warn] src/components/agents/agent-status-cards.tsx
[warn] src/components/analytics/__tests__/analytics-dashboard.test.tsx
[warn] src/components/analytics/agent-performance-table.tsx
[warn] src/components/analytics/analytics-dashboard.tsx
[warn] src/components/analytics/date-range-picker.tsx
[warn] src/components/analytics/error-patterns-chart.tsx
[warn] src/components/analytics/export-dialog.tsx
[warn] src/components/analytics/kpi-cards.tsx
[warn] src/components/analytics/performance-charts.tsx
[warn] src/components/error-boundary.tsx
[warn] src/components/errors/__tests__/error-log-viewer.test.tsx
[warn] src/components/errors/__tests__/task-retry-panel.test.tsx
[warn] src/components/errors/error-log-viewer.tsx
[warn] src/components/errors/error-patterns.tsx
[warn] src/components/errors/system-health-indicators.tsx
[warn] src/components/errors/task-retry-panel.tsx
[warn] src/components/kanban/__tests__/task-board.test.tsx
[warn] src/components/kanban/__tests__/task-card.test.tsx
[warn] src/components/kanban/__tests__/task-detail-modal.test.tsx
[warn] src/components/kanban/task-board.tsx
[warn] src/components/kanban/task-card.tsx
[warn] src/components/kanban/task-create-modal.tsx
[warn] src/components/kanban/task-detail-modal.tsx
[warn] src/components/kanban/task-filters.tsx
[warn] src/components/notifications/in-app-notifications.tsx
[warn] src/components/notifications/notification-preferences.tsx
[warn] src/components/theme-provider.tsx
[warn] src/components/theme-toggle.tsx
[warn] src/components/ui/alert.tsx
[warn] src/components/ui/avatar.tsx
[warn] src/components/ui/badge.tsx
[warn] src/components/ui/button.tsx
[warn] src/components/ui/calendar.tsx
[warn] src/components/ui/card.tsx
[warn] src/components/ui/checkbox.tsx
[warn] src/components/ui/dialog.tsx
[warn] src/components/ui/dropdown-menu.tsx
[warn] src/components/ui/form.tsx
[warn] src/components/ui/input.tsx
[warn] src/components/ui/label.tsx
[warn] src/components/ui/popover.tsx
[warn] src/components/ui/progress.tsx
[warn] src/components/ui/radio-group.tsx
[warn] src/components/ui/scroll-area.tsx
[warn] src/components/ui/select.tsx
[warn] src/components/ui/separator.tsx
[warn] src/components/ui/sheet.tsx
[warn] src/components/ui/sidebar.tsx
[warn] src/components/ui/skeleton.tsx
[warn] src/components/ui/sonner.tsx
[warn] src/components/ui/switch.tsx
[warn] src/components/ui/table.tsx
[warn] src/components/ui/tabs.tsx
[warn] src/components/ui/textarea.tsx
[warn] src/components/ui/tooltip.tsx
[warn] src/hooks/__tests__/use-websocket-agents.test.ts
[warn] src/hooks/use-mobile.ts
[warn] src/hooks/use-websocket-agents.ts
[warn] src/index.ts
[warn] src/lib/__tests__/auth-integration.test.ts
[warn] src/lib/__tests__/backup.test.ts
[warn] src/lib/__tests__/cache.test.ts
[warn] src/lib/__tests__/circuit-breaker.test.ts
[warn] src/lib/__tests__/config.test.ts
[warn] src/lib/__tests__/database-integration.test.ts
[warn] src/lib/__tests__/database.test.ts
[warn] src/lib/__tests__/feature-flags.test.ts
[warn] src/lib/__tests__/health.test.ts
[warn] src/lib/__tests__/jwt.test.ts
[warn] src/lib/__tests__/performance-monitor.test.ts
[warn] src/lib/__tests__/rbac.test.ts
[warn] src/lib/__tests__/security-hardening.test.ts
[warn] src/lib/api-versioning.ts
[warn] src/lib/audit-logger.ts
[warn] src/lib/backup.ts
[warn] src/lib/benchmark.ts
[warn] src/lib/cache.ts
[warn] src/lib/circuit-breaker.ts
[warn] src/lib/config.ts
[warn] src/lib/database-performance.ts
[warn] src/lib/database-utils.ts
[warn] src/lib/database.ts
[warn] src/lib/feature-flags.ts
[warn] src/lib/health.ts
[warn] src/lib/jwt.ts
[warn] src/lib/logger.ts
[warn] src/lib/pagination.ts
[warn] src/lib/performance-monitor.ts
[warn] src/lib/rbac.ts
[warn] src/lib/session-manager.ts
[warn] src/lib/swagger.ts
[warn] src/lib/utils.ts
[warn] src/lib/validation/auth.ts
[warn] src/sdk/__tests__/client.test.ts
[warn] src/sdk/client.ts
[warn] src/sdk/errors.ts
[warn] src/sdk/index.ts
[warn] src/sdk/types.ts
[warn] src/server.ts
[warn] src/services/__tests__/agent.test.ts
[warn] src/services/__tests__/analytics.test.ts
[warn] src/services/__tests__/auth.test.ts
[warn] src/services/__tests__/error.test.ts
[warn] src/services/__tests__/notification-preferences.test.ts
[warn] src/services/__tests__/notification.test.ts
[warn] src/services/__tests__/task.test.ts
[warn] src/services/__tests__/websocket-integration.test.ts
[warn] src/services/__tests__/websocket.test.ts
[warn] src/services/__tests__/workflow-integration.test.ts
[warn] src/services/__tests__/workflow.test.ts
[warn] src/services/agent.ts
[warn] src/services/analytics.ts
[warn] src/services/auth.ts
[warn] src/services/error.ts
[warn] src/services/notification-preferences.ts
[warn] src/services/notification.ts
[warn] src/services/task.ts
[warn] src/services/websocket.ts
[warn] src/services/workflow.ts
[warn] src/types/auth.ts
[warn] src/types/error.ts
[warn] src/types/jest.d.ts
[warn] src/types/notification.ts
[warn] src/types/platform.ts
[warn] src/types/websocket.ts
[warn] src/types/workflow.ts
[warn] test-analytics.js
[warn] test-api-docs.js
[warn] test-results/comprehensive-test-report.json
[warn] test-results/comprehensive-test-report.md
[warn] tsconfig.deployment.json
[warn] tsconfig.json
[warn] tsconfig.server.json
[warn] verify-api-docs.js
[warn] Code style issues found in 259 files. Run Prettier with --write to fix.


### Type Checking

**Error:** Command failed: npm run type-check

### Unit Tests

**Error:** spawnSync /bin/sh ENOBUFS

### Backend Integration Tests

**Error:** spawnSync /bin/sh ENOBUFS

### Build Validation

**Error:** Command failed: npm run build
Failed to compile.

./src/app/dashboard/tasks/page.tsx:131:15
Type error: Cannot find name 'TaskPriority'.

[0m [90m 129 |[39m     description[33m?[39m[33m:[39m string
 [90m 130 |[39m     agentId[33m:[39m string
[31m[1m>[22m[39m[90m 131 |[39m     priority[33m:[39m [33mTaskPriority[39m
 [90m     |[39m               [31m[1m^[22m[39m
 [90m 132 |[39m     scheduledAt[33m:[39m [33mDate[39m
 [90m 133 |[39m     maxRetries[33m:[39m number
 [90m 134 |[39m     parameters[33m:[39m [33mRecord[39m[33m<[39m[33mstring[39m[33m,[39m unknown[33m>[39m[0m
Next.js build worker exited with code: 1 and signal: null


### Server Build

**Error:** Command failed: npm run build:server

### End-to-End Tests

**Error:** Command failed: npm run test:e2e
● Validation Warning:

  Unknown option "moduleNameMapping" with value {"^@/(.*)$": "<rootDir>/src/$1"} was found.
  This is probably a typing mistake. Fixing it will remove this message.

  Configuration Documentation:
  https://jestjs.io/docs/configuration

● Validation Warning:

  Unknown option "moduleNameMapping" with value {"^@/(.*)$": "<rootDir>/src/$1"} was found.
  This is probably a typing mistake. Fixing it will remove this message.

  Configuration Documentation:
  https://jestjs.io/docs/configuration

Environment variables loaded from .env
Environment variables loaded from .env
FAIL e2e/__tests__/user-acceptance.e2e.test.ts
  ● Test suite failed to run

    Cannot find module '@/lib/logger' from 'src/server.ts'

    Require stack:
      src/server.ts
      e2e/utils/test-server.ts
      e2e/__tests__/user-acceptance.e2e.test.ts

       9 | import rateLimit from 'express-rate-limit'
      10 | import session from 'express-session'
    > 11 | import { logger } from '@/lib/logger'
         | ^
      12 | import { 
      13 |   sanitizeInput, 
      14 |   securityHeaders, 

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.<anonymous> (src/server.ts:11:1)
      at Object.<anonymous> (e2e/utils/test-server.ts:4:1)
      at Object.<anonymous> (e2e/__tests__/user-acceptance.e2e.test.ts:1:1)

FAIL e2e/__tests__/platform-integration.e2e.test.ts
  ● Test suite failed to run

    Cannot find module '@/lib/logger' from 'src/server.ts'

    Require stack:
      src/server.ts
      e2e/utils/test-server.ts
      e2e/__tests__/platform-integration.e2e.test.ts

       9 | import rateLimit from 'express-rate-limit'
      10 | import session from 'express-session'
    > 11 | import { logger } from '@/lib/logger'
         | ^
      12 | import { 
      13 |   sanitizeInput, 
      14 |   securityHeaders, 

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.<anonymous> (src/server.ts:11:1)
      at Object.<anonymous> (e2e/utils/test-server.ts:4:1)
      at Object.<anonymous> (e2e/__tests__/platform-integration.e2e.test.ts:1:1)

FAIL e2e/__tests__/performance.e2e.test.ts
  ● Test suite failed to run

    Cannot find module '@/lib/logger' from 'src/server.ts'

    Require stack:
      src/server.ts
      e2e/utils/test-server.ts
      e2e/__tests__/performance.e2e.test.ts

       9 | import rateLimit from 'express-rate-limit'
      10 | import session from 'express-session'
    > 11 | import { logger } from '@/lib/logger'
         | ^
      12 | import { 
      13 |   sanitizeInput, 
      14 |   securityHeaders, 

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.<anonymous> (src/server.ts:11:1)
      at Object.<anonymous> (e2e/utils/test-server.ts:4:1)
      at Object.<anonymous> (e2e/__tests__/performance.e2e.test.ts:1:1)

FAIL e2e/__tests__/agent-management.e2e.test.ts
  ● Test suite failed to run

    Cannot find module '@/lib/logger' from 'src/server.ts'

    Require stack:
      src/server.ts
      e2e/utils/test-server.ts
      e2e/__tests__/agent-management.e2e.test.ts

       9 | import rateLimit from 'express-rate-limit'
      10 | import session from 'express-session'
    > 11 | import { logger } from '@/lib/logger'
         | ^
      12 | import { 
      13 |   sanitizeInput, 
      14 |   securityHeaders, 

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.<anonymous> (src/server.ts:11:1)
      at Object.<anonymous> (e2e/utils/test-server.ts:4:1)
      at Object.<anonymous> (e2e/__tests__/agent-management.e2e.test.ts:1:1)

FAIL e2e/__tests__/auth-flow.e2e.test.ts
  ● Test suite failed to run

    Cannot find module '@/lib/logger' from 'src/server.ts'

    Require stack:
      src/server.ts
      e2e/utils/test-server.ts
      e2e/__tests__/auth-flow.e2e.test.ts

       9 | import rateLimit from 'express-rate-limit'
      10 | import session from 'express-session'
    > 11 | import { logger } from '@/lib/logger'
         | ^
      12 | import { 
      13 |   sanitizeInput, 
      14 |   securityHeaders, 

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.<anonymous> (src/server.ts:11:1)
      at Object.<anonymous> (e2e/utils/test-server.ts:4:1)
      at Object.<anonymous> (e2e/__tests__/auth-flow.e2e.test.ts:1:1)

Test Suites: 5 failed, 5 total
Tests:       0 total
Snapshots:   0 total
Time:        0.34 s
Ran all test suites.



## Quality Gates Status

❌ **QUALITY GATES FAILED** - Deployment blocked!

Please fix the failed required tests before proceeding.
