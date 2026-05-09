// modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';

const router = Router();
const authController = new AuthController();

router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

router.post('/send-otp', authenticate, authController.sendOtp);
router.post('/verify-otp', authenticate, authController.verifyOtp);

router.post('/verification/create', authController.createVerificationSession);
router.get('/verification/status/:sessionId', authController.checkVerificationStatus);

router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:sessionId', authenticate, authController.revokeSession);
router.delete('/sessions', authenticate, authController.revokeAllSessions);

export default router;