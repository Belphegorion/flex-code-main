import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Event from '../models/Event.js';
import Profile from '../models/Profile.js';
import logger from '../config/logger.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { calculateMatchScores } from '../utils/matchingAlgorithm.js';
import { logRequest, logError, logPerformance } from '../utils/loggerUtils.js';
import { successResponse, createErrorResponse, ERROR_CODES } from '../utils/responseFormatter.js';

/**
 * Create a new job listing
 * @param {Object} req - Express request object
 * @param {string} req.userId - Authenticated user ID
 * @param {Object} req.body - Job creation data
 */
export const createJob = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logRequest(req, 'JOB_CREATE', { jobData: req.body });
    
    const { eventId } = req.body;
    
    if (!eventId) {
      const err = createErrorResponse(
        'MISSING_FIELD',
        'Event ID is required',
        400,
        { field: 'eventId' },
        req.id
      );
      return res.status(err.statusCode).json(err.body);
    }

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    
    if (!event) {
      const err = createErrorResponse('EVENT_NOT_FOUND', null, 404, null, req.id);
      return res.status(err.statusCode).json(err.body);
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

    const duration = Date.now() - startTime;
    logPerformance(req, 'JOB_CREATE', duration);

    res.status(201).json(
      successResponse(job, 'Job created successfully', 'JOB_CREATED')
    );
  } catch (error) {
    logError(req, 'JOB_CREATE', error);
    const err = createErrorResponse('INTERNAL_ERROR', null, 500, null, req.id);
    res.status(err.statusCode).json(err.body);
  }
};

/**
 * Get jobs for organizer with pagination
 * Optimized: Uses aggregation pipeline to avoid N+1 queries
 */
export const getJobs = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logRequest(req, 'JOB_LIST', { query: req.query });
    
    if (!req.userId) {
      const err = createErrorResponse('UNAUTHORIZED', null, 401, null, req.id);
      return res.status(err.statusCode).json(err.body);
    }

    const { status, skills, city, eventId, page = 1, limit = 20 } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || isNaN(limitNum)) {
      const err = createErrorResponse('INVALID_PAGINATION', null, 400, null, req.id);
      return res.status(err.statusCode).json(err.body);
    }

    // Build match filter
    const matchStage = {
      organizerId: new mongoose.Types.ObjectId(req.userId),
      ...(status && { status }),
      ...(eventId && { eventId: new mongoose.Types.ObjectId(eventId) }),
      ...(skills && { requiredSkills: { $in: skills.split(',').map(s => s.trim()).filter(s => s.length > 0) } }),
      ...(city && { 'location.city': { $regex: city, $options: 'i' } })
    };

    // Aggregation pipeline for single query (no N+1 problem)
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'organizerId',
          foreignField: '_id',
          as: 'organizer',
          pipeline: [
            { $project: { name: 1, email: 1, profilePhoto: 1, ratingAvg: 1 } }
          ]
        }
      },
      { $unwind: '$organizer' },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
          pipeline: [
            { $project: { title: 1, dateStart: 1, dateEnd: 1, location: 1 } }
          ]
        }
      },
      { $unwind: '$event' },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          jobs: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const result = await Job.aggregate(pipeline);
    const jobs = result[0].jobs;
    const totalCountArray = result[0].totalCount;
    const totalCount = totalCountArray.length > 0 ? totalCountArray[0].count : 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    const duration = Date.now() - startTime;
    logPerformance(req, 'JOB_LIST', duration, duration > 1000);

    res.json(
      successResponse(
        {
          jobs,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
            limit: limitNum
          }
        },
        'Jobs retrieved successfully',
        'JOB_LIST_SUCCESS'
      )
    );
  } catch (error) {
    logError(req, 'JOB_LIST', error);
    const err = createErrorResponse('INTERNAL_ERROR', null, 500, null, req.id);
    res.status(err.statusCode).json(err.body);
  }
};

/**
 * Get job by ID with full details
 * Optimized with aggregation pipeline
 */
