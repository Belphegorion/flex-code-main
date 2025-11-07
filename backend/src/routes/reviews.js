import express from 'express';
import { body } from 'express-validator';
import { createReview, getReviews } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, [
  body('toId').notEmpty().withMessage('Recipient required'),
  body('jobId').notEmpty().withMessage('Job ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  validate
], createReview);

router.get('/:userId', authenticate, getReviews);

export default router;