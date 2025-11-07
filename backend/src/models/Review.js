import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  fromId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['organizer-to-pro', 'pro-to-organizer'],
    required: true
  }
}, {
  timestamps: true
});

// One review per user per job
reviewSchema.index({ fromId: 1, toId: 1, jobId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);