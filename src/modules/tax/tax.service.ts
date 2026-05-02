// server/src/modules/tax/tax.service.ts
import pool from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class TaxService {
  async getAssessments(userId: string) {
    const result = await pool.query(
      `SELECT id, user_id, tax_type, amount, year, due_date, status, auto_generated, created_at
       FROM tax_assessments
       WHERE user_id = $1
       ORDER BY year DESC, created_at DESC`,
      [userId]
    );
    return result.rows.map(row => ({
      assessment_id: row.id,
      tax_type: row.tax_type,
      assessment_year: row.year,
      assessed_amount: row.amount,
      payment_due_date: row.due_date,
      status: row.status,
    }));
  }

  async getAssessment(assessmentId: string, userId: string) {
    const result = await pool.query(
      `SELECT id, user_id, tax_type, amount, year, due_date, status
       FROM tax_assessments
       WHERE id = $1 AND user_id = $2`,
      [assessmentId, userId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError('Assessment not found');
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

  async createAssessment(data: {
    userId: string;
    taxType: string;
    year: number;
    amount: number;
    dueDate: string;
    adminId: string;
    ipAddress?: string;
  }) {
    const result = await pool.query(
      `INSERT INTO tax_assessments (user_id, tax_type, amount, year, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'unpaid')
       RETURNING id, user_id, tax_type, amount, year, due_date, status`,
      [data.userId, data.taxType, data.amount, data.year, data.dueDate]
    );
    const row = result.rows[0];
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [data.adminId, 'ASSESSMENT_CREATED', 'tax_assessments', row.id, JSON.stringify({ amount: data.amount })]
    );
    return {
      assessment_id: row.id,
      tax_type: row.tax_type,
      assessment_year: row.year,
      assessed_amount: row.amount,
      payment_due_date: row.due_date,
      status: row.status,
    };
  }

  async getTaxpayerSummary(userId: string) {
    const assessResult = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('unpaid', 'partially_paid')) AS pending,
         COUNT(*) FILTER (WHERE status = 'paid') AS paid,
         COUNT(*) FILTER (WHERE status = 'overdue') AS overdue,
         COALESCE(SUM(amount) FILTER (WHERE status IN ('unpaid','partially_paid','overdue')), 0) AS total_due
       FROM tax_assessments
       WHERE user_id = $1`,
      [userId]
    );
    const payResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_paid, COUNT(*) AS total_payments
       FROM payments
       WHERE user_id = $1 AND status = 'confirmed'`,
      [userId]
    );
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