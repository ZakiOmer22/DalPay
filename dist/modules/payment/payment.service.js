"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../config/database"));
const errors_1 = require("../../utils/errors");
const logger_1 = __importDefault(require("../../utils/logger"));
class PaymentService {
    // Initiate payment – simulated for testing
    async initiatePayment(data) {
        // Verify assessment
        const assessment = await database_1.default.query('SELECT * FROM tax_assessments WHERE id = $1 AND user_id = $2', [data.assessmentId, data.userId]);
        if (assessment.rows.length === 0) {
            throw new errors_1.NotFoundError('Assessment not found');
        }
        const assess = assessment.rows[0];
        if (assess.status === 'paid') {
            throw new errors_1.AppError('Assessment already paid', 400);
        }
        if (data.amount <= 0 || data.amount > parseFloat(assess.amount)) {
            throw new errors_1.AppError('Invalid payment amount', 400);
        }
        // Create payment record
        const idempotencyKey = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO payments
         (user_id, assessment_id, amount, provider, transaction_ref, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       RETURNING id, user_id, assessment_id, amount, provider, transaction_ref, status, created_at`, [data.userId, data.assessmentId, data.amount, data.providerId, idempotencyKey]);
        const payment = result.rows[0];
        // Simulate mobile money call
        const transactionRef = await this.simulateMobileMoneyCall(data.providerId, data.phoneNumber, data.amount, payment.id);
        // Update with real transaction reference and mark as 'processing'
        await database_1.default.query(`UPDATE payments SET transaction_ref = $1, status = 'processing' WHERE id = $2`, [transactionRef, payment.id]);
        // Audit log
        await database_1.default.query(`INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`, [data.userId, 'PAYMENT_INITIATED', 'payments', payment.id, JSON.stringify({ amount: data.amount })]);
        logger_1.default.info('Payment initiated', { payment_id: payment.id, amount: data.amount });
        return { ...payment, transaction_reference: transactionRef };
    }
    // Confirm payment (webhook or admin)
    async confirmPayment(paymentId, transactionRef, status) {
        const result = await database_1.default.query(`UPDATE payments
       SET status = $1
       WHERE id = $2 AND transaction_ref = $3
       RETURNING id, user_id, assessment_id, amount, provider, transaction_ref, status, created_at`, [status, paymentId, transactionRef]);
        if (result.rows.length === 0) {
            throw new errors_1.NotFoundError('Payment not found');
        }
        const payment = result.rows[0];
        // If confirmed, update assessment status
        if (status === 'confirmed') {
            const totalPaidResult = await database_1.default.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM payments
         WHERE assessment_id = $1 AND status = 'confirmed'`, [payment.assessment_id]);
            const totalPaid = parseFloat(totalPaidResult.rows[0].total);
            const assessmentResult = await database_1.default.query(`SELECT amount FROM tax_assessments WHERE id = $1`, [payment.assessment_id]);
            const assessmentAmount = parseFloat(assessmentResult.rows[0].amount);
            const newStatus = totalPaid >= assessmentAmount ? 'paid' : 'partially_paid';
            await database_1.default.query(`UPDATE tax_assessments SET status = $1 WHERE id = $2`, [newStatus, payment.assessment_id]);
        }
        logger_1.default.info(`Payment ${status}`, { payment_id: paymentId });
        return payment;
    }
    // Get payment history – used by dashboard
    async getPaymentHistory(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const paymentsResult = await database_1.default.query(`SELECT id, assessment_id, amount, provider, transaction_ref, status, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`, [userId, limit, offset]);
        const countResult = await database_1.default.query(`SELECT COUNT(*) FROM payments WHERE user_id = $1`, [userId]);
        const total = parseInt(countResult.rows[0].count, 10);
        const payments = paymentsResult.rows.map(row => ({
            payment_id: row.id,
            provider_name: row.provider, // provider is text (Zaad, eDahab, etc.)
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
    // Get single payment status (not used on dashboard)
    async getPaymentStatus(paymentId, userId) {
        const result = await database_1.default.query(`SELECT id, user_id, assessment_id, amount, provider, transaction_ref, status, created_at
       FROM payments
       WHERE id = $1 AND user_id = $2`, [paymentId, userId]);
        if (result.rows.length === 0) {
            throw new errors_1.NotFoundError('Payment not found');
        }
        return result.rows[0];
    }
    // Get providers (hardcoded because you don't have a table for them)
    async getProviders() {
        return [
            { provider_id: 'zaad', provider_name: 'Zaad', status: 'active' },
            { provider_id: 'edahab', provider_name: 'eDahab', status: 'active' },
            { provider_id: 'nomad', provider_name: 'Nomad', status: 'active' },
        ];
    }
    // Simulate mobile money API response
    async simulateMobileMoneyCall(providerId, phone, amount, paymentId) {
        const prefix = providerId.substring(0, 3).toUpperCase();
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map