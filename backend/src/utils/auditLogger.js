import mongoose from 'mongoose';
import logger from '../config/logger.js';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now, index: true }
  },
  {
    timestamps: false,
    capped: { size: 104857600, max: 500000 } // 100MB, max 500k docs
  }
);

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export { AuditLog };

export const logAction = async (userId, action, resource, resourceId, details = {}, req = null) => {
  if (!userId || !action || !resource) {
    logger.warn('Audit log skipped: missing required parameters', { userId, action, resource });
    return;
  }

  try {
    // Extract IP address properly handling x-forwarded-for
    let ipAddress = 'unknown';
    if (req?.ip) {
      ipAddress = req.ip;
    } else if (req?.headers?.['x-forwarded-for']) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const forwardedFor = req.headers['x-forwarded-for'];
      if (typeof forwardedFor === 'string') {
        ipAddress = forwardedFor.split(',')[0].trim();
      } else if (Array.isArray(forwardedFor)) {
        ipAddress = forwardedFor[0];
      }
    }

    await AuditLog.create({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent: req?.headers?.['user-agent'] || 'unknown'
    });
  } catch (error) {
    logger.error('Audit log error:', error);
  }
};

export const getAuditLogs = async (filters = {}, limit = 100) => {
  return AuditLog.find(filters)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .lean();
};
