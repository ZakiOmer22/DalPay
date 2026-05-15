"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const database_1 = __importDefault(require("../../config/database"));
const response_1 = require("../../utils/response");
class NotificationController {
    // ── Admin: get all notifications ───────────────────────
    async getAll(req, res, next) {
        try {
            const { page = '1', limit = '20', search, read } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
            const offset = (pageNum - 1) * limitNum;
            let where = 'WHERE 1=1';
            const params = [];
            if (search) {
                params.push(`%${search}%`);
                where += ` AND (user_id::text ILIKE $${params.length} OR title ILIKE $${params.length})`;
            }
            if (read === 'true') {
                params.push(true);
                where += ` AND read = $${params.length}`;
            }
            else if (read === 'false') {
                params.push(false);
                where += ` AND read = $${params.length}`;
            }
            const countResult = await database_1.default.query(`SELECT COUNT(*) FROM notifications ${where}`, params);
            const total = parseInt(countResult.rows[0].count, 10);
            const result = await database_1.default.query(`SELECT id, user_id, title, message, read, created_at
         FROM notifications ${where}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limitNum, offset]);
            (0, response_1.successResponse)(res, {
                notifications: result.rows,
                total,
                page: pageNum,
                limit: limitNum,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ── User: get own notifications ────────────────────────
    async getMyNotifications(req, res, next) {
        try {
            const userId = req.user.userId;
            const { page = '1', limit = '20' } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
            const offset = (pageNum - 1) * limitNum;
            const countResult = await database_1.default.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1', [userId]);
            const total = parseInt(countResult.rows[0].count, 10);
            const result = await database_1.default.query(`SELECT id, title, message, read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`, [userId, limitNum, offset]);
            (0, response_1.successResponse)(res, {
                notifications: result.rows,
                total,
                page: pageNum,
                limit: limitNum,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ── User: mark notification as read ────────────────────
    async markAsRead(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const result = await database_1.default.query(`UPDATE notifications SET read = true
         WHERE id = $1 AND user_id = $2
         RETURNING id, read`, [id, userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }
            (0, response_1.successResponse)(res, result.rows[0], 'Notification marked as read');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map