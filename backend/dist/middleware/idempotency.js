"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyGuard = idempotencyGuard;
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
async function idempotencyGuard(req, res, next) {
    const key = req.headers['x-idempotency-key'];
    if (!key) {
        return next(new errors_1.AppError('Missing X-Idempotency-Key header', 400));
    }
    try {
        // Check if already processed
        const existing = await database_1.default.query('SELECT response FROM idempotency_keys WHERE key = $1', [key]);
        if (existing.rows.length > 0) {
            return res.status(200).json(existing.rows[0].response);
        }
        // Intercept response to store it
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            database_1.default.query('INSERT INTO idempotency_keys (key, response) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, JSON.stringify(body)]).catch(() => { }); // don't fail if storage error
            return originalJson(body);
        };
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=idempotency.js.map