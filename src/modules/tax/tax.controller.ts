// server/src/modules/tax/tax.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TaxService } from './tax.service';
import { successResponse } from '../../utils/response';

const taxService = new TaxService();

export class TaxController {
  async getAssessments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId as string;
      const assessments = await taxService.getAssessments(userId);
      return successResponse(res, assessments);
    } catch (error) {
      next(error);
    }
  }

  async getAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId as string;
      const assessmentId = req.params.assessmentId as string;
      const assessment = await taxService.getAssessment(assessmentId, userId);
      return successResponse(res, assessment);
    } catch (error) {
      next(error);
    }
  }

  async createAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.userId as string;
      const { userId, taxType, year, amount, dueDate } = req.body;
      const assessment = await taxService.createAssessment({
        userId,
        taxType,
        year,
        amount,
        dueDate,
        adminId,
        ipAddress: req.ip,
      });
      return successResponse(res, assessment, 'Assessment created', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentTypes(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, []);
    } catch (error) {
      next(error);
    }
  }

  async getTaxpayerSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId as string;
      const summary = await taxService.getTaxpayerSummary(userId);
      return successResponse(res, summary);
    } catch (error) {
      next(error);
    }
  }
}