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
  coOrganizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoOrganizer'
  }],
  location: {
    address: String,
    lat: { 
      type: Number,
      min: -90,
      max: 90,
      validate: {
        validator: function(v) {
          return v === undefined || v === null || (v >= -90 && v <= 90);
        },
        message: 'Latitude must be between -90 and 90'
      }
    },
    lng: { 
      type: Number,
      min: -180,
      max: 180,
      validate: {
        validator: function(v) {
          return v === undefined || v === null || (v >= -180 && v <= 180);
        },
        message: 'Longitude must be between -180 and 180'
      }
    }
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
    totalSold: { type: Number, default: 0, min: 0 },
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

// Pre-save validation
eventSchema.pre('save', function(next) {
  // Validate tickets
  if (this.tickets.totalSold > this.tickets.totalDispersed) {
    return next(new Error('Tickets sold cannot exceed total dispersed'));
  }
  
  // Validate dates
  if (this.dateEnd <= this.dateStart) {
    return next(new Error('End date must be after start date'));
  }
  
  // Validate attendees
  if (this.attendees.registeredCount > this.attendees.expectedCount) {
    return next(new Error('Registered count cannot exceed expected count'));
  }
  
  if (this.attendees.checkedInCount > this.attendees.registeredCount) {
    return next(new Error('Checked-in count cannot exceed registered count'));
  }
  
  // Calculate revenue
  if (this.tickets.totalSold && this.tickets.pricePerTicket) {
    this.revenue = this.tickets.totalSold * this.tickets.pricePerTicket;
  }
  
  // Calculate estimated profit
  const totalExpenses = this.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  this.estimatedProfit = this.revenue - totalExpenses;
  
  next();
});

// Pre-update validation
eventSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  if (update.$set && update.$set.tickets) {
    const { totalSold, totalDispersed } = update.$set.tickets;
    if (totalSold > totalDispersed) {
      return next(new Error('Tickets sold cannot exceed total dispersed'));
    }
  }
  
  next();
});

export default mongoose.model('Event', eventSchema);
