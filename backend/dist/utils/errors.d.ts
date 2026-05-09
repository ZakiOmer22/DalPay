export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code: string;
    details?: any;
    constructor(message: string, statusCode: number, code?: string, details?: any);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, code?: string, details?: any);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class MethodNotAllowedError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class GoneError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class UnprocessableEntityError extends AppError {
    constructor(message?: string, code?: string, details?: any);
}
export declare class TooManyRequestsError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class NotImplementedError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class BadGatewayError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class ServiceUnavailableError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class GatewayTimeoutError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class ValidationError extends AppError {
    constructor(message?: string, errors?: any);
}
export declare class PaymentRequiredError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class TokenExpiredError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class InsufficientFundsError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class DuplicateEntryError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class RateLimitExceededError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class TaxAssessmentNotFoundError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class PaymentFailedError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class VerificationFailedError extends AppError {
    constructor(message?: string, code?: string);
}
//# sourceMappingURL=errors.d.ts.map