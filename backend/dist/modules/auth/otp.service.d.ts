export declare class OtpService {
    sendOtp(userId: string, type: 'email' | 'phone'): Promise<{
        message: string;
    }>;
    verifyOtp(userId: string, code: string): Promise<void>;
}
//# sourceMappingURL=otp.service.d.ts.map