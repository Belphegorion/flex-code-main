import Bull from 'bull';
import logger from './logger.js';

const createQueue = (name) => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const queue = new Bull(name, redisUrl, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  });

  queue.on('completed', (job) => {
    logger.info(`Queue ${name}: Job ${job.id} completed`);
  });

  queue.on('failed', (job, err) => {
    logger.error(`Queue ${name}: Job ${job.id} failed`, { error: err.message });
  });

  return queue;
};

const notificationQueue = createQueue('notifications');
const emailQueue = createQueue('emails');
const paymentQueue = createQueue('payments');

export { notificationQueue, emailQueue, paymentQueue, createQueue };