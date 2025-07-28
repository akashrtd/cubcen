# Cubcen - AI Agent Management Platform

A centralized platform to manage, monitor, and orchestrate AI agents from various automation platforms including n8n, Make.com, Zapier, and more.

## 🚀 Features

- **Multi-Platform Integration**: Connect and manage AI agents from various automation platforms
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
│   └── middleware/     # Express middleware
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## 🎯 MVP Scope

The current MVP focuses on:
- Project setup with modern tooling
- Cubcen brand identity and design system
- Basic homepage with feature overview
- Quality gates and testing infrastructure
- Proper folder structure for scalability

## 🔄 Next Steps

1. Database setup with Prisma and SQLite
2. Authentication system with JWT
3. Platform adapter framework
4. Real-time monitoring dashboard
5. Task scheduling engine

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