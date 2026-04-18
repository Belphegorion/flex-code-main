import logger from '../config/logger.js';

/**
 * Wrapper for async route handlers to catch errors automatically
 * Prevents unhandled promise rejections
 */
export const asyncHandler = (fn) => {
  return (...args) => Promise.resolve(fn(...args)).catch(args[2]);
};

/**
 * Safe async wrapper for Express route handlers
 * Catches errors and passes to error handler middleware
 */
export const safeAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      logger.error('Async handler error', {
        requestId: req.id,
        error: error.message,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      next(error);
    }
  };
};

/**
 * Wrapper for Socket.io handlers to handle async errors
 */
export const safeSocketHandler = (handler) => {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      const socket = args[0];
      logger.error('Socket handler error', {
        userId: socket?.userId,
        error: error.message,
        event: socket?.event || 'unknown'
      });
      socket?.emit('error', { 
        success: false,
        message: 'Operation failed',
        code: 'SOCKET_ERROR'
      });
    }
  };
};

/**
 * Global unhandled rejection handler
 */
export const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason?.message || String(reason),
      stack: reason?.stack,
      timestamp: new Date().toISOString()
    });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    // Exit after logging to avoid running with inconsistent state
    process.exit(1);
  });
};

export default {
  asyncHandler,
  safeAsync,
  safeSocketHandler,
  setupGlobalErrorHandlers
};
