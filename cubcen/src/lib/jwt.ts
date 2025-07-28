// Cubcen JWT Token Management
// Utilities for creating, verifying, and managing JWT tokens

import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { 
  TokenPayload, 
  RefreshTokenPayload, 
  JWTConfig, 
  AuthToken,
  TokenExpiredError,
  InvalidTokenError
} from '@/types/auth'
import { UserRole } from '@/generated/prisma'

// JWT Configuration - should be loaded from environment variables
function getJWTConfig(): JWTConfig {
  return {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'cubcen-access-secret-change-in-production',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'cubcen-refresh-secret-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'cubcen'
  }
}

// Get config dynamically to support testing
const JWT_CONFIG = getJWTConfig()

/**
 * Generate a unique token ID for refresh tokens
 */
function generateTokenId(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Create an access token for a user
 */
export function createAccessToken(userId: string, email: string, role: UserRole): string {
  const config = getJWTConfig()
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId,
    email,
    role
  }

  return jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpiry,
    issuer: config.issuer,
    subject: userId
  })
}

/**
 * Create a refresh token for a user
 */
export function createRefreshToken(userId: string): string {
  const config = getJWTConfig()
  const tokenId = generateTokenId()
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    userId,
    tokenId
  }

  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiry,
    issuer: config.issuer,
    subject: userId
  })
}

/**
 * Create both access and refresh tokens for a user
 */
export function createTokenPair(userId: string, email: string, role: UserRole): AuthToken {
  const config = getJWTConfig()
  const accessToken = createAccessToken(userId, email, role)
  const refreshToken = createRefreshToken(userId)
  
  // Calculate expiry time in seconds
  const expiresIn = getTokenExpirySeconds(config.accessTokenExpiry)

  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer'
  }
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  const config = getJWTConfig()
  try {
    const decoded = jwt.verify(token, config.accessTokenSecret, {
      issuer: config.issuer
    }) as TokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Access token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError('Invalid access token')
    }
    throw new InvalidTokenError('Token verification failed')
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const config = getJWTConfig()
  try {
    const decoded = jwt.verify(token, config.refreshTokenSecret, {
      issuer: config.issuer
    }) as RefreshTokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Refresh token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError('Invalid refresh token')
    }
    throw new InvalidTokenError('Refresh token verification failed')
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Check if a token is expired without throwing an error
 */
export function isTokenExpired(token: string, secret: string): boolean {
  try {
    jwt.verify(token, secret)
    return false
  } catch {
    // Return true for any error (expired, invalid, malformed, etc.)
    return true
  }
}

/**
 * Decode token without verification (for debugging/logging)
 */
export function decodeTokenUnsafe(token: string): jwt.JwtPayload | null {
  try {
    const decoded = jwt.decode(token)
    return decoded as jwt.JwtPayload
  } catch {
    return null
  }
}

/**
 * Get token expiry time in seconds from a time string
 */
function getTokenExpirySeconds(expiryString: string): number {
  // Parse common time formats (15m, 1h, 7d, etc.)
  const match = expiryString.match(/^(\d+)([smhd])$/)
  if (!match) {
    return 900 // Default to 15 minutes
  }

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 60 * 60 * 24
    default: return 900
  }
}

/**
 * Get remaining time until token expires (in seconds)
 */
export function getTokenRemainingTime(token: string): number | null {
  const decoded = decodeTokenUnsafe(token)
  if (!decoded || !decoded.exp) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  const remaining = decoded.exp - now

  return remaining > 0 ? remaining : 0
}

/**
 * Check if token needs refresh (expires within threshold)
 */
export function shouldRefreshToken(token: string, thresholdSeconds: number = 300): boolean {
  const remaining = getTokenRemainingTime(token)
  return remaining === null || remaining <= thresholdSeconds
}

/**
 * Validate JWT configuration on startup
 */
export function validateJWTConfig(): void {
  const requiredEnvVars = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET'
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing JWT environment variables: ${missing.join(', ')}. Using default values (not secure for production).`)
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets must be set in production environment')
    }
    
    if (process.env.JWT_ACCESS_SECRET === 'cubcen-access-secret-change-in-production' ||
        process.env.JWT_REFRESH_SECRET === 'cubcen-refresh-secret-change-in-production') {
      throw new Error('Default JWT secrets detected in production. Please set secure secrets.')
    }
  }
}

// Export configuration for testing
export { JWT_CONFIG, getJWTConfig }