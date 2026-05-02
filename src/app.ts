import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import taxRoutes from './modules/tax/tax.routes';
import paymentRoutes from './modules/payment/payment.routes';
import reconciliationRoutes from './modules/reconciliation/reconciliation.routes';
import { errorResponse } from './utils/response';
import logger from './utils/logger';

const app = express();

// ==================== TRUST PROXY ====================
app.set('trust proxy', 1);

// ==================== SECURITY MIDDLEWARE ====================

// Helmet – secure HTTP headers
app.use(helmet());

// Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
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
  })
);
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dalpay-portal.vercel.app',
  'https://dalpay.onrender.com'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
    credentials: true,
    maxAge: 86400,
  })
);

// Rate limiting – global
app.use('/api/', rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Rate limiting – auth (strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, try again later' },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Rate limiting – payment (very strict)
app.use('/api/v1/payment/initiate', rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many payment attempts' },
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Hide headers
app.disable('x-powered-by');

// ==================== REQUEST LOGGING (clean format) ====================
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms'
  )
);

// ==================== ROUTES ====================

// Health check (public)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
  });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tax', taxRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/reconciliation', reconciliationRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  errorResponse(res, 'Route not found', 404);
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // 401/403 are expected – log a short warning, not a full stack
  if (err.statusCode === 401 || err.statusCode === 403) {
    logger.warn(`${err.message} (${req.method} ${req.url})`);
  } else {
    logger.error(err.message, {
      stack: err.stack,
      method: req.method,
      url: req.url,
      ip: req.ip,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  if (env.nodeEnv === 'production' && !err.isOperational) {
    return errorResponse(res, 'Internal Server Error', 500);
  }

  errorResponse(res, message, statusCode, env.nodeEnv === 'development' ? err.stack : undefined);
});

// ==================== START ====================

app.listen(env.port, () => {
  logger.info(`DalPay API running on port ${env.port}`);
  logger.info(`Environment: ${env.nodeEnv}`);
  logger.info(`CORS origins: ${allowedOrigins.join(', ')}`);
});

export default app;