import express from 'express';
import { body } from 'express-validator';
import { 
  getProfileSetupStatus, 
  completeWorkerProfile, 
  completeOrganizerProfile,
  completeSponsorProfile,
  updateProfilePhoto
} from '../controllers/profileSetupController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/status', authenticate, getProfileSetupStatus);

router.post('/worker', authenticate, [
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('location.address').notEmpty().withMessage('Location is required'),
  body('location.lat').isFloat().withMessage('Valid latitude is required'),
  body('location.lng').isFloat().withMessage('Valid longitude is required'),
  body('availability').isIn(['full-time', 'part-time', 'weekends', 'flexible']).withMessage('Valid availability is required'),
  validate
], completeWorkerProfile);

router.post('/organizer', authenticate, [
  body('companyName').optional().trim().notEmpty(),
  validate
], completeOrganizerProfile);

router.post('/sponsor', authenticate, [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('industry').optional().trim(),
  body('sponsorshipBudget').optional().isFloat({ min: 0 }),
  validate
], completeSponsorProfile);

router.post('/photo', authenticate, [
  body('photoUrl').isURL().withMessage('Valid photo URL is required'),
  validate
], updateProfilePhoto);

export default router;
