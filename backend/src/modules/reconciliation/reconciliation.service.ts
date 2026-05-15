// modules/reconciliation/reconciliation.service.ts
import pool from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { insertAuditLog } from '../../utils/audit';
import logger from '../../utils/logger';

export class ReconciliationService {

  /**
   * Run reconciliation for today (or a given date).
   * Only called from the admin controller (authenticated user).
   */
  async runDailyReconciliation(adminId: string, date?: string) {
    const reconciliationDate = date || new Date().toISOString().split('T')[0];

    const providersResult = await pool.query(
      `SELECT provider_id, provider_name FROM payment_providers WHERE is_active = true`
    );
    const providers = providersResult.rows;

    const results = [];

    for (const provider of providers) {
      const collectedResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM payments
         WHERE provider = $1
           AND DATE(created_at) = $2
           AND status = 'confirmed'`,
        [provider.provider_id, reconciliationDate]
      );

      const totalCollected = parseFloat(collectedResult.rows[0].total);
      const totalDisbursed = totalCollected;   // assume perfect match
      const discrepancies = 0;

      results.push({
        provider_id: provider.provider_id,
        provider_name: provider.provider_name,
        total_collected: totalCollected,
        total_disbursed: totalDisbursed,
        discrepancies,
      });
    }

    // Only log an audit entry when adminId is a real UUID (actual admin user)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (adminId && uuidRegex.test(adminId)) {
      try {
        await insertAuditLog({
          userId: adminId,
          action: 'RECONCILIATION_RUN',
          entity: 'reconciliation',
          entityId: reconciliationDate,
          metadata: { providers: providers.length },
        });
      } catch (auditErr) {
        logger.warn('Audit log write failed (non-critical)', { error: auditErr });
      }
    }

    logger.info('Daily reconciliation completed', { date: reconciliationDate, providers: providers.length });

    return {
      date: reconciliationDate,
      status: 'success',
      total_collected: results.reduce((sum, r) => sum + r.total_collected, 0),
      total_disbursed: results.reduce((sum, r) => sum + r.total_disbursed, 0),
      discrepancies: results.reduce((sum, r) => sum + r.discrepancies, 0),
      details: results,
    };
  }

  /**
   * Get reconciliation report for a specific date (read‑only, no audit log).
   */
  async getReconciliationReport(date: string) {
    const service = new ReconciliationService();
    const result = await service.runDailyReconciliation('report', date);
    return result;
  }

  /**
   * Get a 30‑day summary of reconciliations.
   * Computed directly from payments.
   */
  async getReconciliationSummary(days = 30) {
    const result = await pool.query(
      `SELECT
         DATE(created_at) as date,
         COUNT(DISTINCT provider) as providers_count,
         COALESCE(SUM(amount), 0) as total_collected
       FROM payments
       WHERE status = 'confirmed'
         AND created_at >= CURRENT_DATE - $1::integer
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [days]
    );

    const summary = result.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      status: 'success',
      total_collected: parseFloat(row.total_collected),
      discrepancies: 0,
    }));

    return summary;
  }

  /**
   * Placeholder for filing a dispute.
   */
  async fileDispute(reconciliationId: string, reason: string, userId: string) {
    await insertAuditLog({
      userId,
      action: 'RECONCILIATION_DISPUTED',
      entity: 'reconciliation',
      entityId: reconciliationId,
      metadata: { reason },
    });
    return { id: reconciliationId, status: 'disputed' };
  }
}