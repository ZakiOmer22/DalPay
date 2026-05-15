"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const notification_controller_1 = require("./notification.controller");
const router = (0, express_1.Router)();
const controller = new notification_controller_1.NotificationController();
// ── User routes ──────────────────────────────────────────
// Get the logged‑in user's own notifications
router.get('/', auth_1.authenticate, (req, res, next) => controller.getMyNotifications(req, res, next));
// Mark a notification as read (ownership checked inside controller)
router.patch('/:id/read', auth_1.authenticate, (req, res, next) => controller.markAsRead(req, res, next));
// ── Admin route ──────────────────────────────────────────
// Admin: list all notifications (paginated, filterable)
router.get('/admin/all', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor'), (req, res, next) => controller.getAll(req, res, next));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map