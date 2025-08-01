"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("@/types/auth");
const auth_2 = require("@/types/auth");
const jwt_1 = require("@/lib/jwt");
const logger_1 = require("@/lib/logger");
const database_1 = require("@/lib/database");
class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async login(credentials) {
        try {
            logger_1.logger.info('User login attempt', { email: credentials.email });
            const user = await this.prisma.user.findUnique({
                where: { email: credentials.email }
            });
            if (!user) {
                logger_1.logger.warn('Login failed: User not found', { email: credentials.email });
                throw new auth_2.AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
            }
            const isPasswordValid = await bcryptjs_1.default.compare(credentials.password, user.password);
            if (!isPasswordValid) {
                logger_1.logger.warn('Login failed: Invalid password', { email: credentials.email, userId: user.id });
                throw new auth_2.AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
            }
            const tokens = (0, jwt_1.createTokenPair)(user.id, user.email, user.role);
            const authUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            logger_1.logger.info('User login successful', {
                email: credentials.email,
                userId: user.id,
                role: user.role
            });
            return {
                user: authUser,
                tokens
            };
        }
        catch (error) {
            if (error instanceof auth_2.AuthenticationError) {
                throw error;
            }
            logger_1.logger.error('Login error', error, { email: credentials.email });
            throw new auth_2.AuthenticationError('Login failed', 'LOGIN_ERROR');
        }
    }
    async register(credentials) {
        try {
            logger_1.logger.info('User registration attempt', { email: credentials.email });
            const existingUser = await this.prisma.user.findUnique({
                where: { email: credentials.email }
            });
            if (existingUser) {
                logger_1.logger.warn('Registration failed: Email already exists', { email: credentials.email });
                throw new auth_2.AuthenticationError('Email already registered', 'EMAIL_EXISTS');
            }
            const saltRounds = 12;
            const hashedPassword = await bcryptjs_1.default.hash(credentials.password, saltRounds);
            const userRole = credentials.role || auth_1.UserRole.VIEWER;
            const user = await this.prisma.user.create({
                data: {
                    email: credentials.email,
                    password: hashedPassword,
                    name: credentials.name || null,
                    role: userRole
                }
            });
            const tokens = (0, jwt_1.createTokenPair)(user.id, user.email, user.role);
            const authUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            logger_1.logger.info('User registration successful', {
                email: credentials.email,
                userId: user.id,
                role: user.role
            });
            return {
                user: authUser,
                tokens
            };
        }
        catch (error) {
            if (error instanceof auth_2.AuthenticationError) {
                throw error;
            }
            logger_1.logger.error('Registration error', error, { email: credentials.email });
            throw new auth_2.AuthenticationError('Registration failed', 'REGISTRATION_ERROR');
        }
    }
    async refreshToken(refreshToken) {
        try {
            logger_1.logger.info('Token refresh attempt');
            const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.userId }
            });
            if (!user) {
                logger_1.logger.warn('Token refresh failed: User not found', { userId: payload.userId });
                throw new auth_2.AuthenticationError('Invalid refresh token', 'INVALID_TOKEN');
            }
            const tokens = (0, jwt_1.createTokenPair)(user.id, user.email, user.role);
            logger_1.logger.info('Token refresh successful', {
                userId: user.id,
                email: user.email
            });
            return tokens;
        }
        catch (error) {
            if (error instanceof auth_2.AuthenticationError) {
                throw error;
            }
            logger_1.logger.error('Token refresh error', error);
            throw new auth_2.AuthenticationError('Token refresh failed', 'REFRESH_ERROR');
        }
    }
    async validateToken(token) {
        try {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.userId }
            });
            if (!user) {
                throw new auth_2.AuthenticationError('User not found', 'USER_NOT_FOUND');
            }
            const authUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            return authUser;
        }
        catch (error) {
            if (error instanceof auth_2.AuthenticationError) {
                throw error;
            }
            logger_1.logger.error('Token validation error', error);
            throw new auth_2.AuthenticationError('Invalid token', 'INVALID_TOKEN');
        }
    }
    async validateAuthHeader(authHeader) {
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (!token) {
            throw new auth_2.AuthenticationError('Missing or invalid authorization header', 'MISSING_TOKEN');
        }
        return this.validateToken(token);
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            logger_1.logger.info('Password change attempt', { userId });
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new auth_2.AuthenticationError('User not found', 'USER_NOT_FOUND');
            }
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                logger_1.logger.warn('Password change failed: Invalid current password', { userId });
                throw new auth_2.AuthenticationError('Current password is incorrect', 'INVALID_PASSWORD');
            }
            const saltRounds = 12;
            const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
            await this.prisma.user.update({
                where: { id: userId },
                data: { password: hashedNewPassword }
            });
            logger_1.logger.info('Password change successful', { userId });
        }
        catch (error) {
            if (error instanceof auth_2.AuthenticationError) {
                throw error;
            }
            logger_1.logger.error('Password change error', error, { userId });
            throw new auth_2.AuthenticationError('Password change failed', 'PASSWORD_CHANGE_ERROR');
        }
    }
    async updateUserRole(userId, newRole) {
        try {
            logger_1.logger.info('User role update attempt', { userId, newRole });
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: { role: newRole }
            });
            logger_1.logger.info('User role update successful', { userId, newRole });
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        }
        catch (error) {
            logger_1.logger.error('User role update error', error, { userId, newRole });
            throw new auth_2.AuthenticationError('Role update failed', 'ROLE_UPDATE_ERROR');
        }
    }
    async getUserById(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return null;
            }
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        }
        catch (error) {
            logger_1.logger.error('Get user by ID error', error, { userId });
            throw new auth_2.AuthenticationError('Failed to get user', 'GET_USER_ERROR');
        }
    }
    async getAllUsers() {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));
        }
        catch (error) {
            logger_1.logger.error('Get all users error', error);
            throw new auth_2.AuthenticationError('Failed to get users', 'GET_USERS_ERROR');
        }
    }
    async deleteUser(userId) {
        try {
            logger_1.logger.info('User deletion attempt', { userId });
            await this.prisma.user.delete({
                where: { id: userId }
            });
            logger_1.logger.info('User deletion successful', { userId });
        }
        catch (error) {
            logger_1.logger.error('User deletion error', error, { userId });
            throw new auth_2.AuthenticationError('User deletion failed', 'DELETE_USER_ERROR');
        }
    }
}
const authService = new AuthService(database_1.prisma);
exports.authService = authService;
//# sourceMappingURL=auth.js.map