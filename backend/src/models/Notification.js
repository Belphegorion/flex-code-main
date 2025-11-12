import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['application', 'acceptance', 'rejection', 'message', 'group', 'call', 'system', 'qr_code', 'job_created', 'job_cancelled', 'welcome'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: {
    type: String,
    enum: ['Job', 'Application', 'Chat', 'GroupChat', 'User', 'Event']
  },
  actionUrl: { type: String },

  // Delivery lifecycle
  status: { type: String, enum: ['pending', 'queued', 'delivered', 'failed'], default: 'pending', index: true },
  deliveryAttempts: { type: Number, default: 0 },
  deliveredAt: { type: Date },

  // Read state
  read: { type: Boolean, default: false, index: true },
  readAt: { type: Date },

  // Idempotency for enqueue
  idempotencyKey: { type: String, index: true, unique: false },

  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
