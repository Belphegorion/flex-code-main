import Review from '../models/Review.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { reviewToLegacy } from '../utils/dtoMappers.js';

export const createReview = async (req, res) => {
  try {
    const { toId, jobId, rating, text } = req.body;

    // Verify job and relationship
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Basic relationship checks (legacy-compatible)
    if (req.user.role === 'organizer') {
      if (job.organizerId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized to review' });
      }
      if (!job.hiredPros?.some(id => id.toString() === toId)) {
        return res.status(400).json({ message: 'Can only review hired professionals' });
      }
    } else if (req.user.role === 'worker') {
      if (!job.hiredPros?.some(id => id.toString() === req.userId.toString())) {
        return res.status(403).json({ message: 'Unauthorized to review' });
      }
      if (toId !== job.organizerId.toString()) {
        return res.status(400).json({ message: 'Invalid review recipient' });
      }
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({ reviewerId: req.userId, subjectId: toId, jobId });

    if (existingReview) {
      return res.status(400).json({ message: 'Already reviewed' });
    }

    // Create review (map legacy inputs to new model)
    const review = await Review.create({
      reviewerId: req.userId,
      subjectId: toId,
      jobId,
      categories: {
        communication: rating,
        professionalism: rating,
        quality: rating,
        timeliness: rating
      },
      overallRating: rating,
      title: 'Review',
      content: text || ''
    });

    // Update user rating
    const userToUpdate = await User.findById(toId);
    const newTotalRatings = (userToUpdate.totalRatings || 0) + 1;
    const newRatingAvg = 
      (((userToUpdate.ratingAvg || 0) * (userToUpdate.totalRatings || 0)) + rating) / newTotalRatings;

    userToUpdate.ratingAvg = newRatingAvg;
    userToUpdate.totalRatings = newTotalRatings;
    await userToUpdate.save();

    res.status(201).json({
      message: 'Review submitted successfully',
      review: reviewToLegacy(review)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ subjectId: userId })
      .populate('reviewerId', 'name role')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.json({ reviews: reviews.map(r => reviewToLegacy(r)) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};