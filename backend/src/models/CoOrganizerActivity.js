import mongoose from 'mongoose';

const coOrganizerActivitySchema = new mongoose.Schema({
  coOrganizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoOrganizer',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['hired_worker', 'created_job', 'edited_event', 'created_group', 'managed_application']
  },
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

coOrganizerActivitySchema.index({ coOrganizerId: 1, timestamp: -1 });
coOrganizerActivitySchema.index({ eventId: 1, timestamp: -1 });

export default mongoose.model('CoOrganizerActivity', coOrganizerActivitySchema);
