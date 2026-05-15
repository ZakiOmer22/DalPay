import { Request, Response, NextFunction } from "express";
import { DocumentsService } from "./documents.service";
import { successResponse } from "../../utils/response";
import pool from '../../config/database';

const documentsService = new DocumentsService();

export class DocumentsController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { documentType } = req.body;
      const file = req.file;
      if (!file) {
        throw new Error("No file uploaded");
      }
      const fileUrl = `/uploads/${file.filename}`;
      const document = await documentsService.uploadDocument(
        userId,
        documentType,
        fileUrl,
      );
      return successResponse(res, document, "Document uploaded", 201);
    } catch (error) {
      next(error);
    }
  }

  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const docs = await documentsService.getDocuments(userId);
      return successResponse(res, docs);
    } catch (error) {
      next(error);
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { documentId } = req.params;
      const doc = await documentsService.getDocument(
        documentId as string,
        userId,
      );
      return successResponse(res, doc);
    } catch (error) {
      next(error);
    }
  }
  async verifyDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.userId;
      const { documentId } = req.params;
      const { verified } = req.body; // boolean
      const doc = await documentsService.verifyDocument(
        documentId as string,
        verified,
        adminId,
      );
      return successResponse(
        res,
        doc,
        verified ? "Document approved" : "Document rejected",
      );
    } catch (error) {
      next(error);
    }
  }

  async getAllDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20", search, type, verified } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const offset = (pageNum - 1) * limitNum;

      let where = "WHERE 1=1";
      const params: any[] = [];

      if (search) {
        params.push(`%${search}%`);
        where += ` AND (id::text ILIKE $${params.length} OR user_id::text ILIKE $${params.length})`;
      }
      if (type && type !== "all") {
        params.push(type);
        where += ` AND document_type = $${params.length}`;
      }
      if (verified === "true") {
        params.push(true);
        where += ` AND verified = $${params.length}`;
      } else if (verified === "false") {
        params.push(false);
        where += ` AND verified = $${params.length}`;
      }

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM documents ${where}`,
        params,
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await pool.query(
        `SELECT id, user_id, document_type, file_url, verified, created_at
       FROM documents ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limitNum, offset],
      );

      successResponse(res, {
        documents: result.rows,
        total,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      next(error);
    }
  }
}
