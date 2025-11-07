import User from '../models/User.js';
import Profile from '../models/Profile.js';
import DirectMessage from '../models/DirectMessage.js';
import JobOffer from '../models/JobOffer.js';
import Job from '../models/Job.js';

export const searchWorkers = async (req, res) => {
  try {
    const { skills, location, minRating, availability, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const userFilter = { role: 'worker' };
    if (minRating) userFilter.ratingAvg = { $gte: Number(minRating) };
    if (search) userFilter.name = { $regex: search, $options: 'i' };

    const profileFilter = {};
    if (skills) profileFilter.skills = { $in: skills.split(',') };
    if (location) profileFilter['location.city'] = { $regex: location, $options: 'i' };
    if (availability) profileFilter.availability = availability;

    const profiles = await Profile.find(profileFilter)
      .populate({
        path: 'userId',
        match: userFilter,
        select: 'name email profilePhoto ratingAvg ratingCount badges'
      })
      .skip(skip)
      .limit(limit);

    const workers = profiles.filter(p => p.userId).map(p => ({
      _id: p.userId._id,
      name: p.userId.name,
      email: p.userId.email,
      profilePhoto: p.userId.profilePhoto,
      ratingAvg: p.userId.ratingAvg,
      ratingCount: p.userId.ratingCount,
      badges: p.userId.badges,
      skills: p.skills,
      location: p.location,
      availability: p.availability,
      bio: p.bio
    }));

    const total = await Profile.countDocuments(profileFilter);

    res.json({ workers, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error searching workers', error: error.message });
  }
};

export const getWorkerDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.workerId).select('-password -refreshToken');
    if (!user || user.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const profile = await Profile.findOne({ userId: req.params.workerId });

    res.json({ worker: user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { workerId, text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: 'Message text required' });
    }

    let conversation = await DirectMessage.findOne({
      participants: { $all: [req.userId, workerId] }
    });

    if (!conversation) {
      conversation = await DirectMessage.create({
        participants: [req.userId, workerId],
        messages: []
      });
    }

    conversation.messages.push({
      senderId: req.userId,
      text: text.trim()
    });
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const io = req.app.get('io');
    io.to(`user_${workerId}`).emit('direct-message', {
      conversationId: conversation._id,
      message: conversation.messages[conversation.messages.length - 1]
    });

    res.json({ message: 'Message sent', conversation });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const conversation = await DirectMessage.findOne({
      participants: { $all: [req.userId, req.params.workerId] }
    }).populate('participants', 'name profilePhoto');

    if (!conversation) {
      return res.json({ messages: [] });
    }

    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const conversations = await DirectMessage.find({
      participants: req.userId
    })
      .populate('participants', 'name profilePhoto')
      .sort({ lastMessageAt: -1 });

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

export const sendJobOffer = async (req, res) => {
  try {
    const { workerId, jobId, message } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const existingOffer = await JobOffer.findOne({
      jobId,
      workerId,
      status: 'pending'
    });

    if (existingOffer) {
      return res.status(400).json({ message: 'Offer already sent' });
    }

    const offer = await JobOffer.create({
      jobId,
      workerId,
      organizerId: req.userId,
      message
    });

    const { createNotification } = await import('./notificationController.js');
    await createNotification(workerId, {
      type: 'job_offer',
      title: 'New Job Offer',
      message: `You received a job offer for ${job.title}`,
      relatedId: jobId,
      actionUrl: `/jobs/${jobId}`
    });

    const io = req.app.get('io');
    io.to(`user_${workerId}`).emit('notification', {
      type: 'job_offer',
      message: 'New job offer received'
    });

    res.json({ message: 'Offer sent', offer });
  } catch (error) {
    res.status(500).json({ message: 'Error sending offer', error: error.message });
  }
};

export const getMyOffers = async (req, res) => {
  try {
    const offers = await JobOffer.find({ workerId: req.userId })
      .populate('jobId')
      .populate('organizerId', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ offers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers', error: error.message });
  }
};

export const respondToOffer = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const offer = await JobOffer.findById(req.params.offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.workerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    offer.status = status;
    await offer.save();

    const { createNotification } = await import('./notificationController.js');
    await createNotification(offer.organizerId, {
      type: 'offer_response',
      title: `Offer ${status}`,
      message: `Worker ${status} your job offer`,
      relatedId: offer.jobId,
      actionUrl: `/jobs/${offer.jobId}`
    });

    res.json({ message: `Offer ${status}`, offer });
  } catch (error) {
    res.status(500).json({ message: 'Error responding to offer', error: error.message });
  }
};
