"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndStoreTokens = generateAndStoreTokens;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const env_1 = require("../config/env");
const BCRYPT_ROUNDS = 12;
async function generateAndStoreTokens(userId, tokenVersion, role, ipAddress, userAgent) {
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
        role,
        keyVersion: parseInt(process.env.ACTIVE_JWT_VERSION || "1"),
    }, env_1.env.jwt.secret, { expiresIn: env_1.env.jwt.expiry });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, tokenVersion, jti: refreshJti }, env_1.env.jwt.refreshSecret, { expiresIn: env_1.env.jwt.refreshExpiry });
    // Store session in DB
    const hashedToken = await bcryptjs_1.default.hash(refreshToken, BCRYPT_ROUNDS);
    await database_1.default.query(`INSERT INTO user_sessions (user_id, refresh_token_hash, ip, user_agent)
     VALUES ($1, $2, $3, $4)`, [userId, hashedToken, ipAddress || null, userAgent || null]);
    // Legacy hash update (compatibility)
    await database_1.default.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
        hashedToken,
        userId,
    ]);
    return { accessToken, refreshToken };
}
//# sourceMappingURL=token.js.map