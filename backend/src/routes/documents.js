import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/uploads.js';
import { uploadAadhaar, getDocumentStatus } from '../controllers/documentController.js';

const router = express.Router();

router.post('/aadhaar', authenticate, authorize('worker'), upload.single('aadhaar'), uploadAadhaar);
router.get('/status', authenticate, authorize('worker'), getDocumentStatus);

export default router;