export declare class AuditService {
    getAll(opts: {
        page: number;
        limit: number;
        action?: string;
        userId?: string;
    }): Promise<{
        logs: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    verifyChain(): Promise<{
        valid: boolean;
        logs: {
            id: any;
            action: any;
            hash_chain: any;
            prev_hash: string;
            expected_hash: string;
            valid: boolean;
        }[];
    }>;
}
//# sourceMappingURL=audit.service.d.ts.map