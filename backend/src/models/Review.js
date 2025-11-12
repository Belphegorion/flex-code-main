import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  
  categories: {
    communication: { type: Number, min: 1, max: 5, required: true },
    professionalism: { type: Number, min: 1, max: 5, required: true },
    quality: { type: Number, min: 1, max: 5, required: true },
    timeliness: { type: Number, min: 1, max: 5, required: true }
  },
  
  overallRating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, required: true, maxlength: 100 },
  content: { type: String, required: true, maxlength: 1000 },
  
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: String, enum: ['attendance', 'payment', 'manual'], default: 'attendance' },
  verifiedAt: Date,
  
  response: {
    content: { type: String, maxlength: 500 },
    createdAt: Date,
    helpful: { type: Number, default: 0 }
  },
  
  isPrivate: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
  hiddenReason: String,
  
  helpfulVotes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    votedAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  flags: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, enum: ['inappropriate', 'fake', 'spam'] },
    createdAt: { type: Date, default: Date.now }
  }]
});

reviewSchema.index({ subjectId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1, subjectId: 1 }, { unique: true });
reviewSchema.index({ jobId: 1 });

reviewSchema.pre('save', function(next) {
  const { communication, professionalism, quality, timeliness } = this.categories;
  this.overallRating = (communication + professionalism + quality + timeliness) / 4;
  this.updatedAt = new Date();
  next();
});

reviewSchema.methods.verify = async function() {
  try {
    const Timesheet = mongoose.model('Timesheet');
    const [reviewerSheet, subjectSheet] = await Promise.all([
      Timesheet.findOne({ jobId: this.jobId, workerId: this.reviewerId, status: 'checked-out' }),
      Timesheet.findOne({ jobId: this.jobId, workerId: this.subjectId, status: 'checked-out' })
    ]);
    if (reviewerSheet && subjectSheet) {
      this.isVerified = true;
      this.verifiedAt = new Date();
      await this.save();
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`Verification failed: ${error.message}`);
  }
};

export default mongoose.model('Review', reviewSchema);