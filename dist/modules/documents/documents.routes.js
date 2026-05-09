"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documents_controller_1 = require("./documents.controller");
const auth_1 = require("../../middleware/auth");
const upload_middleware_1 = require("./upload.middleware");
const router = (0, express_1.Router)();
const documentsController = new documents_controller_1.DocumentsController();
router.post('/upload', auth_1.authenticate, upload_middleware_1.upload.single('file'), documentsController.upload);
router.get('/', auth_1.authenticate, documentsController.getDocuments);
router.get('/:documentId', auth_1.authenticate, documentsController.getDocument);
router.patch('/:documentId/verify', auth_1.authenticate, (0, auth_1.authorize)('admin', 'super_admin'), documentsController.verifyDocument);
exports.default = router;
//# sourceMappingURL=documents.routes.js.map