import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { UserService } from "./user.service";
import { successResponse } from "../../utils/response";

const router = Router();
const userService = new UserService();

router.get("/profile", authenticate, async (req: any, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    return successResponse(res, { user: profile });
  } catch (error) {
    next(error);
  }
});

router.put("/profile", authenticate, async (req: any, res, next) => {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);
    return successResponse(res, { user: updated });
  } catch (error) {
    next(error);
  }
});

router.put("/password", authenticate, async (req: any, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }
    await userService.changePassword(req.user.id, currentPassword, newPassword);
    return successResponse(res, { message: "Password changed" });
  } catch (error) {
    next(error);
  }
});

export default router;