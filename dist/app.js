"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts (complete, all features retained)
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser")); // <-- NEW
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const tax_routes_1 = __importDefault(require("./modules/tax/tax.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/payment.routes"));
const reconciliation_routes_1 = __importDefault(require("./modules/reconciliation/reconciliation.routes"));
const ussd_routes_1 = __importDefault(require("./modules/ussd/ussd.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const fraud_routes_1 = __importDefault(require("./modules/fraud/fraud.routes"));
const documents_routes_1 = __importDefault(require("./modules/documents/documents.routes"));
const response_1 = require("./utils/response");
const logger_1 = __importDefault(require("./utils/logger"));
const metrics_1 = require("./utils/metrics");
const database_1 = __importDefault(require("./config/database"));
const ledger_routes_1 = __importDefault(require("./modules/ledger/ledger.routes"));
const admin_routes_1 = require("./modules/admin/admin.routes");
const audit_routes_1 = __importDefault(require("./modules/audit/audit.routes"));
const notification_routes_1 = __importDefault(require("./modules/notification/notification.routes"));
const settings_routes_1 = __importDefault(require("./modules/settings/settings.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const app = (0, express_1.default)();
// ==================== TRUST PROXY ====================
app.set("trust proxy", 1);
// ==================== SECURITY HEADERS ====================
// We must NOT use helmet() or helmet.contentSecurityPolicy – those inject a nonce.
// Instead, we apply every header individually and set CSP manually.
app.use(helmet_1.default.crossOriginEmbedderPolicy({ policy: "require-corp" }));
app.use(helmet_1.default.crossOriginOpenerPolicy({ policy: "same-origin" }));
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "same-origin" }));
app.use(helmet_1.default.dnsPrefetchControl({ allow: false }));
app.use(helmet_1.default.frameguard({ action: "deny" }));
app.use(helmet_1.default.hidePoweredBy());
app.use(helmet_1.default.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(helmet_1.default.ieNoOpen());
app.use(helmet_1.default.noSniff());
app.use(helmet_1.default.originAgentCluster());
app.use(helmet_1.default.permittedCrossDomainPolicies({ permittedPolicies: "none" }));
app.use(helmet_1.default.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
app.use(helmet_1.default.xssFilter());
// ==================== CUSTOM CONTENT SECURITY POLICY (NO NONCE) ====================
// This is the ONLY CSP header we send – Turnstile required sources + hash.
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; " +
        "script-src 'self' https://challenges.cloudflare.com blob: " +
        "'sha256-eJGI0Ik4oYe/PKLDOt4wcN76wYs8h+Ew05pMzdY6xG8=' 'unsafe-eval'; " +
        "worker-src 'self' blob: https://challenges.cloudflare.com; " +
        "child-src 'self' blob: https://challenges.cloudflare.com; " +
        "frame-src 'self' https://challenges.cloudflare.com; " +
        "connect-src 'self' https://challenges.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "object-src 'none'; " +
        "media-src 'self'");
    next();
});
// ==================== CORS ====================
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://dalpay.onrender.com",
    "https://dalpay-portal.vercel.app",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow requests with no origin (curl, mobile apps, etc.)
        if (!origin)
            return callback(null, true);
        // explicitly allowed origins
        const explicitOrigins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://dalpay.onrender.com",
            "https://dalpay-portal.vercel.app",
        ];
        if (explicitOrigins.includes(origin))
            return callback(null, true);
        // allow ALL vercel.app subdomains (covers preview + production)
        if (origin.endsWith(".vercel.app"))
            return callback(null, true);
        // otherwise reject
        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key"],
    credentials: true,
    maxAge: 86400,
}));
// ==================== RATE LIMITING & DDOS PROTECTION ====================
app.use("/api/", (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: env_1.env.rateLimit.max,
    keyGenerator: (req) => {
        const ip = req.rateLimit?.ipKeyGenerator?.(req) ?? req.ip;
        return req.user?.userId || ip;
    },
    message: { success: false, message: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use("/api/", (0, express_slow_down_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    delayAfter: Math.floor(env_1.env.rateLimit.max * 0.5),
    delayMs: (hits) => hits * 200,
}));
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many attempts, try again later" },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/payment/initiate", (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many payment attempts" },
}));
// ==================== BODY PARSER ====================
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)()); // <-- NEW
// ==================== HTTP PARAMETER POLLUTION PROTECTION ====================
app.use((0, hpp_1.default)());
// ==================== HIDE EXPRESS SIGNATURES ====================
app.disable("x-powered-by");
// ==================== REQUEST LOGGING ====================
app.use((0, morgan_1.default)(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms'));
// ==================== ROUTES ====================
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env_1.env.nodeEnv,
    });
});
app.use("/uploads", express_1.default.static(path_1.default.resolve(__dirname, "../uploads")));
app.get("/metrics", async (req, res) => {
    const key = req.headers["x-metrics-key"];
    if (key !== process.env.METRICS_KEY) {
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        const sessionsResult = await database_1.default.query("SELECT COUNT(*) FROM user_sessions WHERE is_revoked = FALSE");
        metrics_1.metrics.activeSessions.set(parseInt(sessionsResult.rows[0].count, 10));
        res.set("Content-Type", metrics_1.prometheusRegister.contentType);
        res.end(await metrics_1.prometheusRegister.metrics());
    }
    catch (error) {
        res.status(500).json({ error: "Failed to collect metrics" });
    }
});
// ==================== ROUTES ====================
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/tax", tax_routes_1.default);
app.use("/api/v1/payment", payment_routes_1.default);
app.use("/api/v1/reconciliation", reconciliation_routes_1.default);
app.use("/api/v1/ussd", ussd_routes_1.default);
app.use("/api/v1/dashboard", dashboard_routes_1.default);
app.use("/api/v1/fraud", fraud_routes_1.default);
app.use("/api/v1/documents", documents_routes_1.default);
app.use("/api/v1/ledger", ledger_routes_1.default);
app.use("/api/v1/admin", admin_routes_1.adminRoutes);
app.use("/api/v1/audit", audit_routes_1.default);
app.use("/api/v1/notification", notification_routes_1.default);
app.use("/api/v1/settings", settings_routes_1.default);
app.use("/api/v1/user", user_routes_1.default);
// ==================== ERROR HANDLING ====================
app.use((req, res) => {
    (0, response_1.errorResponse)(res, "Route not found", 404, undefined, "NOT_FOUND", req.path);
});
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = err.isOperational ? err.message : "Internal Server Error";
    const errors = err.details || (env_1.env.nodeEnv === "development" ? err.stack : undefined);
    if (statusCode === 401 || statusCode === 403) {
        logger_1.default.warn(`${message} (${req.method} ${req.url})`);
    }
    else {
        logger_1.default.error(err.message, {
            stack: err.stack,
            method: req.method,
            url: req.url,
            ip: req.ip,
        });
    }
    if (env_1.env.nodeEnv === "production" && !err.isOperational) {
        return (0, response_1.errorResponse)(res, "Internal Server Error", 500, undefined, "INTERNAL_ERROR", req.path);
    }
    (0, response_1.errorResponse)(res, message, statusCode, errors, code, req.path);
});
// ==================== START ====================
app.listen(env_1.env.port, () => {
    logger_1.default.info(`DalPay API running on port ${env_1.env.port}`);
    logger_1.default.info(`Environment: ${env_1.env.nodeEnv}`);
    logger_1.default.info(`CORS origins: ${allowedOrigins.join(", ")}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map