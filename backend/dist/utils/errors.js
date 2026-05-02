"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map