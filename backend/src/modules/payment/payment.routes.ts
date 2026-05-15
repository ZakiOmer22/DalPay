import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { idempotencyGuard } from '../../middleware/idempotency';
import { verifyCallbackSignature } from '../../middleware/signature';
import { enforceStepUpAuth } from '../../middleware/step-up';

const router = Router();
const paymentController = new PaymentController();

router.post('/initiate', authenticate, enforceStepUpAuth, idempotencyGuard, paymentController.initiatePayment);
router.post('/confirm', authenticate, paymentController.confirmPayment);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/status/:paymentId', authenticate, paymentController.getPaymentStatus);
router.get('/providers', authenticate, paymentController.getProviders);

// Admin: get all payments
router.get(
  '/admin/all',
  authenticate,
  authorize('admin', 'auditor'),
  (req, res, next) => paymentController.getAllPaymentsAdmin(req, res, next)
);

// Admin: create a payment provider
router.post(
  '/providers',
  authenticate,
  authorize('admin', 'super_admin'),
  (req, res, next) => paymentController.createProvider(req, res, next)
);

export default router;