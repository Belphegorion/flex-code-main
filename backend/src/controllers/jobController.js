import Job from '../models/Job.js';
import Event from '../models/Event.js';
import Profile from '../models/Profile.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { calculateMatchScores } from '../utils/matchingAlgorithm.js';

export const createJob = async (req, res) => {
  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const jobData = {
      ...req.body,
      organizerId: req.userId,
      dateStart: event.dateStart,
      dateEnd: event.dateEnd,
      location: event.location
    };

    const job = await Job.create(jobData);

    const qrCode = await generateQRCode(job._id.toString());
    job.qrCode = qrCode;
    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    const { status, skills, city, eventId } = req.query;
    const filter = { organizerId: req.userId };

    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;
    if (skills) filter.requiredSkills = { $in: skills.split(',') };
    if (city) filter['location.city'] = city;

    const jobs = await Job.find(filter)
      .populate('organizerId', 'name email')
      .populate('eventId', 'title dateStart dateEnd')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Jobs fetch error:', { userId: req.userId, error: error.message, timestamp: new Date().toISOString() });
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    if (!jobId || jobId === 'undefined') {
      return res.status(400).json({ message: 'Valid job ID is required' });
    }

    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    const job = await Job.findById(jobId)
      .populate('organizerId', 'name email phone')
      .populate('eventId', 'title dateStart dateEnd location')
      .populate('hiredPros', 'name email ratingAvg')
      .populate('applicants.proId', 'name email ratingAvg badges');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Job fetch error:', { jobId: req.params.id, error: error.message, timestamp: new Date().toISOString() });
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};

export const discoverJobs = async (req, res) => {
  try {
    const { skills, city, minPay, maxPay, dateFrom, maxDistance } = req.query;
    const filter = { status: 'open' };

    if (skills) {
      filter.requiredSkills = { $in: skills.split(',') };
    }
    if (city) {
      filter['location.city'] = city;
    }
    if (minPay || maxPay) {
      filter.payPerPerson = {};
      if (minPay) filter.payPerPerson.$gte = Number(minPay);
      if (maxPay) filter.payPerPerson.$lte = Number(maxPay);
    }
    if (dateFrom) {
      filter.dateStart = { $gte: new Date(dateFrom) };
    }

    let jobs = await Job.find(filter)
      .populate('organizerId', 'name ratingAvg')
      .populate('eventId', 'title dateStart dateEnd location')
      .sort({ createdAt: -1 })
      .limit(50);

    // Apply location-based filtering if user has profile with location
    if (req.user.role === 'worker') {
      const profile = await Profile.findOne({ userId: req.userId });
      
      if (profile?.location?.lat && maxDistance) {
        const distance = Number(maxDistance) || 50; // Default 50km
        jobs = jobs.filter(job => {
          if (!job.location?.lat) return true; // Include jobs without location
          const dist = calculateDistance(
            profile.location.lat,
            profile.location.lng,
            job.location.lat,
            job.location.lng
          );
          return dist <= distance;
        });
      }

      // Apply matching algorithm
      jobs = await calculateMatchScores(jobs, req.userId);
    }

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Error discovering jobs', error: error.message });
  }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, organizerId: req.userId });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const Application = (await import('../models/Application.js')).default;
    
    const applications = await Application.find({ 
      workerId: req.userId,
      status: 'accepted'
    })
      .populate({
        path: 'jobId',
        populate: {
          path: 'eventId',
          select: 'title dateStart dateEnd location status'
        }
      })
      .sort({ createdAt: -1 });

    const jobs = applications.map(app => app.jobId).filter(job => job && job.eventId);

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

export const hirePro = async (req, res) => {
  try {
    const { proIds } = req.body;
    const job = await Job.findOne({ _id: req.params.id, organizerId: req.userId });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    if (job.positionsFilled + proIds.length > job.totalPositions) {
      return res.status(400).json({ message: 'Not enough positions available' });
    }

    // Update job
    job.hiredPros.push(...proIds);
    job.positionsFilled += proIds.length;
    
    // Update applicant status
    proIds.forEach(proId => {
      const applicant = job.applicants.find(a => a.proId.toString() === proId);
      if (applicant) {
        applicant.status = 'accepted';
      }
    });

    if (job.positionsFilled >= job.totalPositions) {
      job.status = 'in-progress';
    }

    await job.save();

    // Send notifications (implement email service)

    res.json({ message: 'Pros hired successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error hiring pros', error: error.message });
  }
};