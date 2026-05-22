export declare class SettingsService {
    /**
     * Get all settings as a flat key-value object.
     */
    getSettings(): Promise<Record<string, any>>;
    /**
     * Update multiple settings at once (upsert each key).
     */
    updateSettings(data: Record<string, any>): Promise<void>;
    /**
     * Test email configuration by sending a test email.
     * (Implement with your actual mail service like nodemailer)
     */
    testEmail(to: string): Promise<void>;
    /**
     * Trigger a database backup.
     * This is a placeholder – implement according to your infrastructure.
     */
    backupDatabase(): Promise<{
        timestamp: string;
    }>;
}
//# sourceMappingURL=settings.service.d.ts.map