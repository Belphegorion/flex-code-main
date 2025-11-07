import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.warn('Authentication attempt without token:', { timestamp: new Date().toISOString() });
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      console.warn('Token missing userId:', { decoded });
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      console.warn('User not found for token:', { userId: decoded.userId });
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isActive === false) {
      console.warn('Deactivated user access attempt:', { userId: user._id });
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Authentication error:', { error: error.message, timestamp: new Date().toISOString() });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'CastError') {
      return res.status(401).json({ message: 'Invalid user ID format' });
    }
    
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    next();
  };
};
