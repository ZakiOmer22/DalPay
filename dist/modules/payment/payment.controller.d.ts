import { Request, Response, NextFunction } from 'express';
export declare class PaymentController {
    initiatePayment(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    confirmPayment(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getPaymentHistory(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getProviders(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=payment.controller.d.ts.map