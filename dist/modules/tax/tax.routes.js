"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/tax/tax.routes.ts (with ledger viewer for admin/auditor)
const express_1 = require("express");
const tax_controller_1 = require("./tax.controller");
const auth_1 = require("../../middleware/auth");
const ledger_service_1 = require("../ledger/ledger.service");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
const taxController = new tax_controller_1.TaxController();
router.get('/assessments', auth_1.authenticate, taxController.getAssessments);
router.get('/assessments/:assessmentId', auth_1.authenticate, taxController.getAssessment);
router.post('/assessments', auth_1.authenticate, (0, auth_1.authorize)('admin', 'employee'), taxController.createAssessment);
router.post('/assessments/generate', auth_1.authenticate, (0, auth_1.authorize)('admin', 'employee'), taxController.generateAssessments);
router.get('/assessment-types', auth_1.authenticate, taxController.getAssessmentTypes);
router.get('/summary', auth_1.authenticate, taxController.getTaxpayerSummary);
router.post('/disputes', auth_1.authenticate, taxController.fileDispute);
router.get('/disputes', auth_1.authenticate, taxController.getMyDisputes);
router.get('/disputes/all', auth_1.authenticate, (0, auth_1.authorize)('admin', 'employee'), taxController.getAllDisputes);
router.patch('/disputes/:disputeId', auth_1.authenticate, (0, auth_1.authorize)('admin', 'employee'), taxController.resolveDispute);
router.get('/ledger', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor', 'employee'), async (req, res, next) => {
    try {
        const { userId, limit, offset } = req.query;
        const ledger = await new ledger_service_1.LedgerService().getLedger(userId, limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
        return (0, response_1.successResponse)(res, ledger);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=tax.routes.js.map