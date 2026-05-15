export declare class OtpService {
    sendOtp(userId: string, type: "email" | "phone"): Promise<{
        message: string;
    }>;
    verifyOtp(userId: string, code: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken?: string;
        refreshToken?: string;
    }>;
    verifyPasswordResetOtp(identifier: string, code: string): Promise<{
        valid: boolean;
        userId?: string;
    }>;
}
//# sourceMappingURL=otp.service.d.ts.map