import { Request, Response, NextFunction } from "express";
export declare class DocumentsController {
    upload(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getDocuments(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getDocument(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    verifyDocument(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAllDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=documents.controller.d.ts.map