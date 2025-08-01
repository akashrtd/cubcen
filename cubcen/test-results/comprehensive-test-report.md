# Cubcen Comprehensive Test Report

Generated: 8/1/2025, 12:19:55 PM
Total Duration: 27.30 seconds

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | 11 |
| Passed | 2 |
| Failed | 9 |
| Required Failures | 8 |

## Test Results

| Test Suite | Status | Duration | Required |
|------------|--------|----------|----------|
| Code Formatting | ❌ Fail | 2.10s | Yes |
| Linting | ❌ Fail | 1.65s | Yes |
| Type Checking | ❌ Fail | 3.81s | Yes |
| Security Audit | ✅ Pass | 1.40s | Yes |
| Unit Tests | ❌ Fail | 3.22s | Yes |
| Backend Integration Tests | ❌ Fail | 1.65s | Yes |
| Build Validation | ❌ Fail | 4.98s | Yes |
| Server Build | ❌ Fail | 3.36s | Yes |
| API Documentation | ✅ Pass | 0.09s | No |
| End-to-End Tests | ❌ Fail | 2.01s | Yes |
| Performance Tests | ❌ Fail | 1.98s | No |

## Failed Required Tests

### Code Formatting

**Error:** Command failed: npm run format:check
[warn] .github/workflows/ci.yml
[warn] .github/workflows/release.yml
[warn] .prettierrc
[warn] components.json
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
[warn] e2e/setup/jest.setup.js
[warn] e2e/setup/seed-test-data.ts
[warn] e2e/utils/test-helpers.ts
[warn] e2e/utils/test-server.ts
[warn] eslint.config.mjs
[warn] jest.backend.config.js
[warn] jest.backend.setup.js
[warn] jest.config.js
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
[warn] tsconfig.deployment.json
[warn] tsconfig.json
[warn] tsconfig.server.json
[warn] verify-api-docs.js
[warn] Code style issues found in 249 files. Run Prettier with --write to fix.


### Linting

**Error:** Command failed: npm run lint

