import mongoose from 'mongoose';

const jobOfferSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, { timestamps: true });

jobOfferSchema.index({ workerId: 1, status: 1 });
jobOfferSchema.index({ jobId: 1 });

export default mongoose.model('JobOffer', jobOfferSchema);
