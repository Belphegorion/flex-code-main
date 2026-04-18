import logger from '../config/logger.js';

/**
 * Structured logging utilities for consistent log formatting
 */

export const logRequest = (req, action, details = {}) => {
  logger.info(`[${action}]`, {
    requestId: req.id,
    userId: req.userId || 'anonymous',
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logError = (req, action, error, details = {}) => {
  logger.error(`[${action}] ERROR`, {
    requestId: req.id,
    userId: req.userId || 'anonymous',
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logPerformance = (req, action, duration, isSlow = false) => {
  const level = isSlow ? 'warn' : 'debug';
  logger[level](`[${action}] PERFORMANCE`, {
    requestId: req.id,
    userId: req.userId || 'anonymous',
    durationMs: duration,
    slow: isSlow,
    threshold: 1000,
    timestamp: new Date().toISOString()
  });
};

export const logSuccess = (req, action, details = {}) => {
  logger.info(`[${action}] SUCCESS`, {
    requestId: req.id,
    userId: req.userId || 'anonymous',
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Log database operation performance
 */
export const logDbOperation = (operation, collectionName, duration, queryCount = 1) => {
  if (duration > 1000) {
    logger.warn(`[DB] Slow query detected`, {
      operation,
      collection: collectionName,
      durationMs: duration,
      queryCount,
      timestamp: new Date().toISOString()
    });
  } else {
    logger.debug(`[DB] ${operation}`, {
      collection: collectionName,
      durationMs: duration,
      queryCount
    });
  }
};

/**
 * Mask sensitive information in logs
 */
export const maskEmail = (email) => {
  if (!email) return 'unknown';
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};

export const maskPhone = (phone) => {
  if (!phone) return 'unknown';
  return `***${phone.substring(phone.length - 4)}`;
};

export const maskToken = (token) => {
  if (!token) return 'unknown';
  return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
};

export default {
  logRequest,
  logError,
  logPerformance,
  logSuccess,
  logDbOperation,
  maskEmail,
  maskPhone,
  maskToken
};
