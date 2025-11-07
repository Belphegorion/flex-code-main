import Review from '../models/Review.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

export const createReview = async (req, res) => {
  try {
    const { toId, jobId, rating, text } = req.body;

    // Verify job and relationship
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Determine review type
    let type;
    if (req.user.role === 'organizer' && job.organizerId.toString() === req.userId.toString()) {
      type = 'organizer-to-pro';
      // Verify toId is a hired pro
      if (!job.hiredPros.some(id => id.toString() === toId)) {
        return res.status(400).json({ message: 'Can only review hired professionals' });
      }
    } else if (req.user.role === 'worker' && job.hiredPros.some(id => id.toString() === req.userId.toString())) {
      type = 'pro-to-organizer';
      // toId must be the organizer
      if (toId !== job.organizerId.toString()) {
        return res.status(400).json({ message: 'Invalid review recipient' });
      }
    } else {
      return res.status(403).json({ message: 'Unauthorized to review' });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      fromId: req.userId,
      toId,
      jobId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Already reviewed' });
    }

    // Create review
    const review = await Review.create({
      fromId: req.userId,
      toId,
      jobId,
      rating,
      text,
      type
    });

    // Update user rating
    const userToUpdate = await User.findById(toId);
    const newTotalRatings = userToUpdate.totalRatings + 1;
    const newRatingAvg = 
      ((userToUpdate.ratingAvg * userToUpdate.totalRatings) + rating) / newTotalRatings;

    userToUpdate.ratingAvg = newRatingAvg;
    userToUpdate.totalRatings = newTotalRatings;
    await userToUpdate.save();

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ toId: userId })
      .populate('fromId', 'name role')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};