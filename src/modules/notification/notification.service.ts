import nodemailer from 'nodemailer';
import pool from '../../config/database';
import logger from '../../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export class NotificationService {
  /**
   * Send a payment confirmation to the user and optionally a security alert.
   */
  static async sendPaymentConfirmation(userId: string, paymentId: string, amount: number) {
    try {
      const userResult = await pool.query('SELECT email, phone FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) return;
      const { email, phone } = userResult.rows[0];

      const message = `DalPay Tax Payment Confirmed\nAmount: ${amount} SOS\nPayment ID: ${paymentId}\nThank you for your payment.`;

      // Email
      if (email && process.env.NODE_ENV === 'production') {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@dalpay.gov',
          to: email,
          subject: 'Payment Confirmed – DalPay',
          text: message,
        }).catch(err => logger.error('Failed to send payment email', err));
      } else {
        logger.info(`[DEV EMAIL] To: ${email} – ${message}`);
      }

      // SMS (simulated)
      if (phone) {
        logger.info(`[SMS] To: ${phone} – ${message}`);
        // In production, integrate with an SMS gateway here
      }

      // Store notification in DB
      await pool.query(
        `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
        [userId, 'Payment Confirmed', message]
      );
    } catch (err) {
      logger.error('Notification error', err);
    }
  }

  /**
   * Send a custom notification to a user (admin tool).
   */
  static async sendCustomNotification(userId: string, title: string, message: string) {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
      [userId, title, message]
    );
    logger.info(`Custom notification sent to user ${userId}: ${title}`);
  }
}