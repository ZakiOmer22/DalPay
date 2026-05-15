export declare class USSDService {
    private sessionStore;
    private paymentService;
    private taxService;
    processRequest(phoneNumber: string, text: string, sessionId?: string): Promise<{
        sessionId: string;
        response: string;
        end: boolean;
    }>;
    private startNewSession;
    private handleState;
    private handleEnterPhone;
    private handleMainMenu;
    private getBalanceText;
    private handleCheckBalance;
    private handlePayTaxSelectType;
    private handlePayTaxSelectProvider;
    private handlePayTaxEnterAmount;
    private handlePayTaxEnterPin;
    private getStatementText;
    private handleStatement;
    private generateSessionId;
}
//# sourceMappingURL=ussd.service.d.ts.map