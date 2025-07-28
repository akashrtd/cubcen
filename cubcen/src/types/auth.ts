// Cubcen Authentication Types
// Defines TypeScript interfaces and types for authentication system

import { UserRole } from '@/generated/prisma'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name?: string
  role?: UserRole
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
  iat: number
  exp: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
  iat: number
  exp: number
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface AuthResult {
  user: AuthUser
  tokens: AuthToken
}

export interface Permission {
  resource: string
  action: string
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[]
  [UserRole.OPERATOR]: Permission[]
  [UserRole.VIEWER]: Permission[]
}

// JWT Configuration
export interface JWTConfig {
  accessTokenSecret: string
  refreshTokenSecret: string
  accessTokenExpiry: string
  refreshTokenExpiry: string
  issuer: string
}

// Authentication errors
export class AuthenticationError extends Error {
  constructor(message: string, public code: string = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public code: string = 'AUTHZ_ERROR') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class TokenExpiredError extends Error {
  constructor(message: string = 'Token has expired') {
    super(message)
    this.name = 'TokenExpiredError'
  }
}

export class InvalidTokenError extends Error {
  constructor(message: string = 'Invalid token') {
    super(message)
    this.name = 'InvalidTokenError'
  }
}