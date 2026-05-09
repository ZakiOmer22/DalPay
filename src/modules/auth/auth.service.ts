import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import pool from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../utils/errors";
import { encrypt, decrypt, hashField } from "../../utils/encryption";
import { insertAuditLog } from "../../utils/audit";
import { AlertService } from "../security/alert.service";
import logger from "../../utils/logger";

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export class AuthService {
  async register(data: {
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
  }) {
    const phoneHash = hashField(data.phoneNumber);
    const nationalIdHash = hashField(data.nationalId);
    const emailHash = data.email ? hashField(data.email) : null;

    const existing = await pool.query(
      `SELECT id FROM users WHERE national_id_hash = $1 OR phone_hash = $2` +
        (emailHash ? " OR email_hash = $3" : ""),
      emailHash
        ? [nationalIdHash, phoneHash, emailHash]
        : [nationalIdHash, phoneHash],
    );

    if (existing.rows.length > 0) {
      throw new AppError(
        "User with this National ID, email, or phone already exists",
        409,
      );
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const encryptedNationalId = encrypt(data.nationalId);
    const encryptedPhone = encrypt(data.phoneNumber);
    const encryptedEmail = data.email ? encrypt(data.email) : null;

    const result = await pool.query(
      `INSERT INTO users (full_name, phone, email, national_id, password_hash, role,
                          phone_hash, national_id_hash, email_hash)
       VALUES ($1, $2, $3, $4, $5, 'taxpayer', $6, $7, $8)
       RETURNING id, full_name, phone, email, national_id, role`,
      [
        `${data.firstName} ${data.lastName}`,
        encryptedPhone,
        encryptedEmail,
        encryptedNationalId,
        passwordHash,
        phoneHash,
        nationalIdHash,
        emailHash,
      ],
    );

    const user = result.rows[0];

    user.phone = decrypt(user.phone);
    user.national_id = decrypt(user.national_id);
    if (user.email) user.email = decrypt(user.email);

    await insertAuditLog({
      userId: user.id,
      action: "REGISTRATION",
      entity: "users",
      entityId: user.id,
      metadata: {
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        verification_id: data.stripeVerificationId,
      },
    });

    logger.info("New user registered", { id: user.id });

    // ✅ role added
    const tokens = this.generateTokens(
      user.id,
      0,
      user.role,
      data.ipAddress,
      data.userAgent,
    );
    await this.storeRefreshTokenSession(
      user.id,
      tokens.refreshToken,
      data.ipAddress,
      data.userAgent,
    );

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        nationalId: user.national_id,
      },
      ...tokens,
    };
  }

  async login(
    identifier: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const isEmail = identifier.includes("@");
    const searchHash = hashField(identifier);

    let result;
    if (isEmail) {
      result = await pool.query("SELECT * FROM users WHERE email_hash = $1", [
        searchHash,
      ]);
    } else {
      result = await pool.query(
        "SELECT * FROM users WHERE phone_hash = $1 OR national_id_hash = $1",
        [searchHash],
      );
    }

    if (result.rows.length === 0) {
      throw new AppError("Invalid credentials", 401);
    }

    const user = result.rows[0];

    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      throw new AppError(
        "Account temporarily locked. Please try again later.",
        403,
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      const attempts = (user.failed_attempts || 0) + 1;
      const lockUntil =
        attempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MS)
          : null;

      await pool.query(
        "UPDATE users SET failed_attempts = $1, lock_until = $2 WHERE id = $3",
        [attempts, lockUntil, user.id],
      );

      if (lockUntil) {
        await AlertService.send("BRUTE_FORCE_LOCKOUT", {
          userId: user.id,
          identifier: identifier,
          attempts,
        });
      }
      throw new AppError("Invalid credentials", 401);
    }

    await pool.query(
      "UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = $1",
      [user.id],
    );

    user.phone = decrypt(user.phone);
    user.national_id = decrypt(user.national_id);
    if (user.email) user.email = decrypt(user.email);

    // ✅ role added
    const tokens = this.generateTokens(
      user.id,
      user.token_version,
      user.role,
      ipAddress,
      userAgent,
    );
    await this.storeRefreshTokenSession(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    await insertAuditLog({
      userId: user.id,
      action: "LOGIN",
      entity: "users",
      entityId: user.id,
      metadata: { ip_address: ipAddress, user_agent: userAgent },
    });

    const { password_hash, refresh_token_hash, ...safeUser } = user;

    return {
      user: {
        id: safeUser.id,
        fullName: safeUser.full_name,
        email: safeUser.email,
        phone: safeUser.phone,
        role: safeUser.role,
        nationalId: safeUser.national_id,
      },
      ...tokens,
    };
  }

  async refreshToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch (err) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const userId = payload.userId;
    const tokenVersion = payload.tokenVersion ?? 0;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Check user and token version
      const userResult = await client.query(
        "SELECT id, token_version, role FROM users WHERE id = $1",
        [userId],
      );
      if (userResult.rows.length === 0)
        throw new AppError("User not found", 401);
      const user = userResult.rows[0];
      if (user.token_version !== tokenVersion) {
        throw new AppError("Token version mismatch – please log in again", 401);
      }

      // Find matching active session
      const sessions = await client.query(
        "SELECT * FROM user_sessions WHERE user_id = $1 AND is_revoked = FALSE ORDER BY created_at DESC",
        [userId],
      );
      let matchingSession = null;
      for (const session of sessions.rows) {
        const match = await bcrypt.compare(
          refreshToken,
          session.refresh_token_hash,
        );
        if (match) {
          matchingSession = session;
          break;
        }
      }

      if (!matchingSession) {
        // Reuse detected → revoke all sessions and bump version
        await client.query(
          "UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1",
          [userId],
        );
        await client.query(
          "UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE id = $1",
          [userId],
        );
        await client.query("COMMIT");
        try {
          await AlertService.send("TOKEN_REUSE_DETECTED", {
            userId,
            ip: ipAddress,
          });
        } catch (err) {
          logger.error("Token reuse alert failed", err);
        }
        throw new AppError(
          "Token reuse detected – all sessions have been invalidated",
          403,
        );
      }

      // Legitimate refresh – revoke old session and create new in same transaction
      await client.query(
        "UPDATE user_sessions SET is_revoked = TRUE WHERE id = $1",
        [matchingSession.id],
      );
      const newTokens = this.generateTokens(
        userId,
        user.token_version,
        user.role,
        ipAddress,
        userAgent,
      );
      const hashedToken = await bcrypt.hash(
        newTokens.refreshToken,
        BCRYPT_ROUNDS,
      );
      await client.query(
        "INSERT INTO user_sessions (user_id, refresh_token_hash, ip, user_agent) VALUES ($1, $2, $3, $4)",
        [userId, hashedToken, ipAddress || null, userAgent || null],
      );
      await client.query(
        "UPDATE users SET refresh_token_hash = $1 WHERE id = $2",
        [hashedToken, userId],
      );
      await client.query("COMMIT");

      return newTokens;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async logout(userId: string, accessToken: string) {
    await pool.query(
      "UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1",
      [userId],
    );
    await pool.query(
      "UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE id = $1",
      [userId],
    );

    try {
      const decoded = jwt.decode(accessToken) as any;
      if (decoded?.jti) {
        await pool.query(
          `INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1, to_timestamp($2))
           ON CONFLICT (jti) DO NOTHING`,
          [decoded.jti, decoded.exp],
        );
      }
    } catch (err) {
      logger.warn("Failed to blacklist access token", { err });
    }
  }

  // ✅ Updated signature – role is now a required parameter
  private generateTokens(
    userId: string,
    tokenVersion: number,
    role: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const fingerprint = crypto
      .createHash("sha256")
      .update(`${ipAddress || ""}${userAgent || ""}`)
      .digest("hex");

    const accessToken = jwt.sign(
      {
        userId,
        tokenVersion,
        jti: accessJti,
        fingerprint,
        role, // ✅ role embedded
        keyVersion: parseInt(process.env.ACTIVE_JWT_VERSION || "1"),
      },
      env.jwt.secret,
      { expiresIn: env.jwt.expiry } as SignOptions,
    );
    const refreshToken = jwt.sign(
      { userId, tokenVersion, jti: refreshJti },
      env.jwt.refreshSecret,
      { expiresIn: env.jwt.refreshExpiry } as SignOptions,
    );
    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenSession(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const hashedToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    await pool.query(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, ip, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [userId, hashedToken, ipAddress || null, userAgent || null],
    );
    await pool.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
      hashedToken,
      userId,
    ]);
  }

  // Session management
  async listSessions(userId: string) {
    const result = await pool.query(
      `SELECT id, ip, user_agent, is_revoked, created_at
     FROM user_sessions
     WHERE user_id = $1 AND is_revoked = FALSE
     ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async revokeSession(userId: string, sessionId: string) {
    await pool.query(
      `UPDATE user_sessions SET is_revoked = TRUE
     WHERE id = $1 AND user_id = $2 AND is_revoked = FALSE`,
      [sessionId, userId],
    );
  }

  async revokeAllSessions(userId: string) {
    await pool.query(
      `UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1`,
      [userId],
    );
    await pool.query(
      `UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE id = $1`,
      [userId],
    );
  }
}
