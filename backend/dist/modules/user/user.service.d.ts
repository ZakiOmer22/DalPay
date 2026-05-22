export declare class UserService {
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        occupation?: string;
        region?: string;
        district?: string;
    }): Promise<any>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map