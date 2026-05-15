export declare class AuthService {
    register(data: {
        nationalId: string;
        firstName: string;
        lastName: string;
        email?: string;
        phoneNumber: string;
        password: string;
        dateOfBirth?: string;
        gender?: string;
        occupation?: string;
        region?: string;
        district?: string;
        address?: string;
        idType?: string;
        idNumber?: string;
        drivingLicenseNumber?: string;
        proofOfAddressType?: string;
        stripeVerificationId?: string;
        parentName?: string;
        parentNationalId?: string;
        parentPhone?: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            fullName: any;
            email: any;
            phone: any;
            role: any;
        };
    }>;
    registerUnverified(data: {
        nationalId: string;
        firstName: string;
        lastName: string;
        email?: string;
        phoneNumber: string;
        password: string;
        dateOfBirth?: string;
        gender?: string;
        occupation?: string;
        region?: string;
        district?: string;
        address?: string;
        idType?: string;
        idNumber?: string;
        drivingLicenseNumber?: string;
        proofOfAddressType?: string;
        stripeVerificationId?: string;
        parentName?: string;
        parentNationalId?: string;
        parentPhone?: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        id: any;
        fullName: any;
        role: any;
    }>;
    login(identifier: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            fullName: any;
            role: any;
        };
    }>;
    refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, accessToken: string): Promise<void>;
    private generateTokens;
    private storeRefreshTokenSession;
    listSessions(userId: string): Promise<any[]>;
    revokeSession(userId: string, sessionId: string): Promise<void>;
    revokeAllSessions(userId: string): Promise<void>;
    getProfile(userId: string): Promise<{
        id: any;
        fullName: any;
        role: any;
        emailVerified: any;
        phoneVerified: any;
        memberSince: any;
        region: any;
        district: any;
        occupation: any;
    }>;
    forgotPassword(identifier: string, type: "email" | "phone"): Promise<void>;
    updatePassword(userId: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map