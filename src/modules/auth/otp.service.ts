import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool from "../../config/database";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import nodemailer from "nodemailer";
import { generateAndStoreTokens } from "../../utils/token";
import { hashField } from "../../utils/encryption";

const OTP_EXPIRY_MINUTES = 10;
const BCRYPT_ROUNDS = 12;
const RESEND_COOLDOWN_MS = 60_000; // 60 seconds

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export class OtpService {
  async sendOtp(
    userId: string,
    type: "email" | "phone",
  ): Promise<{ message: string }> {
    try {
      const user = await pool.query(
        "SELECT email, phone, email_verified, phone_verified FROM users WHERE id = $1",
        [userId],
      );
      if (user.rows.length === 0) {
        return { message: "If eligible, an OTP has been sent." };
      }

      const contact =
        type === "email" ? user.rows[0].email : user.rows[0].phone;
      if (!contact) {
        return { message: "If eligible, an OTP has been sent." };
      }

      const verified =
        type === "email"
          ? user.rows[0].email_verified
          : user.rows[0].phone_verified;
      if (verified) {
        return { message: "If eligible, an OTP has been sent." };
      }

      // Cooldown: check when the last OTP of this type was sent
      const lastCode = await pool.query(
        `SELECT created_at FROM otp_codes
         WHERE user_id = $1 AND type = $2 AND used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [userId, type],
      );
      if (lastCode.rows.length > 0) {
        const diff =
          Date.now() - new Date(lastCode.rows[0].created_at).getTime();
        if (diff < RESEND_COOLDOWN_MS) {
          // Still too soon – return generic message without sending a new code
          return { message: "If eligible, an OTP has been sent." };
        }
      }

      const code = crypto.randomInt(100000, 999999).toString();
      const hashedCode = await bcrypt.hash(code, BCRYPT_ROUNDS);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await pool.query(
        `INSERT INTO otp_codes (user_id, code, type, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [userId, hashedCode, type, expiresAt],
      );

      if (process.env.NODE_ENV === "development") {
        logger.info(`[DEV OTP] ${type}: ${contact} -> ${code}`);
      } else {
        if (type === "email") {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || "noreply@dalpay.gov.so",
            to: contact,
            subject: "DalPay Verification Code",
            text: `Your DalPay verification code is: ${code}`,
          });
        }
        // Phone SMS integration would go here
      }
    } catch (err) {
      logger.error("OTP send error", { err });
    }

    return { message: "If eligible, an OTP has been sent." };
  }

  async verifyOtp(
    userId: string,
    code: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken?: string; refreshToken?: string }> {
    // Get the most recent valid, unused OTP for this user
    const result = await pool.query(
      `SELECT id, code, type
       FROM otp_codes
       WHERE user_id = $1 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    const otp = result.rows[0];

    // Compare the provided code with the stored hash
    const match = await bcrypt.compare(code, otp.code);
    if (!match) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    // Successful verification – mark as used (single‑use)
    await pool.query("UPDATE otp_codes SET used = TRUE WHERE id = $1", [
      otp.id,
    ]);

    // Check if this type was already verified before
    const userRes = await pool.query(
      "SELECT email_verified, phone_verified, role FROM users WHERE id = $1",
      [userId],
    );
    if (userRes.rows.length === 0) throw new AppError("User not found", 400);

    const wasVerified =
      otp.type === "email"
        ? userRes.rows[0].email_verified
        : userRes.rows[0].phone_verified;

    if (otp.type === "email") {
      await pool.query("UPDATE users SET email_verified = TRUE WHERE id = $1", [
        userId,
      ]);
    } else {
      await pool.query("UPDATE users SET phone_verified = TRUE WHERE id = $1", [
        userId,
      ]);
    }

    logger.info(`User ${userId} ${otp.type} verified`);

    // If first verification, generate and return tokens
    if (!wasVerified) {
      const tokens = await generateAndStoreTokens(
        userId,
        0, // tokenVersion starts at 0
        userRes.rows[0].role,
        ipAddress,
        userAgent,
      );
      return tokens;
    }

    return {};
  }

  async verifyPasswordResetOtp(
    identifier: string,
    code: string,
  ): Promise<{ valid: boolean; userId?: string }> {
    // Determine if identifier is email or phone
    const type = identifier.includes("@") ? "email" : "phone";
    const hash = hashField(identifier);

    // Find the user
    let user;
    if (type === "email") {
      user = await pool.query("SELECT id FROM users WHERE email_hash = $1", [
        hash,
      ]);
    } else {
      user = await pool.query("SELECT id FROM users WHERE phone_hash = $1", [
        hash,
      ]);
    }
    if (user.rows.length === 0) return { valid: false };

    const userId = user.rows[0].id;

    // Get the latest unused OTP for this user + type
    const result = await pool.query(
      `SELECT id, code FROM otp_codes
     WHERE user_id = $1 AND type = $2 AND used = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
      [userId, type],
    );

    if (result.rows.length === 0) return { valid: false };

    const otp = result.rows[0];
    const match = await bcrypt.compare(code, otp.code);
    if (!match) return { valid: false };

    // Mark OTP as used
    await pool.query("UPDATE otp_codes SET used = TRUE WHERE id = $1", [
      otp.id,
    ]);

    return { valid: true, userId };
  }
}
