import { Request, Response, NextFunction } from "express";
export declare class AuthController {
    register(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    logout(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    createVerificationSession(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    checkVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=auth.controller.d.ts.map