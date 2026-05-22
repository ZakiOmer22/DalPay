"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const documents_service_1 = require("./documents.service");
const response_1 = require("../../utils/response");
const database_1 = __importDefault(require("../../config/database"));
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
    async getAllDocuments(req, res, next) {
        try {
            const { page = "1", limit = "20", search, type, verified } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
            const offset = (pageNum - 1) * limitNum;
            let where = "WHERE 1=1";
            const params = [];
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
            }
            else if (verified === "false") {
                params.push(false);
                where += ` AND verified = $${params.length}`;
            }
            const countResult = await database_1.default.query(`SELECT COUNT(*) FROM documents ${where}`, params);
            const total = parseInt(countResult.rows[0].count, 10);
            const result = await database_1.default.query(`SELECT id, user_id, document_type, file_url, verified, created_at
       FROM documents ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limitNum, offset]);
            (0, response_1.successResponse)(res, {
                documents: result.rows,
                total,
                page: pageNum,
                limit: limitNum,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DocumentsController = DocumentsController;
//# sourceMappingURL=documents.controller.js.map