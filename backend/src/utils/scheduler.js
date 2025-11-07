import cron from 'node-cron';

export const startScheduledJobs = () => {
  // Clean up expired QR codes daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled cleanup of expired QR codes...');
      // Add cleanup logic here if needed
    } catch (error) {
      console.error('Error in scheduled cleanup:', error);
    }
  });

  console.log('Scheduled jobs started');
};