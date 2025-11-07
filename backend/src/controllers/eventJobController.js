import Event from '../models/Event.js';
import Job from '../models/Job.js';

export const getEventJobs = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const jobs = await Job.find({ eventId })
      .populate('hiredPros', 'name email profilePhoto')
      .sort({ createdAt: 1 });

    const totalPositions = jobs.reduce((sum, job) => sum + job.totalPositions, 0);
    const totalFilled = jobs.reduce((sum, job) => sum + job.positionsFilled, 0);
    const progress = totalPositions > 0 ? (totalFilled / totalPositions) * 100 : 0;

    res.json({ 
      jobs,
      summary: {
        totalJobs: jobs.length,
        totalPositions,
        totalFilled,
        progress: Math.round(progress)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event jobs', error: error.message });
  }
};

export const createEventJob = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, roles, requiredSkills, payPerPerson, totalPositions } = req.body;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const job = await Job.create({
      eventId,
      organizerId: req.userId,
      title,
      description,
      roles,
      requiredSkills,
      payPerPerson,
      totalPositions,
      dateStart: event.dateStart,
      dateEnd: event.dateEnd,
      location: event.location
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

export const updateEventJob = async (req, res) => {
  try {
    const { eventId, jobId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const job = await Job.findOne({ _id: jobId, eventId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

export const deleteEventJob = async (req, res) => {
  try {
    const { eventId, jobId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const job = await Job.findOne({ _id: jobId, eventId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.positionsFilled > 0) {
      return res.status(400).json({ message: 'Cannot delete job with hired workers' });
    }

    await Job.deleteOne({ _id: jobId });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

export const getEventProgress = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const jobs = await Job.find({ eventId });

    const jobProgress = jobs.map(job => ({
      jobId: job._id,
      title: job.title,
      totalPositions: job.totalPositions,
      positionsFilled: job.positionsFilled,
      progress: job.totalPositions > 0 ? (job.positionsFilled / job.totalPositions) * 100 : 0
    }));

    const totalPositions = jobs.reduce((sum, job) => sum + job.totalPositions, 0);
    const totalFilled = jobs.reduce((sum, job) => sum + job.positionsFilled, 0);
    const overallProgress = totalPositions > 0 ? (totalFilled / totalPositions) * 100 : 0;

    res.json({
      eventId,
      eventTitle: event.title,
      overallProgress: Math.round(overallProgress),
      totalPositions,
      totalFilled,
      jobs: jobProgress
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};
