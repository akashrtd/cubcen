# Technology Stack

## Framework & Runtime
- **Next.js 15** with App Router - Full-stack React framework
- **TypeScript** - Strict mode enabled, no `any` types allowed
- **Node.js** - Backend runtime environment

## Frontend Stack
- **React 19** - UI library with latest features
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library built on Radix UI
- **next-themes** - Theme management (light/dark mode)
- **Lucide React** - Icon library
- **Recharts** - Data visualization and charts

## Backend & Database
- **Express.js** - Backend API server
- **Prisma** - Database ORM with type-safe queries
- **SQLite** - Development database (configurable for production)
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Testing & Quality
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Supertest** - API endpoint testing
- **ESLint** - Code linting with Next.js config
- **Prettier** - Code formatting
- **90% test coverage requirement** - Enforced via Jest configuration

## Development Tools
- **tsx** - TypeScript execution for development
- **Turbopack** - Fast bundler for development mode
- **Prisma Studio** - Database management UI

## Common Commands

### Development
```bash
npm run dev              # Start Next.js dev server with Turbopack
npm run dev:server       # Start backend server in watch mode
npm run db:studio        # Open Prisma Studio for database management
```

### Database Operations
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (destructive)
```

### Testing
```bash
npm run test             # Run all tests
npm run test:backend     # Run backend-only tests
npm run test:e2e         # Run end-to-end tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:comprehensive # Run comprehensive test suite
```

### Quality Gates
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run type-check       # Run TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run quality-gates    # Run all quality checks (lint + type-check + test + build)
```

### Build & Deploy
```bash
npm run build            # Build Next.js application
npm run build:server     # Build backend server
npm start                # Start production Next.js server
npm run start:server     # Start production backend server
```

## Architecture Patterns

### Platform Adapter Pattern
- **BasePlatformAdapter** - Abstract base class for all platform integrations
- **AdapterFactory** - Factory pattern for creating and managing adapter instances
- **Circuit Breaker** - Resilient external API calls with failure recovery

### Code Organization
- Strict separation between frontend (`src/app`, `src/components`) and backend (`src/backend`)
- Service layer pattern for business logic (`src/services`)
- Type definitions centralized in `src/types`
- Utility functions in `src/lib`

### Configuration Management
- Environment-based configuration with `.env` files
- Type-safe configuration validation
- Separate configs for development, testing, and production