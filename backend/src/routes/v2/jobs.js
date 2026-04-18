import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { body, query } from 'express-validator';
import * as jobController from '../../controllers/jobControllerV2.js';

const router = express.Router();

/**
 * API v2 - Enhanced job endpoints with optimizations
 */

/**
 * GET /api/v2/jobs
 * Get jobs for authenticated organizer with pagination
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number, max 100 (default: 20)
 *   - status: string (open, closed, draft)
 *   - skills: comma-separated string
 *   - city: string
 *   - eventId: ObjectId
 */
router.get('/', 
  authenticate,
  authorize('organizer', 'admin'),
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isString(),
    query('skills').optional().isString(),
    query('city').optional().isString()
  ],
  validate,
  jobController.getJobs
);

/**
 * POST /api/v2/jobs
 * Create a new job
 * Body:
 *   - title: string (required)
 *   - description: string (required)
 *   - requiredSkills: string[] (required)
 *   - payPerPerson: number (required)
 *   - eventId: ObjectId (required)
 */
router.post('/',
  authenticate,
  authorize('organizer', 'admin'),
  [
    body('title').trim().notEmpty().isLength({ min: 3, max: 200 }),
    body('description').trim().notEmpty().isLength({ min: 10, max: 5000 }),
    body('requiredSkills').isArray({ min: 1, max: 20 }),
    body('payPerPerson').isNumeric({ min: 0 }),
    body('eventId').notEmpty()
  ],
  validate,
  jobController.createJob
);

/**
 * GET /api/v2/jobs/discover
 * Discover available jobs with advanced filtering
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number, max 50 (default: 20)
 *   - skills: comma-separated string
 *   - city: string
 *   - minPay: number
 *   - maxPay: number
 *   - sortBy: 'createdAt' | 'payPerPerson' | 'dateStart'
 */
router.get('/discover',
  authenticate,
  authorize('worker', 'admin'),
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('skills').optional().isString().isLength({ min: 1, max: 500 }),
    query('city').optional().isString().isLength({ min: 1, max: 100 }),
    query('minPay').optional().isNumeric(),
    query('maxPay').optional().isNumeric(),
    query('sortBy').optional().isIn(['createdAt', 'payPerPerson', 'dateStart'])
  ],
  validate,
  jobController.discoverJobs
);

/**
 * GET /api/v2/jobs/:id
 * Get job details by ID
 */
router.get('/:id',
  authenticate,
  jobController.getJobById
);

export default router;
