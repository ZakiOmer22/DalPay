"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const tax_routes_1 = __importDefault(require("./modules/tax/tax.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/payment.routes"));
const reconciliation_routes_1 = __importDefault(require("./modules/reconciliation/reconciliation.routes"));
const response_1 = require("./utils/response");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
// ==================== TRUST PROXY ====================
app.set('trust proxy', 1);
// ==================== SECURITY MIDDLEWARE ====================
// Helmet – secure HTTP headers
app.use((0, helmet_1.default)());
// Content Security Policy
app.use(helmet_1.default.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
    },
}));
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: 'same-origin' }));
app.use(helmet_1.default.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use(helmet_1.default.frameguard({ action: 'deny' }));
app.use(helmet_1.default.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
// CORS
const allowedOrigins = env_1.env.nodeEnv === 'production'
    ? ['https://dalpay.gov.so', 'https://admin.dalpay.gov.so']
    : ['http://localhost:5173', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
    credentials: true,
    maxAge: 86400,
}));
// Rate limiting – global
app.use('/api/', (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: env_1.env.rateLimit.max,
    message: { success: false, message: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
}));
// Rate limiting – auth (strict)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many attempts, try again later' },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
// Rate limiting – payment (very strict)
app.use('/api/v1/payment/initiate', (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many payment attempts' },
}));
// Body parser
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Hide headers
app.disable('x-powered-by');
// ==================== REQUEST LOGGING (clean format) ====================
app.use((0, morgan_1.default)(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms'));
// ==================== ROUTES ====================
// Health check (public)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env_1.env.nodeEnv,
    });
});
// API v1 routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/tax', tax_routes_1.default);
app.use('/api/v1/payment', payment_routes_1.default);
app.use('/api/v1/reconciliation', reconciliation_routes_1.default);
// ==================== ERROR HANDLING ====================
// 404 handler
app.use((req, res) => {
    (0, response_1.errorResponse)(res, 'Route not found', 404);
});
// Global error handler
app.use((err, req, res, next) => {
    // 401/403 are expected – log a short warning, not a full stack
    if (err.statusCode === 401 || err.statusCode === 403) {
        logger_1.default.warn(`${err.message} (${req.method} ${req.url})`);
    }
    else {
        logger_1.default.error(err.message, {
            stack: err.stack,
            method: req.method,
            url: req.url,
            ip: req.ip,
        });
    }
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';
    if (env_1.env.nodeEnv === 'production' && !err.isOperational) {
        return (0, response_1.errorResponse)(res, 'Internal Server Error', 500);
    }
    (0, response_1.errorResponse)(res, message, statusCode, env_1.env.nodeEnv === 'development' ? err.stack : undefined);
});
// ==================== START ====================
app.listen(env_1.env.port, () => {
    logger_1.default.info(`DalPay API running on port ${env_1.env.port}`);
    logger_1.default.info(`Environment: ${env_1.env.nodeEnv}`);
    logger_1.default.info(`CORS origins: ${allowedOrigins.join(', ')}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map