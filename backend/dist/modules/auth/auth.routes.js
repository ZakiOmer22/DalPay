"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// modules/auth/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middleware/auth");
const validation_1 = require("../../middleware/validation");
const sessions_routes_1 = __importDefault(require("./sessions.routes"));
const upload_middleware_1 = require("../documents/upload.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post("/register", upload_middleware_1.upload.fields([
    { name: "identityDocument", maxCount: 1 },
    { name: "proofOfAddressDocument", maxCount: 1 },
    { name: "portraitPhoto", maxCount: 1 },
]), (0, validation_1.validate)("register"), authController.register);
router.post("/login", (0, validation_1.validate)("login"), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", auth_1.authenticate, authController.logout);
router.post("/send-otp", auth_1.authenticate, authController.sendOtp);
router.post("/verify-otp", auth_1.authenticate, authController.verifyOtp);
router.post("/verification/create", authController.createVerificationSession);
router.get("/verification/status/:sessionId", authController.checkVerificationStatus);
router.get("/sessions", auth_1.authenticate, authController.getSessions);
router.delete("/sessions/:sessionId", auth_1.authenticate, authController.revokeSession);
router.delete("/sessions", auth_1.authenticate, authController.revokeAllSessions);
router.get("/profile", auth_1.authenticate, authController.getProfile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/send-verification", authController.sendPublicVerificationCode);
router.post("/verify-code", authController.verifyPublicCode);
router.use(sessions_routes_1.default);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map