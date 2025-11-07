import Profile from '../models/Profile.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Helper function to manage profile sub-documents
const manageProfileSection = async (userId, section, action, data) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  switch (action) {
    case 'add':
      profile[section].push(data);
      break;
    case 'update':
      const item = profile[section].id(data.id);
      if (!item) throw new Error('Item not found');
      Object.assign(item, data);
      break;
    case 'delete':
      profile[section].pull(data.id);
      break;
    default:
      throw new Error('Invalid action');
  }

  await profile.save();
  return profile;
};


export const createOrUpdateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });

    if (profile) {
      Object.assign(profile, req.body);
      await profile.save();
    } else {
      profile = await Profile.create({
        userId: req.userId,
        ...req.body
      });
    }

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId })
      .populate('userId', 'name email ratingAvg totalJobs badges kycStatus');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Valid profile ID is required' });
    }

    const profile = await Profile.findOne({ userId: req.params.id })
      .populate('userId', 'name email ratingAvg totalJobs badges kycStatus profilePhoto');

    if (!profile) {
      // If no Profile document exists, return basic User info
      const user = await User.findById(req.params.id).select('name email ratingAvg totalJobs badges kycStatus profilePhoto');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.json({ 
        profile: {
          userId: user,
          skills: [],
          bio: '',
          workExperience: [],
          education: [],
          portfolio: [],
          certifications: []
        }
      });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'eventpro/videos'
    });

    // Update profile
    await Profile.findOneAndUpdate(
      { userId: req.userId },
      { videoIntroUrl: result.secure_url }
    );

    res.json({
      message: 'Video uploaded successfully',
      videoUrl: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading video', error: error.message });
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

export const searchTalent = async (req, res) => {
  try {
    const { skills, city, minRating, availability } = req.query;
    const filter = {};

    if (skills) {
      filter.skills = { $in: skills.split(',') };
    }
    if (city) {
      filter['location.city'] = city;
    }
    if (availability) {
      filter.availability = availability;
    }

    const profiles = await Profile.find(filter)
      .populate({
        path: 'userId',
        match: minRating ? { ratingAvg: { $gte: Number(minRating) } } : {},
        select: 'name email ratingAvg totalJobs badges kycStatus'
      })
      .limit(50);

    // Filter out null userId (didn't match rating criteria)
    const filteredProfiles = profiles.filter(p => p.userId);

    res.json({ profiles: filteredProfiles });
  } catch (error) {
    res.status(500).json({ message: 'Error searching talent', error: error.message });
  }
};

// --- New functions for managing profile sections ---

export const addWorkExperience = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'workExperience', 'add', req.body);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkExperience = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'workExperience', 'update', { id: req.params.id, ...req.body });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkExperience = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'workExperience', 'delete', { id: req.params.id });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addEducation = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'education', 'add', req.body);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'education', 'update', { id: req.params.id, ...req.body });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'education', 'delete', { id: req.params.id });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addPortfolioItem = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'portfolio', 'add', req.body);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePortfolioItem = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'portfolio', 'update', { id: req.params.id, ...req.body });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePortfolioItem = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'portfolio', 'delete', { id: req.params.id });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCertification = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'certifications', 'add', req.body);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'certifications', 'update', { id: req.params.id, ...req.body });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCertification = async (req, res) => {
  try {
    const profile = await manageProfileSection(req.userId, 'certifications', 'delete', { id: req.params.id });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ message: 'Photo URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePhoto: photoUrl },
      { new: true }
    ).select('-password -refreshToken');

    res.json({ message: 'Profile photo updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating photo', error: error.message });
  }
};

export const getMyFullProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken');
    const profile = await Profile.findOne({ userId: req.userId });

    res.json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, bio, skills, location, availability, hourlyRate, experience } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone },
      { new: true }
    ).select('-password -refreshToken');

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { bio, skills, location, availability, hourlyRate, experience },
      { new: true, upsert: true }
    );

    res.json({ message: 'Profile updated', user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
