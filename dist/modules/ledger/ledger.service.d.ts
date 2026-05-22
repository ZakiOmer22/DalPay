export interface LedgerEntry {
    userId: string;
    amount: number;
    type: "debit" | "credit";
    account: string;
    reference: string;
    description: string;
}
export declare class LedgerService {
    /**
     * Record a double-entry transaction.
     * Every financial event must have at least one debit and one credit of equal sum.
     * This function records all entries atomically.
     */
    recordEntries(entries: LedgerEntry[]): Promise<void>;
    /**
     * Get ledger for a specific user or all users (admin).
     */
    getLedger(userId?: string, limit?: number, offset?: number): Promise<any[]>;
    /**
     * Get balance for a specific account (e.g., to verify cash balance).
     */
    getAccountBalance(account: string): Promise<number>;
    verifyBalance(): Promise<boolean>;
    /**
     * Get filtered ledger entries with pagination.
     * Returns total count and entries.
     */
    getFilteredLedger(filters: {
        search?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }, limit: number, offset: number): Promise<{
        total: number;
        entries: any[];
    }>;
}
//# sourceMappingURL=ledger.service.d.ts.map