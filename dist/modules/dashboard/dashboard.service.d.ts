export declare class DashboardService {
    getOverview(): Promise<{
        revenue: number;
        outstanding: number;
        users: {
            total: number;
            taxpayers: number;
            admins: number;
        };
        fraud: {
            flagged: number;
            total_analyses: number;
        };
        disputes: {
            pending: number;
            total: number;
        };
    }>;
    getMonthlyRevenue(months?: number): Promise<{
        month: any;
        revenue: number;
    }[]>;
    getRecentPayments(limit?: number): Promise<any[]>;
    getRecentFraudFlags(limit?: number): Promise<any[]>;
}
//# sourceMappingURL=dashboard.service.d.ts.map