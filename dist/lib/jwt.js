"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_CONFIG = void 0;
exports.createAccessToken = createAccessToken;
exports.createRefreshToken = createRefreshToken;
exports.createTokenPair = createTokenPair;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.extractTokenFromHeader = extractTokenFromHeader;
exports.generateToken = generateToken;
exports.isTokenExpired = isTokenExpired;
exports.decodeTokenUnsafe = decodeTokenUnsafe;
exports.getTokenRemainingTime = getTokenRemainingTime;
exports.shouldRefreshToken = shouldRefreshToken;
exports.validateJWTConfig = validateJWTConfig;
exports.getJWTConfig = getJWTConfig;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const auth_1 = require("@/types/auth");
const auth_2 = require("@/types/auth");
function getJWTConfig() {
    return {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'cubcen-access-secret-change-in-production',
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'cubcen-refresh-secret-change-in-production',
        accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
        issuer: process.env.JWT_ISSUER || 'cubcen'
    };
}
const JWT_CONFIG = getJWTConfig();
exports.JWT_CONFIG = JWT_CONFIG;
function generateTokenId() {
    return (0, crypto_1.randomBytes)(32).toString('hex');
}
function createAccessToken(userId, email, role) {
    const config = getJWTConfig();
    const payload = {
        userId,
        email,
        role
    };
    return jsonwebtoken_1.default.sign(payload, config.accessTokenSecret, {
        expiresIn: config.accessTokenExpiry,
        issuer: config.issuer,
        subject: userId
    });
}
function createRefreshToken(userId) {
    const config = getJWTConfig();
    const tokenId = generateTokenId();
    const payload = {
        userId,
        tokenId
    };
    return jsonwebtoken_1.default.sign(payload, config.refreshTokenSecret, {
        expiresIn: config.refreshTokenExpiry,
        issuer: config.issuer,
        subject: userId
    });
}
function createTokenPair(userId, email, role) {
    const config = getJWTConfig();
    const accessToken = createAccessToken(userId, email, role);
    const refreshToken = createRefreshToken(userId);
    const expiresIn = getTokenExpirySeconds(config.accessTokenExpiry);
    return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
    };
}
function verifyAccessToken(token) {
    const config = getJWTConfig();
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config.accessTokenSecret, {
            issuer: config.issuer
        });
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new auth_1.TokenExpiredError('Access token has expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new auth_1.InvalidTokenError('Invalid access token');
        }
        throw new auth_1.InvalidTokenError('Token verification failed');
    }
}
function verifyRefreshToken(token) {
    const config = getJWTConfig();
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config.refreshTokenSecret, {
            issuer: config.issuer
        });
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new auth_1.TokenExpiredError('Refresh token has expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new auth_1.InvalidTokenError('Invalid refresh token');
        }
        throw new auth_1.InvalidTokenError('Refresh token verification failed');
    }
}
function extractTokenFromHeader(authHeader) {
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    return parts[1];
}
function generateToken(userId, email, role = auth_2.UserRole.VIEWER) {
    return createAccessToken(userId, email, role);
}
function isTokenExpired(token, secret) {
    try {
        jsonwebtoken_1.default.verify(token, secret);
        return false;
    }
    catch {
        return true;
    }
}
function decodeTokenUnsafe(token) {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        return decoded;
    }
    catch {
        return null;
    }
}
function getTokenExpirySeconds(expiryString) {
    const match = expiryString.match(/^(\d+)([smhd])$/);
    if (!match) {
        return 900;
    }
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 60 * 60 * 24;
        default: return 900;
    }
}
function getTokenRemainingTime(token) {
    const decoded = decodeTokenUnsafe(token);
    if (!decoded || !decoded.exp) {
        return null;
    }
    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;
    return remaining > 0 ? remaining : 0;
}
function shouldRefreshToken(token, thresholdSeconds = 300) {
    const remaining = getTokenRemainingTime(token);
    return remaining === null || remaining <= thresholdSeconds;
}
function validateJWTConfig() {
    const requiredEnvVars = [
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET'
    ];
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missing.length > 0) {
        console.warn(`Warning: Missing JWT environment variables: ${missing.join(', ')}. Using default values (not secure for production).`);
    }
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT secrets must be set in production environment');
        }
        if (process.env.JWT_ACCESS_SECRET === 'cubcen-access-secret-change-in-production' ||
            process.env.JWT_REFRESH_SECRET === 'cubcen-refresh-secret-change-in-production') {
            throw new Error('Default JWT secrets detected in production. Please set secure secrets.');
        }
    }
}
//# sourceMappingURL=jwt.js.map