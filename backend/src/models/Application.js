import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  proId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'no-show'],
    default: 'pending'
  },
  hoursWorked: {
    type: Number,
    default: 0,
    min: 0
  },
  checkInTimestamps: [{
    type: {
      type: String,
      enum: ['check-in', 'check-out']
    },
    timestamp: Date,
    location: {
      lat: Number,
      lng: Number
    }
  }],
  coverLetter: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Ensure one application per pro per job
applicationSchema.index({ jobId: 1, proId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);