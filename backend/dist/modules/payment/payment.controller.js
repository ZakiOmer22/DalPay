"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const response_1 = require("../../utils/response");
const paymentService = new payment_service_1.PaymentService();
class PaymentController {
    async initiatePayment(req, res, next) {
        try {
            const user = req.user;
            // Allow admin to specify a target taxpayer for the payment
            const userId = user.role === "admin" && req.body.targetUserId
                ? req.body.targetUserId
                : user.userId;
            const payment = await paymentService.initiatePayment({
                ...req.body,
                userId,
                ipAddress: req.ip,
            });
            return (0, response_1.successResponse)(res, payment, "Payment initiated", 201);
        }
        catch (error) {
            next(error);
        }
    }
    async confirmPayment(req, res, next) {
        try {
            const { paymentId, transactionRef, status } = req.body;
            const payment = await paymentService.confirmPayment(paymentId, transactionRef, status);
            return (0, response_1.successResponse)(res, payment, "Payment confirmed");
        }
        catch (error) {
            next(error);
        }
    }
    async getPaymentHistory(req, res, next) {
        try {
            const taxpayerId = req.user.userId;
            const { page = 1, limit = 10 } = req.query;
            const history = await paymentService.getPaymentHistory(taxpayerId, Number(page), Number(limit));
            return (0, response_1.successResponse)(res, history);
        }
        catch (error) {
            next(error);
        }
    }
    async getPaymentStatus(req, res, next) {
        try {
            const taxpayerId = req.user.userId;
            const { paymentId } = req.params;
            const payment = await paymentService.getPaymentStatus(paymentId, taxpayerId);
            return (0, response_1.successResponse)(res, payment);
        }
        catch (error) {
            next(error);
        }
    }
    async getProviders(req, res, next) {
        try {
            const providers = await paymentService.getProviders();
            return (0, response_1.successResponse)(res, providers);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map