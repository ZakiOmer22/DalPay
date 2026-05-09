// modules/auth/otp.service.ts
import crypto from 'crypto';
import pool from '../../config/database';
import { AppError, NotFoundError } from '../../utils/errors';
import logger from '../../utils/logger';
import nodemailer from 'nodemailer';

const OTP_EXPIRY_MINUTES = 10;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export class OtpService {
  async sendOtp(userId: string, type: 'email' | 'phone'): Promise<{ message: string }> {
    const user = await pool.query(
      'SELECT email, phone, email_verified, phone_verified FROM users WHERE id = $1',
      [userId]
    );
    if (user.rows.length === 0) throw new NotFoundError('User not found');

    const contact = type === 'email' ? user.rows[0].email : user.rows[0].phone;
    if (!contact) throw new AppError(`No ${type} found for this user`, 400);
    if (type === 'email' && user.rows[0].email_verified) throw new AppError('Email already verified', 400);
    if (type === 'phone' && user.rows[0].phone_verified) throw new AppError('Phone already verified', 400);

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      `INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)`,
      [userId, code, type, expiresAt]
    );

    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV OTP] ${type}: ${contact} -> ${code}`);
    } else {
      if (type === 'email') {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@dalpay.gov.so',
          to: contact,
          subject: 'DalPay Verification Code',
          text: `Your DalPay verification code is: ${code}`,
        });
      }
      // Phone SMS integration would go here
    }

    return { message: `OTP sent to your ${type}` };
  }

  async verifyOtp(userId: string, code: string): Promise<void> {
    const result = await pool.query(
      `SELECT * FROM otp_codes
       WHERE user_id = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId, code]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const otp = result.rows[0];

    await pool.query('UPDATE otp_codes SET used = TRUE WHERE id = $1', [otp.id]);

    if (otp.type === 'email') {
      await pool.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [userId]);
    } else {
      await pool.query('UPDATE users SET phone_verified = TRUE WHERE id = $1', [userId]);
    }

    logger.info(`User ${userId} ${otp.type} verified`);
  }
}