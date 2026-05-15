// modules/settings/settings.service.ts
import pool from "../../config/database";
import logger from "../../utils/logger";

export class SettingsService {
  /**
   * Get all settings as a flat key-value object.
   */
  async getSettings(): Promise<Record<string, any>> {
    const result = await pool.query("SELECT key, value FROM system_settings");
    const settings: Record<string, any> = {};
    for (const row of result.rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }
    return settings;
  }

  /**
   * Update multiple settings at once (upsert each key).
   */
  async updateSettings(data: Record<string, any>): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const [key, value] of Object.entries(data)) {
        await client.query(
          `INSERT INTO system_settings (key, value)
           VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, JSON.stringify(value)]
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test email configuration by sending a test email.
   * (Implement with your actual mail service like nodemailer)
   */
  async testEmail(to: string): Promise<void> {
    // Placeholder: replace with real mail sending logic
    logger.info(`Test email would be sent to ${to}`);
    // Example: await mailService.send({ to, subject: 'DalPay Test', text: 'It works!' });
  }

  /**
   * Trigger a database backup.
   * This is a placeholder – implement according to your infrastructure.
   */
  async backupDatabase(): Promise<{ timestamp: string }> {
    // Example: run pg_dump or call external service
    const timestamp = new Date().toISOString();
    logger.info(`Database backup triggered at ${timestamp}`);
    // Store in settings that a backup was done
    await this.updateSettings({ lastBackup: timestamp });
    return { timestamp };
  }
}