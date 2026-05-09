"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/dashboard/dashboard.routes.ts
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const dashboard_controller_1 = require("./dashboard.controller");
const notification_service_1 = require("../notification/notification.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
const router = (0, express_1.Router)();
const dashboardController = new dashboard_controller_1.DashboardController();
router.get('/overview', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), dashboardController.overview);
router.get('/monthly-revenue', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), dashboardController.monthlyRevenue);
router.get('/recent-payments', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), dashboardController.recentPayments);
router.get('/fraud-flags', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), dashboardController.recentFraudFlags);
router.post('/notify', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), async (req, res, next) => {
    try {
        const { userId, title, message } = req.body;
        if (!userId || !title || !message)
            throw new errors_1.AppError('userId, title, and message are required', 400);
        await notification_service_1.NotificationService.sendCustomNotification(userId, title, message);
        return (0, response_1.successResponse)(res, null, 'Notification sent');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map