import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    validate: {
      validator: function(value) {
        return value.length === 2;
      },
      message: 'Chat must have exactly 2 participants'
    }
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  messages: [messageSchema],
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for finding chats
chatSchema.index({ participants: 1, jobId: 1 }, { unique: true });

export default mongoose.model('Chat', chatSchema);