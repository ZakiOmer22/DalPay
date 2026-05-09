export declare class TaxRuleService {
    computeTaxes(userId: string, taxYear: number): Promise<{
        taxType: string;
        amount: number;
        dueDate: string;
    }[]>;
    generateAssessmentsForUser(userId: string, taxYear: number, triggeredBy?: string): Promise<void>;
    generateAllAssessments(taxYear: number, triggeredBy: string): Promise<number>;
}
//# sourceMappingURL=tax-rule.service.d.ts.map