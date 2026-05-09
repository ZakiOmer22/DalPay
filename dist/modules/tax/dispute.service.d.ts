export interface DisputeData {
    assessmentId: string;
    userId: string;
    reason: string;
    proposedAmount?: number;
    evidence?: string;
}
export declare class DisputeService {
    createDispute(data: DisputeData): Promise<any>;
    getDisputesByUser(userId: string): Promise<any[]>;
    getAllDisputes(status?: string): Promise<any[]>;
    resolveDispute(disputeId: string, adminId: string, resolution: {
        status: 'approved' | 'rejected';
        adjustedAmount?: number;
        comment?: string;
    }): Promise<any>;
}
//# sourceMappingURL=dispute.service.d.ts.map