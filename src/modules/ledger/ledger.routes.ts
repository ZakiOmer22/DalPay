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

router.get('/', authenticate, authorize('admin', 'auditor'), async (req, res, next) => {
  try {
    const { page = '1', limit = '20', search, type, startDate, endDate } = req.query;
    const filters = { search, type, startDate, endDate } as any;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    const data = await ledgerService.getFilteredLedger(filters, limitNum, offset);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
});


export default router;