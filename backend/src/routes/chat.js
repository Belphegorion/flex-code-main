import express from 'express';
import {
  createOrGetChat,
  getChats,
  sendMessage,
  markAsRead
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authenticate, createOrGetChat);
router.get('/', authenticate, getChats);
router.post('/message', authenticate, sendMessage);
router.put('/:chatId/read', authenticate, markAsRead);

export default router;