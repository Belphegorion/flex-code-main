import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['worker', 'organizer', 'sponsor', 'admin'],
    required: true
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  badges: [{
    type: String,
    enum: ['Rising Star', 'Pro', 'Elite', 'Verified']
  }],
  ratingAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  reliabilityScore: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1
  },
  noShowCount: {
    type: Number,
    default: 0
  },
  completedJobsCount: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profilePhoto: {
    type: String
  },
  aadhaarDocument: {
    url: String,
    uploadedAt: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  refreshToken: String
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);