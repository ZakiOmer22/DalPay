// utils/errors.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;         // Machine-readable error code
  public details?: any;        // Additional details (validation errors, etc.)

  constructor(message: string, statusCode: number, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── 4xx Client Errors ──────────────────────────────

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST', details?: any) {
    super(message, 400, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message = 'Method not allowed', code = 'METHOD_NOT_ALLOWED') {
    super(message, 405, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class GoneError extends AppError {
  constructor(message = 'Resource no longer available', code = 'GONE') {
    super(message, 410, code);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity', code = 'UNPROCESSABLE_ENTITY', details?: any) {
    super(message, 422, code, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, try again later', code = 'TOO_MANY_REQUESTS') {
    super(message, 429, code);
  }
}

// ── 5xx Server Errors ──────────────────────────────

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(message, 500, code);
  }
}

export class NotImplementedError extends AppError {
  constructor(message = 'Not implemented', code = 'NOT_IMPLEMENTED') {
    super(message, 501, code);
  }
}

export class BadGatewayError extends AppError {
  constructor(message = 'Bad gateway', code = 'BAD_GATEWAY') {
    super(message, 502, code);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', code = 'SERVICE_UNAVAILABLE') {
    super(message, 503, code);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = 'Gateway timeout', code = 'GATEWAY_TIMEOUT') {
    super(message, 504, code);
  }
}

// ── Domain / Business Errors ──────────────────────

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: any) {
    super(message, 422, 'VALIDATION_ERROR', errors);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = 'Payment required', code = 'PAYMENT_REQUIRED') {
    super(message, 402, code);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = 'Token has expired', code = 'TOKEN_EXPIRED') {
    super(message, 401, code);
  }
}

export class InsufficientFundsError extends AppError {
  constructor(message = 'Insufficient funds', code = 'INSUFFICIENT_FUNDS') {
    super(message, 400, code);
  }
}

export class DuplicateEntryError extends AppError {
  constructor(message = 'Duplicate entry', code = 'DUPLICATE_ENTRY') {
    super(message, 409, code);
  }
}

export class RateLimitExceededError extends AppError {
  constructor(message = 'Rate limit exceeded', code = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, code);
  }
}

export class TaxAssessmentNotFoundError extends AppError {
  constructor(message = 'Tax assessment not found', code = 'TAX_ASSESSMENT_NOT_FOUND') {
    super(message, 404, code);
  }
}

export class PaymentFailedError extends AppError {
  constructor(message = 'Payment failed', code = 'PAYMENT_FAILED') {
    super(message, 400, code);
  }
}

export class VerificationFailedError extends AppError {
  constructor(message = 'Identity verification failed', code = 'VERIFICATION_FAILED') {
    super(message, 400, code);
  }
}