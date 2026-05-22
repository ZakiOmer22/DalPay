"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
// modules/ledger/ledger.service.ts
const database_1 = __importDefault(require("../../config/database"));
const errors_1 = require("../../utils/errors");
class LedgerService {
    /**
     * Record a double-entry transaction.
     * Every financial event must have at least one debit and one credit of equal sum.
     * This function records all entries atomically.
     */
    async recordEntries(entries) {
        const client = await database_1.default.connect();
        try {
            await client.query("BEGIN");
            // Validate that debits equal credits
            const totalDebit = entries
                .filter((e) => e.type === "debit")
                .reduce((sum, e) => sum + e.amount, 0);
            const totalCredit = entries
                .filter((e) => e.type === "credit")
                .reduce((sum, e) => sum + e.amount, 0);
            if (Math.abs(totalDebit - totalCredit) > 0.001) {
                throw new errors_1.AppError("Ledger entries must balance (debits = credits)", 400);
            }
            for (const entry of entries) {
                await client.query(`INSERT INTO ledger_entries
           (user_id, amount, type, account, reference, description)
           VALUES ($1, $2, $3, $4, $5, $6)`, [
                    entry.userId,
                    entry.amount,
                    entry.type,
                    entry.account,
                    entry.reference,
                    entry.description,
                ]);
            }
            await client.query("COMMIT");
        }
        catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Get ledger for a specific user or all users (admin).
     */
    async getLedger(userId, limit = 50, offset = 0) {
        let query = "SELECT * FROM ledger_entries";
        const params = [];
        if (userId) {
            query += " WHERE user_id = $1";
            params.push(userId);
        }
        query +=
            " ORDER BY created_at DESC LIMIT $" +
                (params.length + 1) +
                " OFFSET $" +
                (params.length + 2);
        params.push(limit, offset);
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    /**
     * Get balance for a specific account (e.g., to verify cash balance).
     */
    async getAccountBalance(account) {
        const result = await database_1.default.query(`SELECT
         COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS balance
       FROM ledger_entries
       WHERE account = $1`, [account]);
        return parseFloat(result.rows[0].balance);
    }
    async verifyBalance() {
        const result = await database_1.default.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) AS total_debit,
      COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS total_credit
    FROM ledger_entries
  `);
        const { total_debit, total_credit } = result.rows[0];
        return Math.abs(parseFloat(total_debit) - parseFloat(total_credit)) < 0.001;
    }
    /**
     * Get filtered ledger entries with pagination.
     * Returns total count and entries.
     */
    async getFilteredLedger(filters, limit, offset) {
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (filters.search) {
            conditions.push(`(description ILIKE $${paramIndex} OR reference ILIKE $${paramIndex})`);
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        if (filters.type && filters.type !== "all") {
            conditions.push(`type = $${paramIndex}`);
            params.push(filters.type);
            paramIndex++;
        }
        if (filters.startDate) {
            conditions.push(`created_at >= $${paramIndex}`);
            params.push(filters.startDate);
            paramIndex++;
        }
        if (filters.endDate) {
            // endDate should be the end of that day
            conditions.push(`created_at < $${paramIndex}::date + interval '1 day'`);
            params.push(filters.endDate);
            paramIndex++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        // Count total entries
        const countQuery = `SELECT COUNT(*) FROM ledger_entries ${whereClause}`;
        const countResult = await database_1.default.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);
        // Fetch entries
        const query = `SELECT * FROM ledger_entries ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        const result = await database_1.default.query(query, params);
        return { total, entries: result.rows };
    }
}
exports.LedgerService = LedgerService;
//# sourceMappingURL=ledger.service.js.map