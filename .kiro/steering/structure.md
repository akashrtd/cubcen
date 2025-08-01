# Project Structure & Organization

## Root Directory Structure

```
cubcen/
├── src/                    # Source code
├── prisma/                 # Database schema and migrations
├── e2e/                    # End-to-end tests
├── scripts/                # Deployment and utility scripts
├── docs/                   # Documentation
├── public/                 # Static assets
└── logs/                   # Application logs
```

## Source Code Organization (`src/`)

### Frontend Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (login, register)
│   ├── dashboard/         # Main dashboard and sub-pages
│   │   ├── agents/        # Agent management page
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── tasks/         # Task management page
│   │   └── errors/        # Error monitoring page
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui base components
│   ├── agents/           # Agent-specific components
│   ├── analytics/        # Analytics components
│   ├── kanban/           # Task board components
│   ├── errors/           # Error handling components
│   └── notifications/    # Notification components
└── hooks/                # Custom React hooks
```

### Backend Structure
```
src/
├── backend/              # Backend services and APIs
│   ├── routes/          # Express.js API routes
│   ├── adapters/        # Platform adapter implementations
│   │   ├── base-adapter.ts      # Abstract base class
│   │   ├── adapter-factory.ts   # Factory pattern
│   │   ├── n8n-adapter.ts       # n8n platform adapter
│   │   ├── mock-adapter.ts      # Testing adapter
│   │   └── __tests__/           # Adapter tests
│   ├── middleware/      # Express middleware (auth, validation, security)
│   └── services/        # Business logic services
├── services/            # Frontend service layer
├── lib/                 # Shared utilities and libraries
├── types/               # TypeScript type definitions
├── generated/           # Generated code (Prisma client)
└── sdk/                 # Client SDK for external integrations
```

## Key Architectural Patterns

### File Naming Conventions
- **Components**: PascalCase (e.g., `AgentList.tsx`, `TaskBoard.tsx`)
- **Pages**: lowercase with hyphens (e.g., `agent-management`, `task-board`)
- **Utilities**: camelCase (e.g., `circuitBreaker.ts`, `databaseUtils.ts`)
- **Types**: camelCase with descriptive names (e.g., `platform.ts`, `workflow.ts`)

### Test Organization
- **Co-located tests**: Each module has a `__tests__/` directory
- **Test naming**: `*.test.ts` or `*.test.tsx` for unit tests
- **E2E tests**: Separate `e2e/` directory with `*.e2e.test.ts` naming
- **Test helpers**: Shared utilities in `__tests__/` directories

### Import Conventions
- **Absolute imports**: Use `@/` prefix for src directory imports
- **Relative imports**: Only for closely related files in same directory
- **Type imports**: Use `import type` for TypeScript types

### Component Structure
```typescript
// Standard component file structure
import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface ComponentNameProps extends ComponentProps<'div'> {
  // Component-specific props
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn('default-classes', className)} {...props}>
      {/* Component content */}
    </div>
  )
}
```

### Service Layer Pattern
- **Frontend services**: API calls and data fetching (`src/services/`)
- **Backend services**: Business logic and data processing (`src/backend/services/`)
- **Clear separation**: Frontend services call backend APIs, never direct database access

### Database Organization
```
prisma/
├── schema.prisma         # Database schema definition
├── migrations/           # Database migration files
├── seed.ts              # Database seeding script
└── data/                # Database files (SQLite)
```

### Configuration Files
- **Environment**: `.env`, `.env.example`, `.env.production`
- **TypeScript**: `tsconfig.json`, `tsconfig.server.json`
- **Testing**: `jest.config.js`, `jest.backend.config.js`, `jest.e2e.config.js`
- **Linting**: `eslint.config.mjs`, `.prettierrc`

## Folder Responsibilities

### `/src/app` - Next.js Pages
- Route-based file structure following App Router conventions
- Each route contains `page.tsx` and optional `layout.tsx`
- Co-located `__tests__/` directories for page-specific tests

### `/src/components` - Reusable Components
- Domain-specific component groupings (agents, analytics, kanban)
- `ui/` directory contains base shadcn/ui components
- Each component directory includes tests and related utilities

### `/src/backend` - Server-Side Logic
- RESTful API routes in `/routes`
- Platform adapters in `/adapters` with factory pattern
- Middleware for cross-cutting concerns (auth, validation, security)

### `/src/lib` - Shared Utilities
- Database utilities and performance monitoring
- Authentication and authorization helpers
- Circuit breaker and caching implementations
- Configuration management

### `/src/types` - Type Definitions
- Domain-specific type definitions
- Platform adapter interfaces
- API request/response types

## Development Workflow

1. **Feature Development**: Create feature branch from main
2. **Component Creation**: Use shadcn/ui patterns and co-locate tests
3. **API Development**: Follow RESTful conventions in backend routes
4. **Testing**: Maintain 90% coverage requirement
5. **Quality Gates**: All checks must pass before merge (lint, type-check, test, build)