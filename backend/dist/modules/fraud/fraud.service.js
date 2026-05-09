"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudService = void 0;
// modules/fraud/fraud.service.ts
const database_1 = __importDefault(require("../../config/database"));
const logger_1 = __importDefault(require("../../utils/logger"));
class FraudService {
    async analyzePayment(paymentId, userId, amount) {
        try {
            const profile = await database_1.default.query('SELECT monthly_income FROM taxpayer_profiles WHERE user_id = $1', [userId]);
            let riskScore = 0;
            const reasons = [];
            if (profile.rows.length > 0 && profile.rows[0].monthly_income) {
                const income = parseFloat(profile.rows[0].monthly_income);
                if (income > 0 && amount > income * 2) {
                    riskScore = Math.min(1, riskScore + 0.7);
                    reasons.push('Payment exceeds 2x monthly income');
                }
            }
            if (amount > 10000) {
                riskScore = Math.min(1, riskScore + 0.5);
                reasons.push('High-value transaction');
            }
            const flagged = riskScore >= 0.6;
            await database_1.default.query(`INSERT INTO fraud_analysis (payment_id, risk_score, reason, flagged)
         VALUES ($1, $2, $3, $4)`, [paymentId, riskScore, reasons.join('; ') || 'Low risk', flagged]);
            if (flagged) {
                const fraudStatus = riskScore >= 0.8 ? 'high_risk' : 'suspicious';
                await database_1.default.query(`UPDATE payments SET fraud_status = $1 WHERE id = $2`, [fraudStatus, paymentId]);
            }
            logger_1.default.info('Fraud analysis completed', { paymentId, riskScore, flagged });
        }
        catch (error) {
            logger_1.default.error('Fraud analysis failed', { paymentId, error });
        }
    }
}
exports.FraudService = FraudService;
//# sourceMappingURL=fraud.service.js.map