"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationController = void 0;
const reconciliation_service_1 = require("./reconciliation.service");
const response_1 = require("../../utils/response");
const reconciliationService = new reconciliation_service_1.ReconciliationService();
class ReconciliationController {
    async runReconciliation(req, res, next) {
        try {
            const adminId = req.user.userId;
            const { date } = req.body;
            const result = await reconciliationService.runDailyReconciliation(adminId, date);
            return (0, response_1.successResponse)(res, result, 'Reconciliation completed');
        }
        catch (error) {
            next(error);
        }
    }
    async getReport(req, res, next) {
        try {
            const date = req.params.date;
            const report = await reconciliationService.getReconciliationReport(date);
            return (0, response_1.successResponse)(res, report);
        }
        catch (error) {
            next(error);
        }
    }
    async getSummary(req, res, next) {
        try {
            const days = req.query.days;
            const summary = await reconciliationService.getReconciliationSummary(Number(days) || 30);
            return (0, response_1.successResponse)(res, summary);
        }
        catch (error) {
            next(error);
        }
    }
    async fileDispute(req, res, next) {
        try {
            const userId = req.user.userId;
            const reconciliationId = req.params.reconciliationId;
            const { reason } = req.body;
            const dispute = await reconciliationService.fileDispute(reconciliationId, reason, userId);
            return (0, response_1.successResponse)(res, dispute, 'Dispute filed');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReconciliationController = ReconciliationController;
//# sourceMappingURL=reconciliation.controller.js.map