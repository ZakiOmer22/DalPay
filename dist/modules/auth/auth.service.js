"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const encryption_1 = require("../../utils/encryption");
const audit_1 = require("../../utils/audit");
const alert_service_1 = require("../security/alert.service");
const logger_1 = __importDefault(require("../../utils/logger"));
const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
class AuthService {
    async register(data) {
        const phoneHash = (0, encryption_1.hashField)(data.phoneNumber);
        const nationalIdHash = (0, encryption_1.hashField)(data.nationalId);
        const emailHash = data.email ? (0, encryption_1.hashField)(data.email) : null;
        const existing = await database_1.default.query(`SELECT id FROM users WHERE national_id_hash = $1 OR phone_hash = $2` +
            (emailHash ? " OR email_hash = $3" : ""), emailHash
            ? [nationalIdHash, phoneHash, emailHash]
            : [nationalIdHash, phoneHash]);
        if (existing.rows.length > 0) {
            throw new errors_1.AppError("User with this National ID, email, or phone already exists", 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, BCRYPT_ROUNDS);
        const encryptedNationalId = (0, encryption_1.encrypt)(data.nationalId);
        const encryptedPhone = (0, encryption_1.encrypt)(data.phoneNumber);
        const encryptedEmail = data.email ? (0, encryption_1.encrypt)(data.email) : null;
        const result = await database_1.default.query(`INSERT INTO users (full_name, phone, email, national_id, password_hash, role,
                          phone_hash, national_id_hash, email_hash)
       VALUES ($1, $2, $3, $4, $5, 'taxpayer', $6, $7, $8)
       RETURNING id, full_name, phone, email, national_id, role`, [
            `${data.firstName} ${data.lastName}`,
            encryptedPhone,
            encryptedEmail,
            encryptedNationalId,
            passwordHash,
            phoneHash,
            nationalIdHash,
            emailHash,
        ]);
        const user = result.rows[0];
        user.phone = (0, encryption_1.decrypt)(user.phone);
        user.national_id = (0, encryption_1.decrypt)(user.national_id);
        if (user.email)
            user.email = (0, encryption_1.decrypt)(user.email);
        await (0, audit_1.insertAuditLog)({
            userId: user.id,
            action: "REGISTRATION",
            entity: "users",
            entityId: user.id,
            metadata: {
                ip_address: data.ipAddress,
                user_agent: data.userAgent,
                verification_id: data.stripeVerificationId,
            },
        });
        logger_1.default.info("New user registered", { id: user.id });
        // ✅ role added
        const tokens = this.generateTokens(user.id, 0, user.role, data.ipAddress, data.userAgent);
        await this.storeRefreshTokenSession(user.id, tokens.refreshToken, data.ipAddress, data.userAgent);
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
    async login(identifier, password, ipAddress, userAgent) {
        const isEmail = identifier.includes("@");
        const searchHash = (0, encryption_1.hashField)(identifier);
        let result;
        if (isEmail) {
            result = await database_1.default.query("SELECT * FROM users WHERE email_hash = $1", [
                searchHash,
            ]);
        }
        else {
            result = await database_1.default.query("SELECT * FROM users WHERE phone_hash = $1 OR national_id_hash = $1", [searchHash]);
        }
        if (result.rows.length === 0) {
            throw new errors_1.AppError("Invalid credentials", 401);
        }
        const user = result.rows[0];
        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            throw new errors_1.AppError("Account temporarily locked. Please try again later.", 403);
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            const attempts = (user.failed_attempts || 0) + 1;
            const lockUntil = attempts >= MAX_FAILED_ATTEMPTS
                ? new Date(Date.now() + LOCK_DURATION_MS)
                : null;
            await database_1.default.query("UPDATE users SET failed_attempts = $1, lock_until = $2 WHERE id = $3", [attempts, lockUntil, user.id]);
            if (lockUntil) {
                await alert_service_1.AlertService.send("BRUTE_FORCE_LOCKOUT", {
                    userId: user.id,
                    identifier: identifier,
                    attempts,
                });
            }
            throw new errors_1.AppError("Invalid credentials", 401);
        }
        await database_1.default.query("UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = $1", [user.id]);
        user.phone = (0, encryption_1.decrypt)(user.phone);
        user.national_id = (0, encryption_1.decrypt)(user.national_id);
        if (user.email)
            user.email = (0, encryption_1.decrypt)(user.email);
        // ✅ role added
        const tokens = this.generateTokens(user.id, user.token_version, user.role, ipAddress, userAgent);
        await this.storeRefreshTokenSession(user.id, tokens.refreshToken, ipAddress, userAgent);
        await (0, audit_1.insertAuditLog)({
            userId: user.id,
            action: "LOGIN",
            entity: "users",
            entityId: user.id,
            metadata: { ip_address: ipAddress, user_agent: userAgent },
        });
        const { password_hash, refresh_token_hash, ...safeUser } = user;
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
    async refreshToken(refreshToken, ipAddress, userAgent) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwt.refreshSecret);
        }
        catch (err) {
            throw new errors_1.AppError("Invalid or expired refresh token", 401);
        }
        const userId = payload.userId;
        const tokenVersion = payload.tokenVersion ?? 0;
        const client = await database_1.default.connect();
        try {
            await client.query("BEGIN");
            // Check user and token version
            const userResult = await client.query("SELECT id, token_version, role FROM users WHERE id = $1", [userId]);
            if (userResult.rows.length === 0)
                throw new errors_1.AppError("User not found", 401);
            const user = userResult.rows[0];
            if (user.token_version !== tokenVersion) {
                throw new errors_1.AppError("Token version mismatch – please log in again", 401);
            }
            // Find matching active session
            const sessions = await client.query("SELECT * FROM user_sessions WHERE user_id = $1 AND is_revoked = FALSE ORDER BY created_at DESC", [userId]);
            let matchingSession = null;
            for (const session of sessions.rows) {
                const match = await bcryptjs_1.default.compare(refreshToken, session.refresh_token_hash);
                if (match) {
                    matchingSession = session;
                    break;
                }
            }
            if (!matchingSession) {
                // Reuse detected → revoke all sessions and bump version
                await client.query("UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1", [userId]);
                await client.query("UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE id = $1", [userId]);
                await client.query("COMMIT");
                try {
                    await alert_service_1.AlertService.send("TOKEN_REUSE_DETECTED", {
                        userId,
                        ip: ipAddress,
                    });
                }
                catch (err) {
                    logger_1.default.error("Token reuse alert failed", err);
                }
                throw new errors_1.AppError("Token reuse detected – all sessions have been invalidated", 403);
            }
            // Legitimate refresh – revoke old session and create new in same transaction
            await client.query("UPDATE user_sessions SET is_revoked = TRUE WHERE id = $1", [matchingSession.id]);
            const newTokens = this.generateTokens(userId, user.token_version, user.role, ipAddress, userAgent);
            const hashedToken = await bcryptjs_1.default.hash(newTokens.refreshToken, BCRYPT_ROUNDS);
            await client.query("INSERT INTO user_sessions (user_id, refresh_token_hash, ip, user_agent) VALUES ($1, $2, $3, $4)", [userId, hashedToken, ipAddress || null, userAgent || null]);
            await client.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [hashedToken, userId]);
            await client.query("COMMIT");
            return newTokens;
        }
        catch (error) {
            await client.query("ROLLBACK").catch(() => { });
            throw error;
        }
        finally {
            client.release();
        }
    }
    async logout(userId, accessToken) {
        await database_1.default.query("UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1", [userId]);
        await database_1.default.query("UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE id = $1", [userId]);
        try {
            const decoded = jsonwebtoken_1.default.decode(accessToken);
            if (decoded?.jti) {
                await database_1.default.query(`INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1, to_timestamp($2))
           ON CONFLICT (jti) DO NOTHING`, [decoded.jti, decoded.exp]);
            }
        }
        catch (err) {
            logger_1.default.warn("Failed to blacklist access token", { err });
        }
    }
    // ✅ Updated signature – role is now a required parameter
    generateTokens(userId, tokenVersion, role, ipAddress, userAgent) {
        const accessJti = (0, uuid_1.v4)();
        const refreshJti = (0, uuid_1.v4)();
        const fingerprint = crypto_1.default
            .createHash("sha256")
            .update(`${ipAddress || ""}${userAgent || ""}`)
            .digest("hex");
        const accessToken = jsonwebtoken_1.default.sign({
            userId,
            tokenVersion,
            jti: accessJti,
            fingerprint,
            role, // ✅ role embedded
            keyVersion: parseInt(process.env.ACTIVE_JWT_VERSION || "1"),
        }, env_1.env.jwt.secret, { expiresIn: env_1.env.jwt.expiry });
        const refreshToken = jsonwebtoken_1.default.sign({ userId, tokenVersion, jti: refreshJti }, env_1.env.jwt.refreshSecret, { expiresIn: env_1.env.jwt.refreshExpiry });
        return { accessToken, refreshToken };
    }
    async storeRefreshTokenSession(userId, refreshToken, ipAddress, userAgent) {
        const hashedToken = await bcryptjs_1.default.hash(refreshToken, BCRYPT_ROUNDS);
        await database_1.default.query(`INSERT INTO user_sessions (user_id, refresh_token_hash, ip, user_agent)
       VALUES ($1, $2, $3, $4)`, [userId, hashedToken, ipAddress || null, userAgent || null]);
        await database_1.default.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
            hashedToken,
            userId,
        ]);
    }
    // Session management
    async listSessions(userId) {
        const result = await database_1.default.query(`SELECT id, ip, user_agent, is_revoked, created_at
     FROM user_sessions
     WHERE user_id = $1 AND is_revoked = FALSE
     ORDER BY created_at DESC`, [userId]);
        return result.rows;
    }
    async revokeSession(userId, sessionId) {
        await database_1.default.query(`UPDATE user_sessions SET is_revoked = TRUE
     WHERE id = $1 AND user_id = $2 AND is_revoked = FALSE`, [sessionId, userId]);
    }
    async revokeAllSessions(userId) {
        await database_1.default.query(`UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1`, [userId]);
        await database_1.default.query(`UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE id = $1`, [userId]);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map