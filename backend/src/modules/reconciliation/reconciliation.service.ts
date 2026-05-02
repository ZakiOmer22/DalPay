import pool from '../../config/database';
import { AppError, NotFoundError } from '../../utils/errors';
import logger from '../../utils/logger';

export class ReconciliationService {
  // Run daily reconciliation for all providers
  async runDailyReconciliation(adminId: string, date?: string) {
    const reconciliationDate = date || new Date().toISOString().split('T')[0];

    // Get all active providers
    const providers = await pool.query(
      "SELECT * FROM mobile_money_providers WHERE status = 'active'"
    );

    const results = [];

    for (const provider of providers.rows) {
      // Get expected amount (confirmed payments for this provider on this date)
      const expected = await pool.query(
        `SELECT COALESCE(SUM(payment_amount), 0) as total
         FROM tax_payments
         WHERE provider_id = $1 
         AND payment_date = $2
         AND payment_status IN ('confirmed', 'pending_confirmation')`,
        [provider.provider_id, reconciliationDate]
      );

      // In production, get actual amount from mobile money operator's settlement report
      // Here we simulate it
      const actualAmount = parseFloat(expected.rows[0].total);
      const varianceAmount = 0; // In production: actual - expected

      // Create reconciliation record
      const result = await pool.query(
        `INSERT INTO payment_reconciliations 
         (provider_id, reconciliation_date, expected_amount, actual_amount, variance_amount, status)
         VALUES ($1, $2, $3, $4, $5, 'matched')
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [provider.provider_id, reconciliationDate, expected.rows[0].total, actualAmount, varianceAmount]
      );

      if (result.rows.length > 0) {
        // Mark payments as reconciled
        await pool.query(
          `UPDATE tax_payments SET payment_status = 'reconciled', reconciliation_date = $1
           WHERE provider_id = $2 AND payment_date = $1 AND payment_status = 'confirmed'`,
          [reconciliationDate, provider.provider_id]
        );

        results.push(result.rows[0]);
      }
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action_type, affected_entity, action_details)
       VALUES ($1, $2, $3, $4)`,
      [adminId, 'RECONCILIATION_RUN', reconciliationDate, JSON.stringify({ providers: providers.rows.length })]
    );

    logger.info('Daily reconciliation completed', { date: reconciliationDate, providers: providers.rows.length });
    return { date: reconciliationDate, reconciliations: results };
  }

  // Get reconciliation report for a date
  async getReconciliationReport(date: string) {
    const result = await pool.query(
      `SELECT pr.*, mmp.provider_name
       FROM payment_reconciliations pr
       JOIN mobile_money_providers mmp ON pr.provider_id = mmp.provider_id
       WHERE pr.reconciliation_date = $1
       ORDER BY mmp.provider_name`,
      [date]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('No reconciliation data found for this date');
    }

    return result.rows;
  }

  // Get reconciliation summary (all dates)
  async getReconciliationSummary(days = 30) {
    const result = await pool.query(
      `SELECT reconciliation_date,
              SUM(expected_amount) as total_expected,
              SUM(actual_amount) as total_actual,
              SUM(variance_amount) as total_variance,
              COUNT(*) as providers_count
       FROM payment_reconciliations
       WHERE reconciliation_date >= CURRENT_DATE - $1
       GROUP BY reconciliation_date
       ORDER BY reconciliation_date DESC`,
      [days]
    );

    return result.rows;
  }

  // File a dispute for a variance
  async fileDispute(reconciliationId: string, reason: string, userId: string) {
    const result = await pool.query(
      `UPDATE payment_reconciliations 
       SET status = 'disputed', variance_reason = $1
       WHERE reconciliation_id = $2 AND status != 'resolved'
       RETURNING *`,
      [reason, reconciliationId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Reconciliation record not found or already resolved');
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action_type, affected_entity, action_details)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'RECONCILIATION_DISPUTED', reconciliationId, JSON.stringify({ reason })]
    );

    return result.rows[0];
  }
}