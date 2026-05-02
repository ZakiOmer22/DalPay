"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middleware/auth");
const validation_1 = require("../../middleware/validation");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post('/register', (0, validation_1.validate)('register'), authController.register);
router.post('/login', (0, validation_1.validate)('login'), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', auth_1.authenticate, authController.logout);
// Stripe Identity
router.post('/verification/create', authController.createVerificationSession);
router.get('/verification/status/:sessionId', authController.checkVerificationStatus);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map