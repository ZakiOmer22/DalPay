"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const audit_controller_1 = require("./audit.controller");
const router = (0, express_1.Router)();
const controller = new audit_controller_1.AuditController();
// Admin / Auditor view all audit logs (paginated)
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor'), (req, res, next) => controller.getAll(req, res, next));
router.get('/verify', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor'), (req, res, next) => controller.verify(req, res, next));
exports.default = router;
//# sourceMappingURL=audit.routes.js.map