import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { successResponse } from '../../utils/response';

const dashboardService = new DashboardService();

export class DashboardController {
  async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getOverview();
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  }

  async monthlyRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const data = await dashboardService.getMonthlyRevenue(months);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  }

  async recentPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await dashboardService.getRecentPayments(limit);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  }

  async recentFraudFlags(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await dashboardService.getRecentFraudFlags(limit);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  }
}