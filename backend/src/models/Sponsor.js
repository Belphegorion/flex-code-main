import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  industry: String,
  website: String,
  sponsorshipBudget: {
    type: Number,
    min: 0
  },
  interestedCategories: [{
    type: String
  }],
  sponsoredEvents: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    amount: Number,
    sponsoredAt: Date
  }]
}, {
  timestamps: true
});

export default mongoose.model('Sponsor', sponsorSchema);
