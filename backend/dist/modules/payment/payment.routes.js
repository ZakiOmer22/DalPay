"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/payment/payment.routes.ts
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_1 = require("../../middleware/auth");
const idempotency_1 = require("../../middleware/idempotency");
const step_up_1 = require("../../middleware/step-up");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
router.post('/initiate', auth_1.authenticate, step_up_1.enforceStepUpAuth, idempotency_1.idempotencyGuard, paymentController.initiatePayment);
// router.post('/confirm', verifyCallbackSignature, authenticate, paymentController.confirmPayment);
router.post('/confirm', auth_1.authenticate, paymentController.confirmPayment);
router.get('/history', auth_1.authenticate, paymentController.getPaymentHistory);
router.get('/status/:paymentId', auth_1.authenticate, paymentController.getPaymentStatus);
router.get('/providers', auth_1.authenticate, paymentController.getProviders);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map