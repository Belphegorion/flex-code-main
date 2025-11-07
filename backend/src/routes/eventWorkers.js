import express from 'express';
import { getEventWorkers } from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:eventId', authenticate, getEventWorkers);

export default router;