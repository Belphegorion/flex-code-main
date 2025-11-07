import CoOrganizerActivity from '../models/CoOrganizerActivity.js';

export const logCoOrganizerActivity = async (coOrganizerId, eventId, action, details = {}) => {
  if (!coOrganizerId || !eventId || !action) return;
  
  try {
    await CoOrganizerActivity.create({
      coOrganizerId,
      eventId,
      action,
      details,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
};

export const getCoOrganizerActivities = async (coOrganizerId, limit = 50) => {
  return CoOrganizerActivity.find({ coOrganizerId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

export const getEventActivities = async (eventId, limit = 100) => {
  return CoOrganizerActivity.find({ eventId })
    .populate('coOrganizerId', 'userId')
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};
