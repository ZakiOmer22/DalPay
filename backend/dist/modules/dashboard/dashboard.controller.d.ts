import { Request, Response, NextFunction } from 'express';
export declare class DashboardController {
    overview(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    monthlyRevenue(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    recentPayments(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    recentFraudFlags(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map