./src/backend/__tests__/api-comprehensive.test.ts
10:10  Warning: 'AgentService' is defined but never used.  @typescript-eslint/no-unused-vars
11:10  Warning: 'TaskService' is defined but never used.  @typescript-eslint/no-unused-vars
12:10  Warning: 'AdapterManager' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/__tests__/api-documentation.test.ts
170:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/__tests__/test-helpers.ts
35:71  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/__tests__/adapter-factory.test.ts
255:31  Warning: 'type' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/__tests__/base-adapter.test.ts
32:22  Warning: '_credentials' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/__tests__/make-adapter-demo.test.ts
139:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
141:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/make-adapter-simple.test.ts
144:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
168:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
186:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
196:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
201:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
239:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
249:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
276:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
277:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
278:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
292:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
313:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/make-adapter.test.ts
572:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
573:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/make-integration.test.ts
187:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
188:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/make-mock-server.helper.ts
367:69  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars
390:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
464:27  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
475:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
483:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
487:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/mock-adapter.test.ts
141:11  Warning: 'foundCurrentTask' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/__tests__/n8n-mock-server.helper.ts
171:18  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
192:37  Warning: '_req' is defined but never used.  @typescript-eslint/no-unused-vars
192:52  Warning: '_res' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/mock-adapter.ts
39:22  Warning: '_credentials' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/routes/__tests__/agents.test.ts
15:7  Warning: 'testUserId' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/backend/routes/__tests__/analytics.test.ts
344:13  Warning: 'response' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/backend/routes/__tests__/notifications.test.ts
81:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
105:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
129:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
205:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
221:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
237:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
255:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
341:50  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
366:50  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
409:50  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
453:50  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
490:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
527:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
556:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/backend/routes/__tests__/performance.test.ts
59:25  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
59:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
59:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
240:37  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
257:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
257:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
257:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
320:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
364:30  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
408:40  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
461:37  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
475:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
495:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
495:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
495:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/routes/__tests__/websocket.test.ts
8:10  Warning: 'generateToken' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'prisma' is defined but never used.  @typescript-eslint/no-unused-vars
28:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
28:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
28:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
112:31  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
113:48  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
121:24  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
122:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
386:13  Warning: 'response' is assigned a value but never used.  @typescript-eslint/no-unused-vars
467:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
509:13  Warning: 'rateLimitedResponses' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/backend/routes/__tests__/workflows.test.ts
10:10  Warning: 'TaskService' is defined but never used.  @typescript-eslint/no-unused-vars
11:10  Warning: 'AdapterManager' is defined but never used.  @typescript-eslint/no-unused-vars
16:3  Warning: 'WorkflowCreationData' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'WorkflowUpdateData' is defined but never used.  @typescript-eslint/no-unused-vars
37:7  Warning: 'MockWorkflowService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
60:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:73  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:46  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars
76:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
772:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
772:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
772:69  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars
772:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/routes/performance.ts
127:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
395:19  Warning: 'iterations' is assigned a value but never used.  @typescript-eslint/no-unused-vars
474:42  Warning: 'rampUpTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
474:54  Warning: 'warmupRuns' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/agents/__tests__/agent-monitoring-dashboard.test.tsx
320:36  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
336:36  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
351:36  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
368:11  Warning: 'mockOnStatusUpdate' is assigned a value but never used.  @typescript-eslint/no-unused-vars
369:36  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
372:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
373:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/agents/agent-detail-view.tsx
3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
14:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
23:3  Warning: 'Network' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/agents/agent-list.tsx
3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/agents/agent-monitoring-dashboard.tsx
4:29  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
4:41  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
132:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/agents/agent-status-cards.tsx
3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/analytics/__tests__/analytics-dashboard.test.tsx
17:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
25:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
33:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
41:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:27  Warning: 'date' is defined but never used.  @typescript-eslint/no-unused-vars
49:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
59:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
303:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/analytics/analytics-dashboard.tsx
5:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
14:10  Warning: 'BarChart3' is defined but never used.  @typescript-eslint/no-unused-vars
82:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
94:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
104:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/analytics/error-patterns-chart.tsx
66:45  Warning: 'label' is defined but never used.  @typescript-eslint/no-unused-vars
66:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/analytics/kpi-cards.tsx
9:3  Warning: 'CheckCircle' is defined but never used.  @typescript-eslint/no-unused-vars
11:3  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/analytics/performance-charts.tsx
5:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
5:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
5:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
7:3  Warning: 'LineChart' is defined but never used.  @typescript-eslint/no-unused-vars
8:3  Warning: 'Line' is defined but never used.  @typescript-eslint/no-unused-vars
75:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
80:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
283:30  Warning: 'index' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/kanban/task-board.tsx
156:27  Warning: '_event' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/kanban/task-create-modal.tsx
120:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/notifications/in-app-notifications.tsx
15:3  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/notifications/notification-preferences.tsx
14:52  Warning: 'TestTube' is defined but never used.  @typescript-eslint/no-unused-vars
62:7  Warning: 'channelColors' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/ui/calendar.tsx
57:25  Warning: 'props' is defined but never used.  @typescript-eslint/no-unused-vars
58:26  Warning: 'props' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/__tests__/use-websocket-agents.test.ts
64:13  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/use-websocket-agents.ts
6:15  Warning: 'Agent' is defined but never used.  @typescript-eslint/no-unused-vars
364:6  Warning: React Hook useEffect has missing dependencies: 'connect' and 'disconnect'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

./src/lib/__tests__/cache.test.ts
337:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/__tests__/performance-monitor.test.ts
113:26  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/lib/__tests__/security-hardening.test.ts
17:10  Warning: 'sessionManager' is defined but never used.  @typescript-eslint/no-unused-vars
145:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
164:60  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
448:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
467:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
495:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
519:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
552:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
642:59  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/audit-logger.ts
442:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/benchmark.ts
9:10  Warning: 'performanceMonitor' is defined but never used.  @typescript-eslint/no-unused-vars
240:18  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/cache.ts
196:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
199:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
241:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/database-performance.ts
6:10  Warning: 'PrismaClient' is defined but never used.  @typescript-eslint/no-unused-vars
243:23  Warning: 'avgExecutionTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
301:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/pagination.ts
301:30  Warning: 'T' is defined but never used.  @typescript-eslint/no-unused-vars
397:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
397:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/performance-monitor.ts
349:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
439:53  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/server.ts
15:3  Warning: 'csrfProtection' is defined but never used.  @typescript-eslint/no-unused-vars
21:10  Warning: 'sessionManager' is defined but never used.  @typescript-eslint/no-unused-vars
139:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
165:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
165:71  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
323:59  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars

