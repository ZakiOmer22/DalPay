import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { NotificationController } from './notification.controller';

const router = Router();
const controller = new NotificationController();

// ── User routes ──────────────────────────────────────────
// Get the logged‑in user's own notifications
router.get(
  '/',
  authenticate,
  (req, res, next) => controller.getMyNotifications(req, res, next)
);

// Mark a notification as read (ownership checked inside controller)
router.patch(
  '/:id/read',
  authenticate,
  (req, res, next) => controller.markAsRead(req, res, next)
);

// ── Admin route ──────────────────────────────────────────
// Admin: list all notifications (paginated, filterable)
router.get(
  '/admin/all',
  authenticate,
  authorize('admin', 'auditor'),
  (req, res, next) => controller.getAll(req, res, next)
);

export default router;