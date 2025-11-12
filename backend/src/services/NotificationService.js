import mongoose from 'mongoose';
import crypto from 'crypto';
import Notification from '../models/Notification.js';
import redis from '../config/redis.js';
import logger from '../config/logger.js';
import { notificationQueue } from '../config/queue.js';
import { io as exportedIo } from '../server.js';

class NotificationService {
  constructor() {
    this.setupQueueProcessor();
  }

  setupQueueProcessor() {
    notificationQueue.process('deliver', async (job) => {
      await this.processDelivery(job);
    });
  }

  async create(notificationData) {
    const notification = new Notification({
      ...notificationData,
      status: 'pending',
      deliveryAttempts: 0,
      idempotencyKey: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
    });
    await notification.save();
    await notificationQueue.add('deliver', {
      notificationId: notification._id,
      userId: notification.userId
    });
    return notification;
  }

  async processDelivery(job) {
    const { notificationId, userId } = job.data;
    try {
      const socketId = await redis.get(`socket:${userId}`);
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }
      const io = exportedIo;
      if (socketId && io) {
        io.to(socketId).emit('notification', {
          ...notification.toObject(),
          deliveredAt: new Date().toISOString()
        });
        await Notification.findByIdAndUpdate(notificationId, {
          status: 'delivered',
          deliveredAt: new Date()
        });
      } else {
        await Notification.findByIdAndUpdate(notificationId, { status: 'queued' });
      }
      await redis.zadd(`unread:${userId}`, Date.now(), notificationId.toString());
    } catch (error) {
      await Notification.findByIdAndUpdate(notificationId, {
        $inc: { deliveryAttempts: 1 },
        status: 'failed'
      });
      logger.error('Notification delivery failed', { notificationId, userId, error: error.message });
      throw error;
    }
  }

  async markAsRead(userId, notificationIds) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Notification.updateMany(
          { _id: { $in: notificationIds }, userId },
          { read: true, readAt: new Date() },
          { session }
        );
        const pipeline = redis.pipeline();
        notificationIds.forEach(id => pipeline.zrem(`unread:${userId}`, id));
        await pipeline.exec();
      });
    } finally {
      await session.endSession();
    }
  }

  async getUnreadCount(userId) {
    return await redis.zcard(`unread:${userId}`);
  }

  async notifyMatchingWorkers(job) {
    logger.info('Notifying matching workers about new job', { jobId: job._id });
  }
}

export default new NotificationService();