./src/services/__tests__/agent.test.ts
11:10  Warning: 'logger' is defined but never used.  @typescript-eslint/no-unused-vars
29:7  Warning: 'testUserId' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/services/__tests__/analytics.test.ts
33:20  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
37:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
237:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/__tests__/notification-preferences.test.ts
14:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
42:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/services/__tests__/notification.test.ts
52:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
53:25  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
99:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
163:26  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
196:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
400:26  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
425:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
474:26  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/services/__tests__/task.test.ts
10:10  Warning: 'logger' is defined but never used.  @typescript-eslint/no-unused-vars
71:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
72:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
73:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
273:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
547:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars
567:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars
588:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars
611:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars
776:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/services/__tests__/websocket-integration.test.ts
9:10  Warning: 'generateToken' is defined but never used.  @typescript-eslint/no-unused-vars
15:3  Warning: 'AgentConnectedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
16:3  Warning: 'AgentDisconnectedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'TaskCreatedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
18:3  Warning: 'TaskStartedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
19:3  Warning: 'TaskProgressEvent' is defined but never used.  @typescript-eslint/no-unused-vars
20:3  Warning: 'TaskCompletedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
21:3  Warning: 'TaskFailedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
22:3  Warning: 'TaskCancelledEvent' is defined but never used.  @typescript-eslint/no-unused-vars
61:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
83:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
95:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/services/__tests__/websocket.test.ts
5:20  Warning: 'SocketIOServer' is defined but never used.  @typescript-eslint/no-unused-vars
8:10  Warning: 'generateToken' is defined but never used.  @typescript-eslint/no-unused-vars
35:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
51:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
63:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
98:31  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
111:31  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
530:31  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/services/__tests__/workflow-integration.test.ts
9:27  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
17:33  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
25:38  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/services/__tests__/workflow.test.ts
16:3  Warning: 'WorkflowExecutionOptions' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'WorkflowValidationResult' is defined but never used.  @typescript-eslint/no-unused-vars
1065:13  Warning: 'executionId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
1123:13  Warning: 'executionId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
1203:13  Warning: 'executionId' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/services/agent.ts
6:48  Warning: 'AgentHealth' is defined but never used.  @typescript-eslint/no-unused-vars
8:10  Warning: 'AdapterFactory' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'BasePlatformAdapter' is defined but never used.  @typescript-eslint/no-unused-vars
10:10  Warning: 'PlatformConfig' is defined but never used.  @typescript-eslint/no-unused-vars
10:35  Warning: 'PlatformAgent' is defined but never used.  @typescript-eslint/no-unused-vars

./src/services/analytics.ts
3:26  Warning: 'cached' is defined but never used.  @typescript-eslint/no-unused-vars
45:15  Warning: 'whereClause' is assigned a value but never used.  @typescript-eslint/no-unused-vars
452:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
456:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/notification.ts
554:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/task.ts
681:80  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/websocket.ts
206:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
867:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/workflow.ts
26:3  Warning: 'WorkflowExecutionStatus' is defined but never used.  @typescript-eslint/no-unused-vars
32:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
274:15  Warning: 'updatedWorkflow' is assigned a value but never used.  @typescript-eslint/no-unused-vars

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules


### Type Checking

**Error:** Command failed: npm run type-check

### Unit Tests

**Error:** spawnSync /bin/sh ENOBUFS

### Backend Integration Tests

**Error:** spawnSync /bin/sh ENOBUFS

### Build Validation

**Error:** Command failed: npm run build

Failed to compile.

