"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxController = void 0;
const tax_service_1 = require("./tax.service");
const response_1 = require("../../utils/response");
const taxService = new tax_service_1.TaxService();
class TaxController {
    async getAssessments(req, res, next) {
        try {
            const userId = req.user.userId;
            const assessments = await taxService.getAssessments(userId);
            return (0, response_1.successResponse)(res, assessments);
        }
        catch (error) {
            next(error);
        }
    }
    async getAssessment(req, res, next) {
        try {
            const userId = req.user.userId;
            const assessmentId = req.params.assessmentId;
            const assessment = await taxService.getAssessment(assessmentId, userId);
            return (0, response_1.successResponse)(res, assessment);
        }
        catch (error) {
            next(error);
        }
    }
    async createAssessment(req, res, next) {
        try {
            const adminId = req.user.userId;
            const { userId, taxType, year, amount, dueDate } = req.body;
            const assessment = await taxService.createAssessment({
                userId,
                taxType,
                year,
                amount,
                dueDate,
                adminId,
                ipAddress: req.ip,
            });
            return (0, response_1.successResponse)(res, assessment, 'Assessment created', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getAssessmentTypes(req, res, next) {
        try {
            return (0, response_1.successResponse)(res, []);
        }
        catch (error) {
            next(error);
        }
    }
    async getTaxpayerSummary(req, res, next) {
        try {
            const userId = req.user.userId;
            const summary = await taxService.getTaxpayerSummary(userId);
            return (0, response_1.successResponse)(res, summary);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TaxController = TaxController;
//# sourceMappingURL=tax.controller.js.map