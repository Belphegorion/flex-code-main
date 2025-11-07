import CoOrganizer from '../models/CoOrganizer.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import GroupChat from '../models/GroupChat.js';

export const hireCoOrganizer = async (req, res) => {
  try {
    const { eventId, userId, permissions, template } = req.body;
    
    let finalPermissions = permissions;
    if (template && !permissions) {
      const { getPermissionTemplate } = await import('../utils/permissionTemplates.js');
      finalPermissions = getPermissionTemplate(template);
    }

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await CoOrganizer.findOne({ eventId, userId });
    if (existing) {
      return res.status(400).json({ message: 'User is already a co-organizer' });
    }

    const coOrganizer = await CoOrganizer.create({
      eventId,
      userId,
      addedBy: req.userId,
      permissions: finalPermissions || {},
      elevatedFrom: 'hired'
    });

    event.coOrganizers.push(coOrganizer._id);
    await event.save();

    // Add to main event group
    const mainGroup = await GroupChat.findOne({ eventId, groupType: 'main' });
    if (mainGroup && !mainGroup.participants.includes(userId)) {
      mainGroup.participants.push(userId);
      mainGroup.messages.push({
        senderId: req.userId,
        text: `${user.name} was added as co-organizer`,
        type: 'system'
      });
      await mainGroup.save();
    }

    // Create notification
    const { createNotification } = await import('./notificationController.js');
    await createNotification(userId, {
      type: 'coorganizer',
      title: 'Co-Organizer Role Assigned',
      message: `You have been added as co-organizer for ${event.title}`,
      relatedId: eventId,
      relatedModel: 'Event',
      actionUrl: `/events/${eventId}`
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user_${userId}`).emit('notification', {
      type: 'coorganizer',
      message: `You are now co-organizer for ${event.title}`
    });

    res.json({ message: 'Co-organizer hired successfully', coOrganizer });
  } catch (error) {
    res.status(500).json({ message: 'Error hiring co-organizer', error: error.message });
  }
};

export const elevateWorkerToCoOrganizer = async (req, res) => {
  try {
    const { eventId, workerId, permissions } = req.body;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const existing = await CoOrganizer.findOne({ eventId, userId: workerId });
    if (existing) {
      return res.status(400).json({ message: 'User is already a co-organizer' });
    }

    const coOrganizer = await CoOrganizer.create({
      eventId,
      userId: workerId,
      addedBy: req.userId,
      permissions: permissions || {},
      elevatedFrom: 'worker'
    });

    event.coOrganizers.push(coOrganizer._id);
    await event.save();

    // Add to main event group
    const mainGroup = await GroupChat.findOne({ eventId, groupType: 'main' });
    if (mainGroup && !mainGroup.participants.includes(workerId)) {
      mainGroup.participants.push(workerId);
      mainGroup.messages.push({
        senderId: req.userId,
        text: `${worker.name} was elevated to co-organizer`,
        type: 'system'
      });
      await mainGroup.save();
    }

    // Create notification
    const { createNotification } = await import('./notificationController.js');
    await createNotification(workerId, {
      type: 'coorganizer',
      title: 'Elevated to Co-Organizer',
      message: `You have been elevated to co-organizer for ${event.title}`,
      relatedId: eventId,
      relatedModel: 'Event',
      actionUrl: `/events/${eventId}`
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user_${workerId}`).emit('notification', {
      type: 'coorganizer',
      message: `You are now co-organizer for ${event.title}`
    });

    res.json({ message: 'Worker elevated to co-organizer', coOrganizer });
  } catch (error) {
    res.status(500).json({ message: 'Error elevating worker', error: error.message });
  }
};

export const getEventCoOrganizers = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const coOrganizers = await CoOrganizer.find({ eventId, status: 'active' })
      .populate('userId', 'name email profilePhoto')
      .populate('addedBy', 'name');

    res.json({ coOrganizers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching co-organizers', error: error.message });
  }
};

export const updateCoOrganizerPermissions = async (req, res) => {
  try {
    const { coOrganizerId } = req.params;
    const { permissions } = req.body;

    const coOrganizer = await CoOrganizer.findById(coOrganizerId).populate('eventId');
    if (!coOrganizer) {
      return res.status(404).json({ message: 'Co-organizer not found' });
    }

    if (coOrganizer.eventId.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only main organizer can update permissions' });
    }

    coOrganizer.permissions = { ...coOrganizer.permissions, ...permissions };
    await coOrganizer.save();

    res.json({ message: 'Permissions updated', coOrganizer });
  } catch (error) {
    res.status(500).json({ message: 'Error updating permissions', error: error.message });
  }
};

export const removeCoOrganizer = async (req, res) => {
  try {
    const { coOrganizerId } = req.params;

    const coOrganizer = await CoOrganizer.findById(coOrganizerId).populate('eventId');
    if (!coOrganizer) {
      return res.status(404).json({ message: 'Co-organizer not found' });
    }

    if (coOrganizer.eventId.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only main organizer can remove co-organizers' });
    }

    coOrganizer.status = 'inactive';
    await coOrganizer.save();

    const event = await Event.findById(coOrganizer.eventId);
    if (event) {
      event.coOrganizers = event.coOrganizers.filter(id => id.toString() !== coOrganizerId);
      await event.save();
    }

    res.json({ message: 'Co-organizer removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing co-organizer', error: error.message });
  }
};

export const checkCoOrganizerPermission = async (eventId, userId, permission) => {
  const event = await Event.findById(eventId);
  if (!event) return false;

  if (event.organizerId.toString() === userId.toString()) return true;

  const coOrganizer = await CoOrganizer.findOne({ eventId, userId, status: 'active' });
  if (!coOrganizer) return false;

  return coOrganizer.permissions[permission] === true;
};
export const bulkHireCoOrganizers = async (req, res) => {
  try {
    const { eventId, users, template } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Users array required' });
    }

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const { getPermissionTemplate } = await import('../utils/permissionTemplates.js');
    const permissions = getPermissionTemplate(template || 'limited');

    const results = [];
    for (const userId of users) {
      const existing = await CoOrganizer.findOne({ eventId, userId });
      if (existing) continue;

      const coOrganizer = await CoOrganizer.create({
        eventId,
        userId,
        addedBy: req.userId,
        permissions,
        elevatedFrom: 'hired'
      });

      event.coOrganizers.push(coOrganizer._id);
      results.push(coOrganizer);
    }

    await event.save();

    res.json({ message: `${results.length} co-organizers hired`, coOrganizers: results });
  } catch (error) {
    res.status(500).json({ message: 'Error bulk hiring', error: error.message });
  }
};

export const getCoOrganizerActivities = async (req, res) => {
  try {
    const { coOrganizerId } = req.params;

    const coOrganizer = await CoOrganizer.findById(coOrganizerId);
    if (!coOrganizer) {
      return res.status(404).json({ message: 'Co-organizer not found' });
    }

    const { getCoOrganizerActivities } = await import('../utils/coOrganizerLogger.js');
    const activities = await getCoOrganizerActivities(coOrganizerId);

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
};

export const getEventCoOrganizerAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const coOrganizers = await CoOrganizer.find({ eventId, status: 'active' });
    const { getEventActivities } = await import('../utils/coOrganizerLogger.js');
    const activities = await getEventActivities(eventId);

    const analytics = {
      totalCoOrganizers: coOrganizers.length,
      hired: coOrganizers.filter(co => co.elevatedFrom === 'hired').length,
      elevated: coOrganizers.filter(co => co.elevatedFrom === 'worker').length,
      totalActivities: activities.length,
      activityBreakdown: activities.reduce((acc, act) => {
        acc[act.action] = (acc[act.action] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};