./src/backend/__tests__/api-comprehensive.test.ts
10:10  Warning: 'AgentService' is defined but never used.  @typescript-eslint/no-unused-vars
11:10  Warning: 'TaskService' is defined but never used.  @typescript-eslint/no-unused-vars
12:10  Warning: 'AdapterManager' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/__tests__/api-documentation.test.ts
170:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/__tests__/test-helpers.ts
35:71  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/__tests__/adapter-factory.test.ts
255:31  Warning: 'type' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/__tests__/base-adapter.test.ts
32:22  Warning: '_credentials' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/__tests__/make-adapter-demo.test.ts
139:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
141:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/make-adapter-simple.test.ts
144:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
168:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
186:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
196:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
201:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
239:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
249:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
276:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
277:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
278:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
292:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
313:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/make-adapter.test.ts
572:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
573:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/make-integration.test.ts
187:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
188:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/make-mock-server.helper.ts
367:69  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars
390:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
464:27  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
475:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
483:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
487:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/adapters/__tests__/mock-adapter.test.ts
141:11  Warning: 'foundCurrentTask' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/__tests__/n8n-mock-server.helper.ts
171:18  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
192:37  Warning: '_req' is defined but never used.  @typescript-eslint/no-unused-vars
192:52  Warning: '_res' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/adapters/mock-adapter.ts
39:22  Warning: '_credentials' is defined but never used.  @typescript-eslint/no-unused-vars

./src/backend/routes/__tests__/agents.test.ts
15:7  Warning: 'testUserId' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/backend/routes/__tests__/analytics.test.ts
344:13  Warning: 'response' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/backend/routes/__tests__/notifications.test.ts
81:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
105:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
129:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
205:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
221:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
237:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
255:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
341:50  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
366:50  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
409:50  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
453:50  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
490:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
527:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
556:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/backend/routes/__tests__/performance.test.ts
59:25  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
59:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
59:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
240:37  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
257:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
257:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
257:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
320:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
364:30  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
408:40  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
461:37  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
475:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
495:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
495:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
495:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/routes/__tests__/websocket.test.ts
8:10  Warning: 'generateToken' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'prisma' is defined but never used.  @typescript-eslint/no-unused-vars
28:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
28:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
28:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
112:31  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
113:48  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
121:24  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
122:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
386:13  Warning: 'response' is assigned a value but never used.  @typescript-eslint/no-unused-vars
467:39  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
509:13  Warning: 'rateLimitedResponses' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/backend/routes/__tests__/workflows.test.ts
10:10  Warning: 'TaskService' is defined but never used.  @typescript-eslint/no-unused-vars
11:10  Warning: 'AdapterManager' is defined but never used.  @typescript-eslint/no-unused-vars
16:3  Warning: 'WorkflowCreationData' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'WorkflowUpdateData' is defined but never used.  @typescript-eslint/no-unused-vars
37:7  Warning: 'MockWorkflowService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
60:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:73  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
76:46  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars
76:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
772:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
772:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
772:69  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars
772:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/backend/routes/performance.ts
127:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
395:19  Warning: 'iterations' is assigned a value but never used.  @typescript-eslint/no-unused-vars
474:42  Warning: 'rampUpTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
474:54  Warning: 'warmupRuns' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/agents/__tests__/agent-monitoring-dashboard.test.tsx
320:36  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
336:36  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
351:36  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
368:11  Warning: 'mockOnStatusUpdate' is assigned a value but never used.  @typescript-eslint/no-unused-vars
369:36  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
372:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
373:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/agents/agent-detail-view.tsx
3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
14:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
23:3  Warning: 'Network' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/agents/agent-list.tsx
3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/agents/agent-monitoring-dashboard.tsx
4:29  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
4:41  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
132:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/agents/agent-status-cards.tsx
3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/analytics/__tests__/analytics-dashboard.test.tsx
17:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
25:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
33:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
41:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:27  Warning: 'date' is defined but never used.  @typescript-eslint/no-unused-vars
49:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
59:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
303:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/analytics/analytics-dashboard.tsx
5:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
14:10  Warning: 'BarChart3' is defined but never used.  @typescript-eslint/no-unused-vars
82:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
94:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
104:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/analytics/error-patterns-chart.tsx
66:45  Warning: 'label' is defined but never used.  @typescript-eslint/no-unused-vars
66:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/analytics/kpi-cards.tsx
9:3  Warning: 'CheckCircle' is defined but never used.  @typescript-eslint/no-unused-vars
11:3  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/analytics/performance-charts.tsx
5:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
5:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
5:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
7:3  Warning: 'LineChart' is defined but never used.  @typescript-eslint/no-unused-vars
8:3  Warning: 'Line' is defined but never used.  @typescript-eslint/no-unused-vars
75:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
80:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
283:30  Warning: 'index' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/kanban/task-board.tsx
156:27  Warning: '_event' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/kanban/task-create-modal.tsx
120:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/notifications/in-app-notifications.tsx
15:3  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/notifications/notification-preferences.tsx
14:52  Warning: 'TestTube' is defined but never used.  @typescript-eslint/no-unused-vars
62:7  Warning: 'channelColors' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/ui/calendar.tsx
57:25  Warning: 'props' is defined but never used.  @typescript-eslint/no-unused-vars
58:26  Warning: 'props' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/__tests__/use-websocket-agents.test.ts
64:13  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/use-websocket-agents.ts
6:15  Warning: 'Agent' is defined but never used.  @typescript-eslint/no-unused-vars
364:6  Warning: React Hook useEffect has missing dependencies: 'connect' and 'disconnect'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

