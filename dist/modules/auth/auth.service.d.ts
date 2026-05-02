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
            nationalId: any;
        };
    }>;
    login(identifier: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            fullName: any;
            email: any;
            phone: any;
            role: any;
            nationalId: any;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, accessToken: string): Promise<void>;
    private generateTokens;
    private storeRefreshToken;
}
//# sourceMappingURL=auth.service.d.ts.map