import { Request, Response, NextFunction } from "express";
import { DocumentsService } from "./documents.service";
import { successResponse } from "../../utils/response";

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
}
