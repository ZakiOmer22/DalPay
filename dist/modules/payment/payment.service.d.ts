export declare class PaymentService {
    private fraudService;
    initiatePayment(data: {
        userId: string;
        assessmentId: string;
        amount: number;
        providerId: string;
        phoneNumber: string;
        ipAddress?: string;
    }): Promise<any>;
    /**
     * Runs fraud analysis outside any transaction so the payment row is
     * visible (committed) when fraud_analysis tries to insert its FK reference.
     */
    private runFraudAnalysisAsync;
    confirmPayment(paymentId: string, transactionRef: string, status?: string): Promise<any>;
    getPaymentHistory(userId: string, page?: number, limit?: number): Promise<{
        payments: {
            payment_id: any;
            provider_name: any;
            payment_amount: any;
            transaction_reference: any;
            payment_status: any;
            payment_date: any;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPaymentStatus(paymentId: string, userId: string): Promise<any>;
    getProviders(): Promise<{
        provider_id: any;
        provider_name: any;
        status: string;
        api_url: any;
    }[]>;
    getAllPayments(limit: number, offset: number): Promise<{
        id: any;
        user_id: any;
        assessment_id: any;
        amount: any;
        provider: any;
        transaction_ref: any;
        status: any;
        fraud_status: any;
        created_at: any;
    }[]>;
    getTotalPaymentsCount(): Promise<number>;
    createProvider(data: {
        provider_id: string;
        provider_name: string;
    }): Promise<any>;
    private simulateMobileMoneyCall;
}
//# sourceMappingURL=payment.service.d.ts.map