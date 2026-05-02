import { Request, Response, NextFunction } from 'express';
import { ReconciliationService } from './reconciliation.service';
import { successResponse } from '../../utils/response';

const reconciliationService = new ReconciliationService();

export class ReconciliationController {
  async runReconciliation(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.userId;
      const { date } = req.body;
      const result = await reconciliationService.runDailyReconciliation(adminId, date);
      return successResponse(res, result, 'Reconciliation completed');
    } catch (error) {
      next(error);
    }
  }

  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.params.date as string;
      const report = await reconciliationService.getReconciliationReport(date);
      return successResponse(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days as string;
      const summary = await reconciliationService.getReconciliationSummary(Number(days) || 30);
      return successResponse(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async fileDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const reconciliationId = req.params.reconciliationId as string;
      const { reason } = req.body;
      const dispute = await reconciliationService.fileDispute(reconciliationId, reason, userId);
      return successResponse(res, dispute, 'Dispute filed');
    } catch (error) {
      next(error);
    }
  }
}