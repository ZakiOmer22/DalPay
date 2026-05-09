import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { LedgerService } from './ledger.service';
import { successResponse } from '../../utils/response';

const router = Router();
const ledgerService = new LedgerService();

router.get('/verify', authenticate, authorize('admin', 'auditor'), async (req, res, next) => {
  try {
    const balanced = await ledgerService.verifyBalance();
    return successResponse(res, { balanced });
  } catch (error) {
    next(error);
  }
});

export default router;