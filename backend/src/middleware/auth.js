import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import tokenService from '../services/TokenService.js';
import logger from '../config/logger.js';
import { AuthorizationError } from '../utils/AppError.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AuthorizationError('No token provided');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (await tokenService.isTokenBlacklisted(decoded.tokenId)) {
      throw new AuthorizationError('Token has been revoked');
    }
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AuthorizationError('User not found or inactive');
    }
    // Backward compatibility: set both user and userId
    req.user = user;
    req.userId = user._id;
    req.auth = { id: user._id, role: user.role, tokenId: decoded.tokenId };
    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message });
    res.status(error.statusCode || 401).json({ success: false, message: error.message });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};
