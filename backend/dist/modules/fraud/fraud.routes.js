"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/fraud/fraud.routes.ts (new file for admin AI endpoints)
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const gemini_fraud_service_1 = require("./gemini-fraud.service");
const router = (0, express_1.Router)();
const geminiFraud = new gemini_fraud_service_1.GeminiFraudService();
router.get('/analyze-user/:userId', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor'), async (req, res, next) => {
    try {
        const analysis = await geminiFraud.analyzeUserRisk(req.params.userId);
        return res.json({ success: true, data: analysis });
    }
    catch (error) {
        next(error);
    }
});
router.post('/analyze-payment/:paymentId', auth_1.authenticate, (0, auth_1.authorize)('admin', 'auditor'), async (req, res, next) => {
    try {
        await geminiFraud.analyzeWithAI(req.params.paymentId);
        return res.json({ success: true, message: 'Payment re-analyzed with AI' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=fraud.routes.js.map