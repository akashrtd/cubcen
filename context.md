# Cubcen Project Context

This document provides a high-level overview of the Cubcen project, including its purpose, tech stack, and key architectural features.

## Project Overview

Cubcen is a centralized platform to manage, monitor, and orchestrate AI agents from various automation platforms including n8n, Make.com, Zapier, and more.

## Key Features

- **Multi-Platform Integration**: Connect and manage AI agents from various automation platforms
- **Platform Adapter Framework**: Extensible architecture for integrating with n8n, Make.com, Zapier, and more
- **Circuit Breaker Pattern**: Resilient external API calls with automatic failure recovery
- **Real-time Monitoring**: Monitor agent status, track progress, and receive instant alerts
- **Task Scheduling**: Schedule and automate workflows with advanced retry logic
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type-Safe**: Full TypeScript support throughout the application

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Font**: Inter
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Database**: Prisma with PostgreSQL
- **Authentication**: JWT and RBAC

## Project Structure

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

## Platform Adapter Framework

Cubcen features a robust platform adapter framework that enables seamless integration with various automation platforms.

### Architecture

The adapter framework follows these design patterns:

- **Abstract Base Class**: `BasePlatformAdapter` defines the contract for all platform integrations
- **Factory Pattern**: `AdapterFactory` provides dynamic loading and instance management
- **Circuit Breaker**: Resilient external API calls with automatic failure recovery
- **Event System**: Real-time event subscription and notification system

### Dependencies

#### Main Dependencies
- next: 15.4.4
- react: 19.1.0
- typescript: 5
- prisma: 6.13.0
- tailwindcss: 4
- jest: 30.0.5
- express: 5.1.0
- socket.io: 4.8.1

#### UI and Component Libraries
- @radix-ui/*
- shadcn/ui (via CLI, not a direct dependency)
- lucide-react
- recharts
- sonner

#### Data and State Management
- @dnd-kit/*
- react-hook-form
- zod

#### Backend and API
- axios
- bcryptjs
- jsonwebtoken
- nodemailer
- winston
- swagger-jsdoc
- swagger-ui-express
