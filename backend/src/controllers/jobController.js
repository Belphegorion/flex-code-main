import mongoose from 'mongoose';
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

    const { status, skills, city, eventId, page = 1, limit = 20 } = req.query;
    const filter = { organizerId: req.userId };

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;
    if (skills) filter.requiredSkills = { $in: skills.split(',') };
    if (city) filter['location.city'] = city;

    const [jobs, totalCount] = await Promise.all([
      Job.find(filter)
        .populate('organizerId', 'name email')
        .populate('eventId', 'title dateStart dateEnd')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({ 
      jobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
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
    const { skills, city, minPay, maxPay, dateFrom, maxDistance, page = 1, limit = 20, sortBy = 'createdAt' } = req.query;
    const filter = { status: 'open' };

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page for discovery
    const skip = (pageNum - 1) * limitNum;

    // Validate sort parameter
    const allowedSorts = ['createdAt', 'payPerPerson', 'dateStart'];
    const sortField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = sortBy === 'payPerPerson' ? -1 : -1; // Highest pay first, newest first for others

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

    // Add index hints for better performance
    const [jobs, totalCount] = await Promise.all([
      Job.find(filter)
        .populate('organizerId', 'name ratingAvg')
        .populate('eventId', 'title dateStart dateEnd location')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      Job.countDocuments(filter)
    ]);

    let processedJobs = jobs;

    // Apply location-based filtering if user has profile with location
    if (req.user.role === 'worker') {
      const profile = await Profile.findOne({ userId: req.userId }).lean();
      
      if (profile?.location?.lat && maxDistance) {
        const distance = Number(maxDistance) || 50; // Default 50km
        processedJobs = jobs.filter(job => {
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

      // Apply matching algorithm only to current page results
      processedJobs = await calculateMatchScores(processedJobs, req.userId);
    }

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({ 
      jobs: processedJobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      },
      filters: {
        skills: skills?.split(',') || [],
        city,
        minPay,
        maxPay,
        dateFrom,
        maxDistance,
        sortBy: sortField
      }
    });
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
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { proIds } = req.body;
      
      if (!proIds || !Array.isArray(proIds) || proIds.length === 0) {
        throw new Error('Valid array of worker IDs is required');
      }
      
      const job = await Job.findOne({ _id: req.params.id, organizerId: req.userId }).session(session);

      if (!job) {
        throw new Error('Job not found or unauthorized');
      }

      const availablePositions = job.totalPositions - (job.positionsFilled || 0);
      if (proIds.length > availablePositions) {
        throw new Error(`Only ${availablePositions} positions available, cannot hire ${proIds.length} workers`);
      }

      // Update applications in bulk
      const Application = (await import('../models/Application.js')).default;
      const applications = await Application.find({
        jobId: job._id,
        proId: { $in: proIds },
        status: 'pending'
      }).session(session);
      
      if (applications.length !== proIds.length) {
        throw new Error('Some workers have not applied or already processed');
      }

      // Update all applications
      await Application.updateMany(
        { _id: { $in: applications.map(a => a._id) } },
        { $set: { status: 'accepted' } },
        { session }
      );

      // Update job
      job.hiredPros.push(...proIds);
      job.positionsFilled = (job.positionsFilled || 0) + proIds.length;
      
      proIds.forEach(proId => {
        const applicant = job.applicants.find(a => a.proId.toString() === proId);
        if (applicant) {
          applicant.status = 'accepted';
        }
      });

      if (job.positionsFilled >= job.totalPositions) {
        job.status = 'filled';
      }

      await job.save({ session });
      
      req.transactionData = { job, proIds, applications };
    });

    // Post-transaction: notifications and audit log
    const { job, proIds } = req.transactionData;
    const { createNotification } = await import('./notificationController.js');
    const { logAction } = await import('../utils/auditLogger.js');
    
    await Promise.all([
      ...proIds.map(proId => 
        createNotification(proId, {
          type: 'acceptance',
          title: 'Application Accepted!',
          message: `Your application for ${job.title} has been accepted`,
          relatedId: job._id,
          relatedModel: 'Job',
          actionUrl: `/jobs/${job._id}`
        })
      ),
      logAction(req.userId, 'HIRE_WORKERS', 'Job', job._id, { workerIds: proIds, count: proIds.length }, req)
    ]);

    res.json({ 
      message: `Successfully hired ${proIds.length} workers`, 
      job,
      hiredCount: proIds.length
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') || error.message.includes('unauthorized') ? 404 :
                      error.message.includes('positions') || error.message.includes('applied') ? 400 : 500;
    res.status(statusCode).json({ message: error.message || 'Error hiring workers' });
  } finally {
    await session.endSession();
  }
};

export const bulkAcceptApplications = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { applicationIds } = req.body;
      
      if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
        throw new Error('Valid array of application IDs is required');
      }
      
      const Application = (await import('../models/Application.js')).default;
      const applications = await Application.find({
        _id: { $in: applicationIds },
        status: 'pending'
      }).populate('jobId').session(session);
      
      if (applications.length === 0) {
        throw new Error('No valid pending applications found');
      }
      
      // Group by job to check positions
      const jobGroups = {};
      applications.forEach(app => {
        const jobId = app.jobId._id.toString();
        if (!jobGroups[jobId]) jobGroups[jobId] = [];
        jobGroups[jobId].push(app);
      });
      
      // Validate and update each job
      for (const [jobId, apps] of Object.entries(jobGroups)) {
        const job = apps[0].jobId;
        
        if (job.organizerId.toString() !== req.userId.toString()) {
          throw new Error('Unauthorized to accept applications for this job');
        }
        
        const availablePositions = job.workersNeeded - (job.positionsFilled || 0);
        if (apps.length > availablePositions) {
          throw new Error(`Job "${job.title}" only has ${availablePositions} positions available`);
        }
        
        // Update applications
        await Application.updateMany(
          { _id: { $in: apps.map(a => a._id) } },
          { $set: { status: 'accepted' } },
          { session }
        );
        
        // Update job
        job.positionsFilled = (job.positionsFilled || 0) + apps.length;
        if (job.positionsFilled >= job.workersNeeded) {
          job.status = 'filled';
        }
        await job.save({ session });
      }
      
      req.transactionData = { applications };
    });
    
    res.json({ 
      message: `Successfully accepted ${req.transactionData.applications.length} applications`,
      count: req.transactionData.applications.length
    });
  } catch (error) {
    const statusCode = error.message.includes('Unauthorized') ? 403 :
                      error.message.includes('positions') || error.message.includes('No valid') ? 400 : 500;
    res.status(statusCode).json({ message: error.message || 'Error accepting applications' });
  } finally {
    await session.endSession();
  }
};