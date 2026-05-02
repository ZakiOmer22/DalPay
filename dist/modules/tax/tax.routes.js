"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tax_controller_1 = require("./tax.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const taxController = new tax_controller_1.TaxController();
router.get('/assessments', auth_1.authenticate, taxController.getAssessments);
router.get('/assessments/:assessmentId', auth_1.authenticate, taxController.getAssessment);
router.post('/assessments', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), taxController.createAssessment);
router.get('/assessment-types', auth_1.authenticate, taxController.getAssessmentTypes);
router.get('/summary', auth_1.authenticate, taxController.getTaxpayerSummary);
exports.default = router;
//# sourceMappingURL=tax.routes.js.map