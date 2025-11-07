import Application from '../models/Application.js';
import User from '../models/User.js';
import { scheduleReliabilityUpdate } from '../utils/jobQueue.js';

export const markNoShow = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = 'no-show';
    await application.save();

    scheduleReliabilityUpdate(application.proId, 'no-show');

    res.json({ message: 'Marked as no-show', application });
  } catch (error) {
    res.status(500).json({ message: 'Error marking no-show', error: error.message });
  }
};

export const runDailyReliabilityUpdate = async (req, res) => {
  try {
    const users = await User.find({ role: 'worker' });
    
    for (const user of users) {
      const { updateReliabilityScore } = await import('../utils/matchingAlgorithm.js');
      await updateReliabilityScore(user._id);
    }

    res.json({ message: `Updated reliability scores for ${users.length} pros` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reliability scores', error: error.message });
  }
};
