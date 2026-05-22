import { v4 as uuidv4 } from "uuid";
import pool from "../../config/database";
import { AppError, NotFoundError } from "../../utils/errors";
import { FraudService } from "../fraud/fraud.service";
import { insertAuditLog } from "../../utils/audit";
import { LedgerService } from "../ledger/ledger.service";
import { AlertService } from "../security/alert.service";
import logger from "../../utils/logger";

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
    let paymentId: string | null = null;

    try {
      await client.query("BEGIN");
      await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

      // Validate provider
      const provider = await client.query(
        "SELECT provider_id FROM payment_providers WHERE provider_id = $1 AND is_active = true",
        [data.providerId],
      );
      if (provider.rows.length === 0) {
        throw new AppError("Invalid or inactive payment provider", 400);
      }

      // Validate assessment
      const assessment = await client.query(
        "SELECT * FROM tax_assessments WHERE id = $1 AND user_id = $2 FOR UPDATE",
        [data.assessmentId, data.userId],
      );
      if (assessment.rows.length === 0) {
        throw new NotFoundError("Assessment not found");
      }
      const assess = assessment.rows[0];
      if (assess.status === "paid") {
        throw new AppError("Assessment already paid", 400);
      }
      if (data.amount <= 0 || data.amount > parseFloat(assess.amount)) {
        throw new AppError("Invalid payment amount", 400);
      }

      // Generate transaction reference
      const transactionRef = await this.simulateMobileMoneyCall(
        data.providerId,
        data.phoneNumber,
        data.amount,
        null,
      );

      // Insert payment with status 'pending'
      const result = await client.query(
        `INSERT INTO payments
           (user_id, assessment_id, amount, provider, transaction_ref, status, fraud_status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', 'none', NOW())
         RETURNING id, user_id, assessment_id, amount, provider, transaction_ref, status, fraud_status, created_at`,
        [
          data.userId,
          data.assessmentId,
          data.amount,
          data.providerId,
          transactionRef,
        ],
      );
      const payment = result.rows[0];
      paymentId = payment.id;

      // Update status to 'processing' before commit
      await client.query(
        `UPDATE payments SET status = 'processing' WHERE id = $1`,
        [payment.id],
      );

      // Outbox event for async fraud analysis — written inside transaction so it's atomic
      await client.query(
        `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
         VALUES ($1, $2, $3, $4)`,
        [
          "payments",
          payment.id,
          "FRAUD_ANALYSIS",
          JSON.stringify({
            paymentId: payment.id,
            userId: data.userId,
            amount: data.amount,
          }),
        ],
      );

      await insertAuditLog({
        userId: data.userId,
        action: "PAYMENT_INITIATED",
        entity: "payments",
        entityId: payment.id,
        metadata: { amount: data.amount, provider: data.providerId },
      });

      await client.query("COMMIT");
      this.runFraudAnalysisAsync(payment.id, data.userId, data.amount).catch(
        (err) => logger.warn("Post-commit fraud analysis failed", { paymentId: payment.id, error: err }),
      );

      logger.info("Payment initiated", {
        payment_id: payment.id,
        amount: data.amount,
      });

      return {
        ...payment,
        status: "processing",
        transaction_reference: payment.transaction_ref,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Runs fraud analysis outside any transaction so the payment row is
   * visible (committed) when fraud_analysis tries to insert its FK reference.
   */
  private async runFraudAnalysisAsync(
    paymentId: string,
    userId: string,
    amount: number,
  ): Promise<void> {
    try {
      await this.fraudService.analyzePayment(paymentId, userId, amount);

      const fraudResult = await pool.query(
        "SELECT flagged, risk_score, reason FROM fraud_analysis WHERE payment_id = $1 ORDER BY created_at DESC LIMIT 1",
        [paymentId],
      );

      if (fraudResult.rows.length > 0 && fraudResult.rows[0].flagged) {
        await pool.query(
          `UPDATE payments SET fraud_status = 'suspicious' WHERE id = $1`,
          [paymentId],
        );
        await AlertService.send("PAYMENT_FRAUD_FLAGGED", {
          paymentId,
          userId,
          amount,
          riskScore: fraudResult.rows[0].risk_score,
          reason: fraudResult.rows[0].reason,
        });
      }
    } catch (err) {
      // Logged by the caller; swallow here so the fire-and-forget never propagates
      logger.error("Fraud analysis failed", { paymentId, error: err });
    }
  }

  async confirmPayment(
    paymentId: string,
    transactionRef: string,
    status: string = "confirmed",
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

      const current = await client.query(
        `SELECT * FROM payments WHERE id = $1 AND transaction_ref = $2 FOR UPDATE`,
        [paymentId, transactionRef],
      );
      if (current.rows.length === 0) {
        throw new NotFoundError("Payment not found");
      }
      const payment = current.rows[0];

      if (
        payment.status === "confirmed" ||
        payment.status === "failed" ||
        payment.status === "reversed"
      ) {
        await client.query("COMMIT");
        logger.info(
          `Payment ${paymentId} already ${payment.status}, skipping duplicate confirmation`,
        );
        return payment;
      }

      // Update payment status
      await client.query(`UPDATE payments SET status = $1 WHERE id = $2`, [
        status,
        paymentId,
      ]);

      if (status === "confirmed") {
        // ✅ Update assessment status based on total paid
        const totalPaidResult = await client.query(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM payments
           WHERE assessment_id = $1 AND status = 'confirmed'`,
          [payment.assessment_id],
        );
        const totalPaid = parseFloat(totalPaidResult.rows[0].total);

        const assessmentResult = await client.query(
          `SELECT amount FROM tax_assessments WHERE id = $1 FOR UPDATE`,
          [payment.assessment_id],
        );
        const assessmentAmount = parseFloat(assessmentResult.rows[0].amount);

        const newStatus =
          totalPaid >= assessmentAmount ? "paid" : "partially_paid";

        await client.query(
          `UPDATE tax_assessments SET status = $1 WHERE id = $2`,
          [newStatus, payment.assessment_id],
        );

        logger.info(
          `Assessment ${payment.assessment_id} updated to ${newStatus}`,
          { totalPaid, assessmentAmount },
        );

        // Ledger entries
        await ledgerService.recordEntries([
          {
            userId: payment.user_id,
            amount: payment.amount,
            type: "debit",
            account: "cash",
            reference: payment.id,
            description: `Payment received for assessment ${payment.assessment_id}`,
          },
          {
            userId: payment.user_id,
            amount: payment.amount,
            type: "credit",
            account: "revenue",
            reference: payment.id,
            description: `Tax revenue from assessment ${payment.assessment_id}`,
          },
        ]);

        await insertAuditLog({
          userId: payment.user_id,
          action: "PAYMENT_CONFIRMED",
          entity: "payments",
          entityId: payment.id,
          metadata: {
            amount: payment.amount,
            assessment_id: payment.assessment_id,
            new_status: newStatus,
          },
        });

        // Outbox for email notification
        await client.query(
          `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
           VALUES ($1, $2, $3, $4)`,
          [
            "payments",
            payment.id,
            "EMAIL_NOTIFICATION",
            JSON.stringify({
              userId: payment.user_id,
              paymentId: payment.id,
              amount: payment.amount,
              assessmentId: payment.assessment_id,
            }),
          ],
        );
      }

      await client.query("COMMIT");
      logger.info(`Payment ${status}`, {
        payment_id: paymentId,
        assessment_id: payment.assessment_id,
      });
      return { ...payment, status };
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Payment confirmation failed", { error, paymentId });
      throw error;
    } finally {
      client.release();
    }
  }

  async getPaymentHistory(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const paymentsResult = await pool.query(
      `SELECT id, assessment_id, amount, provider, transaction_ref, status, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM payments WHERE user_id = $1`,
      [userId],
    );
    const total = parseInt(countResult.rows[0].count, 10);
    const payments = paymentsResult.rows.map((row) => ({
      payment_id: row.id,
      provider_name: row.provider,
      payment_amount: row.amount,
      transaction_reference: row.transaction_ref,
      payment_status: row.status || "pending",
      payment_date: row.created_at,
    }));
    return { payments, total, page, limit };
  }

  async getPaymentStatus(paymentId: string, userId: string) {
    const result = await pool.query(
      `SELECT id, user_id, assessment_id, amount, provider, transaction_ref, status, created_at
       FROM payments
       WHERE id = $1 AND user_id = $2`,
      [paymentId, userId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundError("Payment not found");
    }
    return result.rows[0];
  }

  async getProviders() {
    const result = await pool.query(
      `SELECT provider_id, provider_name, is_active, api_url
       FROM payment_providers
       WHERE is_active = true
       ORDER BY provider_name ASC`,
    );
    return result.rows.map((row) => ({
      provider_id: row.provider_id,
      provider_name: row.provider_name,
      status: row.is_active ? "active" : "inactive",
      api_url: row.api_url || null,
    }));
  }

  // ── ADMIN METHODS ─────────────────────────────────────────────
  async getAllPayments(limit: number, offset: number) {
    const result = await pool.query(
      `SELECT id, user_id, assessment_id, amount, provider, transaction_ref, status, fraud_status, created_at
       FROM payments
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      assessment_id: row.assessment_id,
      amount: row.amount,
      provider: row.provider,
      transaction_ref: row.transaction_ref,
      status: row.status || "pending",
      fraud_status: row.fraud_status,
      created_at: row.created_at,
    }));
  }

  async getTotalPaymentsCount() {
    const result = await pool.query("SELECT COUNT(*) FROM payments");
    return parseInt(result.rows[0].count, 10);
  }

  async createProvider(data: { provider_id: string; provider_name: string }) {
    const result = await pool.query(
      `INSERT INTO payment_providers (provider_id, provider_name, is_active)
       VALUES ($1, $2, true)
       RETURNING id, provider_id, provider_name, is_active, created_at`,
      [data.provider_id, data.provider_name],
    );
    return result.rows[0];
  }

  private async simulateMobileMoneyCall(
    providerId: string,
    phone: string,
    amount: number,
    paymentId: string | null,
  ): Promise<string> {
    const prefix = providerId.substring(0, 3).toUpperCase();
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}