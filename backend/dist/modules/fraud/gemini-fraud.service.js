"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiFraudService = void 0;
// modules/fraud/gemini-fraud.service.ts
const generative_ai_1 = require("@google/generative-ai");
const database_1 = __importDefault(require("../../config/database"));
const logger_1 = __importDefault(require("../../utils/logger"));
// Use backend env variable (no VITE_ prefix)
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Correct model name – the stable version, not "latest"
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
class GeminiFraudService {
    /**
     * Analyze a payment using Gemini AI and return enhanced risk assessment.
     * Stores the result in fraud_analysis alongside the existing rules.
     */
    async analyzeWithAI(paymentId) {
        try {
            // Gather payment context
            const payment = await database_1.default.query(`SELECT p.*, u.full_name, ta.tax_type, ta.amount as assessed_amount
         FROM payments p
         JOIN users u ON p.user_id = u.id
         JOIN tax_assessments ta ON p.assessment_id = ta.id
         WHERE p.id = $1`, [paymentId]);
            if (payment.rows.length === 0)
                return;
            const p = payment.rows[0];
            // Get user's profile and payment history
            const profile = await database_1.default.query("SELECT * FROM taxpayer_profiles WHERE user_id = $1", [p.user_id]);
            const history = await database_1.default.query(`SELECT COUNT(*) as total_payments, COALESCE(SUM(amount), 0) as total_amount
         FROM payments WHERE user_id = $1 AND status = 'confirmed'`, [p.user_id]);
            const context = {
                user: { name: p.full_name, id: p.user_id },
                payment: {
                    amount: p.amount,
                    taxType: p.tax_type,
                    assessedAmount: p.assessed_amount,
                },
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
            const aiAssessment = JSON.parse(response.replace(/```json|```/g, ""));
            // Update or insert fraud analysis
            await database_1.default.query(`INSERT INTO fraud_analysis (payment_id, risk_score, reason, flagged)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (payment_id) DO UPDATE
         SET risk_score = EXCLUDED.risk_score,
             reason = EXCLUDED.reason,
             flagged = EXCLUDED.flagged`, [
                paymentId,
                aiAssessment.riskScore,
                aiAssessment.reasons.join("; "),
                aiAssessment.flagged,
            ]);
            // Update payment fraud_status if flagged
            if (aiAssessment.flagged) {
                const fraudStatus = aiAssessment.riskScore >= 0.8 ? "high_risk" : "suspicious";
                await database_1.default.query("UPDATE payments SET fraud_status = $1 WHERE id = $2", [fraudStatus, paymentId]);
            }
            logger_1.default.info("AI fraud analysis completed", {
                paymentId,
                riskScore: aiAssessment.riskScore,
            });
        }
        catch (error) {
            logger_1.default.error("AI fraud analysis failed", { paymentId, error });
        }
    }
    /**
     * Analyze a user's overall risk profile.
     */
    async analyzeUserRisk(userId) {
        try {
            const user = await database_1.default.query("SELECT * FROM users WHERE id = $1", [
                userId,
            ]);
            const payments = await database_1.default.query(`SELECT p.amount, p.status, p.created_at, ta.tax_type
         FROM payments p
         LEFT JOIN tax_assessments ta ON p.assessment_id = ta.id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC LIMIT 20`, [userId]);
            const profile = await database_1.default.query("SELECT * FROM taxpayer_profiles WHERE user_id = $1", [userId]);
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
            return JSON.parse(response.replace(/```json|```/g, ""));
        }
        catch (error) {
            logger_1.default.error("AI user risk analysis failed", { userId, error });
            return {
                overallRiskScore: 0,
                flags: [],
                riskLevel: "unknown",
                summary: "Analysis failed",
            };
        }
    }
    /**
     * Bulk-analyze all tax assessments that haven't been processed yet.
     * Finds all payments linked to unanalyzed assessments and runs AI analysis.
     */
    async analyzeAllAssessments() {
        try {
            // 1. Fetch all payments with fraud_status not yet set (or null)
            const payments = await database_1.default.query(`SELECT p.id, p.amount, p.user_id
       FROM payments p
       JOIN tax_assessments ta ON p.assessment_id = ta.id
       WHERE p.fraud_status IS NULL
         AND p.status = 'confirmed'
       ORDER BY p.created_at DESC
       LIMIT 500`);
            const total = payments.rows.length;
            const results = [];
            // 2. Process each payment one-by-one (to respect API rate limits)
            for (const row of payments.rows) {
                try {
                    await this.analyzeWithAI(row.id); // uses your existing method
                    // Fetch the newly stored risk score
                    const analysis = await database_1.default.query("SELECT risk_score, flagged FROM fraud_analysis WHERE payment_id = $1", [row.id]);
                    const score = analysis.rows[0]?.risk_score || 0;
                    const flagged = analysis.rows[0]?.flagged || false;
                    results.push({ paymentId: row.id, riskScore: score, flagged });
                }
                catch (err) {
                    logger_1.default.error("Failed to analyze payment in bulk", {
                        paymentId: row.id,
                        err,
                    });
                    results.push({ paymentId: row.id, riskScore: 0, flagged: false });
                }
            }
            const flaggedCount = results.filter((r) => r.flagged).length;
            logger_1.default.info("Bulk fraud analysis completed", {
                total,
                flagged: flaggedCount,
            });
            return {
                total,
                processed: results.length,
                flagged: flaggedCount,
                results,
            };
        }
        catch (error) {
            logger_1.default.error("Bulk fraud analysis failed", { error });
            throw error;
        }
    }
}
exports.GeminiFraudService = GeminiFraudService;
//# sourceMappingURL=gemini-fraud.service.js.map