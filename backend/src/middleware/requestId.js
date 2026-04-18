import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Middleware to generate and attach request IDs for tracing
 * Enables end-to-end request tracking across logs
 */
export const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('x-request-id', req.id);
  res.locals.requestId = req.id;
  
  logger.debug(`[${req.id}] ${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  
  next();
};

export default requestIdMiddleware;
