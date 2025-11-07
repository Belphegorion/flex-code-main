import cron from 'node-cron';
import WorkSchedule from '../models/WorkSchedule.js';
import Notification from '../models/Notification.js';
import Job from '../models/Job.js';
import Event from '../models/Event.js';
import Application from '../models/Application.js';

export const startScheduledJobs = () => {
  // Clean up expired QR codes daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled cleanup of expired QR codes...');
      const result = await WorkSchedule.updateMany(
        { qrExpiry: { $lt: new Date() }, isActive: true },
        { $set: { isActive: false } }
      );
      console.log(`Deactivated ${result.modifiedCount} expired QR codes`);
    } catch (error) {
      console.error('Error cleaning up QR codes:', error);
    }
  });

  // Clean up old notifications (older than 30 days) daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('Running scheduled cleanup of old notifications...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        read: true
      });
      console.log(`Deleted ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  });

  // Update job statuses based on dates daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Running scheduled job status updates...');
      const now = new Date();
      
      // Mark jobs as completed if end date has passed
      const completedResult = await Job.updateMany(
        { dateEnd: { $lt: now }, status: { $in: ['open', 'in-progress'] } },
        { $set: { status: 'completed' } }
      );
      
      // Mark jobs as in-progress if start date has passed
      const inProgressResult = await Job.updateMany(
        { dateStart: { $lte: now }, dateEnd: { $gte: now }, status: 'open' },
        { $set: { status: 'in-progress' } }
      );
      
      console.log(`Updated ${completedResult.modifiedCount} jobs to completed, ${inProgressResult.modifiedCount} to in-progress`);
    } catch (error) {
      console.error('Error updating job statuses:', error);
    }
  });

  // Update event statuses daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('Running scheduled event status updates...');
      const now = new Date();
      
      // Mark events as completed
      const completedResult = await Event.updateMany(
        { dateEnd: { $lt: now }, status: { $in: ['upcoming', 'ongoing'] } },
        { $set: { status: 'completed' } }
      );
      
      // Mark events as ongoing
      const ongoingResult = await Event.updateMany(
        { dateStart: { $lte: now }, dateEnd: { $gte: now }, status: 'upcoming' },
        { $set: { status: 'ongoing' } }
      );
      
      console.log(`Updated ${completedResult.modifiedCount} events to completed, ${ongoingResult.modifiedCount} to ongoing`);
    } catch (error) {
      console.error('Error updating event statuses:', error);
    }
  });

  // Clean up stale pending applications (older than 7 days) weekly on Sunday at 4 AM
  cron.schedule('0 4 * * 0', async () => {
    try {
      console.log('Running scheduled cleanup of stale applications...');
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const result = await Application.deleteMany({
        status: 'pending',
        createdAt: { $lt: sevenDaysAgo }
      });
      console.log(`Deleted ${result.deletedCount} stale applications`);
    } catch (error) {
      console.error('Error cleaning up applications:', error);
    }
  });

  console.log('Scheduled jobs started: QR cleanup, notifications, job/event status updates, stale data cleanup');
};

// Manual cleanup functions
export const cleanupExpiredData = async () => {
  try {
    const results = {
      qrCodes: 0,
      notifications: 0,
      applications: 0
    };

    // Cleanup expired QR codes
    const qrResult = await WorkSchedule.updateMany(
      { qrExpiry: { $lt: new Date() }, isActive: true },
      { $set: { isActive: false } }
    );
    results.qrCodes = qrResult.modifiedCount;

    // Cleanup old notifications
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const notifResult = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true
    });
    results.notifications = notifResult.deletedCount;

    // Cleanup stale applications
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const appResult = await Application.deleteMany({
      status: 'pending',
      createdAt: { $lt: sevenDaysAgo }
    });
    results.applications = appResult.deletedCount;

    return results;
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    throw error;
  }
};