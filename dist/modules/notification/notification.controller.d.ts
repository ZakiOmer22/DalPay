import { Request, Response, NextFunction } from 'express';
export declare class NotificationController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=notification.controller.d.ts.map