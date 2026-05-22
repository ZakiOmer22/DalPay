// modules/auth/auth.routes.ts
import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validation";
import sessionsRouter from "./sessions.routes";
import { upload } from "../documents/upload.middleware";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  upload.fields([
    { name: "identityDocument", maxCount: 1 },
    { name: "proofOfAddressDocument", maxCount: 1 },
    { name: "portraitPhoto", maxCount: 1 },
  ]),
  validate("register"),
  authController.register,
);
router.post("/login", validate("login"), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authenticate, authController.logout);

router.post("/send-otp", authenticate, authController.sendOtp);
router.post("/verify-otp", authenticate, authController.verifyOtp);

router.post("/verification/create", authController.createVerificationSession);
router.get(
  "/verification/status/:sessionId",
  authController.checkVerificationStatus,
);

router.get("/sessions", authenticate, authController.getSessions);
router.delete(
  "/sessions/:sessionId",
  authenticate,
  authController.revokeSession,
);
router.delete("/sessions", authenticate, authController.revokeAllSessions);

router.get("/profile", authenticate, authController.getProfile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.post("/send-verification", authController.sendPublicVerificationCode);
router.post("/verify-code", authController.verifyPublicCode);

router.use(sessionsRouter);

export default router;
