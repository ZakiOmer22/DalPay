"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_1 = require("../../middleware/auth");
const idempotency_1 = require("../../middleware/idempotency");
const step_up_1 = require("../../middleware/step-up");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
router.post('/initiate', auth_1.authenticate, step_up_1.enforceStepUpAuth, idempotency_1.idempotencyGuard, paymentController.initiatePayment);
router.post('/confirm', auth_1.authenticate, paymentController.confirmPayment);
router.get('/history', auth_1.authenticate, paymentController.getPaymentHistory);
router.get('/status/:paymentId', auth_1.authenticate, paymentController.getPaymentStatus);
router.get('/providers', auth_1.authenticate, paymentController.getProviders);
// Admin: get all payments
router.get('/admin/all', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor', 'employee'), (req, res, next) => paymentController.getAllPaymentsAdmin(req, res, next));
// Admin: create a payment provider
router.post('/providers', auth_1.authenticate, (0, auth_1.authorize)('admin', 'employee'), (req, res, next) => paymentController.createProvider(req, res, next));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map