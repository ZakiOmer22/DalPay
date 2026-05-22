export declare class GeminiFraudService {
    /**
     * Analyze a payment using Gemini AI and return enhanced risk assessment.
     * Stores the result in fraud_analysis alongside the existing rules.
     */
    analyzeWithAI(paymentId: string): Promise<void>;
    /**
     * Analyze a user's overall risk profile.
     */
    analyzeUserRisk(userId: string): Promise<any>;
    /**
     * Bulk-analyze all tax assessments that haven't been processed yet.
     * Finds all payments linked to unanalyzed assessments and runs AI analysis.
     */
    analyzeAllAssessments(): Promise<{
        total: number;
        processed: number;
        flagged: number;
        results: Array<{
            paymentId: string;
            riskScore: number;
            flagged: boolean;
        }>;
    }>;
}
//# sourceMappingURL=gemini-fraud.service.d.ts.map