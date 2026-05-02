export declare class ReconciliationService {
    runDailyReconciliation(adminId: string, date?: string): Promise<{
        date: string;
        reconciliations: any[];
    }>;
    getReconciliationReport(date: string): Promise<any[]>;
    getReconciliationSummary(days?: number): Promise<any[]>;
    fileDispute(reconciliationId: string, reason: string, userId: string): Promise<any>;
}
//# sourceMappingURL=reconciliation.service.d.ts.map