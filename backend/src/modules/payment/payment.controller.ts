import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { successResponse } from '../../utils/response';

const paymentService = new PaymentService();

export class PaymentController {
  async initiatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const taxpayerId = (req as any).user.userId;
      const payment = await paymentService.initiatePayment({
        ...req.body,
        taxpayerId,
        ipAddress: req.ip,
      });
      return successResponse(res, payment, 'Payment initiated', 201);
    } catch (error) {
      next(error);
    }
  }

  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, transactionRef, status } = req.body;
      const payment = await paymentService.confirmPayment(paymentId, transactionRef, status);
      return successResponse(res, payment, 'Payment confirmed');
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const taxpayerId = (req as any).user.userId;
      const { page = 1, limit = 10 } = req.query;
      const history = await paymentService.getPaymentHistory(taxpayerId, Number(page), Number(limit));
      return successResponse(res, history);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const taxpayerId = (req as any).user.userId;
      const { paymentId } = req.params;
      const payment = await paymentService.getPaymentStatus(paymentId as string, taxpayerId);
      return successResponse(res, payment);
    } catch (error) {
      next(error);
    }
  }

  async getProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const providers = await paymentService.getProviders();
      return successResponse(res, providers);
    } catch (error) {
      next(error);
    }
  }
}