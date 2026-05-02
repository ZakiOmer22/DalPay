import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    url: process.env.DATABASE_URL || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '1d',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'session-secret',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  mobileMoney: {
    zaad: {
      apiUrl: process.env.ZAAD_API_URL || '',
      apiKey: process.env.ZAAD_API_KEY || '',
    },
    edahab: {
      apiUrl: process.env.EDAHAB_API_URL || '',
      apiKey: process.env.EDAHAB_API_KEY || '',
    },
  },
};