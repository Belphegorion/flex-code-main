import express from 'express';
import { body } from 'express-validator';
import {
  createEscrow,
  confirmPayment,
  releasePayment,
  getTransactions
} from '../controllers/escrowController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/create', authenticate, authorize('organizer'), [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  validate
], createEscrow);

router.post('/confirm', authenticate, authorize('organizer'), confirmPayment);
router.post('/:transactionId/release', authenticate, releasePayment);
router.get('/transactions', authenticate, getTransactions);

export default router;