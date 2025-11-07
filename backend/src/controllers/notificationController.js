import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const unreadCount = await Notification.countDocuments({ 
      userId: req.userId, 
      read: false 
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.userId, 
      read: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching count', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

export const createNotification = async (userId, data) => {
  try {
    if (!userId) {
      console.error('User ID is required for notification');
      return null;
    }

    if (!data.type || !data.title || !data.message) {
      console.error('Type, title, and message are required for notification');
      return null;
    }

    const notification = await Notification.create({
      userId,
      ...data
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
