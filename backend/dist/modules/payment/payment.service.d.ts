export declare class PaymentService {
    initiatePayment(data: {
        userId: string;
        assessmentId: string;
        amount: number;
        providerId: string;
        phoneNumber: string;
        ipAddress?: string;
    }): Promise<any>;
    confirmPayment(paymentId: string, transactionRef: string, status: string): Promise<any>;
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
        provider_id: string;
        provider_name: string;
        status: string;
    }[]>;
    private simulateMobileMoneyCall;
}
//# sourceMappingURL=payment.service.d.ts.map