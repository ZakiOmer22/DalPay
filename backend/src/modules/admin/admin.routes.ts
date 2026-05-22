// src/modules/admin/admin.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as adminController from './admin.controller';
import { successResponse } from '@/utils/response';
import pool from '@/config/database';   // ← ensure this is imported

const router = Router();

router.get('/taxpayers', authenticate, authorize('admin', 'super_admin', 'employee'), adminController.getTaxpayers);
router.get('/taxpayers/:userId', authenticate, authorize('admin', 'super_admin', 'employee'), adminController.getTaxpayerDetail);
router.get('/sessions', authenticate, authorize('admin', 'super_admin', 'employee'), adminController.getSessions);
router.post('/sessions/:id/revoke', authenticate, authorize('admin', 'super_admin'), adminController.revokeSession);

router.get('/users/pending', authenticate, authorize('admin', 'super_admin'), adminController.getPendingUsers);
router.put('/users/:userId/approve', authenticate, authorize('admin', 'super_admin'), adminController.approveUser);
router.put('/users/:userId/reject', authenticate, authorize('admin', 'super_admin'), adminController.rejectUser);
router.get('/users/:userId/details', authenticate, authorize('admin', 'super_admin'), adminController.getUserRegistrationDetails);

// Admin/Employee view all assessments
router.get('/assessments', authenticate, authorize('admin', 'super_admin', 'employee'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tax_assessments ORDER BY created_at DESC LIMIT 50'
    );
    return successResponse(res, result.rows);
  } catch (error) {
    next(error);
  }
});

export { router as adminRoutes };