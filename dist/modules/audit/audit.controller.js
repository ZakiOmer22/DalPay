"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_service_1 = require("./audit.service");
const response_1 = require("../../utils/response");
class AuditController {
    constructor() {
        this.auditService = new audit_service_1.AuditService();
    }
    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 20, action, userId } = req.query;
            const result = await this.auditService.getAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                action: action,
                userId: userId,
            });
            (0, response_1.successResponse)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async verify(req, res, next) {
        try {
            const result = await this.auditService.verifyChain();
            // result is already { valid: boolean, logs: [...] }
            return (0, response_1.successResponse)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuditController = AuditController;
//# sourceMappingURL=audit.controller.js.map