"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
// config/env.ts
exports.env = {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
        url: process.env.DATABASE_URL || '',
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
        refreshSecret: process.env.JWT_REFRESH_SECRET || '',
        expiry: process.env.JWT_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '1d',
    },
    session: {
        secret: process.env.SESSION_SECRET || '',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    },
    mobileMoney: {
        zaadApiUrl: process.env.ZAAD_API_URL || '',
        zaadApiKey: process.env.ZAAD_API_KEY || '',
        edahabApiUrl: process.env.EDAHAB_API_URL || '',
        edahabApiKey: process.env.EDAHAB_API_KEY || '',
    },
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    hashSalt: process.env.HASH_SALT || 'default-salt-change-me',
};
//# sourceMappingURL=env.js.map