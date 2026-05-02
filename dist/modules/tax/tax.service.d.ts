export declare class TaxService {
    getAssessments(userId: string): Promise<{
        assessment_id: any;
        tax_type: any;
        assessment_year: any;
        assessed_amount: any;
        payment_due_date: any;
        status: any;
    }[]>;
    getAssessment(assessmentId: string, userId: string): Promise<{
        assessment_id: any;
        tax_type: any;
        assessment_year: any;
        assessed_amount: any;
        payment_due_date: any;
        status: any;
    }>;
    createAssessment(data: {
        userId: string;
        taxType: string;
        year: number;
        amount: number;
        dueDate: string;
        adminId: string;
        ipAddress?: string;
    }): Promise<{
        assessment_id: any;
        tax_type: any;
        assessment_year: any;
        assessed_amount: any;
        payment_due_date: any;
        status: any;
    }>;
    getTaxpayerSummary(userId: string): Promise<{
        assessments: {
            total_due: any;
            pending: number;
            overdue: number;
            paid: number;
        };
        payments: {
            total_paid: any;
            total_payments: number;
        };
    }>;
}
//# sourceMappingURL=tax.service.d.ts.map