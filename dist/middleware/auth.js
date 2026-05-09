"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
// Helper to escape single quotes for direct interpolation in SET LOCAL
function safeSQL(value) {
    return value.replace(/'/g, "''");
}
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jsonwebtoken_1.default.decode(token, { complete: true });
        const keyVersion = decodedToken?.payload?.keyVersion || 1;
        const secret = keyVersion === 2
            ? (process.env.JWT_SECRET_V2 || env_1.env.jwt.secret)
            : env_1.env.jwt.secret;
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // JTI blacklist check
        if (decoded.jti) {
            const revoked = await database_1.default.query('SELECT 1 FROM revoked_tokens WHERE jti = $1', [decoded.jti]);
            if (revoked.rows.length > 0) {
                throw new errors_1.UnauthorizedError('Token has been revoked');
            }
        }
        // Fingerprint check
        if (decoded.fingerprint) {
            const currentFingerprint = crypto_1.default
                .createHash('sha256')
                .update(`${req.ip}${req.headers['user-agent']}`)
                .digest('hex');
            if (currentFingerprint !== decoded.fingerprint) {
                throw new errors_1.UnauthorizedError('Token used from different device');
            }
        }
        // ======================== RLS setup (fixed) ========================
        const userId = decoded.userId;
        let role = decoded.role;
        if (!userId) {
            // This shouldn't happen, but just in case
            return next(new errors_1.UnauthorizedError('Malformed token: missing userId'));
        }
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // Direct interpolation because SET LOCAL does not accept parameters
            await client.query(`SET LOCAL app.user_id = '${safeSQL(userId)}'`);
            if (!role) {
                // Look up role from DB if not present in token (should be present in new tokens)
                const res = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
                if (res.rows.length > 0) {
                    role = res.rows[0].role;
                }
            }
            if (role) {
                await client.query(`SET LOCAL app.user_role = '${safeSQL(role)}'`);
            }
            req.dbClient = client;
            req.user = decoded;
            const originalEnd = res.end.bind(res);
            res.end = (...args) => {
                client.query('COMMIT').catch(() => { }).finally(() => client.release());
                return originalEnd(...args);
            };
            next();
        }
        catch (innerError) {
            logger_1.default.error('Authenticate inner block failed', { error: innerError, userId });
            await client.query('ROLLBACK').catch(() => { });
            client.release();
            if (innerError instanceof errors_1.UnauthorizedError) {
                return next(innerError);
            }
            next(new errors_1.UnauthorizedError('Internal authentication error'));
        }
    }
    catch (error) {
        if (error instanceof errors_1.UnauthorizedError) {
            return next(error);
        }
        next(new errors_1.UnauthorizedError('Invalid or expired token'));
    }
}
function authorize(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return next(new errors_1.UnauthorizedError('Insufficient permissions'));
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map