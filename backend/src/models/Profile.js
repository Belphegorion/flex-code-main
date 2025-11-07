import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // Can be null if current job
  description: { type: String, maxlength: 1000 }
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String },
  fieldOfStudy: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, maxlength: 500 }
});

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, maxlength: 1000 },
  imageUrl: { type: String },
  projectUrl: { type: String }
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: Date },
  credentialId: { type: String }
});

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String
  }],
  bio: {
    type: String,
    maxlength: 1500
  },
  tagline: {
    type: String,
    maxlength: 100
  },
  videoIntroUrl: {
    type: String
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    lat: {
      type: Number,
      min: -90,
      max: 90,
      validate: {
        validator: function(v) {
          return v === null || v === undefined || (v >= -90 && v <= 90);
        },
        message: 'Latitude must be between -90 and 90 degrees'
      }
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
      validate: {
        validator: function(v) {
          return v === null || v === undefined || (v >= -180 && v <= 180);
        },
        message: 'Longitude must be between -180 and 180 degrees'
      }
    }
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'flexible'],
    default: 'flexible'
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  languages: [{
    language: String,
    proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'] }
  }],
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    github: String,
    portfolio: String,
    website: String
  },
  preferences: {
    jobTypes: [String],
    industries: [String],
    travelWillingness: { type: String, enum: ['no', 'local', 'regional', 'national', 'international'] },
    remoteWork: Boolean,
    teamSize: { type: String, enum: ['solo', 'small', 'medium', 'large', 'any'] }
  },
  yearsOfExperience: {
    type: Number,
    min: 0
  },
  workExperience: [workExperienceSchema],
  education: [educationSchema],
  portfolio: [portfolioItemSchema],
  certifications: [certificationSchema]
}, {
  timestamps: true
});

// Indexes for searching and filtering
profileSchema.index({ skills: 1 });
profileSchema.index({ 'location.city': 1 });
profileSchema.index({ 'userId': 1 });

export default mongoose.model('Profile', profileSchema);
