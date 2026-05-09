import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../utils/errors';

export async function idempotencyGuard(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-idempotency-key'] as string;
  if (!key) {
    return next(new AppError('Missing X-Idempotency-Key header', 400));
  }

  try {
    // Check if already processed
    const existing = await pool.query(
      'SELECT response FROM idempotency_keys WHERE key = $1',
      [key]
    );
    if (existing.rows.length > 0) {
      return res.status(200).json(existing.rows[0].response);
    }

    // Intercept response to store it
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      pool.query(
        'INSERT INTO idempotency_keys (key, response) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [key, JSON.stringify(body)]
      ).catch(() => {}); // don't fail if storage error
      return originalJson(body);
    };

    next();
  } catch (error) {
    next(error);
  }
}