export const getJobById = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logRequest(req, 'JOB_GET', { jobId: req.params.id });
    
    const jobId = req.params.id;
    
    if (!jobId || jobId === 'undefined') {
      const err = createErrorResponse('MISSING_FIELD', 'Valid job ID is required', 400, null, req.id);
      return res.status(err.statusCode).json(err.body);
    }

    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      const err = createErrorResponse('INVALID_FORMAT', 'Invalid job ID format', 400, null, req.id);
      return res.status(err.statusCode).json(err.body);
    }

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(jobId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'organizerId',
          foreignField: '_id',
          as: 'organizer',
          pipeline: [{ $project: { name: 1, email: 1, phone: 1, ratingAvg: 1, profilePhoto: 1 } }]
        }
      },
      { $unwind: '$organizer' },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
          pipeline: [{ $project: { title: 1, dateStart: 1, dateEnd: 1, location: 1 } }]
        }
      },
      { $unwind: '$event' },
      {
        $lookup: {
          from: 'users',
          localField: 'hiredPros',
          foreignField: '_id',
          as: 'hiredProsDetails',
          pipeline: [{ $project: { name: 1, email: 1, ratingAvg: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'applicants.proId',
          foreignField: '_id',
          as: 'applicantDetails',
          pipeline: [{ $project: { name: 1, email: 1, ratingAvg: 1, badges: 1 } }]
        }
      }
    ];

    const jobs = await Job.aggregate(pipeline);
    
    if (jobs.length === 0) {
      const err = createErrorResponse('JOB_NOT_FOUND', null, 404, null, req.id);
      return res.status(err.statusCode).json(err.body);
    }

    const duration = Date.now() - startTime;
    logPerformance(req, 'JOB_GET', duration);

    res.json(successResponse(jobs[0], 'Job retrieved successfully'));
  } catch (error) {
    logError(req, 'JOB_GET', error);
    const err = createErrorResponse('INTERNAL_ERROR', null, 500, null, req.id);
    res.status(err.statusCode).json(err.body);
  }
};

/**
 * Discover available jobs with advanced filtering
 * Optimized with aggregation pipeline
 */
export const discoverJobs = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logRequest(req, 'JOB_DISCOVER', { query: req.query });
    
    const { 
      skills, 
      city, 
      minPay, 
      maxPay, 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt' 
    } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || isNaN(limitNum)) {
      const err = createErrorResponse('INVALID_PAGINATION', null, 400, null, req.id);
      return res.status(err.statusCode).json(err.body);
    }

    // Validate sort parameter
    const allowedSorts = ['createdAt', 'payPerPerson', 'dateStart'];
    const sortField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = sortBy === 'payPerPerson' ? -1 : -1;

    // Build match filter
    const matchStage = { status: 'open' };

    if (skills) {
      const skillArray = skills.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length <= 100);
      if (skillArray.length > 0) {
        matchStage.requiredSkills = { $in: skillArray };
      }
    }

    if (city) {
      matchStage['location.city'] = { $regex: city, $options: 'i' };
    }

    if (minPay || maxPay) {
      matchStage.payPerPerson = {};
      if (minPay && !isNaN(parseInt(minPay))) {
        matchStage.payPerPerson.$gte = parseInt(minPay);
      }
      if (maxPay && !isNaN(parseInt(maxPay))) {
        matchStage.payPerPerson.$lte = parseInt(maxPay);
      }
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'organizerId',
          foreignField: '_id',
          as: 'organizer',
          pipeline: [{ $project: { name: 1, email: 1, ratingAvg: 1, profilePhoto: 1 } }]
        }
      },
      { $unwind: '$organizer' },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
          pipeline: [{ $project: { title: 1, dateStart: 1, dateEnd: 1, location: 1 } }]
        }
      },
      { $unwind: '$event' },
      { $sort: { [sortField]: sortOrder } },
      {
        $facet: {
          jobs: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const result = await Job.aggregate(pipeline);
    const jobs = result[0].jobs;
    const totalCountArray = result[0].totalCount;
    const totalCount = totalCountArray.length > 0 ? totalCountArray[0].count : 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    const duration = Date.now() - startTime;
    logPerformance(req, 'JOB_DISCOVER', duration, duration > 1000);

    res.json(
      successResponse(
        {
          jobs,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
            limit: limitNum
          }
        },
        'Jobs discovered successfully',
        'JOB_DISCOVER_SUCCESS'
      )
    );
  } catch (error) {
    logError(req, 'JOB_DISCOVER', error);
    const err = createErrorResponse('INTERNAL_ERROR', null, 500, null, req.id);
    res.status(err.statusCode).json(err.body);
  }
};

export default {
  createJob,
  getJobs,
  getJobById,
  discoverJobs
};
