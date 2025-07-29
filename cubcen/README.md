# Cubcen - AI Agent Management Platform

A centralized platform to manage, monitor, and orchestrate AI agents from various automation platforms including n8n, Make.com, Zapier, and more.

## 🚀 Features

- **Multi-Platform Integration**: Connect and manage AI agents from various automation platforms
- **Platform Adapter Framework**: Extensible architecture for integrating with n8n, Make.com, Zapier, and more
- **Circuit Breaker Pattern**: Resilient external API calls with automatic failure recovery
- **Real-time Monitoring**: Monitor agent status, track progress, and receive instant alerts
- **Task Scheduling**: Schedule and automate workflows with advanced retry logic
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type-Safe**: Full TypeScript support throughout the application

## 🎨 Design System

Cubcen uses a custom design system with brand colors:

- **Primary**: `#3F51B5` (Indigo) - Main brand color for buttons, links, and primary actions
- **Secondary**: `#B19ADA` (Light Purple) - Accent color for highlights, badges, and secondary elements

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Font**: Inter
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Development Scripts

```bash
# Development
npm run dev              # Start development server

# Quality Gates
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript type checking
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run quality-gates    # Run all quality checks

# Formatting
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Build
npm run build            # Build for production
npm start                # Start production server
```

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── dashboard/      # Dashboard components
│   ├── kanban/         # Kanban board components
│   ├── analytics/      # Analytics components
│   └── agents/         # Agent management components
├── hooks/              # Custom React hooks
├── services/           # API services
├── backend/            # Backend services
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── adapters/       # Platform adapters
│   │   ├── base-adapter.ts      # Abstract base adapter
│   │   ├── adapter-factory.ts   # Factory pattern for adapters
│   │   ├── mock-adapter.ts      # Mock adapter for testing
│   │   └── __tests__/           # Adapter tests
│   └── middleware/     # Express middleware
├── lib/                # Utility functions
│   ├── circuit-breaker.ts       # Circuit breaker implementation
│   └── __tests__/               # Library tests
└── types/              # TypeScript type definitions
    └── platform.ts              # Platform adapter types
```

## 🎯 MVP Scope

The current MVP includes:

- ✅ Project setup with modern tooling
- ✅ Cubcen brand identity and design system
- ✅ Basic homepage with feature overview
- ✅ Quality gates and testing infrastructure
- ✅ Proper folder structure for scalability
- ✅ **Platform Adapter Framework** with circuit breaker pattern
- ✅ Database integration with Prisma and PostgreSQL
- ✅ Authentication system with JWT and RBAC
- ✅ Health monitoring and API endpoints

## 🔌 Platform Adapter Framework

Cubcen features a robust platform adapter framework that enables seamless integration with various automation platforms.

### Architecture

The adapter framework follows these design patterns:

- **Abstract Base Class**: `BasePlatformAdapter` defines the contract for all platform integrations
- **Factory Pattern**: `AdapterFactory` provides dynamic loading and instance management
- **Circuit Breaker**: Resilient external API calls with automatic failure recovery
- **Event System**: Real-time event subscription and notification system

### Supported Platforms

- **n8n**: Open-source workflow automation
- **Make.com**: Visual automation platform
- **Zapier**: Popular automation service
- **Extensible**: Easy to add new platform adapters

### Key Components

#### BasePlatformAdapter

Abstract class that all platform adapters must implement:

```typescript
abstract class BasePlatformAdapter {
  abstract authenticate(credentials: PlatformCredentials): Promise<AuthResult>
  abstract discoverAgents(): Promise<Agent[]>
  abstract getAgentStatus(agentId: string): Promise<AgentStatus>
  abstract executeAgent(
    agentId: string,
    params: ExecutionParams
  ): Promise<ExecutionResult>
  abstract healthCheck(): Promise<HealthStatus>
  abstract connect(): Promise<ConnectionStatus>
  abstract disconnect(): Promise<void>
}
```

#### AdapterFactory

Manages adapter registration and instance creation:

```typescript
// Register a new adapter type
AdapterFactory.registerAdapter('n8n', N8nAdapter)

// Create adapter instance
const adapter = AdapterFactory.createAdapter(config)

// Get existing adapter
const adapter = AdapterFactory.getAdapter('platform-id')
```

#### Circuit Breaker

Provides resilient external API calls:

```typescript
const circuitBreaker = createPlatformCircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 30000,
})

const result = await circuitBreaker.execute(() => apiCall())
```

### Usage Example

```typescript
import { AdapterFactory } from './backend/adapters/adapter-factory'

// Configure platform
const config = {
  id: 'my-n8n-instance',
  name: 'Production n8n',
  type: 'n8n',
  baseUrl: 'https://n8n.example.com',
  credentials: {
    apiKey: 'your-api-key',
  },
}

// Create and connect adapter
const adapter = AdapterFactory.createAdapter(config)
await adapter.connect()

// Discover agents
const agents = await adapter.discoverAgents()

// Execute agent
const result = await adapter.executeAgent('agent-id', { param: 'value' })

// Subscribe to events
await adapter.subscribeToEvents(event => {
  console.log('Platform event:', event)
})
```

### Testing

The framework includes comprehensive testing utilities:

- **MockPlatformAdapter**: Full-featured mock for testing and development
- **Circuit Breaker Tests**: Failure scenarios and recovery testing
- **Factory Pattern Tests**: Registration and instance management
- **Integration Tests**: End-to-end adapter functionality

Run adapter tests:

```bash
npm run test -- --testPathPatterns="circuit-breaker|base-adapter|adapter-factory|mock-adapter"
```

## 🔄 Next Steps

1. ✅ Platform adapter framework
2. Real-time monitoring dashboard
3. Task scheduling engine
4. Platform-specific adapter implementations
5. Advanced analytics and reporting

## 📝 Quality Standards

- **TypeScript Strict Mode**: No `any` types, proper type definitions
- **Test Coverage**: Minimum 90% code coverage for all modules
- **Code Quality**: ESLint + Prettier for consistent code style
- **Performance**: Response times <200ms for API calls
- **Security**: Input sanitization, authentication, and authorization checks

## 🤝 Contributing

1. Follow the established code style and quality gates
2. Write tests for all new functionality
3. Update documentation as needed
4. Ensure all quality gates pass before submitting

## 📄 License

This project is part of the Cubcen AI Agent Management Platform.
