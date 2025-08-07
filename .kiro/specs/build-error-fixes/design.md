# Design Document

## Overview

This design outlines a systematic approach to fixing build errors in the Cubcen application. The solution focuses on addressing critical compilation errors first, followed by React Hook violations, JSX escaping issues, and finally cleaning up TypeScript/ESLint warnings to restore the application to a buildable state.

## Architecture

### Error Classification System

The build errors are categorized into four priority levels:

1. **Critical Errors** - Prevent compilation (missing imports, undefined components)
2. **React Hook Violations** - Runtime safety issues (improper hook usage)
3. **JSX Syntax Errors** - Rendering issues (unescaped characters)
4. **Quality Warnings** - Code quality issues (unused variables, any types)

### Fix Strategy

The solution employs a phased approach:

- **Phase 1**: Fix critical compilation errors
- **Phase 2**: Resolve React Hook violations
- **Phase 3**: Fix JSX syntax issues
- **Phase 4**: Clean up quality warnings

## Components and Interfaces

### Critical Error Fixes

#### Missing Card Component Imports

- **Location**: `src/components/analytics/analytics-dashboard.tsx`
- **Issue**: Card, CardHeader, CardContent, CardTitle, CardDescription components not imported
- **Solution**: Import missing components from `@/components/ui/card`

#### Storybook Configuration Errors

- **Locations**: Multiple `.stories.tsx` files
- **Issue**: Using `@storybook/react` renderer package directly
- **Solution**: Replace with `@storybook/nextjs` framework package

#### ChartWrapper Component Reference

- **Location**: `src/components/dashboard/cards/chart-card.tsx`
- **Issue**: ChartWrapper component not defined in scope
- **Solution**: Import ChartWrapper from correct path

### React Hook Violations

#### Conditional Hook Usage

- **Location**: `src/components/dashboard/performance/viewport-skeleton.tsx`
- **Issue**: useMemo called conditionally
- **Solution**: Restructure component to call hooks unconditionally

#### Hook in Non-Component Function

- **Location**: `src/components/dashboard/charts/chart-wrapper.tsx`
- **Issue**: useEffect called in renderChart function
- **Solution**: Move hook to component level or rename function to start with 'use'

#### Missing Dependencies

- **Multiple Locations**: Various useEffect and useCallback hooks
- **Solution**: Add missing dependencies to dependency arrays

### JSX Syntax Fixes

#### Unescaped Quotes

- **Locations**: Multiple components with quote characters in JSX
- **Solution**: Replace quotes with `&quot;`, `&ldquo;`, `&#34;`, or `&rdquo;`

#### Unescaped Apostrophes

- **Locations**: Components with apostrophe characters in JSX
- **Solution**: Replace apostrophes with `&apos;`, `&lsquo;`, `&#39;`, or `&rsquo;`

## Data Models

### Error Tracking Structure

```typescript
interface BuildError {
  file: string
  line: number
  type: 'critical' | 'hook-violation' | 'jsx-syntax' | 'quality-warning'
  message: string
  solution: string
}
```

### Fix Progress Tracking

```typescript
interface FixProgress {
  totalErrors: number
  fixedErrors: number
  remainingErrors: number
  phase: 'critical' | 'hooks' | 'jsx' | 'quality'
}
```

## Error Handling

### Build Verification Process

1. **Pre-fix Validation**: Run build to capture all current errors
2. **Incremental Testing**: Test build after each phase of fixes
3. **Regression Prevention**: Ensure fixes don't introduce new errors
4. **Final Verification**: Confirm successful build completion

### Rollback Strategy

- Maintain git commits for each phase
- Enable quick rollback if fixes introduce new issues
- Test individual file changes before bulk updates

## Testing Strategy

### Build Testing Approach

1. **Continuous Build Testing**: Run `npm run build` after each fix group
2. **Component-Level Testing**: Verify individual components compile correctly
3. **Integration Testing**: Ensure fixed components work together
4. **Storybook Testing**: Verify Storybook builds successfully after import fixes

### Quality Assurance

1. **ESLint Validation**: Ensure fixes don't introduce new linting errors
2. **TypeScript Checking**: Verify type safety is maintained
3. **Runtime Testing**: Basic smoke tests to ensure application starts
4. **Storybook Verification**: Confirm stories render correctly

### Test Coverage Maintenance

- Ensure existing tests continue to pass
- Update test imports if component imports change
- Verify test utilities are not affected by fixes
- Maintain 90% test coverage requirement
