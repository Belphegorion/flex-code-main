import express from 'express';
import { body } from 'express-validator';
import {
  createGroup,
  getGroups,
  getGroup,
  sendGroupMessage,
  addMembers,
  removeMember,
  leaveGroup,
  transferOwnership,
  scheduleVideoMeeting,
  joinMeeting,
  shareWorkQRInGroup,
  getMeetingInfo
} from '../controllers/groupChatController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('participants').isArray().withMessage('Participants must be an array'),
  validate
], createGroup);

router.get('/', authenticate, getGroups);
router.get('/:id', authenticate, getGroup);

router.post('/:id/message', authenticate, [
  body('text').trim().notEmpty().withMessage('Message text is required'),
  validate
], sendGroupMessage);

router.post('/:id/members', authenticate, [
  body('userIds').isArray({ min: 1 }).withMessage('At least one user ID required'),
  validate
], addMembers);

router.delete('/:id/members/:userId', authenticate, removeMember);
router.put('/:id/leave', authenticate, leaveGroup);
router.put('/:id/transfer', authenticate, [
  body('newOwnerId').notEmpty().withMessage('New owner ID is required'),
  validate
], transferOwnership);

router.post('/:id/schedule-meeting', authenticate, [
  body('meetingDate').notEmpty().withMessage('Meeting date is required'),
  body('meetingTime').notEmpty().withMessage('Meeting time is required'),
  body('meetingUrl').isURL().withMessage('Valid meeting URL is required'),
  validate
], scheduleVideoMeeting);

router.get('/:id/meeting', authenticate, joinMeeting);
router.post('/:groupId/share-work-qr', authenticate, shareWorkQRInGroup);
router.get('/:id/meeting-info', authenticate, getMeetingInfo);

export default router;
