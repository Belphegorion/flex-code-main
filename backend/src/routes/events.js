import express from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createEvent,
  uploadTicketImage,
  startVideoCall,
  endVideoCall,
  verifyQRAccess,
  getOrganizerEvents,
  getEventDetails,
  updateEvent,
  updateTickets,
  addExpense,
  deleteExpense,
  getFinancials,
  getFinancialSummary,
  addEstimatedExpense,
  deleteEstimatedExpense,
  getActiveEvents,
  getEventWorkers,
  updateVenueDetails,
  updateAttendeeInfo,
  addCustomField,
  removeCustomField,
  getEventAnalytics
} from '../controllers/eventController.js';
import {
  getEventJobs,
  createEventJob,
  updateEventJob,
  deleteEventJob,
  getEventProgress
} from '../controllers/eventJobController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Specific routes first (before parameterized routes)
router.get('/active/live', authenticate, getActiveEvents);
router.get('/financials/summary', authenticate, getFinancialSummary);
router.post('/video-call/verify', authenticate, verifyQRAccess);

// General routes
router.post('/', authenticate, authorize('organizer'), createEvent);
router.get('/', authenticate, getOrganizerEvents);

// Parameterized routes
router.get('/:eventId', authenticate, getEventDetails);
router.put('/:eventId', authenticate, updateEvent);
router.get('/:eventId/workers', authenticate, getEventWorkers);
router.post('/:eventId/ticket', authenticate, upload.single('ticket'), uploadTicketImage);
router.post('/:eventId/video-call/start', authenticate, startVideoCall);
router.post('/:eventId/video-call/end', authenticate, endVideoCall);
router.put('/:eventId/tickets', authenticate, updateTickets);
router.post('/:eventId/expenses', authenticate, addExpense);
router.delete('/:eventId/expenses/:expenseId', authenticate, deleteExpense);
router.get('/:eventId/financials', authenticate, getFinancials);
router.post('/:eventId/estimated-expenses', authenticate, addEstimatedExpense);
router.delete('/:eventId/estimated-expenses/:expenseId', authenticate, deleteEstimatedExpense);

// Event jobs management
router.get('/:eventId/jobs', authenticate, getEventJobs);
router.post('/:eventId/jobs', authenticate, authorize('organizer'), createEventJob);
router.put('/:eventId/jobs/:jobId', authenticate, authorize('organizer'), updateEventJob);
router.delete('/:eventId/jobs/:jobId', authenticate, authorize('organizer'), deleteEventJob);
router.get('/:eventId/progress', authenticate, getEventProgress);

// New routes for enhanced event management
router.put('/:eventId/venue', authenticate, updateVenueDetails);
router.put('/:eventId/attendees', authenticate, updateAttendeeInfo);
router.post('/:eventId/custom-fields', authenticate, addCustomField);
router.delete('/:eventId/custom-fields/:fieldId', authenticate, removeCustomField);
router.get('/:eventId/analytics', authenticate, getEventAnalytics);

export default router;
