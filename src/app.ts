// app.ts (complete, all features retained)
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import hpp from "hpp";
import morgan from "morgan";
import cookieParser from "cookie-parser"; // <-- NEW
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import taxRoutes from "./modules/tax/tax.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import reconciliationRoutes from "./modules/reconciliation/reconciliation.routes";
import ussdRoutes from "./modules/ussd/ussd.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import fraudRoutes from "./modules/fraud/fraud.routes";
import documentsRoutes from "./modules/documents/documents.routes";
import { errorResponse } from "./utils/response";
import logger from "./utils/logger";
import { prometheusRegister, metrics } from "./utils/metrics";
import pool from "./config/database";
import ledgerRoutes from "./modules/ledger/ledger.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import auditRoutes from "./modules/audit/audit.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import settingsRoutes from "./modules/settings/settings.routes";
import userRoutes from "./modules/user/user.routes";

const app = express();

// ==================== TRUST PROXY ====================
app.set("trust proxy", 1);

// ==================== SECURITY HEADERS ====================
// We must NOT use helmet() or helmet.contentSecurityPolicy – those inject a nonce.
// Instead, we apply every header individually and set CSP manually.

app.use(helmet.crossOriginEmbedderPolicy({ policy: "require-corp" }));
app.use(helmet.crossOriginOpenerPolicy({ policy: "same-origin" }));
app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.hidePoweredBy());
app.use(
  helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }),
);
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: "none" }));
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
app.use(helmet.xssFilter());

// ==================== CUSTOM CONTENT SECURITY POLICY (NO NONCE) ====================
// This is the ONLY CSP header we send – Turnstile required sources + hash.
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
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
      "media-src 'self'",
  );
  next();
});

// ==================== CORS ====================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://dalpay.onrender.com",
  "https://dalpay-portal.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, mobile apps, etc.)
      if (!origin) return callback(null, true);

      // explicitly allowed origins
      const explicitOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://dalpay.onrender.com",
        "https://dalpay-portal.vercel.app",
      ];
      if (explicitOrigins.includes(origin)) return callback(null, true);

      // allow ALL vercel.app subdomains (covers preview + production)
      if (origin.endsWith(".vercel.app")) return callback(null, true);

      // otherwise reject
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key"],
    credentials: true,
    maxAge: 86400,
  }),
);

// ==================== RATE LIMITING & DDOS PROTECTION ====================

app.use(
  "/api/",
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    keyGenerator: (req) => {
      const ip = (req as any).rateLimit?.ipKeyGenerator?.(req) ?? req.ip;
      return (req as any).user?.userId || ip;
    },
    message: { success: false, message: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(
  "/api/",
  slowDown({
    windowMs: env.rateLimit.windowMs,
    delayAfter: Math.floor(env.rateLimit.max * 0.5),
    delayMs: (hits) => hits * 200,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts, try again later" },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

app.use(
  "/api/v1/payment/initiate",
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many payment attempts" },
  }),
);

// ==================== BODY PARSER ====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // <-- NEW

// ==================== HTTP PARAMETER POLLUTION PROTECTION ====================
app.use(hpp());

// ==================== HIDE EXPRESS SIGNATURES ====================
app.disable("x-powered-by");

// ==================== REQUEST LOGGING ====================
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
  ),
);

// ==================== ROUTES ====================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
  });
});

app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/metrics", async (req, res) => {
  const key = req.headers["x-metrics-key"] as string;
  if (key !== process.env.METRICS_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const sessionsResult = await pool.query(
      "SELECT COUNT(*) FROM user_sessions WHERE is_revoked = FALSE",
    );
    metrics.activeSessions.set(parseInt(sessionsResult.rows[0].count, 10));

    res.set("Content-Type", prometheusRegister.contentType);
    res.end(await prometheusRegister.metrics());
  } catch (error) {
    res.status(500).json({ error: "Failed to collect metrics" });
  }
});

// ==================== ROUTES ====================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tax", taxRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reconciliation", reconciliationRoutes);
app.use("/api/v1/ussd", ussdRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/fraud", fraudRoutes);
app.use("/api/v1/documents", documentsRoutes);
app.use("/api/v1/ledger", ledgerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/audit", auditRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/user", userRoutes);

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  errorResponse(res, "Route not found", 404, undefined, "NOT_FOUND", req.path);
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const statusCode = err.statusCode || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = err.isOperational ? err.message : "Internal Server Error";
    const errors =
      err.details || (env.nodeEnv === "development" ? err.stack : undefined);

    if (statusCode === 401 || statusCode === 403) {
      logger.warn(`${message} (${req.method} ${req.url})`);
    } else {
      logger.error(err.message, {
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
      });
    }

    if (env.nodeEnv === "production" && !err.isOperational) {
      return errorResponse(
        res,
        "Internal Server Error",
        500,
        undefined,
        "INTERNAL_ERROR",
        req.path,
      );
    }

    errorResponse(res, message, statusCode, errors, code, req.path);
  },
);

// ==================== START ====================

app.listen(env.port, () => {
  logger.info(`DalPay API running on port ${env.port}`);
  logger.info(`Environment: ${env.nodeEnv}`);
  logger.info(`CORS origins: ${allowedOrigins.join(", ")}`);
});

export default app;
