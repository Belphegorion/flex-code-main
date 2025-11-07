import express from 'express';
import { getWorkerBadge, getLeaderboard } from '../controllers/badgeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-badge', authenticate, getWorkerBadge);
router.get('/worker/:workerId', authenticate, getWorkerBadge);
router.get('/leaderboard', authenticate, getLeaderboard);

export default router;