import { Router } from 'express';
import { USSDController } from './ussd.controller';

const router = Router();
const ussdController = new USSDController();

router.post('/', ussdController.handleRequest);

export default router;