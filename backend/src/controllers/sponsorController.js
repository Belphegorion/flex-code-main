import Event from '../models/Event.js';
import Sponsor from '../models/Sponsor.js';
import User from '../models/User.js';
import GroupChat from '../models/GroupChat.js';
import { createNotification } from './notificationController.js';
import WorkSchedule from '../models/WorkSchedule.js';

export const getAvailableEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: { $in: ['upcoming', 'ongoing'] },
      dateStart: { $gte: new Date() }
    })
      .populate('organizerId', 'name email')
      .sort({ dateStart: 1 })
      .limit(50);

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

export const sponsorEvent = async (req, res) => {
  try {
    const { eventId, amount, message } = req.body;

    if (!eventId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Event ID and valid amount are required' });
    }

    const event = await Event.findById(eventId).populate('organizerId', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already sponsored
    const existingSponsor = await Sponsor.findOne({
      userId: req.userId,
      'sponsoredEvents.eventId': eventId
    });
    if (existingSponsor) {
      return res.status(400).json({ message: 'You have already sponsored this event' });
    }

    // Update sponsor record
    await Sponsor.findOneAndUpdate(
      { userId: req.userId },
      {
        $push: {
          sponsoredEvents: {
            eventId,
            amount,
            sponsoredAt: new Date()
          }
        }
      },
      { upsert: true }
    );

    // Create private chat between sponsor and organizer
    const chatName = `${event.title} - Sponsorship Discussion`;
    const privateChat = await GroupChat.create({
      name: chatName,
      eventId,
      participants: [req.userId, event.organizerId._id],
      createdBy: req.userId,
      messages: [{
        senderId: req.userId,
        text: message || `I would like to sponsor your event "${event.title}" with $${amount}`,
        type: 'text'
      }]
    });

    // Add sponsor to event
    event.sponsors.push({
      sponsorId: req.userId,
      amount,
      sponsoredAt: new Date(),
      chatId: privateChat._id
    });
    await event.save();

    // Notify organizer
    await createNotification(event.organizerId._id, {
      type: 'system',
      title: 'New Event Sponsorship',
      message: `Someone wants to sponsor your event "${event.title}" with $${amount}`,
      relatedId: privateChat._id,
      relatedModel: 'GroupChat',
      actionUrl: `/groups/${privateChat._id}`
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user_${event.organizerId._id}`).emit('notification', {
      type: 'sponsorship',
      message: `New sponsorship offer for ${event.title}`
    });

    // Share work QR code in the chat if available
    const workSchedule = await WorkSchedule.findOne({ eventId });
    if (workSchedule?.qrCode) {
      privateChat.messages.push({
        senderId: req.userId,
        text: 'Work Hours QR Code for tracking your work time:',
        type: 'system'
      });
      await privateChat.save();
    }

    res.json({ 
      message: 'Sponsorship offer sent successfully',
      chatId: privateChat._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sponsorship', error: error.message });
  }
};

export const getSponsorships = async (req, res) => {
  try {
    const sponsor = await Sponsor.findOne({ userId: req.userId })
      .populate('sponsoredEvents.eventId', 'title dateStart dateEnd status organizerId')
      .populate('sponsoredEvents.eventId.organizerId', 'name');

    if (!sponsor) {
      return res.json({ sponsorships: [], totalSponsored: 0 });
    }

    const totalSponsored = sponsor.sponsoredEvents.reduce((sum, s) => sum + s.amount, 0);

    res.json({ 
      sponsorships: sponsor.sponsoredEvents,
      totalSponsored
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sponsorships', error: error.message });
  }
};

export const getSponsorStats = async (req, res) => {
  try {
    const sponsor = await Sponsor.findOne({ userId: req.userId })
      .populate('sponsoredEvents.eventId');

    if (!sponsor) {
      return res.json({
        totalSponsored: 0,
        activeEvents: 0,
        workersSupported: 0,
        roi: 0
      });
    }

    const totalSponsored = sponsor.sponsoredEvents.reduce((sum, s) => sum + s.amount, 0);
    const activeEvents = sponsor.sponsoredEvents.filter(s => 
      s.eventId && ['upcoming', 'ongoing'].includes(s.eventId.status)
    ).length;

    // Calculate workers supported (rough estimate)
    const workersSupported = sponsor.sponsoredEvents.reduce((sum, s) => {
      if (s.eventId) {
        return sum + (s.eventId.tickets?.totalSold || 0) / 10; // Rough estimate
      }
      return sum;
    }, 0);

    res.json({
      totalSponsored,
      activeEvents,
      workersSupported: Math.round(workersSupported),
      roi: totalSponsored > 0 ? Math.round((workersSupported * 100) / totalSponsored) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

export const joinEventVideoCall = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if sponsor has sponsored this event
    const sponsor = await Sponsor.findOne({ 
      userId: req.userId,
      'sponsoredEvents.eventId': eventId
    });

    if (!sponsor) {
      return res.status(403).json({ message: 'You must sponsor this event to join the video call' });
    }

    if (!event.videoCallActive) {
      return res.status(400).json({ message: 'No active video call for this event' });
    }

    res.json({
      message: 'Access granted to video call',
      videoCallId: event.videoCallId,
      eventTitle: event.title,
      qrCode: event.qrCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining video call', error: error.message });
  }
};