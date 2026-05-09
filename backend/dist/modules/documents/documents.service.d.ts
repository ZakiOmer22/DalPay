export declare class DocumentsService {
    uploadDocument(userId: string, documentType: string, fileUrl: string): Promise<any>;
    getDocuments(userId: string): Promise<any[]>;
    getDocument(documentId: string, userId: string): Promise<any>;
    verifyDocument(documentId: string, verified: boolean, adminId: string): Promise<any>;
}
//# sourceMappingURL=documents.service.d.ts.map