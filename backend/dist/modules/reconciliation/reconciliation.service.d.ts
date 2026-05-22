export declare class ReconciliationService {
    /**
     * Run reconciliation for today (or a given date).
     * Only called from the admin controller (authenticated user).
     */
    runDailyReconciliation(adminId: string, date?: string): Promise<{
        date: string;
        status: string;
        total_collected: any;
        total_disbursed: any;
        discrepancies: any;
        details: any[];
    }>;
    /**
     * Get reconciliation report for a specific date (read‑only, no audit log).
     */
    getReconciliationReport(date: string): Promise<{
        date: string;
        status: string;
        total_collected: any;
        total_disbursed: any;
        discrepancies: any;
        details: any[];
    }>;
    /**
     * Get a 30‑day summary of reconciliations.
     * Computed directly from payments.
     */
    getReconciliationSummary(days?: number): Promise<{
        date: any;
        status: string;
        total_collected: number;
        discrepancies: number;
    }[]>;
    /**
     * Placeholder for filing a dispute.
     */
    fileDispute(reconciliationId: string, reason: string, userId: string): Promise<{
        id: string;
        status: string;
    }>;
}
//# sourceMappingURL=reconciliation.service.d.ts.map