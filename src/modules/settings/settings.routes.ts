import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { SettingsService } from "./settings.service";
import { successResponse } from "../../utils/response";

const router = Router();
const settingsService = new SettingsService();

// GET all settings
router.get("/", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return successResponse(res, settings);
  } catch (error) {
    next(error);
  }
});

// PUT update settings
router.put("/", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    await settingsService.updateSettings(req.body);
    const updated = await settingsService.getSettings();
    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
});

// POST test email
router.post("/test-email", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    await settingsService.testEmail(email);
    return successResponse(res, { sent: true });
  } catch (error) {
    next(error);
  }
});

// POST database backup
router.post("/backup", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const result = await settingsService.backupDatabase();
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;