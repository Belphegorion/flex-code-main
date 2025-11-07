import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  venue: {
    name: String,
    type: { type: String, enum: ['indoor', 'outdoor', 'hybrid'] },
    capacity: Number,
    facilities: [String],
    contactPerson: {
      name: String,
      phone: String,
      email: String
    },
    rentalCost: Number,
    setupRequirements: String
  },
  eventType: {
    type: String,
    enum: ['conference', 'concert', 'festival', 'workshop', 'seminar', 'exhibition', 'sports', 'wedding', 'corporate', 'other'],
    required: true
  },
  attendees: {
    expectedCount: { type: Number, min: 1 },
    registeredCount: { type: Number, default: 0 },
    checkedInCount: { type: Number, default: 0 },
    demographics: {
      ageGroups: [{
        range: String,
        percentage: Number
      }],
      interests: [String]
    }
  },
  customFields: [{
    fieldName: String,
    fieldType: { type: String, enum: ['text', 'number', 'boolean', 'date', 'select'] },
    fieldValue: mongoose.Schema.Types.Mixed,
    options: [String], // For select type
    isRequired: { type: Boolean, default: false }
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
  ticketImage: {
    url: String,
    publicId: String
  },
  videoCallActive: {
    type: Boolean,
    default: false
  },
  videoCallId: String,
  qrCode: String,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tickets: {
    totalDispersed: { type: Number, default: 0, min: 0 },
    totalSold: { 
      type: Number, 
      default: 0, 
      min: 0,
      validate: {
        validator: function(value) {
          return value <= this.tickets.totalDispersed;
        },
        message: 'Tickets sold cannot exceed total dispersed'
      }
    },
    pricePerTicket: { type: Number, default: 0, min: 0 }
  },
  expenses: [{
    category: String,
    description: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  estimatedExpenses: [{
    category: String,
    description: String,
    estimatedAmount: Number
  }],

  revenue: { type: Number, default: 0 },
  estimatedProfit: { type: Number, default: 0 },
  sponsors: [{
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    sponsoredAt: Date,
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupChat'
    }
  }],
  eventSettings: {
    isPublic: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: false },
    allowWaitlist: { type: Boolean, default: false },
    maxWaitlistSize: Number,
    cancellationPolicy: String,
    refundPolicy: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Event', eventSchema);
