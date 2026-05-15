import { Request, Response, NextFunction } from 'express';
import { USSDService } from './ussd.service';
import { successResponse } from '../../utils/response';

const ussdService = new USSDService();

export class USSDController {
  async handleRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, text, sessionId } = req.body;

      // phoneNumber is now optional – the service will prompt for it if missing
      const result = await ussdService.processRequest(
        phoneNumber || '',
        (text as string) || '',
        sessionId as string | undefined
      );

      return successResponse(res, result, 'USSD response');
    } catch (error) {
      next(error);
    }
  }
}