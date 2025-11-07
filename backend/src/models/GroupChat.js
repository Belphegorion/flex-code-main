import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  fileUrl: String,
  read: Boolean,
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const groupChatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [groupMessageSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  avatar: String,
  lastMessage: String,
  lastMessageAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  qrCode: String,
  qrCodeExpiry: Date,
  sessionScheduled: {
    type: Boolean,
    default: false
  },
  sessionDate: Date,
  sessionTime: String,
  allowedWorkers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

groupChatSchema.index({ eventId: 1 });
groupChatSchema.index({ participants: 1 });

export default mongoose.model('GroupChat', groupChatSchema);
