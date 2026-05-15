"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAuditLog = insertAuditLog;
const database_1 = __importDefault(require("../config/database"));
const crypto_1 = __importDefault(require("crypto"));
async function insertAuditLog(data) {
    const last = await database_1.default.query('SELECT hash_chain FROM audit_logs ORDER BY created_at DESC LIMIT 1');
    const previousHash = last.rows.length > 0
        ? last.rows[0].hash_chain
        : '0'.repeat(64);
    // Get the database's own NOW() for the timestamp (no JS Date involved)
    const nowResult = await database_1.default.query('SELECT NOW()');
    const now = nowResult.rows[0].now; // PostgreSQL timestamp string
    const payload = JSON.stringify({
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata,
        timestamp: now,
        previousHash,
    });
    const newHash = crypto_1.default.createHash('sha256').update(payload).digest('hex');
    await database_1.default.query(`INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata, hash_chain, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
        data.userId,
        data.action,
        data.entity,
        data.entityId,
        JSON.stringify(data.metadata),
        newHash,
        now, // same timestamp used in the hash
    ]);
}
//# sourceMappingURL=audit.js.map