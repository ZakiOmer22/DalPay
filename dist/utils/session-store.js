"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStore = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const PREFIX = 'ussd_session:';
const TTL = 300; // 5 minutes
class SessionStore {
    async get(sessionId) {
        const raw = await redis.get(PREFIX + sessionId);
        return raw ? JSON.parse(raw) : null;
    }
    async set(sessionId, state, ttl = TTL) {
        await redis.setex(PREFIX + sessionId, ttl, JSON.stringify(state));
    }
    async delete(sessionId) {
        await redis.del(PREFIX + sessionId);
    }
}
exports.SessionStore = SessionStore;
//# sourceMappingURL=session-store.js.map