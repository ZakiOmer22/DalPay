import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

router.post('/initiate', authenticate, paymentController.initiatePayment);
router.post('/confirm', authenticate, paymentController.confirmPayment);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/status/:paymentId', authenticate, paymentController.getPaymentStatus);
router.get('/providers', authenticate, paymentController.getProviders);

export default router;