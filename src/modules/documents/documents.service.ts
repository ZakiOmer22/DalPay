import pool from "../../config/database";
import { NotFoundError } from "../../utils/errors";

export class DocumentsService {
  async uploadDocument(userId: string, documentType: string, fileUrl: string) {
    const result = await pool.query(
      `INSERT INTO documents (user_id, document_type, file_url, verified)
       VALUES ($1, $2, $3, FALSE)
       RETURNING id, user_id, document_type, file_url, verified, created_at`,
      [userId, documentType, fileUrl],
    );
    return result.rows[0];
  }

  async getDocuments(userId: string) {
    const result = await pool.query(
      `SELECT id, user_id, document_type, file_url, verified, created_at
       FROM documents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async getDocument(documentId: string, userId: string) {
    const result = await pool.query(
      `SELECT id, user_id, document_type, file_url, verified, created_at
       FROM documents
       WHERE id = $1 AND user_id = $2`,
      [documentId, userId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundError("Document not found");
    }
    return result.rows[0];
  }

  async verifyDocument(documentId: string, verified: boolean, adminId: string) {
    const result = await pool.query(
      `UPDATE documents SET verified = $1, reviewed_by = $2
     WHERE id = $3
     RETURNING id, user_id, document_type, file_url, verified, created_at`,
      [verified, adminId, documentId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundError("Document not found");
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
      [
        adminId,
        verified ? "DOCUMENT_APPROVED" : "DOCUMENT_REJECTED",
        "documents",
        documentId,
        JSON.stringify({ verified }),
      ],
    );
    return result.rows[0];
  }
}
