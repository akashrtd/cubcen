// Cubcen JWT Utilities Tests
// Tests for JWT token creation, verification, and management

import jwt from 'jsonwebtoken'
import { UserRole } from '@/types/auth'
import {
  createAccessToken,
  createRefreshToken,
  createTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  isTokenExpired,
  decodeTokenUnsafe,
  getTokenRemainingTime,
  shouldRefreshToken,
  validateJWTConfig,
  getJWTConfig,
} from '../jwt'
import { TokenExpiredError, InvalidTokenError } from '@/types/auth'

// Mock environment variables
const originalEnv = process.env

beforeAll(() => {
  process.env = {
    ...originalEnv,
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
    JWT_ISSUER: 'cubcen-test',
  }
})

afterAll(() => {
  process.env = originalEnv
})

describe('JWT Utilities', () => {
  const userId = 'user-123'
  const email = 'test@cubcen.com'
  const role = UserRole.VIEWER

  describe('createAccessToken', () => {
    it('should create a valid access token', () => {
      const token = createAccessToken(userId, email, role)

      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)

      // Verify token structure
      const decoded = jwt.decode(token) as jwt.JwtPayload & {
        userId: string
        email: string
        role: string
      }
      expect(decoded.userId).toBe(userId)
      expect(decoded.email).toBe(email)
      expect(decoded.role).toBe(role)
      expect(decoded.iss).toBe(process.env.JWT_ISSUER || 'cubcen')
      expect(decoded.sub).toBe(userId)
    })

    it('should create tokens with different expiry times', () => {
      const token1 = createAccessToken(userId, email, role)
      const token2 = createAccessToken(userId, email, role)

      const decoded1 = jwt.decode(token1) as jwt.JwtPayload & { exp: number }
      const decoded2 = jwt.decode(token2) as jwt.JwtPayload & { exp: number }

      // Tokens should have similar expiry times (within 1 second)
      expect(Math.abs(decoded1.exp - decoded2.exp)).toBeLessThan(2)
    })
  })

  describe('createRefreshToken', () => {
    it('should create a valid refresh token', () => {
      const token = createRefreshToken(userId)

      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)

      // Verify token structure
      const decoded = jwt.decode(token) as jwt.JwtPayload & {
        userId: string
        tokenId: string
      }
      expect(decoded.userId).toBe(userId)
      expect(decoded.tokenId).toBeDefined()
      expect(typeof decoded.tokenId).toBe('string')
      expect(decoded.iss).toBe(process.env.JWT_ISSUER || 'cubcen')
      expect(decoded.sub).toBe(userId)
    })

    it('should create unique token IDs', () => {
      const token1 = createRefreshToken(userId)
      const token2 = createRefreshToken(userId)

      const decoded1 = jwt.decode(token1) as jwt.JwtPayload & {
        tokenId: string
      }
      const decoded2 = jwt.decode(token2) as jwt.JwtPayload & {
        tokenId: string
      }

      expect(decoded1.tokenId).not.toBe(decoded2.tokenId)
    })
  })

  describe('createTokenPair', () => {
    it('should create both access and refresh tokens', () => {
      const tokenPair = createTokenPair(userId, email, role)

      expect(tokenPair.accessToken).toBeDefined()
      expect(tokenPair.refreshToken).toBeDefined()
      expect(tokenPair.tokenType).toBe('Bearer')
      expect(tokenPair.expiresIn).toBeGreaterThan(0)

      // Verify both tokens are valid
      const accessDecoded = jwt.decode(
        tokenPair.accessToken
      ) as jwt.JwtPayload & { userId: string }
      const refreshDecoded = jwt.decode(
        tokenPair.refreshToken
      ) as jwt.JwtPayload & { userId: string }

      expect(accessDecoded.userId).toBe(userId)
      expect(refreshDecoded.userId).toBe(userId)
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = createAccessToken(userId, email, role)
      const payload = verifyAccessToken(token)

      expect(payload.userId).toBe(userId)
      expect(payload.email).toBe(email)
      expect(payload.role).toBe(role)
      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
    })

    it('should throw InvalidTokenError for malformed token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow(
        InvalidTokenError
      )
    })

    it('should throw TokenExpiredError for expired token', () => {
      // Create token with very short expiry
      const config = getJWTConfig()
      const expiredToken = jwt.sign(
        { userId, email, role },
        config.accessTokenSecret,
        { expiresIn: '1ms', issuer: config.issuer, subject: userId }
      )

      // Wait for token to expire
      setTimeout(() => {
        expect(() => verifyAccessToken(expiredToken)).toThrow(TokenExpiredError)
      }, 10)
    })

    it('should throw InvalidTokenError for wrong secret', () => {
      const config = getJWTConfig()
      const token = jwt.sign({ userId, email, role }, 'wrong-secret', {
        expiresIn: '15m',
        issuer: config.issuer,
        subject: userId,
      })

      expect(() => verifyAccessToken(token)).toThrow(InvalidTokenError)
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = createRefreshToken(userId)
      const payload = verifyRefreshToken(token)

      expect(payload.userId).toBe(userId)
      expect(payload.tokenId).toBeDefined()
      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
    })

    it('should throw InvalidTokenError for malformed token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow(
        InvalidTokenError
      )
    })
  })

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'valid-token-123'
      const header = `Bearer ${token}`

      const extracted = extractTokenFromHeader(header)
      expect(extracted).toBe(token)
    })

    it('should return null for missing header', () => {
      const extracted = extractTokenFromHeader(undefined)
      expect(extracted).toBeNull()
    })

    it('should return null for invalid format', () => {
      expect(extractTokenFromHeader('invalid-format')).toBeNull()
      expect(extractTokenFromHeader('Basic token')).toBeNull()
      expect(extractTokenFromHeader('Bearer')).toBeNull()
      expect(extractTokenFromHeader('Bearer token1 token2')).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const token = createAccessToken(userId, email, role)
      const config = getJWTConfig()
      const expired = isTokenExpired(token, config.accessTokenSecret)

      expect(expired).toBe(false)
    })

    it('should return true for expired token', () => {
      const config = getJWTConfig()
      const expiredToken = jwt.sign(
        { userId, email, role },
        config.accessTokenSecret,
        { expiresIn: '1ms', issuer: config.issuer, subject: userId }
      )

      setTimeout(() => {
        const expired = isTokenExpired(expiredToken, config.accessTokenSecret)
        expect(expired).toBe(true)
      }, 10)
    })

    it('should return true for invalid token', () => {
      const config = getJWTConfig()
      const expired = isTokenExpired('invalid-token', config.accessTokenSecret)
      expect(expired).toBe(true)
    })
  })

  describe('decodeTokenUnsafe', () => {
    it('should decode valid token without verification', () => {
      const token = createAccessToken(userId, email, role)
      const decoded = decodeTokenUnsafe(token) as jwt.JwtPayload & {
        userId: string
        email: string
        role: string
      }

      expect(decoded?.userId).toBe(userId)
      expect(decoded?.email).toBe(email)
      expect(decoded?.role).toBe(role)
    })

    it('should return null for invalid token', () => {
      const decoded = decodeTokenUnsafe('invalid-token')
      expect(decoded).toBeNull()
    })
  })

  describe('getTokenRemainingTime', () => {
    it('should return remaining time for valid token', () => {
      const token = createAccessToken(userId, email, role)
      const remaining = getTokenRemainingTime(token)

      expect(remaining).toBeGreaterThan(0)
      expect(remaining).toBeLessThanOrEqual(15 * 60) // 15 minutes in seconds
    })

    it('should return null for invalid token', () => {
      const remaining = getTokenRemainingTime('invalid-token')
      expect(remaining).toBeNull()
    })

    it('should return 0 for expired token', () => {
      const config = getJWTConfig()
      const expiredToken = jwt.sign(
        { userId, email, role },
        config.accessTokenSecret,
        { expiresIn: '1ms', issuer: config.issuer, subject: userId }
      )

      setTimeout(() => {
        const remaining = getTokenRemainingTime(expiredToken)
        expect(remaining).toBe(0)
      }, 10)
    })
  })

  describe('shouldRefreshToken', () => {
    it('should return false for fresh token', () => {
      const token = createAccessToken(userId, email, role)
      const shouldRefresh = shouldRefreshToken(token, 300) // 5 minutes threshold

      expect(shouldRefresh).toBe(false)
    })

    it('should return true for token nearing expiry', () => {
      // Create token with 2 minute expiry
      const config = getJWTConfig()
      const shortToken = jwt.sign(
        { userId, email, role },
        config.accessTokenSecret,
        { expiresIn: '2m', issuer: config.issuer, subject: userId }
      )

      const shouldRefresh = shouldRefreshToken(shortToken, 300) // 5 minutes threshold
      expect(shouldRefresh).toBe(true)
    })

    it('should return true for invalid token', () => {
      const shouldRefresh = shouldRefreshToken('invalid-token', 300)
      expect(shouldRefresh).toBe(true)
    })
  })

  describe('validateJWTConfig', () => {
    it('should not throw for valid configuration', () => {
      expect(() => validateJWTConfig()).not.toThrow()
    })

    it('should warn about missing environment variables', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const originalAccessSecret = process.env.JWT_ACCESS_SECRET
      const originalRefreshSecret = process.env.JWT_REFRESH_SECRET

      delete process.env.JWT_ACCESS_SECRET
      delete process.env.JWT_REFRESH_SECRET

      validateJWTConfig()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing JWT environment variables')
      )

      // Restore environment variables
      if (originalAccessSecret)
        process.env.JWT_ACCESS_SECRET = originalAccessSecret
      if (originalRefreshSecret)
        process.env.JWT_REFRESH_SECRET = originalRefreshSecret

      consoleSpy.mockRestore()
    })

    it('should throw in production with missing secrets', () => {
      const originalNodeEnv = process.env.NODE_ENV
      const originalAccessSecret = process.env.JWT_ACCESS_SECRET

      process.env.NODE_ENV = 'production'
      delete process.env.JWT_ACCESS_SECRET

      expect(() => validateJWTConfig()).toThrow(
        'JWT secrets must be set in production environment'
      )

      // Restore environment variables
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true });
      if (originalAccessSecret)
        process.env.JWT_ACCESS_SECRET = originalAccessSecret
    })

    it('should throw in production with default secrets', () => {
      const originalNodeEnv = process.env.NODE_ENV
      const originalAccessSecret = process.env.JWT_ACCESS_SECRET
      const originalRefreshSecret = process.env.JWT_REFRESH_SECRET

      process.env.NODE_ENV = 'production'
      process.env.JWT_ACCESS_SECRET =
        'cubcen-access-secret-change-in-production'
      process.env.JWT_REFRESH_SECRET = 'some-other-secret'

      expect(() => validateJWTConfig()).toThrow(
        'Default JWT secrets detected in production'
      )

      // Restore environment variables
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true });
      if (originalAccessSecret)
        process.env.JWT_ACCESS_SECRET = originalAccessSecret
      if (originalRefreshSecret)
        process.env.JWT_REFRESH_SECRET = originalRefreshSecret
    })
  })
})
