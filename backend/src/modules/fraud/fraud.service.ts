// modules/fraud/fraud.service.ts
import pool from '../../config/database';
import logger from '../../utils/logger';

export class FraudService {
  async analyzePayment(paymentId: string, userId: string, amount: number): Promise<void> {
    try {
      const profile = await pool.query(
        'SELECT monthly_income FROM taxpayer_profiles WHERE user_id = $1',
        [userId]
      );

      let riskScore = 0;
      const reasons: string[] = [];

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

      await pool.query(
        `INSERT INTO fraud_analysis (payment_id, risk_score, reason, flagged)
         VALUES ($1, $2, $3, $4)`,
        [paymentId, riskScore, reasons.join('; ') || 'Low risk', flagged]
      );

      if (flagged) {
        const fraudStatus = riskScore >= 0.8 ? 'high_risk' : 'suspicious';
        await pool.query(
          `UPDATE payments SET fraud_status = $1 WHERE id = $2`,
          [fraudStatus, paymentId]
        );
      }

      logger.info('Fraud analysis completed', { paymentId, riskScore, flagged });
    } catch (error) {
      logger.error('Fraud analysis failed', { paymentId, error });
    }
  }
}