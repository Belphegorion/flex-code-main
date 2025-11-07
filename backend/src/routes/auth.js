import express from 'express';
import { body } from 'express-validator';
import { register, login, refresh, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiter only in production
const rateLimiterMiddleware = process.env.NODE_ENV === 'production' ? [authLimiter] : [];

router.post('/register', ...rateLimiterMiddleware, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['worker', 'organizer', 'sponsor', 'admin']).withMessage('Invalid role'),
  validate
], register);

router.post('/login', ...rateLimiterMiddleware, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], login);

router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate
], refresh);

router.get('/profile', authenticate, getProfile);

export default router;