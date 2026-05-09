// modules/fraud/gemini-fraud.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../../config/database';
import logger from '../../utils/logger';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

export class GeminiFraudService {
  /**
   * Analyze a payment using Gemini AI and return enhanced risk assessment.
   * Stores the result in fraud_analysis alongside the existing rules.
   */
  async analyzeWithAI(paymentId: string): Promise<void> {
    try {
      // Gather payment context
      const payment = await pool.query(
        `SELECT p.*, u.full_name, ta.tax_type, ta.amount as assessed_amount
         FROM payments p
         JOIN users u ON p.user_id = u.id
         JOIN tax_assessments ta ON p.assessment_id = ta.id
         WHERE p.id = $1`,
        [paymentId]
      );
      if (payment.rows.length === 0) return;
      const p = payment.rows[0];

      // Get user's profile and payment history
      const profile = await pool.query(
        'SELECT * FROM taxpayer_profiles WHERE user_id = $1',
        [p.user_id]
      );
      const history = await pool.query(
        `SELECT COUNT(*) as total_payments, COALESCE(SUM(amount), 0) as total_amount
         FROM payments WHERE user_id = $1 AND status = 'confirmed'`,
        [p.user_id]
      );

      const context = {
        user: { name: p.full_name, id: p.user_id },
        payment: { amount: p.amount, taxType: p.tax_type, assessedAmount: p.assessed_amount },
        profile: profile.rows[0] || {},
        history: history.rows[0] || {},
      };

      const prompt = `Analyze this tax payment for fraud risk.
Context: ${JSON.stringify(context)}
Return a JSON object with:
- riskScore (0-1)
- reasons (array of strings)
- flagged (boolean)
- recommendation (string)

Only respond with valid JSON, no markdown.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();
      const aiAssessment = JSON.parse(response.replace(/```json|```/g, ''));

      // Update or insert fraud analysis
      await pool.query(
        `INSERT INTO fraud_analysis (payment_id, risk_score, reason, flagged)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (payment_id) DO UPDATE
         SET risk_score = EXCLUDED.risk_score,
             reason = EXCLUDED.reason,
             flagged = EXCLUDED.flagged`,
        [paymentId, aiAssessment.riskScore, aiAssessment.reasons.join('; '), aiAssessment.flagged]
      );

      // Update payment fraud_status if flagged
      if (aiAssessment.flagged) {
        const fraudStatus = aiAssessment.riskScore >= 0.8 ? 'high_risk' : 'suspicious';
        await pool.query('UPDATE payments SET fraud_status = $1 WHERE id = $2', [fraudStatus, paymentId]);
      }

      logger.info('AI fraud analysis completed', { paymentId, riskScore: aiAssessment.riskScore });
    } catch (error) {
      logger.error('AI fraud analysis failed', { paymentId, error });
    }
  }

  /**
   * Analyze a user's overall risk profile.
   */
  async analyzeUserRisk(userId: string): Promise<any> {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      const payments = await pool.query(
        `SELECT p.amount, p.status, p.created_at, ta.tax_type
         FROM payments p
         LEFT JOIN tax_assessments ta ON p.assessment_id = ta.id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC LIMIT 20`,
        [userId]
      );
      const profile = await pool.query('SELECT * FROM taxpayer_profiles WHERE user_id = $1', [userId]);

      const context = {
        user: { name: user.rows[0]?.full_name, id: userId },
        payments: payments.rows,
        profile: profile.rows[0] || {},
      };

      const prompt = `Analyze this taxpayer's overall risk profile.
Context: ${JSON.stringify(context)}
Return a JSON object with:
- overallRiskScore (0-1)
- flags (array of string descriptions)
- riskLevel (low/medium/high/critical)
- summary (string)

Only respond with valid JSON.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();
      return JSON.parse(response.replace(/```json|```/g, ''));
    } catch (error) {
      logger.error('AI user risk analysis failed', { userId, error });
      return { overallRiskScore: 0, flags: [], riskLevel: 'unknown', summary: 'Analysis failed' };
    }
  }
}