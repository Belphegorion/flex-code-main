import express from 'express';
import { body } from 'express-validator';
import {
  getAvailableEvents,
  sponsorEvent,
  getSponsorships,
  getSponsorStats,
  joinEventVideoCall
} from '../controllers/sponsorController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/events', authenticate, authorize('sponsor'), getAvailableEvents);

router.post('/sponsor', authenticate, authorize('sponsor'), [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount is required'),
  body('message').optional().trim(),
  validate
], sponsorEvent);

router.get('/sponsorships', authenticate, authorize('sponsor'), getSponsorships);
router.get('/stats', authenticate, authorize('sponsor'), getSponsorStats);
router.post('/events/:eventId/join-call', authenticate, authorize('sponsor'), joinEventVideoCall);

export default router;