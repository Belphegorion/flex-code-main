import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { startScheduledJobs } from './utils/scheduler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { securityHeaders, customSecurity } from './middleware/security.js';
import { createDatabaseIndexes } from './utils/createIndexes.js';
import { AuditLog, logAction } from './utils/auditLogger.js';
import sanitizeInput from './middleware/sanitizer.js';
import logger from './config/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { setupGlobalErrorHandlers } from './utils/errorHandlers.js';
import jobRoutesV2 from './routes/v2/jobs.js';

// Routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import profileRoutes from './routes/profiles.js';
import applicationRoutes from './routes/applications.js';
import escrowRoutes from './routes/escrow.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import eventRoutes from './routes/events.js';
import eventWorkerRoutes from './routes/eventWorkers.js';
import profileSetupRoutes from './routes/profileSetup.js';
import notificationRoutes from './routes/notifications.js';
import groupRoutes from './routes/groups.js';
import sponsorRoutes from './routes/sponsors.js';
import workScheduleRoutes from './routes/workSchedule.js';
import badgeRoutes from './routes/badges.js';
import documentRoutes from './routes/documents.js';
import analyticsRoutes from './routes/analytics.js';
import coOrganizerRoutes from './routes/coOrganizers.js';
import workerDirectoryRoutes from './routes/workerDirectory.js';

dotenv.config();

// Setup global error handlers for unhandled rejections and uncaught exceptions
setupGlobalErrorHandlers();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  logger.error('CRITICAL: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

if (!process.env.JWT_REFRESH_SECRET) {
  logger.error('CRITICAL: JWT_REFRESH_SECRET environment variable is not set!');
  process.exit(1);
}

if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  logger.error('CRITICAL: MONGO_URI or MONGODB_URI environment variable is not set!');
  process.exit(1);
}

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  logger.warn('WARNING: Cloudinary environment variables not set. Image uploads will fail.');
}

logger.info('Environment check:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'SET' : 'NOT SET'
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.CORS_ORIGIN === '*'
        ? true
        : [process.env.FRONTEND_URL || 'http://localhost:3000', 'https://eventflex.vercel.app'],
    credentials: true
  }
});

// Connect to Database
connectDB().then(async () => {
  // Create database indexes for performance
  try {
    await createDatabaseIndexes();
    logger.info('Database indexes initialized');
  } catch (error) {
    logger.error('Failed to create database indexes:', error);
  }

  // Log server startup
  try {
    await logAction(
      new mongoose.Types.ObjectId(), // System user
      'SERVER_START',
      'System',
      null,
      {
        details: {
          environment: process.env.NODE_ENV || 'development',
          port: process.env.PORT || 4000,
          timestamp: new Date().toISOString()
        },
        ipAddress: 'localhost'
      }
    );
  } catch (error) {
    logger.error('Failed to log server startup:', error);
  }
});

// Start scheduled jobs
startScheduledJobs();

// CORS
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === '*'
        ? true
        : [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'https://eventflex.vercel.app'
          ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
// Request ID generation for tracing
app.use(requestIdMiddleware);
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Input sanitizer
app.use(sanitizeInput);

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    headers: req.headers.authorization ? 'Bearer ***' : 'No Auth',
    body: req.method === 'POST' ? 'Has Body' : 'No Body'
  });
  next();
});

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Compression
app.use(compression());

// Security Middleware
app.use(customSecurity);
if (process.env.NODE_ENV === 'production') {
  app.use(securityHeaders);
  app.use('/api/', apiLimiter);
} else {
  logger.debug('Development mode: Rate limiting disabled');
}

// Socket.io setup
io.on('connection', (socket) => {
  logger.info('User connected:', { socketId: socket.id });

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', (data) => {
    io.to(data.chatId).emit('receive-message', data);
  });

  socket.on('join-event', (eventId) => {
    socket.join(`event_${eventId}`);
  });

  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('join-group', (groupId) => {
    socket.join(`group_${groupId}`);
  });

  // Job alerts subscription - workers can subscribe to receive new job notifications
  socket.on('subscribe_job_alerts', (userId) => {
    if (!userId) {
      logger.warn('Subscribe job alerts: No user ID provided');
      return;
    }
    socket.join(`job_alerts:${userId}`);
    logger.info('Worker subscribed to job alerts', { userId, socketId: socket.id });
  });

  // Job alerts unsubscribe
  socket.on('unsubscribe_job_alerts', (userId) => {
    if (!userId) return;
    socket.leave(`job_alerts:${userId}`);
    logger.info('Worker unsubscribed from job alerts', { userId, socketId: socket.id });
  });

  socket.on('video-signal', (data) => {
    socket.to(data.to).emit('video-signal', data);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', { socketId: socket.id });
    // Explicitly leave all rooms
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check (before routes to avoid auth)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Removed /api/debug endpoint as it exposes internal request headers

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-workers', eventWorkerRoutes);
app.use('/api/profile-setup', profileSetupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/work-schedule', workScheduleRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/co-organizers', coOrganizerRoutes);
app.use('/api/worker-directory', workerDirectoryRoutes);

// Routes - API v2 (optimized endpoints with aggregation pipelines and request tracking)
app.use('/api/v2/jobs', jobRoutesV2);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
export { io };
