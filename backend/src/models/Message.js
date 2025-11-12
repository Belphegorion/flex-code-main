import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { type: String, enum: ['text', 'image', 'file', 'video', 'audio', 'system'], default: 'text' },
  content: {
    text: String,
    fileUrl: String,
    fileName: String,
    mimeType: String,
    size: Number,
    thumbnailUrl: String,
    duration: Number
  },
  
  metadata: {
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reactions: [{
      emoji: String,
      userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    forwardCount: { type: Number, default: 0 }
  },
  
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'read', 'failed'], default: 'sent' },
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  editedAt: Date,
  deletedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ 'metadata.mentions': 1 });

export default mongoose.model('Message', messageSchema);


