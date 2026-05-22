"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errors_1 = require("../../utils/errors");
const fraud_service_1 = require("../fraud/fraud.service");
const audit_1 = require("../../utils/audit");
const ledger_service_1 = require("../ledger/ledger.service");
const alert_service_1 = require("../security/alert.service");
const logger_1 = __importDefault(require("../../utils/logger"));
const ledgerService = new ledger_service_1.LedgerService();
class PaymentService {
    constructor() {
        this.fraudService = new fraud_service_1.FraudService();
    }
    async initiatePayment(data) {
        const client = await database_1.default.connect();
        let paymentId = null;
        try {
            await client.query("BEGIN");
            await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
            // Validate provider
            const provider = await client.query("SELECT provider_id FROM payment_providers WHERE provider_id = $1 AND is_active = true", [data.providerId]);
            if (provider.rows.length === 0) {
                throw new errors_1.AppError("Invalid or inactive payment provider", 400);
            }
            // Validate assessment
            const assessment = await client.query("SELECT * FROM tax_assessments WHERE id = $1 AND user_id = $2 FOR UPDATE", [data.assessmentId, data.userId]);
            if (assessment.rows.length === 0) {
                throw new errors_1.NotFoundError("Assessment not found");
            }
            const assess = assessment.rows[0];
            if (assess.status === "paid") {
                throw new errors_1.AppError("Assessment already paid", 400);
            }
            if (data.amount <= 0 || data.amount > parseFloat(assess.amount)) {
                throw new errors_1.AppError("Invalid payment amount", 400);
            }
            // Generate transaction reference
            const transactionRef = await this.simulateMobileMoneyCall(data.providerId, data.phoneNumber, data.amount, null);
            // Insert payment with status 'pending'
            const result = await client.query(`INSERT INTO payments
           (user_id, assessment_id, amount, provider, transaction_ref, status, fraud_status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', 'none', NOW())
         RETURNING id, user_id, assessment_id, amount, provider, transaction_ref, status, fraud_status, created_at`, [
                data.userId,
                data.assessmentId,
                data.amount,
                data.providerId,
                transactionRef,
            ]);
            const payment = result.rows[0];
            paymentId = payment.id;
            // Update status to 'processing' before commit
            await client.query(`UPDATE payments SET status = 'processing' WHERE id = $1`, [payment.id]);
            // Outbox event for async fraud analysis — written inside transaction so it's atomic
            await client.query(`INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
         VALUES ($1, $2, $3, $4)`, [
                "payments",
                payment.id,
                "FRAUD_ANALYSIS",
                JSON.stringify({
                    paymentId: payment.id,
                    userId: data.userId,
                    amount: data.amount,
                }),
            ]);
            await (0, audit_1.insertAuditLog)({
                userId: data.userId,
                action: "PAYMENT_INITIATED",
                entity: "payments",
                entityId: payment.id,
                metadata: { amount: data.amount, provider: data.providerId },
            });
            await client.query("COMMIT");
            this.runFraudAnalysisAsync(payment.id, data.userId, data.amount).catch((err) => logger_1.default.warn("Post-commit fraud analysis failed", { paymentId: payment.id, error: err }));
            logger_1.default.info("Payment initiated", {
                payment_id: payment.id,
                amount: data.amount,
            });
            return {
                ...payment,
                status: "processing",
                transaction_reference: payment.transaction_ref,
            };
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
     * Runs fraud analysis outside any transaction so the payment row is
     * visible (committed) when fraud_analysis tries to insert its FK reference.
     */
    async runFraudAnalysisAsync(paymentId, userId, amount) {
        try {
            await this.fraudService.analyzePayment(paymentId, userId, amount);
            const fraudResult = await database_1.default.query("SELECT flagged, risk_score, reason FROM fraud_analysis WHERE payment_id = $1 ORDER BY created_at DESC LIMIT 1", [paymentId]);
            if (fraudResult.rows.length > 0 && fraudResult.rows[0].flagged) {
                await database_1.default.query(`UPDATE payments SET fraud_status = 'suspicious' WHERE id = $1`, [paymentId]);
                await alert_service_1.AlertService.send("PAYMENT_FRAUD_FLAGGED", {
                    paymentId,
                    userId,
                    amount,
                    riskScore: fraudResult.rows[0].risk_score,
                    reason: fraudResult.rows[0].reason,
                });
            }
        }
        catch (err) {
            // Logged by the caller; swallow here so the fire-and-forget never propagates
            logger_1.default.error("Fraud analysis failed", { paymentId, error: err });
        }
    }
    async confirmPayment(paymentId, transactionRef, status = "confirmed") {
        const client = await database_1.default.connect();
        try {
            await client.query("BEGIN");
            await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
            const current = await client.query(`SELECT * FROM payments WHERE id = $1 AND transaction_ref = $2 FOR UPDATE`, [paymentId, transactionRef]);
            if (current.rows.length === 0) {
                throw new errors_1.NotFoundError("Payment not found");
            }
            const payment = current.rows[0];
            if (payment.status === "confirmed" ||
                payment.status === "failed" ||
                payment.status === "reversed") {
                await client.query("COMMIT");
                logger_1.default.info(`Payment ${paymentId} already ${payment.status}, skipping duplicate confirmation`);
                return payment;
            }
            // Update payment status
            await client.query(`UPDATE payments SET status = $1 WHERE id = $2`, [
                status,
                paymentId,
            ]);
            if (status === "confirmed") {
                // ✅ Update assessment status based on total paid
                const totalPaidResult = await client.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM payments
           WHERE assessment_id = $1 AND status = 'confirmed'`, [payment.assessment_id]);
                const totalPaid = parseFloat(totalPaidResult.rows[0].total);
                const assessmentResult = await client.query(`SELECT amount FROM tax_assessments WHERE id = $1 FOR UPDATE`, [payment.assessment_id]);
                const assessmentAmount = parseFloat(assessmentResult.rows[0].amount);
                const newStatus = totalPaid >= assessmentAmount ? "paid" : "partially_paid";
                await client.query(`UPDATE tax_assessments SET status = $1 WHERE id = $2`, [newStatus, payment.assessment_id]);
                logger_1.default.info(`Assessment ${payment.assessment_id} updated to ${newStatus}`, { totalPaid, assessmentAmount });
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
                await (0, audit_1.insertAuditLog)({
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
                await client.query(`INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
           VALUES ($1, $2, $3, $4)`, [
                    "payments",
                    payment.id,
                    "EMAIL_NOTIFICATION",
                    JSON.stringify({
                        userId: payment.user_id,
                        paymentId: payment.id,
                        amount: payment.amount,
                        assessmentId: payment.assessment_id,
                    }),
                ]);
            }
            await client.query("COMMIT");
            logger_1.default.info(`Payment ${status}`, {
                payment_id: paymentId,
                assessment_id: payment.assessment_id,
            });
            return { ...payment, status };
        }
        catch (error) {
            await client.query("ROLLBACK");
            logger_1.default.error("Payment confirmation failed", { error, paymentId });
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getPaymentHistory(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const paymentsResult = await database_1.default.query(`SELECT id, assessment_id, amount, provider, transaction_ref, status, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`, [userId, limit, offset]);
        const countResult = await database_1.default.query(`SELECT COUNT(*) FROM payments WHERE user_id = $1`, [userId]);
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
    async getPaymentStatus(paymentId, userId) {
        const result = await database_1.default.query(`SELECT id, user_id, assessment_id, amount, provider, transaction_ref, status, created_at
       FROM payments
       WHERE id = $1 AND user_id = $2`, [paymentId, userId]);
        if (result.rows.length === 0) {
            throw new errors_1.NotFoundError("Payment not found");
        }
        return result.rows[0];
    }
    async getProviders() {
        const result = await database_1.default.query(`SELECT provider_id, provider_name, is_active, api_url
       FROM payment_providers
       WHERE is_active = true
       ORDER BY provider_name ASC`);
        return result.rows.map((row) => ({
            provider_id: row.provider_id,
            provider_name: row.provider_name,
            status: row.is_active ? "active" : "inactive",
            api_url: row.api_url || null,
        }));
    }
    // ── ADMIN METHODS ─────────────────────────────────────────────
    async getAllPayments(limit, offset) {
        const result = await database_1.default.query(`SELECT id, user_id, assessment_id, amount, provider, transaction_ref, status, fraud_status, created_at
       FROM payments
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`, [limit, offset]);
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
        const result = await database_1.default.query("SELECT COUNT(*) FROM payments");
        return parseInt(result.rows[0].count, 10);
    }
    async createProvider(data) {
        const result = await database_1.default.query(`INSERT INTO payment_providers (provider_id, provider_name, is_active)
       VALUES ($1, $2, true)
       RETURNING id, provider_id, provider_name, is_active, created_at`, [data.provider_id, data.provider_name]);
        return result.rows[0];
    }
    async simulateMobileMoneyCall(providerId, phone, amount, paymentId) {
        const prefix = providerId.substring(0, 3).toUpperCase();
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map