// modules/tax/tax.routes.ts (with ledger viewer for admin/auditor)
import { Router } from 'express';
import { TaxController } from './tax.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { LedgerService } from '../ledger/ledger.service';
import { successResponse } from '../../utils/response';

const router = Router();
const taxController = new TaxController();

router.get('/assessments', authenticate, taxController.getAssessments);
router.get('/assessments/:assessmentId', authenticate, taxController.getAssessment);
router.post('/assessments', authenticate, authorize('admin', 'employee'), taxController.createAssessment);
router.post('/assessments/generate', authenticate, authorize('admin', 'employee'), taxController.generateAssessments);
router.get('/assessment-types', authenticate, taxController.getAssessmentTypes);
router.get('/summary', authenticate, taxController.getTaxpayerSummary);

router.post('/disputes', authenticate, taxController.fileDispute);
router.get('/disputes', authenticate, taxController.getMyDisputes);
router.get('/disputes/all', authenticate, authorize('admin', 'employee'), taxController.getAllDisputes);
router.patch('/disputes/:disputeId', authenticate, authorize('admin', 'employee'), taxController.resolveDispute);

router.get('/ledger', authenticate, authorize('admin', 'auditor', 'employee'), async (req, res, next) => {
  try {
    const { userId, limit, offset } = req.query;
    const ledger = await new LedgerService().getLedger(
      userId as string,
      limit ? parseInt(limit as string) : 50,
      offset ? parseInt(offset as string) : 0
    );
    return successResponse(res, ledger);
  } catch (error) {
    next(error);
  }
});

export default router;