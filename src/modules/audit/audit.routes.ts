import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { AuditController } from './audit.controller';

const router = Router();
const controller = new AuditController();

// Admin / Auditor view all audit logs (paginated)
router.get(
  '/',
  authenticate,
  authorize('admin', 'auditor'),
  (req, res, next) => controller.getAll(req, res, next)
);
router.get('/verify', authenticate, authorize('admin', 'auditor'), (req, res, next) => controller.verify(req, res, next));

export default router;