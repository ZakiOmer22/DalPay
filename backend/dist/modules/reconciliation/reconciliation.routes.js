"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reconciliation_controller_1 = require("./reconciliation.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const reconciliationController = new reconciliation_controller_1.ReconciliationController();
router.post('/run', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), reconciliationController.runReconciliation);
router.get('/report/:date', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), reconciliationController.getReport);
router.get('/summary', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), reconciliationController.getSummary);
router.post('/dispute/:reconciliationId', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), reconciliationController.fileDispute);
exports.default = router;
//# sourceMappingURL=reconciliation.routes.js.map