import mongoose from 'mongoose';

const coOrganizerSchema = new mongoose.Schema({
  // New fields
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', index: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coOrganizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Legacy compatibility fields (event-based)
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  permissions: {
    canEditJob: { type: Boolean, default: false },
    canManageApplicants: { type: Boolean, default: true },
    canManageAttendance: { type: Boolean, default: true },
    canSendMessages: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: false },
    canProcessPayments: { type: Boolean, default: false }
  },
  
  invitationStatus: { type: String, enum: ['pending', 'accepted', 'declined', 'revoked'], default: 'pending' },
  invitedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  lastActiveAt: Date,
  
  actions: [{
    type: String,
    description: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

coOrganizerSchema.index({ jobId: 1, coOrganizerId: 1 }, { unique: false });
coOrganizerSchema.index({ eventId: 1, userId: 1 }, { unique: false });
coOrganizerSchema.index({ coOrganizerId: 1, invitationStatus: 1 });

export default mongoose.model('CoOrganizer', coOrganizerSchema);
