import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentIntentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'escrowed', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'mock'],
    default: 'mock'
  },
  releaseDetails: [{
    proId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    releasedAt: Date,
    transferId: String
  }],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);