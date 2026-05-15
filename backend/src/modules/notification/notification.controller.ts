import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { successResponse } from '../../utils/response';

export class NotificationController {
  // ── Admin: get all notifications ───────────────────────
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', search, read } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const offset = (pageNum - 1) * limitNum;

      let where = 'WHERE 1=1';
      const params: any[] = [];

      if (search) {
        params.push(`%${search}%`);
        where += ` AND (user_id::text ILIKE $${params.length} OR title ILIKE $${params.length})`;
      }
      if (read === 'true') {
        params.push(true);
        where += ` AND read = $${params.length}`;
      } else if (read === 'false') {
        params.push(false);
        where += ` AND read = $${params.length}`;
      }

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM notifications ${where}`,
        params
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await pool.query(
        `SELECT id, user_id, title, message, read, created_at
         FROM notifications ${where}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limitNum, offset]
      );

      successResponse(res, {
        notifications: result.rows,
        total,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      next(error);
    }
  }

  // ── User: get own notifications ────────────────────────
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const offset = (pageNum - 1) * limitNum;

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
        [userId]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await pool.query(
        `SELECT id, title, message, read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limitNum, offset]
      );

      successResponse(res, {
        notifications: result.rows,
        total,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      next(error);
    }
  }

  // ── User: mark notification as read ────────────────────
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE notifications SET read = true
         WHERE id = $1 AND user_id = $2
         RETURNING id, read`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      successResponse(res, result.rows[0], 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }
}