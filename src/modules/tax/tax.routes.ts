import { Router } from 'express';
import { TaxController } from './tax.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
const taxController = new TaxController();

router.get('/assessments', authenticate, taxController.getAssessments);
router.get('/assessments/:assessmentId', authenticate, taxController.getAssessment);
router.post('/assessments', authenticate, authorize('admin', 'super_admin'), taxController.createAssessment);
router.get('/assessment-types', authenticate, taxController.getAssessmentTypes);
router.get('/summary', authenticate, taxController.getTaxpayerSummary);

export default router;