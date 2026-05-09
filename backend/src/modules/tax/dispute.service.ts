// modules/tax/dispute.service.ts (full file with ledger integration)
import pool from '../../config/database';
import { NotFoundError, AppError } from '../../utils/errors';
import { insertAuditLog } from '../../utils/audit';
import { LedgerService } from '../ledger/ledger.service';
import logger from '../../utils/logger';

const ledgerService = new LedgerService();

export interface DisputeData {
  assessmentId: string;
  userId: string;
  reason: string;
  proposedAmount?: number;
  evidence?: string;
}

export class DisputeService {
  async createDispute(data: DisputeData) {
    const assessment = await pool.query(
      'SELECT * FROM tax_assessments WHERE id = $1 AND user_id = $2',
      [data.assessmentId, data.userId]
    );
    if (assessment.rows.length === 0) {
      throw new NotFoundError('Assessment not found');
    }

    const result = await pool.query(
      `INSERT INTO tax_disputes (assessment_id, user_id, reason, proposed_amount, evidence, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, assessment_id, user_id, reason, proposed_amount, status, created_at`,
      [data.assessmentId, data.userId, data.reason, data.proposedAmount || null, data.evidence || null]
    );

    await insertAuditLog({
      userId: data.userId,
      action: 'DISPUTE_FILED',
      entity: 'tax_disputes',
      entityId: result.rows[0].id,
      metadata: { assessment_id: data.assessmentId, reason: data.reason },
    });

    logger.info('Tax dispute filed', { disputeId: result.rows[0].id });
    return result.rows[0];
  }

  async getDisputesByUser(userId: string) {
    const result = await pool.query(
      `SELECT td.*, ta.tax_type, ta.amount as original_amount, ta.year
       FROM tax_disputes td
       JOIN tax_assessments ta ON td.assessment_id = ta.id
       WHERE td.user_id = $1
       ORDER BY td.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getAllDisputes(status?: string) {
    let query = `SELECT td.*, ta.tax_type, ta.amount as original_amount, ta.year,
                        u.full_name as taxpayer_name
                 FROM tax_disputes td
                 JOIN tax_assessments ta ON td.assessment_id = ta.id
                 JOIN users u ON td.user_id = u.id`;
    const params: any[] = [];
    if (status) {
      query += ' WHERE td.status = $1';
      params.push(status);
    }
    query += ' ORDER BY td.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async resolveDispute(disputeId: string, adminId: string, resolution: {
    status: 'approved' | 'rejected';
    adjustedAmount?: number;
    comment?: string;
  }) {
    const dispute = await pool.query(
      `SELECT td.*, ta.amount as original_amount
       FROM tax_disputes td
       JOIN tax_assessments ta ON td.assessment_id = ta.id
       WHERE td.id = $1`,
      [disputeId]
    );
    if (dispute.rows.length === 0) throw new NotFoundError('Dispute not found');
    if (dispute.rows[0].status !== 'pending') throw new AppError('Dispute already resolved', 400);

    const originalAmount = parseFloat(dispute.rows[0].original_amount);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE tax_disputes SET status = $1, resolved_by = $2, resolved_at = NOW(),
         adjusted_amount = $3, resolution_comment = $4
         WHERE id = $5`,
        [resolution.status, adminId, resolution.adjustedAmount || null, resolution.comment || null, disputeId]
      );

      if (resolution.status === 'approved' && resolution.adjustedAmount !== undefined) {
        await client.query(
          `UPDATE tax_assessments SET amount = $1, status = CASE WHEN $1 <= 0 THEN 'paid' ELSE status END
           WHERE id = $2`,
          [resolution.adjustedAmount, dispute.rows[0].assessment_id]
        );

        const difference = originalAmount - resolution.adjustedAmount;
        if (Math.abs(difference) > 0.001) {
          await ledgerService.recordEntries([
            {
              userId: dispute.rows[0].user_id,
              amount: originalAmount,
              type: 'credit',
              account: 'revenue',
              reference: disputeId,
              description: `Dispute approved - reverse original revenue for assessment ${dispute.rows[0].assessment_id}`,
            },
            {
              userId: dispute.rows[0].user_id,
              amount: resolution.adjustedAmount,
              type: 'credit',
              account: 'revenue',
              reference: disputeId,
              description: `Dispute approved - adjusted revenue for assessment ${dispute.rows[0].assessment_id}`,
            },
          ]);
        }
      }

      await client.query('COMMIT');

      await insertAuditLog({
        userId: adminId,
        action: resolution.status === 'approved' ? 'DISPUTE_APPROVED' : 'DISPUTE_REJECTED',
        entity: 'tax_disputes',
        entityId: disputeId,
        metadata: resolution,
      });

      logger.info(`Dispute ${resolution.status}`, { disputeId });
      return dispute.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}