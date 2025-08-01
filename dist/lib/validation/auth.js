"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionSchema = exports.authHeaderSchema = exports.refreshTokenPayloadSchema = exports.jwtTokenSchema = exports.updateProfileSchema = exports.updateUserRoleSchema = exports.refreshTokenSchema = exports.changePasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const auth_1 = require("@/types/auth");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
    password: zod_1.z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
    name: zod_1.z
        .string()
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    role: zod_1.z.nativeEnum(auth_1.UserRole).optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z
        .string()
        .min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .max(128, 'New password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    confirmNewPassword: zod_1.z.string().min(1, 'New password confirmation is required')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword']
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z
        .string()
        .min(1, 'Refresh token is required')
});
exports.updateUserRoleSchema = zod_1.z.object({
    userId: zod_1.z
        .string()
        .min(1, 'User ID is required'),
    role: zod_1.z.nativeEnum(auth_1.UserRole, {
        message: 'Invalid role. Must be ADMIN, OPERATOR, or VIEWER'
    })
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    email: zod_1.z
        .string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters')
        .optional()
});
exports.jwtTokenSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    email: zod_1.z.string().email(),
    role: zod_1.z.nativeEnum(auth_1.UserRole),
    iat: zod_1.z.number(),
    exp: zod_1.z.number()
});
exports.refreshTokenPayloadSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    tokenId: zod_1.z.string(),
    iat: zod_1.z.number(),
    exp: zod_1.z.number()
});
exports.authHeaderSchema = zod_1.z.object({
    authorization: zod_1.z
        .string()
        .regex(/^Bearer\s+.+$/, 'Authorization header must be in format: Bearer <token>')
});
exports.permissionSchema = zod_1.z.object({
    resource: zod_1.z.string().min(1, 'Resource is required'),
    action: zod_1.z.string().min(1, 'Action is required')
});
//# sourceMappingURL=auth.js.map