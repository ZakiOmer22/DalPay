"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const settings_service_1 = require("./settings.service");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
const settingsService = new settings_service_1.SettingsService();
// GET all settings
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const settings = await settingsService.getSettings();
        return (0, response_1.successResponse)(res, settings);
    }
    catch (error) {
        next(error);
    }
});
// PUT update settings
router.put("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        await settingsService.updateSettings(req.body);
        const updated = await settingsService.getSettings();
        return (0, response_1.successResponse)(res, updated);
    }
    catch (error) {
        next(error);
    }
});
// POST test email
router.post("/test-email", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        await settingsService.testEmail(email);
        return (0, response_1.successResponse)(res, { sent: true });
    }
    catch (error) {
        next(error);
    }
});
// POST database backup
router.post("/backup", auth_1.authenticate, (0, auth_1.authorize)("admin"), async (req, res, next) => {
    try {
        const result = await settingsService.backupDatabase();
        return (0, response_1.successResponse)(res, result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=settings.routes.js.map