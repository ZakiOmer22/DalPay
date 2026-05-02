import { Router } from 'express';
import { ReconciliationController } from './reconciliation.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
const reconciliationController = new ReconciliationController();

router.post('/run', authenticate, authorize('admin', 'super_admin'), reconciliationController.runReconciliation);
router.get('/report/:date', authenticate, authorize('admin', 'super_admin'), reconciliationController.getReport);
router.get('/summary', authenticate, authorize('admin', 'super_admin'), reconciliationController.getSummary);
router.post('/dispute/:reconciliationId', authenticate, authorize('admin', 'super_admin'), reconciliationController.fileDispute);

export default router;