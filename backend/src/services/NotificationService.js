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
        const notificationObj = notification.toObject();
        notificationObj.deliveredAt = new Date().toISOString();
        
        // Emit to user-specific room
        io.to(socketId).emit('notification', notificationObj);
        
        // If it's a job alert, also emit to job_alerts channel
        if (notification.type === 'job_created') {
          io.to(`job_alerts:${userId}`).emit('job_alert', {
            ...notificationObj,
            channel: 'job_alerts'
          });
        }
        
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
    try {
      logger.info('Notifying matching workers about new job', { jobId: job._id });
      
      // Query workers with matching skills
      const matchingWorkers = await this.findMatchingWorkers(job);
      
      if (matchingWorkers.length === 0) {
        logger.info('No matching workers found for job', { jobId: job._id });
        return;
      }
      
      logger.info(`Found ${matchingWorkers.length} matching workers for job`, { jobId: job._id });
      
      // Create notifications for matching workers
      const notifications = [];
      for (const worker of matchingWorkers) {
        try {
          const notification = await this.create({
            userId: worker._id,
            type: 'job_created',
            title: `New Job: ${job.title}`,
            message: `A new job matching your skills has been posted: ${job.title} - $${job.payPerPerson}/hr`,
            relatedId: job._id,
            relatedModel: 'Job',
            actionUrl: `/jobs/${job._id}`,
            metadata: {
              jobTitle: job.title,
              matchScore: worker.matchScore,
              payPerPerson: job.payPerPerson,
              location: job.location?.city
            }
          });
          notifications.push(notification);
        } catch (err) {
          logger.error('Error creating notification for worker', { workerId: worker._id, jobId: job._id, error: err.message });
        }
      }
      
      logger.info('Notifications created for matching workers', { jobId: job._id, count: notifications.length });
    } catch (error) {
      logger.error('Error notifying matching workers:', { jobId: job._id, error: error.message });
    }
  }

  async findMatchingWorkers(job) {
    try {
      const { calculateMatchScores } = await import('../utils/matchingAlgorithm.js').catch(() => ({}));
      const User = (await import('../models/User.js')).default;
      const Profile = (await import('../models/Profile.js')).default;

      // Step 1: Find workers with matching skills (initial filter)
      const jobSkills = job.requiredSkills || [];
      if (jobSkills.length === 0) {
        logger.warn('Job has no required skills specified', { jobId: job._id });
        return [];
      }

      const workersWithSkills = await Profile.find(
        { skills: { $in: jobSkills } },
        { userId: 1, skills: 1, location: 1 }
      ).lean();

      if (workersWithSkills.length === 0) {
        logger.info('No workers found with matching skills', { jobId: job._id, requiredSkills: jobSkills });
        return [];
      }

      // Step 2: Get full user data for matching workers
      const workerIds = workersWithSkills.map(p => p.userId);
      const workers = await User.find(
        { _id: { $in: workerIds }, role: 'worker' },
        { _id: 1, email: 1, ratingAvg: 1, completedJobsCount: 1, reliabilityScore: 1 }
      ).lean();

      if (workers.length === 0) {
        return [];
      }

      // Step 3: Calculate match scores
      let workersWithScores = workers;
      if (calculateMatchScores && typeof calculateMatchScores === 'function') {
        try {
          // Enhance workers with profile data
          workersWithScores = workers.map(worker => {
            const profile = workersWithSkills.find(p => p.userId.toString() === worker._id.toString());
            return { ...worker, ...profile };
          });
          workersWithScores = await calculateMatchScores(workersWithScores.map(w => ({ id: w._id, ...w })), null);
        } catch (scoreError) {
          logger.error('Error calculating match scores', { error: scoreError.message });
        }
      }

      // Step 4: Filter by match score threshold (>60%) and limit to top matches
      const topMatches = workersWithScores
        .filter(w => (w.matchScore || 50) >= 60) // Default 50 if no score
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 50); // Max 50 notifications per job

      logger.info('Top matching workers calculated', { jobId: job._id, count: topMatches.length });
      return topMatches;
    } catch (error) {
      logger.error('Error finding matching workers:', { error: error.message });
      return [];
    }
  }
}

export default new NotificationService();


