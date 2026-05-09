"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const documents_service_1 = require("./documents.service");
const response_1 = require("../../utils/response");
const documentsService = new documents_service_1.DocumentsService();
class DocumentsController {
    async upload(req, res, next) {
        try {
            const userId = req.user.userId;
            const { documentType } = req.body;
            const file = req.file;
            if (!file) {
                throw new Error("No file uploaded");
            }
            const fileUrl = `/uploads/${file.filename}`;
            const document = await documentsService.uploadDocument(userId, documentType, fileUrl);
            return (0, response_1.successResponse)(res, document, "Document uploaded", 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getDocuments(req, res, next) {
        try {
            const userId = req.user.userId;
            const docs = await documentsService.getDocuments(userId);
            return (0, response_1.successResponse)(res, docs);
        }
        catch (error) {
            next(error);
        }
    }
    async getDocument(req, res, next) {
        try {
            const userId = req.user.userId;
            const { documentId } = req.params;
            const doc = await documentsService.getDocument(documentId, userId);
            return (0, response_1.successResponse)(res, doc);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyDocument(req, res, next) {
        try {
            const adminId = req.user.userId;
            const { documentId } = req.params;
            const { verified } = req.body; // boolean
            const doc = await documentsService.verifyDocument(documentId, verified, adminId);
            return (0, response_1.successResponse)(res, doc, verified ? "Document approved" : "Document rejected");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DocumentsController = DocumentsController;
//# sourceMappingURL=documents.controller.js.map