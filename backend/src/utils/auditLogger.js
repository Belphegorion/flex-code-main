import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now, index: true }
}, { 
  timestamps: false,
  capped: { size: 10485760, max: 50000 } // 10MB, max 50k docs
});

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export { AuditLog };

export const logAction = async (userId, action, resource, resourceId, details = {}, req = null) => {
  if (!userId || !action || !resource) {
    console.warn('Audit log skipped: missing required parameters');
    return;
  }
  
  try {
    await AuditLog.create({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || 'unknown',
      userAgent: req?.headers?.['user-agent'] || 'unknown'
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

export const getAuditLogs = async (filters = {}, limit = 100) => {
  return AuditLog.find(filters)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .lean();
};
