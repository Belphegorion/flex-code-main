import express from 'express';
import {
  searchWorkers,
  getWorkerDetails,
  sendMessage,
  getConversation,
  getMyConversations,
  sendJobOffer,
  getMyOffers,
  respondToOffer
} from '../controllers/workerDirectoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', authenticate, authorize('organizer'), searchWorkers);
router.get('/worker/:workerId', authenticate, authorize('organizer'), getWorkerDetails);
router.post('/message', authenticate, authorize('organizer'), sendMessage);
router.get('/conversation/:workerId', authenticate, getConversation);
router.get('/conversations', authenticate, getMyConversations);
router.post('/offer', authenticate, authorize('organizer'), sendJobOffer);
router.get('/offers', authenticate, authorize('worker'), getMyOffers);
router.put('/offer/:offerId', authenticate, authorize('worker'), respondToOffer);

export default router;
