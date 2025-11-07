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
    user.completedJobsCount += 1;
  } else if (status === 'no-show') {
    user.noShowCount += 1;
  }
  
  await user.save();
  await updateReliabilityScore(userId);
});

reminderQueue.process(async (job) => {
  const { jobId, type } = job.data;
  
  const jobDoc = await Job.findById(jobId).populate('hiredPros');
  if (!jobDoc) return;

  const applications = await Application.find({
    jobId,
    status: 'accepted'
  }).populate('proId');

  for (const app of applications) {
    // Send notification (integrate with notification service)
    console.log(`Sending ${type} reminder to ${app.proId.email} for job ${jobDoc.title}`);
  }
});

export const scheduleReliabilityUpdate = (userId, status) => {
  reliabilityQueue.add({ userId, status });
};

export const scheduleJobReminder = (jobId, type, delay) => {
  reminderQueue.add({ jobId, type }, { delay });
};
