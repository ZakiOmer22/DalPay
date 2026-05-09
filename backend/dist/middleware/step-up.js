"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceStepUpAuth = enforceStepUpAuth;
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
const SENSITIVE_ACTION_TTL_SECONDS = 5 * 60; // 5 minutes
async function enforceStepUpAuth(req, res, next) {
    const user = req.user;
    if (!user)
        return next(new errors_1.UnauthorizedError('Authentication required'));
    // Allow admins and auditors to bypass step‑up
    if (user.role === 'admin' || user.role === 'auditor') {
        return next();
    }
    const result = await database_1.default.query('SELECT last_sensitive_auth_at FROM users WHERE id = $1', [user.userId]);
    const lastAuth = result.rows[0]?.last_sensitive_auth_at;
    const now = new Date();
    if (!lastAuth || (now.getTime() - new Date(lastAuth).getTime()) > SENSITIVE_ACTION_TTL_SECONDS * 1000) {
        return res.status(403).json({
            success: false,
            code: 'STEP_UP_REQUIRED',
            message: 'You must re‑verify your identity before this action (verify OTP)',
        });
    }
    next();
}
//# sourceMappingURL=step-up.js.map