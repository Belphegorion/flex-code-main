import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  hireCoOrganizer,
  elevateWorkerToCoOrganizer,
  getEventCoOrganizers,
  updateCoOrganizerPermissions,
  removeCoOrganizer,
  bulkHireCoOrganizers,
  getCoOrganizerActivities,
  getEventCoOrganizerAnalytics
} from '../controllers/coOrganizerController.js';

const router = express.Router();

router.post('/hire', authenticate, hireCoOrganizer);
router.post('/bulk-hire', authenticate, bulkHireCoOrganizers);
router.post('/elevate', authenticate, elevateWorkerToCoOrganizer);
router.get('/event/:eventId', authenticate, getEventCoOrganizers);
router.get('/event/:eventId/analytics', authenticate, getEventCoOrganizerAnalytics);
router.get('/:coOrganizerId/activities', authenticate, getCoOrganizerActivities);
router.put('/:coOrganizerId/permissions', authenticate, updateCoOrganizerPermissions);
router.delete('/:coOrganizerId', authenticate, removeCoOrganizer);

export default router;
