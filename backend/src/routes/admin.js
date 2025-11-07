import express from 'express';
import { markNoShow, runDailyReliabilityUpdate } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/no-show/:applicationId', authenticate, authorize('admin', 'organizer'), markNoShow);
router.post('/reliability-update', authenticate, authorize('admin'), runDailyReliabilityUpdate);

export default router;
