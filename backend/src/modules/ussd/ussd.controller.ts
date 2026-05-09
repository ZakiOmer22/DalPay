import { Request, Response, NextFunction } from 'express';
import { USSDService } from './ussd.service';
import { successResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';

const ussdService = new USSDService();

export class USSDController {
  async handleRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, text, sessionId } = req.body;

      if (!phoneNumber) {
        throw new AppError('Phone number is required', 400);
      }

      const result = await ussdService.processRequest(
        phoneNumber as string,
        (text as string) || '',
        sessionId as string | undefined
      );

      return successResponse(res, result, 'USSD response');
    } catch (error) {
      next(error);
    }
  }
}