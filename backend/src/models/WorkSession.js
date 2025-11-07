import mongoose from 'mongoose';

const workSessionSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: Date,
  totalHours: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  earnings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    default: 'checked-in'
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  }
}, {
  timestamps: true
});

// Calculate earnings when session is completed
workSessionSchema.pre('save', function(next) {
  if (this.checkOutTime && this.checkInTime) {
    const hours = (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60);
    this.totalHours = Math.round(hours * 100) / 100; // Round to 2 decimal places
    this.earnings = this.totalHours * this.hourlyRate;
  }
  next();
});

export default mongoose.model('WorkSession', workSessionSchema);