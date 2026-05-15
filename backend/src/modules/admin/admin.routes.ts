import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as adminController from './admin.controller';

const router = Router();

router.get('/taxpayers', authenticate, authorize('admin', 'super_admin'), adminController.getTaxpayers);
router.get('/taxpayers/:userId', authenticate, authorize('admin', 'super_admin'), adminController.getTaxpayerDetail);

export { router as adminRoutes };