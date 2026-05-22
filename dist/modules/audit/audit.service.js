"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const crypto_1 = __importDefault(require("crypto"));
class AuditService {
    async getAll(opts) {
        const { page, limit, action, userId } = opts;
        const offset = (page - 1) * limit;
        let where = "WHERE 1=1";
        const params = [];
        if (action) {
            params.push(action);
            where += ` AND action = $${params.length}`;
        }
        if (userId) {
            params.push(userId);
            where += ` AND user_id = $${params.length}`;
        }
        const countResult = await database_1.default.query(`SELECT COUNT(*) FROM audit_logs ${where}`, params);
        const total = parseInt(countResult.rows[0].count, 10);
        const result = await database_1.default.query(`SELECT id, user_id, action, entity, entity_id, metadata, hash_chain, created_at
       FROM audit_logs ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
        return {
            logs: result.rows,
            total,
            page,
            limit,
        };
    }
    async verifyChain() {
        const chainStatus = [];
        const result = await database_1.default.query("SELECT * FROM audit_logs ORDER BY created_at ASC");
        const logs = result.rows;
        let prevHash = "0".repeat(64);
        for (const log of logs) {
            // Recreate the exact same payload – all timestamps are now in the same format
            const payload = JSON.stringify({
                userId: log.user_id,
                action: log.action,
                entity: log.entity,
                entityId: log.entity_id,
                metadata: log.metadata,
                timestamp: log.created_at, // same PostgreSQL format
                previousHash: prevHash,
            });
            const expectedHash = crypto_1.default
                .createHash("sha256")
                .update(payload)
                .digest("hex");
            const valid = expectedHash === log.hash_chain;
            chainStatus.push({
                id: log.id,
                action: log.action,
                hash_chain: log.hash_chain,
                prev_hash: prevHash,
                expected_hash: expectedHash,
                valid,
            });
            prevHash = log.hash_chain;
        }
        return {
            valid: chainStatus.every((c) => c.valid),
            logs: chainStatus,
        };
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map