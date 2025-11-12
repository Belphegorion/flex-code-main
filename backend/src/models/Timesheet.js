import mongoose from 'mongoose';

const timesheetSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  
  shiftDate: { type: Date, required: true, index: true },
  scheduledStart: { type: Date, required: true },
  scheduledEnd: { type: Date, required: true },
  scheduledDuration: Number,
  
  actualStart: { type: Date },
  actualEnd: { type: Date },
  actualDuration: { type: Number, default: 0 },
  
  breaks: [{
    start: Date,
    end: Date,
    duration: Number,
    type: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }
  }],
  
  checkInLocation: {
    coordinates: [Number],
    accuracy: Number,
    address: String
  },
  checkOutLocation: {
    coordinates: [Number],
    accuracy: Number,
    address: String
  },
  locationVerified: { type: Boolean, default: false },
  
  status: { type: String, enum: ['scheduled', 'checked-in', 'checked-out', 'no-show', 'cancelled'], default: 'scheduled', index: true },
  
  payRate: { type: Number, required: true },
  totalEarnings: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'approved', 'paid', 'disputed'], default: 'pending', index: true },
  paidAt: Date,
  paymentId: String,
  
  approvedBy: mongoose.Schema.Types.ObjectId,
  approvedAt: Date,
  
  dispute: {
    raisedBy: mongoose.Schema.Types.ObjectId,
    reason: String,
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    resolution: String,
    resolvedAt: Date
  },
  
  workerNotes: String,
  organizerNotes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

timesheetSchema.index({ workerId: 1, shiftDate: -1 });
timesheetSchema.index({ jobId: 1, shiftDate: 1 });

timesheetSchema.pre('save', function(next) {
  if (this.actualStart && this.actualEnd) {
    const breakDuration = (this.breaks || []).reduce((sum, b) => sum + (b.duration || 0), 0);
    const duration = (this.actualEnd - this.actualStart) / (1000 * 60 * 60) - breakDuration;
    this.actualDuration = Math.max(0, duration);
    this.totalEarnings = this.actualDuration * this.payRate;
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Timesheet', timesheetSchema);


