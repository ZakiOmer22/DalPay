import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

export class AuthService {
  // ─────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────
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
    const existing = await pool.query(
      `SELECT id FROM users WHERE national_id = $1 OR phone = $2` +
      (data.email ? ' OR email = $3' : ''),
      data.email
        ? [data.nationalId, data.phoneNumber, data.email]
        : [data.nationalId, data.phoneNumber]
    );

    if (existing.rows.length > 0) {
      throw new AppError('User with this National ID, email, or phone already exists', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, phone, email, national_id, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'taxpayer')
       RETURNING id, full_name, phone, email, national_id, role`,
      [
        `${data.firstName} ${data.lastName}`,
        data.phoneNumber,
        data.email || null,
        data.nationalId,
        passwordHash,
      ]
    );

    const user = result.rows[0];

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        'REGISTRATION',
        'users',
        user.id,
        JSON.stringify({
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          verification_id: data.stripeVerificationId,
        }),
      ]
    );

    logger.info('New user registered', { id: user.id });

    const tokens = this.generateTokens(user.id);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

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

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  async login(identifier: string, password: string, ipAddress?: string, userAgent?: string) {
    const isEmail = identifier.includes('@');
    let result;

    if (isEmail) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [identifier]);
    } else {
      result = await pool.query(
        'SELECT * FROM users WHERE phone = $1 OR national_id = $1',
        [identifier]
      );
    }

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.generateTokens(user.id);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        'LOGIN',
        'users',
        user.id,
        JSON.stringify({ ip_address: ipAddress, user_agent: userAgent }),
      ]
    );

    const { password_hash, refresh_token, ...safeUser } = user;

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

  // ─────────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────────
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret) as { userId: string };
      const result = await pool.query('SELECT id FROM users WHERE id = $1', [decoded.userId]);
      if (result.rows.length === 0) throw new AppError('Invalid refresh token', 401);
      const tokens = this.generateTokens(decoded.userId);
      await this.storeRefreshToken(decoded.userId, tokens.refreshToken);
      return tokens;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  async logout(userId: string, accessToken: string) {
    await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [userId]);
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, env.jwt.secret, {
      expiresIn: env.jwt.expiry,
    } as SignOptions);
    const refreshToken = jwt.sign({ userId }, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiry,
    } as SignOptions);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [hashedToken, userId]);
  }
}