import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database';
import { AppError, NotFoundError } from '../../utils/errors';
import { FraudService } from '../fraud/fraud.service';
import { insertAuditLog } from '../../utils/audit';
import { LedgerService } from '../ledger/ledger.service';
import { AlertService } from '../security/alert.service';
import logger from '../../utils/logger';

const ledgerService = new LedgerService();

export class PaymentService {
  private fraudService = new FraudService();

  async initiatePayment(data: {
    userId: string;
    assessmentId: string;
    amount: number;
    providerId: string;
    phoneNumber: string;
    ipAddress?: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

      // Validate assessment
      const assessment = await client.query(
        'SELECT * FROM tax_assessments WHERE id = $1 AND user_id = $2',
        [data.assessmentId, data.userId]
      );
      if (assessment.rows.length === 0) {
        throw new NotFoundError('Assessment not found');
      }
      const assess = assessment.rows[0];
      if (assess.status === 'paid') {
        throw new AppError('Assessment already paid', 400);
      }
      if (data.amount <= 0 || data.amount > parseFloat(assess.amount)) {
        throw new AppError('Invalid payment amount', 400);
      }

      const idempotencyKey = uuidv4();
      const result = await client.query(
        `INSERT INTO payments
           (user_id, assessment_id, amount, provider, transaction_ref, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
         RETURNING id, user_id, assessment_id, amount, provider, transaction_ref, status, created_at`,
        [data.userId, data.assessmentId, data.amount, data.providerId, idempotencyKey]
      );
      const payment = result.rows[0];

      // Quick rule‑based fraud check – still inline
      await this.fraudService.analyzePayment(payment.id, data.userId, data.amount);

      const fraudResult = await client.query(
        'SELECT flagged, risk_score, reason FROM fraud_analysis WHERE payment_id = $1 ORDER BY created_at DESC LIMIT 1',
        [payment.id]
      );
      if (fraudResult.rows.length > 0 && fraudResult.rows[0].flagged) {
        await AlertService.send('PAYMENT_FRAUD_FLAGGED', {
          paymentId: payment.id,
          userId: data.userId,
          amount: data.amount,
          riskScore: fraudResult.rows[0].risk_score,
          reason: fraudResult.rows[0].reason,
        });
      }

      const transactionRef = await this.simulateMobileMoneyCall(
        data.providerId,
        data.phoneNumber,
        data.amount,
        payment.id
      );

      await client.query(
        `UPDATE payments SET transaction_ref = $1, status = 'processing' WHERE id = $2`,
        [transactionRef, payment.id]
      );

      await insertAuditLog({
        userId: data.userId,
        action: 'PAYMENT_INITIATED',
        entity: 'payments',
        entityId: payment.id,
        metadata: { amount: data.amount },
      });

      // Outbox: guaranteed in the same transaction
      await client.query(
        `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
         VALUES ($1, $2, $3, $4)`,
        ['payments', payment.id, 'FRAUD_ANALYSIS', JSON.stringify({ paymentId: payment.id, userId: data.userId, amount: data.amount })]
      );

      await client.query('COMMIT');
      logger.info('Payment initiated', { payment_id: payment.id, amount: data.amount });
      return { ...payment, transaction_reference: transactionRef };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async confirmPayment(paymentId: string, transactionRef: string, status: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

      // Fetch the current payment state – FOR UPDATE to prevent race conditions
      const current = await client.query(
        `SELECT * FROM payments WHERE id = $1 AND transaction_ref = $2 FOR UPDATE`,
        [paymentId, transactionRef]
      );
      if (current.rows.length === 0) {
        throw new NotFoundError('Payment not found');
      }
      const payment = current.rows[0];

      // --- Idempotency guard: if already in a final state, just return ---
      if (payment.status === 'confirmed' || payment.status === 'failed' || payment.status === 'reversed') {
        await client.query('COMMIT'); // release the lock
        logger.info(`Payment ${paymentId} already ${payment.status}, skipping duplicate confirmation`);
        return payment;
      }

      // Proceed with the actual status change
      await client.query(
        `UPDATE payments SET status = $1 WHERE id = $2`,
        [status, paymentId]
      );

      if (status === 'confirmed') {
        // Update assessment status
        const totalPaidResult = await client.query(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM payments
           WHERE assessment_id = $1 AND status = 'confirmed'`,
          [payment.assessment_id]
        );
        const totalPaid = parseFloat(totalPaidResult.rows[0].total);
        const assessmentResult = await client.query(
          `SELECT amount FROM tax_assessments WHERE id = $1`,
          [payment.assessment_id]
        );
        const assessmentAmount = parseFloat(assessmentResult.rows[0].amount);
        const newStatus = totalPaid >= assessmentAmount ? 'paid' : 'partially_paid';
        await client.query(`UPDATE tax_assessments SET status = $1 WHERE id = $2`, [newStatus, payment.assessment_id]);

        // Double-entry ledger (must be synchronous)
        await ledgerService.recordEntries([
          {
            userId: payment.user_id,
            amount: payment.amount,
            type: 'debit',
            account: 'cash',
            reference: payment.id,
            description: `Payment received for assessment ${payment.assessment_id}`,
          },
          {
            userId: payment.user_id,
            amount: payment.amount,
            type: 'credit',
            account: 'revenue',
            reference: payment.id,
            description: `Tax revenue from assessment ${payment.assessment_id}`,
          },
        ]);

        // Outbox notification event
        await client.query(
          `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
           VALUES ($1, $2, $3, $4)`,
          ['payments', payment.id, 'EMAIL_NOTIFICATION', JSON.stringify({ userId: payment.user_id, paymentId: payment.id, amount: payment.amount })]
        );
      }

      await client.query('COMMIT');
      logger.info(`Payment ${status}`, { payment_id: paymentId });
      return { ...payment, status }; // return updated status
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ---- remaining methods unchanged ----
  async getPaymentHistory(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const paymentsResult = await pool.query(
      `SELECT id, assessment_id, amount, provider, transaction_ref, status, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM payments WHERE user_id = $1`,
      [userId]
    );

    const total = parseInt(countResult.rows[0].count, 10);

    const payments = paymentsResult.rows.map(row => ({
      payment_id: row.id,
      provider_name: row.provider,
      payment_amount: row.amount,
      transaction_reference: row.transaction_ref,
      payment_status: row.status,
      payment_date: row.created_at,
    }));

    return {
      payments,
      total,
      page,
      limit,
    };
  }

  async getPaymentStatus(paymentId: string, userId: string) {
    const result = await pool.query(
      `SELECT id, user_id, assessment_id, amount, provider, transaction_ref, status, created_at
       FROM payments
       WHERE id = $1 AND user_id = $2`,
      [paymentId, userId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError('Payment not found');
    }
    return result.rows[0];
  }

  async getProviders() {
    return [
      { provider_id: 'zaad', provider_name: 'Zaad', status: 'active' },
      { provider_id: 'edahab', provider_name: 'eDahab', status: 'active' },
      { provider_id: 'nomad', provider_name: 'Nomad', status: 'active' },
    ];
  }

  private async simulateMobileMoneyCall(providerId: string, phone: string, amount: number, paymentId: string): Promise<string> {
    const prefix = providerId.substring(0, 3).toUpperCase();
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}