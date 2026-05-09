"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationFailedError = exports.PaymentFailedError = exports.TaxAssessmentNotFoundError = exports.RateLimitExceededError = exports.DuplicateEntryError = exports.InsufficientFundsError = exports.TokenExpiredError = exports.PaymentRequiredError = exports.ValidationError = exports.GatewayTimeoutError = exports.ServiceUnavailableError = exports.BadGatewayError = exports.NotImplementedError = exports.InternalServerError = exports.TooManyRequestsError = exports.UnprocessableEntityError = exports.GoneError = exports.ConflictError = exports.MethodNotAllowedError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
// utils/errors.ts
class AppError extends Error {
    constructor(message, statusCode, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// ── 4xx Client Errors ──────────────────────────────
class BadRequestError extends AppError {
    constructor(message = 'Bad request', code = 'BAD_REQUEST', details) {
        super(message, 400, code, details);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
        super(message, 401, code);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access denied', code = 'FORBIDDEN') {
        super(message, 403, code);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
        super(message, 404, code);
    }
}
exports.NotFoundError = NotFoundError;
class MethodNotAllowedError extends AppError {
    constructor(message = 'Method not allowed', code = 'METHOD_NOT_ALLOWED') {
        super(message, 405, code);
    }
}
exports.MethodNotAllowedError = MethodNotAllowedError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists', code = 'CONFLICT') {
        super(message, 409, code);
    }
}
exports.ConflictError = ConflictError;
class GoneError extends AppError {
    constructor(message = 'Resource no longer available', code = 'GONE') {
        super(message, 410, code);
    }
}
exports.GoneError = GoneError;
class UnprocessableEntityError extends AppError {
    constructor(message = 'Unprocessable entity', code = 'UNPROCESSABLE_ENTITY', details) {
        super(message, 422, code, details);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests, try again later', code = 'TOO_MANY_REQUESTS') {
        super(message, 429, code);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
// ── 5xx Server Errors ──────────────────────────────
class InternalServerError extends AppError {
    constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
        super(message, 500, code);
    }
}
exports.InternalServerError = InternalServerError;
class NotImplementedError extends AppError {
    constructor(message = 'Not implemented', code = 'NOT_IMPLEMENTED') {
        super(message, 501, code);
    }
}
exports.NotImplementedError = NotImplementedError;
class BadGatewayError extends AppError {
    constructor(message = 'Bad gateway', code = 'BAD_GATEWAY') {
        super(message, 502, code);
    }
}
exports.BadGatewayError = BadGatewayError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable', code = 'SERVICE_UNAVAILABLE') {
        super(message, 503, code);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class GatewayTimeoutError extends AppError {
    constructor(message = 'Gateway timeout', code = 'GATEWAY_TIMEOUT') {
        super(message, 504, code);
    }
}
exports.GatewayTimeoutError = GatewayTimeoutError;
// ── Domain / Business Errors ──────────────────────
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors) {
        super(message, 422, 'VALIDATION_ERROR', errors);
    }
}
exports.ValidationError = ValidationError;
class PaymentRequiredError extends AppError {
    constructor(message = 'Payment required', code = 'PAYMENT_REQUIRED') {
        super(message, 402, code);
    }
}
exports.PaymentRequiredError = PaymentRequiredError;
class TokenExpiredError extends AppError {
    constructor(message = 'Token has expired', code = 'TOKEN_EXPIRED') {
        super(message, 401, code);
    }
}
exports.TokenExpiredError = TokenExpiredError;
class InsufficientFundsError extends AppError {
    constructor(message = 'Insufficient funds', code = 'INSUFFICIENT_FUNDS') {
        super(message, 400, code);
    }
}
exports.InsufficientFundsError = InsufficientFundsError;
class DuplicateEntryError extends AppError {
    constructor(message = 'Duplicate entry', code = 'DUPLICATE_ENTRY') {
        super(message, 409, code);
    }
}
exports.DuplicateEntryError = DuplicateEntryError;
class RateLimitExceededError extends AppError {
    constructor(message = 'Rate limit exceeded', code = 'RATE_LIMIT_EXCEEDED') {
        super(message, 429, code);
    }
}
exports.RateLimitExceededError = RateLimitExceededError;
class TaxAssessmentNotFoundError extends AppError {
    constructor(message = 'Tax assessment not found', code = 'TAX_ASSESSMENT_NOT_FOUND') {
        super(message, 404, code);
    }
}
exports.TaxAssessmentNotFoundError = TaxAssessmentNotFoundError;
class PaymentFailedError extends AppError {
    constructor(message = 'Payment failed', code = 'PAYMENT_FAILED') {
        super(message, 400, code);
    }
}
exports.PaymentFailedError = PaymentFailedError;
class VerificationFailedError extends AppError {
    constructor(message = 'Identity verification failed', code = 'VERIFICATION_FAILED') {
        super(message, 400, code);
    }
}
exports.VerificationFailedError = VerificationFailedError;
//# sourceMappingURL=errors.js.map