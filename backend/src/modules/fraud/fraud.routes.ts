// modules/fraud/fraud.routes.ts (new file for admin AI endpoints)
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { GeminiFraudService } from './gemini-fraud.service';

const router = Router();
const geminiFraud = new GeminiFraudService();

router.get('/analyze-user/:userId', authenticate, authorize('admin', 'auditor'), async (req, res, next) => {
  try {
    const analysis = await geminiFraud.analyzeUserRisk(req.params.userId as string);
    return res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

router.post('/analyze-payment/:paymentId', authenticate, authorize('admin', 'auditor'), async (req, res, next) => {
  try {
    await geminiFraud.analyzeWithAI(req.params.paymentId as string);
    return res.json({ success: true, message: 'Payment re-analyzed with AI' });
  } catch (error) {
    next(error);
  }
});

export default router;