./src/lib/__tests__/cache.test.ts
337:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/__tests__/performance-monitor.test.ts
113:26  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/lib/__tests__/security-hardening.test.ts
17:10  Warning: 'sessionManager' is defined but never used.  @typescript-eslint/no-unused-vars
145:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
164:60  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
448:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
467:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
495:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
519:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
552:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
642:59  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/audit-logger.ts
442:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/benchmark.ts
9:10  Warning: 'performanceMonitor' is defined but never used.  @typescript-eslint/no-unused-vars
240:18  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/cache.ts
196:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
199:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
241:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/database-performance.ts
6:10  Warning: 'PrismaClient' is defined but never used.  @typescript-eslint/no-unused-vars
243:23  Warning: 'avgExecutionTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
301:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/pagination.ts
301:30  Warning: 'T' is defined but never used.  @typescript-eslint/no-unused-vars
397:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
397:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/performance-monitor.ts
349:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
439:53  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/server.ts
15:3  Warning: 'csrfProtection' is defined but never used.  @typescript-eslint/no-unused-vars
21:10  Warning: 'sessionManager' is defined but never used.  @typescript-eslint/no-unused-vars
139:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
165:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
165:71  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
323:59  Warning: 'next' is defined but never used.  @typescript-eslint/no-unused-vars

./src/services/__tests__/agent.test.ts
11:10  Warning: 'logger' is defined but never used.  @typescript-eslint/no-unused-vars
29:7  Warning: 'testUserId' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/services/__tests__/analytics.test.ts
33:20  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
37:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
237:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/__tests__/notification-preferences.test.ts
14:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
42:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/services/__tests__/notification.test.ts
52:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
53:25  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
99:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
163:26  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
196:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
400:26  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
425:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
474:26  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/services/__tests__/task.test.ts
10:10  Warning: 'logger' is defined but never used.  @typescript-eslint/no-unused-vars
71:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
72:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
73:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
273:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
547:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars
567:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars
588:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars
611:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars
776:13  Warning: 'task' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/services/__tests__/websocket-integration.test.ts
9:10  Warning: 'generateToken' is defined but never used.  @typescript-eslint/no-unused-vars
15:3  Warning: 'AgentConnectedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
16:3  Warning: 'AgentDisconnectedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'TaskCreatedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
18:3  Warning: 'TaskStartedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
19:3  Warning: 'TaskProgressEvent' is defined but never used.  @typescript-eslint/no-unused-vars
20:3  Warning: 'TaskCompletedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
21:3  Warning: 'TaskFailedEvent' is defined but never used.  @typescript-eslint/no-unused-vars
22:3  Warning: 'TaskCancelledEvent' is defined but never used.  @typescript-eslint/no-unused-vars
61:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
83:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
95:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/services/__tests__/websocket.test.ts
5:20  Warning: 'SocketIOServer' is defined but never used.  @typescript-eslint/no-unused-vars
8:10  Warning: 'generateToken' is defined but never used.  @typescript-eslint/no-unused-vars
35:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
51:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
63:29  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
98:31  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
111:31  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
530:31  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/services/__tests__/workflow-integration.test.ts
9:27  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
17:33  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
25:38  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports

