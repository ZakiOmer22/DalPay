import { Request, Response, NextFunction } from 'express';
export declare class TaxController {
    getAssessments(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAssessment(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    createAssessment(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAssessmentTypes(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getTaxpayerSummary(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=tax.controller.d.ts.map