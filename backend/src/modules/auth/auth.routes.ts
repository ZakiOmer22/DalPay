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

// Stripe Identity
router.post('/verification/create', authController.createVerificationSession);
router.get('/verification/status/:sessionId', authController.checkVerificationStatus);

export default router;