import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import WorkSession from '../models/WorkSession.js';
import { calculateBadge } from '../utils/badgeSystem.js';

export const register = async (req, res) => {
  // Basic input validation to return clearer 4xx errors instead of a generic 500
  const { name, email, phone, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    // Create profile for workers or sponsors
    if (role === 'worker') {
      await Profile.create({ userId: user._id, skills: [] });
    } else if (role === 'sponsor') {
      const Sponsor = (await import('../models/Sponsor.js')).default;
      await Sponsor.create({
        userId: user._id, 
        companyName: name,
        sponsoredEvents: [] 
      });
    }

    // Generate tokens
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return res.status(500).json({ message: 'JWT secrets not configured on server' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted || false,
        profilePhoto: user.profilePhoto
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: Object.values(error.errors).map(e => e.message) });
    }

    // Duplicate key (unique) error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `${field} already exists` });
    }

    // Generic user exists handling (fallback)
    if (error.message === 'User already exists') {
      return res.status(400).json({ message: error.message });
    }

    // Default to 500
    return res.status(500).json({ message: error.message || 'Error registering user' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected:', { readyState: mongoose.connection.readyState });
      return res.status(503).json({ message: 'Database connection unavailable' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('Login attempt with non-existent email:', { email, timestamp: new Date().toISOString() });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('Failed login attempt:', { email, userId: user._id, timestamp: new Date().toISOString() });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if active
    if (!user.isActive) {
      console.warn('Login attempt on deactivated account:', { email, userId: user._id, timestamp: new Date().toISOString() });
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Generate tokens
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets not configured');
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Get user badge
    const sessions = await WorkSession.find({ workerId: user._id, status: 'checked-out' });
    const totalHours = sessions.reduce((sum, session) => sum + session.totalHours, 0);
    const eventIds = [...new Set(sessions.map(session => session.eventId.toString()))];
    const badge = calculateBadge(totalHours, eventIds.length);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        badges: user.badges,
        ratingAvg: user.ratingAvg,
        profileCompleted: user.profileCompleted,
        profilePhoto: user.profilePhoto,
        badge
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', { email: email || 'unknown', error: error.message, stack: error.stack, timestamp: new Date().toISOString() });
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', { error: error.message, timestamp: new Date().toISOString() });
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection unavailable' });
    }

    const user = await User.findById(req.userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user badge
    const sessions = await WorkSession.find({ workerId: user._id, status: 'checked-out' });
    const totalHours = sessions.reduce((sum, session) => sum + session.totalHours, 0);
    const eventIds = [...new Set(sessions.map(session => session.eventId.toString()))];
    const badge = calculateBadge(totalHours, eventIds.length);

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        badges: user.badges,
        ratingAvg: user.ratingAvg,
        profileCompleted: user.profileCompleted,
        profilePhoto: user.profilePhoto,
        badge
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', { userId: req.userId, error: error.message });
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
