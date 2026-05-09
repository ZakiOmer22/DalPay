// modules/dashboard/dashboard.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { DashboardController } from './dashboard.controller';
import { NotificationService } from '../notification/notification.service';
import { successResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';

const router = Router();
const dashboardController = new DashboardController();

router.get('/overview', authenticate, authorize('admin', 'super_admin'), dashboardController.overview);
router.get('/monthly-revenue', authenticate, authorize('admin', 'super_admin'), dashboardController.monthlyRevenue);
router.get('/recent-payments', authenticate, authorize('admin', 'super_admin'), dashboardController.recentPayments);
router.get('/fraud-flags', authenticate, authorize('admin', 'super_admin'), dashboardController.recentFraudFlags);
router.post('/notify', authenticate, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { userId, title, message } = req.body;
    if (!userId || !title || !message) throw new AppError('userId, title, and message are required', 400);
    await NotificationService.sendCustomNotification(userId, title, message);
    return successResponse(res, null, 'Notification sent');
  } catch (error) {
    next(error);
  }
});

export default router;