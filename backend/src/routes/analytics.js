import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getOrganizerAnalytics, getWorkerAnalytics, getEventAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/organizer', authenticate, authorize('organizer'), getOrganizerAnalytics);
router.get('/worker', authenticate, authorize('worker'), getWorkerAnalytics);
router.get('/event/:eventId', authenticate, authorize('organizer'), getEventAnalytics);

export default router;
