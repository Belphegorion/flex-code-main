import mongoose from 'mongoose';

const workScheduleSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weeklySchedule: {
    monday: { startTime: String, endTime: String, isActive: { type: Boolean, default: false } },
    tuesday: { startTime: String, endTime: String, isActive: { type: Boolean, default: false } },
    wednesday: { startTime: String, endTime: String, isActive: { type: Boolean, default: false } },
    thursday: { startTime: String, endTime: String, isActive: { type: Boolean, default: false } },
    friday: { startTime: String, endTime: String, isActive: { type: Boolean, default: false } },
    saturday: { startTime: String, endTime: String, isActive: { type: Boolean, default: false } },
    sunday: { startTime: String, endTime: String, isActive: { type: Boolean, default: false } }
  },
  qrCode: String,
  qrToken: String,
  qrExpiry: Date,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('WorkSchedule', workScheduleSchema);