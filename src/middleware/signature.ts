import { Request, Response, NextFunction } from 'express';
import { verifySignature } from '../utils/signature';
import { AppError } from '../utils/errors';

const CALLBACK_SECRET = process.env.MOBILE_MONEY_CALLBACK_SECRET || '';

export function verifyCallbackSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-signature'] as string;
  const payload = JSON.stringify(req.body);

  if (!verifySignature(payload, signature, CALLBACK_SECRET)) {
    return next(new AppError('Invalid signature', 401));
  }
  next();
}