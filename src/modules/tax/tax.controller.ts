// modules/tax/tax.controller.ts
import { Request, Response, NextFunction } from "express";
import { TaxService } from "./tax.service";
import { TaxRuleService } from "./tax-rule.service";
import { successResponse } from "../../utils/response";
import { DisputeService } from "./dispute.service";
import { AppError } from "../../utils/errors";
import pool from "@/config/database";

const taxService = new TaxService();
const taxRuleService = new TaxRuleService();
const disputeService = new DisputeService();

export class TaxController {
  async getAssessments(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      // admin / auditor can see all assessments; others only their own
      const userId =
        user.role === "admin" || user.role === "auditor"
          ? undefined
          : (user.userId as string);
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
      return successResponse(res, assessment, "Assessment created", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentTypes(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, [
        "income_tax",
        "business_tax",
        "property_tax",
        "sales_tax",
        "customs_tax",
      ]);
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

  async generateAssessments(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.userId as string;
      const { taxYear } = req.body;
      const year = taxYear || new Date().getFullYear();
      const count = await taxRuleService.generateAllAssessments(year, adminId);
      return successResponse(
        res,
        { count },
        `Generated assessments for ${count} users`,
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async fileDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId as string;
      const { assessmentId, reason, proposedAmount, evidence } = req.body;
      if (!assessmentId || !reason)
        throw new AppError("Assessment ID and reason are required", 400);
      const dispute = await disputeService.createDispute({
        assessmentId,
        userId,
        reason,
        proposedAmount,
        evidence,
      });
      return successResponse(res, dispute, "Dispute filed successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyDisputes(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId as string;
      const disputes = await disputeService.getDisputesByUser(userId);
      return successResponse(res, disputes);
    } catch (error) {
      next(error);
    }
  }

  async getAllDisputes(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const disputes = await disputeService.getAllDisputes(status as string);
      return successResponse(res, disputes);
    } catch (error) {
      next(error);
    }
  }

  async resolveDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.userId as string;
      const { disputeId } = req.params;
      const { status, adjustedAmount, comment } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        throw new AppError("Valid status required (approved/rejected)", 400);
      }
      const result = await disputeService.resolveDispute(
        disputeId as string,
        adminId,
        {
          status,
          adjustedAmount,
          comment,
        },
      );
      return successResponse(res, result, `Dispute ${status}`);
    } catch (error) {
      next(error);
    }
  }

  async getTaxProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await pool.query(
        `SELECT occupation, monthly_income, region, district, business_name, business_type, property_value
       FROM taxpayer_profiles
       WHERE user_id = $1`,
        [userId],
      );
      if (result.rows.length === 0) {
        return successResponse(res, { profile: null });
      }
      return successResponse(res, { profile: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdateTaxProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = (req as any).user.userId;
      const {
        occupation,
        monthly_income,
        region,
        district,
        business_name,
        business_type,
        property_value,
      } = req.body;

      // 1. Upsert taxpayer_profiles (now with unique constraint)
      await pool.query(
        `INSERT INTO taxpayer_profiles
        (user_id, occupation, monthly_income, region, district, business_name, business_type, property_value, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
       ON CONFLICT (user_id) DO UPDATE SET
        occupation = EXCLUDED.occupation,
        monthly_income = EXCLUDED.monthly_income,
        region = EXCLUDED.region,
        district = EXCLUDED.district,
        business_name = EXCLUDED.business_name,
        business_type = EXCLUDED.business_type,
        property_value = EXCLUDED.property_value,
        verified = false`,
        [
          userId,
          occupation,
          monthly_income,
          region,
          district,
          business_name,
          business_type,
          property_value || 0,
        ],
      );

      // 2. Create a verification request of type 'tax_profile'
      const submittedData = {
        occupation,
        monthly_income,
        region,
        district,
        business_name,
        business_type,
        property_value,
      };
      await pool.query(
        `INSERT INTO verification (user_id, type, data, status)
       VALUES ($1, 'tax_profile', $2, 'pending')
       ON CONFLICT (user_id, type) WHERE status = 'pending'
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        [userId, JSON.stringify(submittedData)],
      );

      return successResponse(res, null, "Profile submitted for verification");
    } catch (error) {
      next(error);
    }
  }
}
