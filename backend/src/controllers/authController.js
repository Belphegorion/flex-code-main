import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import tokenService from '../services/TokenService.js';
import notificationService from '../services/NotificationService.js';
import logger from '../config/logger.js';
import WorkSession from '../models/WorkSession.js';
import { calculateBadge } from '../utils/badgeSystem.js';

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }
    if (!['worker', 'organizer', 'sponsor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be worker, organizer, sponsor, or admin' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
    }
    const saltRounds = process.env.NODE_ENV === 'production' ? 14 : 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, email, phone, password: hashedPassword, role });

    const deviceId = req.headers['user-agent'] || 'unknown';
    const access = tokenService.generateAccessToken(user._id, user.role, deviceId);
    const refresh = tokenService.generateRefreshToken(user._id, deviceId);
    await tokenService.storeRefreshToken(user._id, refresh.tokenId, { device: req.headers['user-agent'], ip: req.ip });

    await notificationService.create({
      userId: user._id,
      type: 'welcome',
      title: 'Welcome to EventFlex!',
      message: 'Complete your profile to start using the platform',
      actionUrl: '/profile/setup'
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profileCompleted: user.profileCompleted || false, profilePhoto: user.profilePhoto },
      accessToken: access.token,
      refreshToken: refresh.token
    });
  } catch (error) {
    logger.error('Register error', { error: error.message });
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `${field} already exists` });
    }
    return res.status(500).json({ message: error.message || 'Error registering user' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    const deviceId = req.headers['user-agent'] || 'unknown';
    const access = tokenService.generateAccessToken(user._id, user.role, deviceId);
    const refresh = tokenService.generateRefreshToken(user._id, deviceId);
    await tokenService.storeRefreshToken(user._id, refresh.tokenId, { device: req.headers['user-agent'], ip: req.ip });

    const sessions = await WorkSession.find({ workerId: user._id, status: 'checked-out' });
    const totalHours = sessions.reduce((sum, session) => sum + session.totalHours, 0);
    const eventIds = [...new Set(sessions.map(session => session.eventId?.toString()).filter(Boolean))];
    const badge = calculateBadge(totalHours, eventIds.length);

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, kycStatus: user.kycStatus, badges: user.badges, ratingAvg: user.ratingAvg, profileCompleted: user.profileCompleted, profilePhoto: user.profilePhoto, badge },
      accessToken: access.token,
      refreshToken: refresh.token
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
    const tokenData = await tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(tokenData.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    const newAccess = tokenService.generateAccessToken(user._id, user.role, tokenData.deviceId);
    res.json({ accessToken: newAccess.token });
  } catch (error) {
    logger.error('Refresh token error', { error: error.message });
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }
    const user = await User.findById(req.userId).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const sessions = await WorkSession.find({ workerId: user._id, status: 'checked-out' });
    const totalHours = sessions.reduce((sum, session) => sum + session.totalHours, 0);
    const eventIds = [...new Set(sessions.map(session => session.eventId?.toString()).filter(Boolean))];
    const badge = calculateBadge(totalHours, eventIds.length);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, kycStatus: user.kycStatus, badges: user.badges, ratingAvg: user.ratingAvg, profileCompleted: user.profileCompleted, profilePhoto: user.profilePhoto, badge } });
  } catch (error) {
    logger.error('Profile fetch error', { error: error.message });
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.tokenId) {
        await tokenService.revokeToken(decoded.userId, decoded.tokenId);
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};
