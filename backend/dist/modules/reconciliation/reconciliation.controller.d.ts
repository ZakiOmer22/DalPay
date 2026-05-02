import { Request, Response, NextFunction } from 'express';
export declare class ReconciliationController {
    runReconciliation(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getReport(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getSummary(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    fileDispute(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=reconciliation.controller.d.ts.map