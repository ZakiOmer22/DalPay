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
}
//# sourceMappingURL=gemini-fraud.service.d.ts.map