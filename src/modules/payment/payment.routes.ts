// modules/payment/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middleware/auth';
import { idempotencyGuard } from '../../middleware/idempotency';
import { verifyCallbackSignature } from '../../middleware/signature';
import { enforceStepUpAuth } from '../../middleware/step-up';

const router = Router();
const paymentController = new PaymentController();

router.post('/initiate', authenticate, enforceStepUpAuth, idempotencyGuard, paymentController.initiatePayment);
// router.post('/confirm', verifyCallbackSignature, authenticate, paymentController.confirmPayment);
router.post('/confirm', authenticate, paymentController.confirmPayment);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/status/:paymentId', authenticate, paymentController.getPaymentStatus);
router.get('/providers', authenticate, paymentController.getProviders);

export default router;