./src/services/__tests__/workflow.test.ts
16:3  Warning: 'WorkflowExecutionOptions' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'WorkflowValidationResult' is defined but never used.  @typescript-eslint/no-unused-vars
1065:13  Warning: 'executionId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
1123:13  Warning: 'executionId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
1203:13  Warning: 'executionId' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/services/agent.ts
6:48  Warning: 'AgentHealth' is defined but never used.  @typescript-eslint/no-unused-vars
8:10  Warning: 'AdapterFactory' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'BasePlatformAdapter' is defined but never used.  @typescript-eslint/no-unused-vars
10:10  Warning: 'PlatformConfig' is defined but never used.  @typescript-eslint/no-unused-vars
10:35  Warning: 'PlatformAgent' is defined but never used.  @typescript-eslint/no-unused-vars

./src/services/analytics.ts
3:26  Warning: 'cached' is defined but never used.  @typescript-eslint/no-unused-vars
45:15  Warning: 'whereClause' is assigned a value but never used.  @typescript-eslint/no-unused-vars
452:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
456:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/notification.ts
554:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/task.ts
681:80  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/websocket.ts
206:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
867:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/services/workflow.ts
26:3  Warning: 'WorkflowExecutionStatus' is defined but never used.  @typescript-eslint/no-unused-vars
32:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
274:15  Warning: 'updatedWorkflow' is assigned a value but never used.  @typescript-eslint/no-unused-vars

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules


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

FAIL e2e/__tests__/user-acceptance.e2e.test.ts
  ● Test suite failed to run

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation, specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    /Users/akashrathod/cubcen/cubcen/e2e/setup/jest.setup.js:1
    import { TextEncoder, TextDecoder } from 'util'
    ^^^^^^

    SyntaxError: Cannot use import statement outside a module

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1316:40)

FAIL e2e/__tests__/performance.e2e.test.ts
  ● Test suite failed to run

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation, specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    /Users/akashrathod/cubcen/cubcen/e2e/setup/jest.setup.js:1
    import { TextEncoder, TextDecoder } from 'util'
    ^^^^^^

    SyntaxError: Cannot use import statement outside a module

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1316:40)

FAIL e2e/__tests__/platform-integration.e2e.test.ts
  ● Test suite failed to run

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation, specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    /Users/akashrathod/cubcen/cubcen/e2e/setup/jest.setup.js:1
    import { TextEncoder, TextDecoder } from 'util'
    ^^^^^^

    SyntaxError: Cannot use import statement outside a module

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1316:40)

FAIL e2e/__tests__/auth-flow.e2e.test.ts
  ● Test suite failed to run

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation, specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    /Users/akashrathod/cubcen/cubcen/e2e/setup/jest.setup.js:1
    import { TextEncoder, TextDecoder } from 'util'
    ^^^^^^

    SyntaxError: Cannot use import statement outside a module

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1316:40)

FAIL e2e/__tests__/agent-management.e2e.test.ts
  ● Test suite failed to run

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation, specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    /Users/akashrathod/cubcen/cubcen/e2e/setup/jest.setup.js:1
    import { TextEncoder, TextDecoder } from 'util'
    ^^^^^^

    SyntaxError: Cannot use import statement outside a module

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1316:40)

Test Suites: 5 failed, 5 total
Tests:       0 total
Snapshots:   0 total
Time:        0.105 s
Ran all test suites.



## Quality Gates Status

❌ **QUALITY GATES FAILED** - Deployment blocked!

Please fix the failed required tests before proceeding.
