export declare class NotificationService {
    /**
     * Send a payment confirmation to the user and optionally a security alert.
     */
    static sendPaymentConfirmation(userId: string, paymentId: string, amount: number): Promise<void>;
    /**
     * Send a custom notification to a user (admin tool).
     */
    static sendCustomNotification(userId: string, title: string, message: string): Promise<void>;
}
//# sourceMappingURL=notification.service.d.ts.map