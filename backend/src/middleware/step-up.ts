// middleware/step-up.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import pool from '../config/database';

const SENSITIVE_ACTION_TTL_SECONDS = 5 * 60; // 5 minutes

export async function enforceStepUpAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) return next(new UnauthorizedError('Authentication required'));

  // Allow admins and auditors to bypass step‑up
  if (user.role === 'admin' || user.role === 'auditor') {
    return next();
  }

  const result = await pool.query(
    'SELECT last_sensitive_auth_at FROM users WHERE id = $1',
    [user.userId]
  );

  const lastAuth = result.rows[0]?.last_sensitive_auth_at;
  const now = new Date();

  if (!lastAuth || (now.getTime() - new Date(lastAuth).getTime()) > SENSITIVE_ACTION_TTL_SECONDS * 1000) {
    return res.status(403).json({
      success: false,
      code: 'STEP_UP_REQUIRED',
      message: 'You must re‑verify your identity before this action (verify OTP)',
    });
  }

  next();
}