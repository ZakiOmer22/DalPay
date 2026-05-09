"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxController = void 0;
const tax_service_1 = require("./tax.service");
const tax_rule_service_1 = require("./tax-rule.service");
const response_1 = require("../../utils/response");
const dispute_service_1 = require("./dispute.service");
const errors_1 = require("../../utils/errors");
const taxService = new tax_service_1.TaxService();
const taxRuleService = new tax_rule_service_1.TaxRuleService();
const disputeService = new dispute_service_1.DisputeService();
class TaxController {
    async getAssessments(req, res, next) {
        try {
            const user = req.user;
            // admin / auditor can see all assessments; others only their own
            const userId = user.role === "admin" || user.role === "auditor"
                ? undefined
                : user.userId;
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
            return (0, response_1.successResponse)(res, assessment, "Assessment created", 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getAssessmentTypes(req, res, next) {
        try {
            return (0, response_1.successResponse)(res, [
                "income_tax",
                "business_tax",
                "property_tax",
                "sales_tax",
                "customs_tax",
            ]);
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
    async generateAssessments(req, res, next) {
        try {
            const adminId = req.user.userId;
            const { taxYear } = req.body;
            const year = taxYear || new Date().getFullYear();
            const count = await taxRuleService.generateAllAssessments(year, adminId);
            return (0, response_1.successResponse)(res, { count }, `Generated assessments for ${count} users`, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async fileDispute(req, res, next) {
        try {
            const userId = req.user.userId;
            const { assessmentId, reason, proposedAmount, evidence } = req.body;
            if (!assessmentId || !reason)
                throw new errors_1.AppError("Assessment ID and reason are required", 400);
            const dispute = await disputeService.createDispute({
                assessmentId,
                userId,
                reason,
                proposedAmount,
                evidence,
            });
            return (0, response_1.successResponse)(res, dispute, "Dispute filed successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getMyDisputes(req, res, next) {
        try {
            const userId = req.user.userId;
            const disputes = await disputeService.getDisputesByUser(userId);
            return (0, response_1.successResponse)(res, disputes);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllDisputes(req, res, next) {
        try {
            const { status } = req.query;
            const disputes = await disputeService.getAllDisputes(status);
            return (0, response_1.successResponse)(res, disputes);
        }
        catch (error) {
            next(error);
        }
    }
    async resolveDispute(req, res, next) {
        try {
            const adminId = req.user.userId;
            const { disputeId } = req.params;
            const { status, adjustedAmount, comment } = req.body;
            if (!status || !["approved", "rejected"].includes(status)) {
                throw new errors_1.AppError("Valid status required (approved/rejected)", 400);
            }
            const result = await disputeService.resolveDispute(disputeId, adminId, {
                status,
                adjustedAmount,
                comment,
            });
            return (0, response_1.successResponse)(res, result, `Dispute ${status}`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TaxController = TaxController;
//# sourceMappingURL=tax.controller.js.map