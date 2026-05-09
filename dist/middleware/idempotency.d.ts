import { Request, Response, NextFunction } from 'express';
export declare function idempotencyGuard(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=idempotency.d.ts.map