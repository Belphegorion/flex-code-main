import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: 'US' },
  coordinates: { type: [Number], index: '2dsphere' }
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  isCurrent: Boolean,
  description: String,
  achievements: [String]
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: String,
  issueDate: Date,
  expiryDate: Date,
  credentialId: String,
  credentialUrl: String,
  isVerified: { type: Boolean, default: false }
});

const portfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  mediaUrl: String,
  mediaType: { type: String, enum: ['image', 'video', 'document'] },
  eventName: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['worker', 'organizer', 'sponsor', 'admin'], required: true },
  // Preserve original fields for backward compatibility
  name: String,
  phone: String,
  bio: String,
  profilePhoto: String,
  skills: [String],
  badges: [String],
  // New nested profile structure
  profileData: {
    worker: {
      professionalHeadline: { type: String, maxlength: 120 },
      rate: {
        hourly: { type: Number, min: 0 },
        daily: { type: Number, min: 0 },
        negotiable: { type: Boolean, default: true }
      },
      availability: {
        status: { type: String, enum: ['available', 'busy', 'away'], default: 'available' },
        calendar: [{
          date: Date,
          availability: { type: String, enum: ['available', 'partial', 'unavailable'] },
          note: String
        }]
      },
      experience: [experienceSchema],
      certifications: [certificationSchema],
      portfolio: [portfolioSchema],
      equipment: [{ type: String }],
      transportation: {
        hasVehicle: Boolean,
        vehicleType: String,
        canTravel: { type: Boolean, default: true },
        maxDistance: Number
      },
      languages: [{
        code: String,
        name: String,
        proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'] }
      }],
      preferences: {
        eventTypes: [String],
        minPayRate: Number,
        locations: [String],
        willingToTravel: { type: Boolean, default: false }
      },
      stats: {
        totalHours: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        jobSuccessScore: { type: Number, default: 0 },
        onTimeRate: { type: Number, default: 0 },
        responseRate: { type: Number, default: 0 },
        repeatClientRate: { type: Number, default: 0 }
      },
      verification: {
        identity: { status: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' }, verifiedAt: Date },
        backgroundCheck: { status: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' }, verifiedAt: Date },
        badges: [{
          type: { type: String, enum: ['identity', 'background', 'skill', 'top_rated'] },
          issuedAt: { type: Date, default: Date.now },
          expiresAt: Date
        }]
      }
    },
    
    organizer: {
      company: {
        name: String,
        website: String,
        logoUrl: String,
        bannerUrl: String,
        taxId: String,
        businessType: String,
        yearFounded: Number,
        size: { type: String, enum: ['solo', 'small', 'medium', 'large'] }
      },
      businessVerification: {
        status: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
        documents: [String],
        verifiedAt: Date
      },
      contact: {
        phone: String,
        alternativeEmail: String,
        address: addressSchema
      },
      socialMedia: {
        linkedin: String,
        facebook: String,
        twitter: String,
        instagram: String
      },
      specializations: [{
        category: String,
        subcategories: [String],
        experienceYears: Number
      }],
      eventStats: {
        totalEvents: { type: Number, default: 0 },
        totalWorkersHired: { type: Number, default: 0 },
        totalAttendees: { type: Number, default: 0 },
        averageBudget: { type: Number, default: 0 },
        averageWorkerRating: { type: Number, default: 0 },
        responseRate: { type: Number, default: 0 },
        onTimePaymentRate: { type: Number, default: 0 },
        cancellationRate: { type: Number, default: 0 }
      },
      preferences: {
        communicationMethod: { type: String, enum: ['app', 'email', 'phone'], default: 'app' },
        autoApproveApplications: { type: Boolean, default: false },
        requireInterview: { type: Boolean, default: true },
        paymentTerms: { type: String, enum: ['net_7', 'net_15', 'net_30'], default: 'net_15' }
      }
    },
    
    sponsor: {
      company: {
        name: { type: String, required: function() { return this.role === 'sponsor'; } },
        industry: { type: String, required: true },
        website: String,
        logoUrl: String,
        description: String,
        headquarters: addressSchema
      },
      sponsorshipPreferences: {
        eventTypes: [String],
        budgetRange: {
          min: { type: Number, default: 0 },
          max: { type: Number, default: 100000 }
        },
        preferredLocations: [String],
        brandingRequirements: [{
          type: { type: String, enum: ['logo', 'booth', 'speaking_slot', 'naming_rights'] },
          priority: { type: String, enum: ['required', 'preferred', 'optional'] }
        }],
        activationGoals: [String]
      },
      stats: {
        totalSponsorships: { type: Number, default: 0 },
        totalSpend: { type: Number, default: 0 },
        averageActivationRate: { type: Number, default: 0 },
        activeDeals: { type: Number, default: 0 }
      },
      contactPerson: {
        name: String,
        title: String,
        email: String,
        phone: String,
        isPrimary: Boolean
      }
    }
  },
  // Enhanced rating system
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    breakdown: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 }
    }
  },
  
  // Enhanced reviews
  reviews: [{
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100 },
    content: { type: String, maxlength: 1000 },
    isVerified: { type: Boolean, default: false },
    verifiedBy: String,
    categories: {
      communication: Number,
      professionalism: Number,
      quality: Number,
      timeliness: Number
    },
    response: {
      content: String,
      createdAt: Date
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    helpful: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false }
  }],
  contactInfo: {
    phone: {
      number: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date
    }
  },
  
  privacySettings: {
    showContactInfo: { type: Boolean, default: false },
    showEarnings: { type: Boolean, default: false },
    showEventStats: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  lastLogin: { type: Date },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    location: String
  }],
  onboarding: {
    step: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false },
    completedAt: Date
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'profileData.worker.stats.jobSuccessScore': -1 });
userSchema.index({ 'profileData.organizer.eventStats.totalEvents': -1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.calculateJobSuccessScore = function() {
  if (this.role === 'worker' && this.profileData.worker) {
    const stats = this.profileData.worker.stats;
    const onTimeWeight = stats.onTimeRate * 0.4;
    const responseWeight = stats.responseRate * 0.3;
    const repeatWeight = stats.repeatClientRate * 0.3;
    return Math.round((onTimeWeight + responseWeight + repeatWeight) * 100);
  }
  return 0;
};

export default mongoose.model('User', userSchema);