import Chat from '../models/Chat.js';

export const createOrGetChat = async (req, res) => {
  try {
    const { participantId, jobId } = req.body;
    const participants = [req.userId, participantId].sort();

    let chat = await Chat.findOne({ participants, jobId });

    if (!chat) {
      chat = await Chat.create({
        participants,
        jobId,
        messages: []
      });
    }

    await chat.populate('participants', 'name email role');
    await chat.populate('jobId', 'title');

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat', error: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', 'name email role')
      .populate('jobId', 'title')
      .sort({ lastMessageAt: -1 });

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is participant
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = {
      senderId: req.userId,
      text,
      createdAt: new Date()
    };

    chat.messages.push(message);
    chat.lastMessage = text;
    chat.lastMessageAt = new Date();
    await chat.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(chatId).emit('receive-message', message);

    res.json({ message: 'Message sent', chat });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== req.userId.toString()) {
        msg.read = true;
      }
    });

    await chat.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages', error: error.message });
  }
};