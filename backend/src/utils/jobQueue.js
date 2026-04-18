import Queue from 'bull';
import { updateReliabilityScore } from './matchingAlgorithm.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const reliabilityQueue = new Queue('reliability-updates', REDIS_URL);
export const reminderQueue = new Queue('reminders', REDIS_URL);

reliabilityQueue.process(async (job) => {
  const { userId, status } = job.data;
  
  const user = await User.findById(userId);
  if (!user) return;

  if (status === 'completed') {
    await User.findByIdAndUpdate(userId, { $inc: { completedJobsCount: 1 } });
  } else if (status === 'no-show') {
    await User.findByIdAndUpdate(userId, { $inc: { noShowCount: 1 } });
  }
  
  await updateReliabilityScore(userId);
});

reminderQueue.process(async (job) => {
  const { jobId, type } = job.data;
  
  try {
    const jobDoc = await Job.findById(jobId).populate('hiredPros');
    if (!jobDoc) {
      console.warn('Job not found for reminder', { jobId });
      return;
    }

    const applications = await Application.find({
      jobId,
      status: 'accepted'
    }).populate('proId');

    if (applications.length === 0) {
      console.log('No accepted applications for job reminder', { jobId });
      return;
    }

    // Import NotificationService
    const { default: NotificationService } = await import('../services/NotificationService.js');
    
    // Send actual notifications instead of just logging
    for (const app of applications) {
      try {
        const reminderText = type === 'pre-job' 
          ? `Your job "${jobDoc.title}" starts in 24 hours. Arrive 15 minutes early.`
          : type === 'day-of'
          ? `Your job "${jobDoc.title}" is TODAY! Check-in location and materials.`
          : `Reminder: "${jobDoc.title}" work session.`;

        await NotificationService.create({
          userId: app.proId._id,
          type: 'job_reminder',
          title: `${type === 'pre-job' ? '24-Hour' : 'Day-Of'} Job Reminder`,
          message: reminderText,
          relatedId: jobDoc._id,
          relatedModel: 'Job',
          actionUrl: `/jobs/${jobDoc._id}`,
          metadata: {
            reminderType: type,
            jobTitle: jobDoc.title,
            jobDate: jobDoc.dateStart
          }
        });
        console.log(`Job reminder notification sent to ${app.proId.email} for ${jobDoc.title}`);
      } catch (notificationError) {
        console.error(`Error sending reminder to ${app.proId.email}`, { error: notificationError.message });
      }
    }
  } catch (error) {
    console.error('Error processing job reminder queue', { jobId, error: error.message });
  }
});

export const scheduleReliabilityUpdate = (userId, status) => {
  reliabilityQueue.add({ userId, status });
};

export const scheduleJobReminder = (jobId, type, delay) => {
  reminderQueue.add({ jobId, type }, { delay });
};
