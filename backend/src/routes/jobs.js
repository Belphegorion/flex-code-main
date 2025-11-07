import express from 'express';
import { body } from 'express-validator';
import {
  createJob,
  getJobs,
  getJobById,
  discoverJobs,
  updateJob,
  hirePro,
  getMyJobs
} from '../controllers/jobController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Specific routes first
router.get('/discover', authenticate, authorize('worker'), discoverJobs);
router.get('/my-jobs', authenticate, authorize('worker'), getMyJobs);

// General routes
router.post('/', authenticate, authorize('organizer'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('requiredSkills').isArray({ min: 1 }).withMessage('At least one skill required'),
  body('dateStart').isISO8601().withMessage('Valid start date required'),
  body('dateEnd').isISO8601().withMessage('Valid end date required')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.dateStart)) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),
  body('payPerPerson').isNumeric().withMessage('Pay must be a number'),
  body('totalPositions').isInt({ min: 1 }).withMessage('At least one position required'),
  validate
], createJob);

router.get('/', authenticate, authorize('organizer'), getJobs);

// Parameterized routes
router.get('/:id', authenticate, getJobById);
router.put('/:id', authenticate, authorize('organizer'), updateJob);
router.post('/:id/hire', authenticate, authorize('organizer'), [
  body('proIds').isArray({ min: 1 }).withMessage('At least one pro required'),
  validate
], hirePro);

export default router;