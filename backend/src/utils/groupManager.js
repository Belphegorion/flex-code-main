import GroupChat from '../models/GroupChat.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import WorkSchedule from '../models/WorkSchedule.js';

/**
 * Get existing event group or create new one automatically
 * @param {String} eventId - Event ID
 * @param {String} organizerId - Organizer user ID
 * @returns {Promise<GroupChat>} Group chat instance
 */
export const getOrCreateEventGroup = async (eventId, organizerId) => {
  // Check if group exists
  let group = await GroupChat.findOne({ 
    eventId, 
    groupType: 'worker',
    isActive: true 
  });

  if (!group) {
    // Get event details
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Create group automatically
    group = await GroupChat.create({
      name: `${event.title} - Team`,
      eventId,
      groupType: 'worker',
      participants: [organizerId],
      createdBy: organizerId,
      messages: [{
        senderId: organizerId,
        text: `Welcome to ${event.title}! This group was automatically created for team communication. All team members will be added here as they join.`,
        type: 'system'
      }],
      lastMessage: `Welcome to ${event.title}!`,
      lastMessageAt: new Date()
    });

    console.log(`✅ Auto-created group: ${group.name}`);
  }

  return group;
};

/**
 * Add worker to event group automatically
 * @param {String} eventId - Event ID
 * @param {String} workerId - Worker user ID
 * @param {String} organizerId - Organizer user ID
 * @param {Object} io - Socket.IO instance (optional)
 * @returns {Promise<Object>} { group, added: boolean }
 */
export const addWorkerToEventGroup = async (eventId, workerId, organizerId, io = null) => {
  try {
    // Get or create group
    const group = await getOrCreateEventGroup(eventId, organizerId);

    // Check if worker already in group
    if (group.participants.some(p => p.toString() === workerId.toString())) {
      return { group, added: false, reason: 'already_member' };
    }

    // Add worker
    group.participants.push(workerId);

    // Get worker and event info
    const [worker, event] = await Promise.all([
      User.findById(workerId).select('name role'),
      Event.findById(eventId).select('title')
    ]);

    if (!worker) {
      throw new Error('Worker not found');
    }

    // Add system message
    group.messages.push({
      senderId: organizerId,
      text: `${worker.name} joined the team`,
      type: 'system'
    });

    group.lastMessage = group.messages[group.messages.length - 1].text;
    group.lastMessageAt = new Date();
    await group.save();

    // Auto-share work QR if exists
    const workSchedule = await WorkSchedule.findOne({ eventId });
    if (workSchedule?.qrCode) {
      group.messages.push({
        senderId: organizerId,
        text: `📱 Work Hours QR Code\n\nScan this QR code to track your work hours for ${event.title}\n\n⏰ Use this for check-in and check-out`,
        type: 'system'
      });
      group.lastMessage = group.messages[group.messages.length - 1].text;
      group.lastMessageAt = new Date();
      await group.save();

      // Emit QR to group if io provided
      if (io) {
        const messageWithQR = {
          ...group.messages[group.messages.length - 1].toObject(),
          qrCode: workSchedule.qrCode
        };
        io.to(`group_${group._id}`).emit('group-message', {
          groupId: group._id,
          message: messageWithQR,
          qrCode: workSchedule.qrCode
        });
      }
    }

    // Send notification to worker
    const { createNotification } = await import('../controllers/notificationController.js');
    await createNotification(workerId, {
      type: 'group',
      title: 'Added to Team Group',
      message: `You've been added to ${group.name}. Start communicating with your team!`,
      relatedId: group._id,
      relatedModel: 'GroupChat',
      actionUrl: `/groups/${group._id}`,
      metadata: { eventId, hasWorkQR: !!workSchedule, autoAdded: true }
    });

    // Emit socket notification if io provided
    if (io) {
      io.to(`user_${workerId}`).emit('notification', {
        type: 'group',
        message: `Added to ${group.name}`,
        actionUrl: `/groups/${group._id}`
      });

      // Emit to group
      io.to(`group_${group._id}`).emit('group-message', {
        groupId: group._id,
        message: group.messages[group.messages.length - (workSchedule ? 2 : 1)] // Join message
      });
    }

    console.log(`✅ Worker ${worker.name} auto-added to group: ${group.name}`);

    return { group, added: true, workerName: worker.name };
  } catch (error) {
    console.error('Error adding worker to group:', error);
    throw error;
  }
};

/**
 * Add multiple workers to event group in bulk
 * @param {String} eventId - Event ID
 * @param {Array<String>} workerIds - Array of worker user IDs
 * @param {String} organizerId - Organizer user ID
 * @param {Object} io - Socket.IO instance (optional)
 * @returns {Promise<Object>} { group, addedCount, skippedCount }
 */
export const addWorkersToEventGroup = async (eventId, workerIds, organizerId, io = null) => {
  let addedCount = 0;
  let skippedCount = 0;
  let group = null;

  for (const workerId of workerIds) {
    try {
      const result = await addWorkerToEventGroup(eventId, workerId, organizerId, io);
      group = result.group;
      if (result.added) {
        addedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`Failed to add worker ${workerId}:`, error);
      skippedCount++;
    }
  }

  console.log(`✅ Bulk add complete: ${addedCount} added, ${skippedCount} skipped`);

  return { group, addedCount, skippedCount };
};

/**
 * Remove worker from event group
 * @param {String} eventId - Event ID
 * @param {String} workerId - Worker user ID
 * @param {String} organizerId - Organizer user ID
 * @param {Object} io - Socket.IO instance (optional)
 * @returns {Promise<Object>} { group, removed: boolean }
 */
export const removeWorkerFromEventGroup = async (eventId, workerId, organizerId, io = null) => {
  try {
    const group = await GroupChat.findOne({ 
      eventId, 
      groupType: 'worker',
      isActive: true 
    });

    if (!group) {
      return { group: null, removed: false, reason: 'group_not_found' };
    }

    // Check if worker is in group
    if (!group.participants.some(p => p.toString() === workerId.toString())) {
      return { group, removed: false, reason: 'not_member' };
    }

    // Remove worker
    group.participants = group.participants.filter(p => p.toString() !== workerId.toString());

    // Get worker info
    const worker = await User.findById(workerId).select('name');

    // Add system message
    group.messages.push({
      senderId: organizerId,
      text: `${worker?.name || 'A member'} left the team`,
      type: 'system'
    });

    group.lastMessage = group.messages[group.messages.length - 1].text;
    group.lastMessageAt = new Date();
    await group.save();

    // Emit to group if io provided
    if (io) {
      io.to(`group_${group._id}`).emit('group-message', {
        groupId: group._id,
        message: group.messages[group.messages.length - 1]
      });
    }

    console.log(`✅ Worker ${worker?.name} removed from group: ${group.name}`);

    return { group, removed: true, workerName: worker?.name };
  } catch (error) {
    console.error('Error removing worker from group:', error);
    throw error;
  }
};

export default {
  getOrCreateEventGroup,
  addWorkerToEventGroup,
  addWorkersToEventGroup,
  removeWorkerFromEventGroup
};
