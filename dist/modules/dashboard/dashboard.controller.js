"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const response_1 = require("../../utils/response");
const dashboardService = new dashboard_service_1.DashboardService();
class DashboardController {
    async overview(req, res, next) {
        try {
            const data = await dashboardService.getOverview();
            return (0, response_1.successResponse)(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    async monthlyRevenue(req, res, next) {
        try {
            const months = parseInt(req.query.months) || 12;
            const data = await dashboardService.getMonthlyRevenue(months);
            return (0, response_1.successResponse)(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    async recentPayments(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const data = await dashboardService.getRecentPayments(limit);
            return (0, response_1.successResponse)(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    async recentFraudFlags(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const data = await dashboardService.getRecentFraudFlags(limit);
            return (0, response_1.successResponse)(res, data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map