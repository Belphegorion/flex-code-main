import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2000,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

export const authLimiter = rateLimit({
  windowMs: 120 * 60 * 1000, // 2 hours
  max: 10, // Slightly increased for better Docker auth handling
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  retry: true,
});

// Add specific limiter for notifications
export const notificationsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    error: 'Too many notification requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: (req) => req.user ? req.user.id : req.ip, // Rate limit per user if authenticated
});

// Add specific limiter for groups
export const groupsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    error: 'Too many group requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
});

// Add websocket connections limiter
export const websocketLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 connection attempts
  message: {
    error: 'Too many connection attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

// Helper function to handle rate limit errors
export const handleRateLimitError = (err, req, res, next) => {
  if (err instanceof Error && err.status === 429) {
    return res.status(429).json({
      error: err.message,
      retryAfter: err.headers['Retry-After']
    });
  }
  next(err);
};