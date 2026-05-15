import { Router } from 'express';
import { DocumentsController } from './documents.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { upload } from './upload.middleware';

const router = Router();
const documentsController = new DocumentsController();

router.post('/upload', authenticate, upload.single('file'), documentsController.upload);
router.get('/', authenticate, documentsController.getDocuments);
router.get('/:documentId', authenticate, documentsController.getDocument);
router.patch('/:documentId/verify', authenticate, authorize('admin', 'super_admin'), documentsController.verifyDocument);

router.get(
  '/admin/all',
  authenticate,
  authorize('admin', 'auditor'),
  (req, res, next) => documentsController.getAllDocuments(req, res, next)
);

export default router;