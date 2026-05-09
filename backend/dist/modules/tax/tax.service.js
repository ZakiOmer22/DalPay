"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxService = void 0;
// server/src/modules/tax/tax.service.ts
const database_1 = __importDefault(require("../../config/database"));
const errors_1 = require("../../utils/errors");
const audit_1 = require("../../utils/audit");
class TaxService {
    async getAssessments(userId) {
        let query = `SELECT id, user_id, tax_type, amount, year, due_date, status, auto_generated, created_at
                 FROM tax_assessments`;
        const params = [];
        if (userId) {
            query += ' WHERE user_id = $1';
            params.push(userId);
        }
        query += ' ORDER BY year DESC, created_at DESC';
        const result = await database_1.default.query(query, params);
        return result.rows.map(row => ({
            assessment_id: row.id,
            tax_type: row.tax_type,
            assessment_year: row.year,
            assessed_amount: row.amount,
            payment_due_date: row.due_date,
            status: row.status,
        }));
    }
    async getAssessment(assessmentId, userId) {
        const result = await database_1.default.query(`SELECT id, user_id, tax_type, amount, year, due_date, status
       FROM tax_assessments
       WHERE id = $1 AND user_id = $2`, [assessmentId, userId]);
        if (result.rows.length === 0) {
            throw new errors_1.NotFoundError('Assessment not found');
        }
        const row = result.rows[0];
        return {
            assessment_id: row.id,
            tax_type: row.tax_type,
            assessment_year: row.year,
            assessed_amount: row.amount,
            payment_due_date: row.due_date,
            status: row.status,
        };
    }
    async createAssessment(data) {
        const result = await database_1.default.query(`INSERT INTO tax_assessments (user_id, tax_type, amount, year, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'unpaid')
       RETURNING id, user_id, tax_type, amount, year, due_date, status`, [data.userId, data.taxType, data.amount, data.year, data.dueDate]);
        const row = result.rows[0];
        await (0, audit_1.insertAuditLog)({
            userId: data.adminId,
            action: 'ASSESSMENT_CREATED',
            entity: 'tax_assessments',
            entityId: row.id,
            metadata: { amount: data.amount },
        });
        return {
            assessment_id: row.id,
            tax_type: row.tax_type,
            assessment_year: row.year,
            assessed_amount: row.amount,
            payment_due_date: row.due_date,
            status: row.status,
        };
    }
    async getTaxpayerSummary(userId) {
        const assessResult = await database_1.default.query(`SELECT
         COUNT(*) FILTER (WHERE status IN ('unpaid', 'partially_paid')) AS pending,
         COUNT(*) FILTER (WHERE status = 'paid') AS paid,
         COUNT(*) FILTER (WHERE status = 'overdue') AS overdue,
         COALESCE(SUM(amount) FILTER (WHERE status IN ('unpaid','partially_paid','overdue')), 0) AS total_due
       FROM tax_assessments
       WHERE user_id = $1`, [userId]);
        const payResult = await database_1.default.query(`SELECT COALESCE(SUM(amount), 0) AS total_paid, COUNT(*) AS total_payments
       FROM payments
       WHERE user_id = $1 AND status = 'confirmed'`, [userId]);
        const a = assessResult.rows[0];
        const p = payResult.rows[0];
        return {
            assessments: {
                total_due: a.total_due,
                pending: parseInt(a.pending, 10),
                overdue: parseInt(a.overdue, 10),
                paid: parseInt(a.paid, 10),
            },
            payments: {
                total_paid: p.total_paid,
                total_payments: parseInt(p.total_payments, 10),
            },
        };
    }
}
exports.TaxService = TaxService;
//# sourceMappingURL=tax.service.js.map