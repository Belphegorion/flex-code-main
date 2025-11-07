import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
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
  roles: [{
    type: String,
    required: true
  }],
  requiredSkills: [{
    type: String,
    required: true
  }],
  dateStart: {
    type: Date,
    required: true
  },
  dateEnd: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.dateStart;
      },
      message: 'End date must be after start date'
    }
  },
  location: {
    address: String,
    city: String,
    state: String,
    lat: Number,
    lng: Number
  },
  payPerPerson: {
    type: Number,
    required: true,
    min: 0
  },
  totalPositions: {
    type: Number,
    required: true,
    min: 1
  },
  positionsFilled: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.totalPositions;
      },
      message: 'Positions filled cannot exceed total positions'
    }
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  applicants: [{
    proId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  hiredPros: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  qrCode: {
    type: String
  },
  isEscrowCreated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
jobSchema.index({ eventId: 1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ dateStart: 1 });
jobSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default mongoose.model('Job', jobSchema);