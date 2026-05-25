import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import pool from '../config/database';
import logger from '../utils/logger';

// Helper to escape single quotes for direct interpolation in SET LOCAL
function safeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken: any = jwt.decode(token, { complete: true });
    const keyVersion = decodedToken?.payload?.keyVersion || 1;
    const secret =
      keyVersion === 2
        ? (process.env.JWT_SECRET_V2 || env.jwt.secret)
        : env.jwt.secret;
    const decoded: any = jwt.verify(token, secret);

    // JTI blacklist check
    if (decoded.jti) {
      const revoked = await pool.query('SELECT 1 FROM revoked_tokens WHERE jti = $1', [decoded.jti]);
      if (revoked.rows.length > 0) {
        throw new UnauthorizedError('Token has been revoked');
      }
    }

    // Fingerprint check (compatible with Render)
    if (decoded.fingerprint) {
      const isRender = process.env.RENDER === 'true';
      const salt = process.env.FINGERPRINT_SALT || 'dalpay-render-salt';
      
      let currentFingerprint: string;
      if (isRender) {
        // On Render, only use user agent + salt (IP changes often)
        currentFingerprint = crypto
          .createHash('sha256')
          .update(`${req.headers['user-agent'] || ''}${salt}`)
          .digest('hex');
      } else {
        // Original fingerprint (IP + user agent) for local / non‑Render
        currentFingerprint = crypto
          .createHash('sha256')
          .update(`${req.ip}${req.headers['user-agent'] || ''}`)
          .digest('hex');
      }
      
      if (currentFingerprint !== decoded.fingerprint) {
        throw new UnauthorizedError('Token used from different device');
      }
    }

    // ======================== RLS setup ========================
    const userId = decoded.userId;
    let role = decoded.role;

    if (!userId) {
      return next(new UnauthorizedError('Malformed token: missing userId'));
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`SET LOCAL app.user_id = '${safeSQL(userId)}'`);

      if (!role) {
        const res = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (res.rows.length > 0) {
          role = res.rows[0].role;
        }
      }

      if (role) {
        await client.query(`SET LOCAL app.user_role = '${safeSQL(role)}'`);
      }

      (req as any).dbClient = client;
      (req as any).user = decoded;

      const originalEnd = res.end.bind(res);
      res.end = (...args: any[]) => {
        client.query('COMMIT').catch(() => {}).finally(() => client.release());
        return originalEnd(...args);
      };

      next();
    } catch (innerError) {
      logger.error('Authenticate inner block failed', { error: innerError, userId });
      await client.query('ROLLBACK').catch(() => {});
      client.release();
      if (innerError instanceof UnauthorizedError) {
        return next(innerError);
      }
      next(new UnauthorizedError('Internal authentication error'));
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    next();
  };
}