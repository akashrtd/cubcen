"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTokenError = exports.TokenExpiredError = exports.AuthorizationError = exports.AuthenticationError = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["OPERATOR"] = "OPERATOR";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
class AuthenticationError extends Error {
    constructor(message, code = 'AUTH_ERROR') {
        super(message);
        this.code = code;
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends Error {
    constructor(message, code = 'AUTHZ_ERROR') {
        super(message);
        this.code = code;
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class TokenExpiredError extends Error {
    constructor(message = 'Token has expired') {
        super(message);
        this.name = 'TokenExpiredError';
    }
}
exports.TokenExpiredError = TokenExpiredError;
class InvalidTokenError extends Error {
    constructor(message = 'Invalid token') {
        super(message);
        this.name = 'InvalidTokenError';
    }
}
exports.InvalidTokenError = InvalidTokenError;
//# sourceMappingURL=auth.js.map