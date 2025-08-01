// Cubcen Authentication Validation Schemas
// Zod schemas for validating authentication-related inputs

import { z } from 'zod'
import { UserRole } from '@/types/auth'

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
})

// Registration validation schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .max(255, 'Email must be less than 255 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    name: z
      .string()
      .max(100, 'Name must be less than 100 characters')
      .optional(),
    role: z.nativeEnum(UserRole).optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Password change validation schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmNewPassword: z
      .string()
      .min(1, 'New password confirmation is required'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  })

// Token refresh validation schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// User role update validation schema
export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.nativeEnum(UserRole, {
    message: 'Invalid role. Must be ADMIN, OPERATOR, or VIEWER',
  }),
})

// User profile update validation schema
export const updateProfileSchema = z.object({
  name: z.string().max(100, 'Name must be less than 100 characters').optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional(),
})

// JWT token validation schema
export const jwtTokenSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  iat: z.number(),
  exp: z.number(),
})

// Refresh token validation schema
export const refreshTokenPayloadSchema = z.object({
  userId: z.string(),
  tokenId: z.string(),
  iat: z.number(),
  exp: z.number(),
})

// API request validation schemas
export const authHeaderSchema = z.object({
  authorization: z
    .string()
    .regex(
      /^Bearer\s+.+$/,
      'Authorization header must be in format: Bearer <token>'
    ),
})

// Permission validation schema
export const permissionSchema = z.object({
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
})

// Type exports for use in other modules
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type JWTTokenData = z.infer<typeof jwtTokenSchema>
export type RefreshTokenData = z.infer<typeof refreshTokenPayloadSchema>
export type AuthHeaderData = z.infer<typeof authHeaderSchema>
export type PermissionData = z.infer<typeof permissionSchema>
