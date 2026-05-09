import nodemailer from 'nodemailer';
import logger from '../../utils/logger';

const ALERT_EMAIL = process.env.ALERT_EMAIL || 'security@dalpay.gov.so';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ethereal.email';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export class AlertService {
  static async send(event: string, details: any) {
    const message = `[SECURITY] ${event}\n${JSON.stringify(details, null, 2)}`;
    logger.warn(message);

    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@dalpay.gov.so',
        to: ALERT_EMAIL,
        subject: `Security Alert: ${event}`,
        text: message,
      }).catch(err => logger.error('Failed to send alert email', err));
    }
  }
}