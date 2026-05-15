import { Request, Response, NextFunction } from "express";
export declare class AuditController {
    private auditService;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    verify(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=audit.controller.d.ts.map