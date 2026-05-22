"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const user_service_1 = require("./user.service");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
const userService = new user_service_1.UserService();
router.get("/profile", auth_1.authenticate, async (req, res, next) => {
    try {
        const profile = await userService.getProfile(req.user.id);
        return (0, response_1.successResponse)(res, { user: profile });
    }
    catch (error) {
        next(error);
    }
});
router.put("/profile", auth_1.authenticate, async (req, res, next) => {
    try {
        const updated = await userService.updateProfile(req.user.id, req.body);
        return (0, response_1.successResponse)(res, { user: updated });
    }
    catch (error) {
        next(error);
    }
});
router.put("/password", auth_1.authenticate, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password required" });
        }
        await userService.changePassword(req.user.id, currentPassword, newPassword);
        return (0, response_1.successResponse)(res, { message: "Password changed" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map