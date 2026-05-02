"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const logger_1 = __importDefault(require("../../utils/logger"));
class AuthService {
    // ─────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────
    async register(data) {
        const existing = await database_1.default.query(`SELECT id FROM users WHERE national_id = $1 OR phone = $2` +
            (data.email ? ' OR email = $3' : ''), data.email
            ? [data.nationalId, data.phoneNumber, data.email]
            : [data.nationalId, data.phoneNumber]);
        if (existing.rows.length > 0) {
            throw new errors_1.AppError('User with this National ID, email, or phone already exists', 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        const result = await database_1.default.query(`INSERT INTO users (full_name, phone, email, national_id, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'taxpayer')
       RETURNING id, full_name, phone, email, national_id, role`, [
            `${data.firstName} ${data.lastName}`,
            data.phoneNumber,
            data.email || null,
            data.nationalId,
            passwordHash,
        ]);
        const user = result.rows[0];
        // Audit log
        await database_1.default.query(`INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`, [
            user.id,
            'REGISTRATION',
            'users',
            user.id,
            JSON.stringify({
                ip_address: data.ipAddress,
                user_agent: data.userAgent,
                verification_id: data.stripeVerificationId,
            }),
        ]);
        logger_1.default.info('New user registered', { id: user.id });
        const tokens = this.generateTokens(user.id);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                nationalId: user.national_id,
            },
            ...tokens,
        };
    }
    // ─────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────
    async login(identifier, password, ipAddress, userAgent) {
        const isEmail = identifier.includes('@');
        let result;
        if (isEmail) {
            result = await database_1.default.query('SELECT * FROM users WHERE email = $1', [identifier]);
        }
        else {
            result = await database_1.default.query('SELECT * FROM users WHERE phone = $1 OR national_id = $1', [identifier]);
        }
        if (result.rows.length === 0) {
            throw new errors_1.AppError('Invalid credentials', 401);
        }
        const user = result.rows[0];
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new errors_1.AppError('Invalid credentials', 401);
        }
        const tokens = this.generateTokens(user.id);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        // Audit log
        await database_1.default.query(`INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`, [
            user.id,
            'LOGIN',
            'users',
            user.id,
            JSON.stringify({ ip_address: ipAddress, user_agent: userAgent }),
        ]);
        const { password_hash, refresh_token, ...safeUser } = user;
        return {
            user: {
                id: safeUser.id,
                fullName: safeUser.full_name,
                email: safeUser.email,
                phone: safeUser.phone,
                role: safeUser.role,
                nationalId: safeUser.national_id,
            },
            ...tokens,
        };
    }
    // ─────────────────────────────────────────────
    // REFRESH TOKEN
    // ─────────────────────────────────────────────
    async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwt.refreshSecret);
            const result = await database_1.default.query('SELECT id FROM users WHERE id = $1', [decoded.userId]);
            if (result.rows.length === 0)
                throw new errors_1.AppError('Invalid refresh token', 401);
            const tokens = this.generateTokens(decoded.userId);
            await this.storeRefreshToken(decoded.userId, tokens.refreshToken);
            return tokens;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError('Invalid or expired refresh token', 401);
        }
    }
    // ─────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────
    async logout(userId, accessToken) {
        await database_1.default.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [userId]);
    }
    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────
    generateTokens(userId) {
        const accessToken = jsonwebtoken_1.default.sign({ userId }, env_1.env.jwt.secret, {
            expiresIn: env_1.env.jwt.expiry,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, env_1.env.jwt.refreshSecret, {
            expiresIn: env_1.env.jwt.refreshExpiry,
        });
        return { accessToken, refreshToken };
    }
    async storeRefreshToken(userId, refreshToken) {
        const hashedToken = await bcryptjs_1.default.hash(refreshToken, 10);
        await database_1.default.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [hashedToken, userId]);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map