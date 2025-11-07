import mongoose from 'mongoose';

const coOrganizerSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: {
    canHireWorkers: { type: Boolean, default: true },
    canManageJobs: { type: Boolean, default: true },
    canViewFinancials: { type: Boolean, default: false },
    canEditEvent: { type: Boolean, default: false },
    canManageGroups: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  elevatedFrom: {
    type: String,
    enum: ['hired', 'worker'],
    required: true
  }
}, {
  timestamps: true
});

coOrganizerSchema.index({ eventId: 1, userId: 1 }, { unique: true });
coOrganizerSchema.index({ eventId: 1, status: 1 });

export default mongoose.model('CoOrganizer', coOrganizerSchema);
