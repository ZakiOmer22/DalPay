import { Request, Response, NextFunction } from "express";
import { AuditService } from "./audit.service";
import { successResponse } from "../../utils/response";

export class AuditController {
  private auditService = new AuditService();

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, action, userId } = req.query;
      const result = await this.auditService.getAll({
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        action: action as string | undefined,
        userId: userId as string | undefined,
      });
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.auditService.verifyChain();
      // result is already { valid: boolean, logs: [...] }
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}
