import WorkSchedule from '../models/WorkSchedule.js';
import GroupChat from '../models/GroupChat.js';
import WorkSession from '../models/WorkSession.js';
import Event from '../models/Event.js';
import Job from '../models/Job.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { calculateBadge } from '../utils/badgeSystem.js';

export const createWorkSchedule = async (req, res) => {
  try {
    const { eventId, weeklySchedule } = req.body;

    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    // Generate unique QR token for this event
    const qrToken = crypto.randomBytes(32).toString('hex');
    const qrExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const qrData = JSON.stringify({
      eventId,
      token: qrToken,
      type: 'work-hours'
    });

    const qrCode = await QRCode.toDataURL(qrData);

    // Delete existing schedule if any
    await WorkSchedule.deleteOne({ eventId });

    const schedule = await WorkSchedule.create({
      eventId,
      organizerId: req.userId,
      weeklySchedule,
      qrCode,
      qrToken,
      qrExpiry
    });

    // Get all workers for this event and notify them
    const jobs = await Job.find({ eventId });
    const workerIds = [];
    jobs.forEach(job => {
      job.hiredPros.forEach(workerId => {
        if (!workerIds.includes(workerId.toString())) {
          workerIds.push(workerId.toString());
        }
      });
    });

    // Send notifications to all workers
    const { createNotification } = await import('./notificationController.js');
    const io = req.app.get('io');

    for (const workerId of workerIds) {
      await createNotification(workerId, {
        type: 'qr_code',
        title: 'New Work Hours QR Code',
        message: `New QR code generated for ${event.title}. Tap to view and start tracking your work hours.`,
        relatedId: eventId,
        relatedModel: 'Event',
        actionUrl: `/work-qr/${eventId}`,
        metadata: { qrToken, qrCode }
      });

      io.to(`user_${workerId}`).emit('notification', {
        type: 'qr_code',
        message: `New work QR code for ${event.title}`,
        qrCode,
        actionUrl: `/work-qr/${eventId}`
      });
    }

    // Also post QR into event's group chat (if exists)
    try {
  let group = await GroupChat.findOne({ eventId, createdBy: req.userId });
  if (!group) group = await GroupChat.findOne({ eventId });
      if (group) {
        group.messages.push({
          senderId: req.userId,
          text: `📱 Work Hours QR Code\n\nScan this QR code to track your work hours for ${event.title}\n\n⏰ Use this for check-in and check-out`,
          type: 'system'
        });
        group.lastMessage = group.messages[group.messages.length - 1].text;
        group.lastMessageAt = new Date();
        await group.save();

        const workerParticipants = group.participants.filter(p => p.toString() !== req.userId.toString());
        for (const participant of workerParticipants) {
          await createNotification(participant, {
            type: 'qr_code',
            title: 'Work QR Code Shared',
            message: `Work hours QR code for ${event.title} has been posted in the event group. Tap to view and start tracking.`,
            relatedId: eventId,
            relatedModel: 'Event',
            actionUrl: `/work-qr/${eventId}`,
            metadata: { qrToken, qrCode }
          });

          io.to(`user_${participant}`).emit('notification', {
            type: 'qr_code',
            message: `Work QR code posted in group for ${event.title}`,
            qrCode,
            actionUrl: `/work-qr/${eventId}`
          });
        }

        const messageWithQR = {
          ...group.messages[group.messages.length - 1].toObject?.() ?? group.messages[group.messages.length - 1],
          qrCode
        };
        io.to(`group_${group._id}`).emit('group-message', {
          groupId: group._id,
          message: messageWithQR,
          qrCode
        });
      }
    } catch (groupErr) {
      console.error('Error posting QR to group chat:', groupErr);
    }

    res.status(201).json({ 
      message: 'Work schedule created successfully', 
      schedule,
      qrCode,
      workersNotified: workerIds.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating work schedule', error: error.message });
  }
};

export const getWorkSchedule = async (req, res) => {
  try {
    const { eventId } = req.params;

    const schedule = await WorkSchedule.findOne({ eventId })
      .populate('eventId', 'title dateStart dateEnd');

    if (!schedule) {
      return res.status(404).json({ message: 'Work schedule not found' });
    }

    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching work schedule', error: error.message });
  }
};

export const updateWorkSchedule = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { weeklySchedule } = req.body;

    const schedule = await WorkSchedule.findOneAndUpdate(
      { eventId, organizerId: req.userId },
      { weeklySchedule },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Work schedule not found or unauthorized' });
    }

    res.json({ message: 'Work schedule updated successfully', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Error updating work schedule', error: error.message });
  }
};

export const checkInWorker = async (req, res) => {
  try {
    const { qrToken, jobId } = req.body;

    // Verify QR token
    const schedule = await WorkSchedule.findOne({ 
      qrToken, 
      qrExpiry: { $gt: new Date() },
      isActive: true 
    });

    if (!schedule) {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    // Check if worker is assigned to this job
    const job = await Job.findOne({ 
      _id: jobId, 
      eventId: schedule.eventId,
      hiredPros: req.userId 
    });

    if (!job) {
      return res.status(403).json({ message: 'You are not assigned to this job' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const existingSession = await WorkSession.findOne({
      eventId: schedule.eventId,
      workerId: req.userId,
      jobId,
      date: today,
      status: 'checked-in'
    });

    if (existingSession) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    // Create new work session
    const session = await WorkSession.create({
      eventId: schedule.eventId,
      workerId: req.userId,
      jobId,
      checkInTime: new Date(),
      hourlyRate: job.payPerPerson, // Assuming this is hourly rate
      date: today
    });

    res.json({ 
      message: 'Checked in successfully', 
      session,
      checkInTime: session.checkInTime 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
};

export const checkOutWorker = async (req, res) => {
  try {
    const { qrToken, jobId } = req.body;

    // Verify QR token
    const schedule = await WorkSchedule.findOne({ 
      qrToken, 
      qrExpiry: { $gt: new Date() },
      isActive: true 
    });

    if (!schedule) {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Find active session
    const session = await WorkSession.findOne({
      eventId: schedule.eventId,
      workerId: req.userId,
      jobId,
      date: today,
      status: 'checked-in'
    });

    if (!session) {
      return res.status(400).json({ message: 'No active check-in found for today' });
    }

    // Update session with checkout time
    session.checkOutTime = new Date();
    session.status = 'checked-out';
    await session.save(); // This will trigger the pre-save hook to calculate earnings

    res.json({ 
      message: 'Checked out successfully', 
      session,
      totalHours: session.totalHours,
      earnings: session.earnings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking out', error: error.message });
  }
};

export const getWorkerSessions = async (req, res) => {
  try {
    const { eventId } = req.params;

    const sessions = await WorkSession.find({
      eventId,
      workerId: req.userId
    })
    .populate('jobId', 'title')
    .sort({ createdAt: -1 });

    const totalHours = sessions.reduce((sum, session) => sum + session.totalHours, 0);
    const totalEarnings = sessions.reduce((sum, session) => sum + session.earnings, 0);

    res.json({ 
      sessions,
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalSessions: sessions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker sessions', error: error.message });
  }
};

export const getWorkQRForWorker = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if worker is assigned to any job in this event
    const jobs = await Job.find({ 
      eventId, 
      hiredPros: req.userId 
    });

    if (jobs.length === 0) {
      return res.status(403).json({ message: 'You are not assigned to any job in this event' });
    }

    const schedule = await WorkSchedule.findOne({ eventId })
      .populate('eventId', 'title dateStart dateEnd');

    if (!schedule) {
      return res.status(404).json({ message: 'Work schedule not found for this event' });
    }

    res.json({ 
      qrCode: schedule.qrCode,
      qrToken: schedule.qrToken,
      event: schedule.eventId,
      jobs: jobs.map(job => ({ _id: job._id, title: job.title })),
      expiryTime: schedule.qrExpiry
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching QR code', error: error.message });
  }
};

export const sendWorkQRToWorkers = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify organizer owns this event
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    // Get or create work schedule for this event
    let schedule = await WorkSchedule.findOne({ eventId });
    
    if (!schedule) {
      // Create new work schedule with QR code
      const qrToken = crypto.randomBytes(32).toString('hex');
      const qrExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const qrData = JSON.stringify({
        eventId,
        token: qrToken,
        type: 'work-hours'
      });

      const qrCode = await QRCode.toDataURL(qrData);

      schedule = await WorkSchedule.create({
        eventId,
        organizerId: req.userId,
        qrCode,
        qrToken,
        qrExpiry
      });
    }

    // Get all workers for this event from applications
    const Application = (await import('./applicationController.js')).default || (await import('../models/Application.js')).default;
    
    const applications = await Application.find({ 
      eventId: eventId,
      status: 'accepted'
    }).distinct('workerId');
    
    const workerIds = applications.map(id => id.toString());

    // Send notifications to all workers
    const { createNotification } = await import('./notificationController.js');
    const io = req.app.get('io');

    for (const workerId of workerIds) {
      await createNotification(workerId, {
        type: 'qr_code',
        title: 'Work Hours QR Code',
        message: `Work hours QR code for ${event.title}. Tap to view and start tracking your work hours.`,
        relatedId: eventId,
        relatedModel: 'Event',
        actionUrl: `/work-qr/${eventId}`,
        metadata: { qrToken: schedule.qrToken, qrCode: schedule.qrCode }
      });

      io.to(`user_${workerId}`).emit('notification', {
        type: 'qr_code',
        message: `Work QR code for ${event.title}`,
        qrCode: schedule.qrCode,
        actionUrl: `/work-qr/${eventId}`
      });
    }

    // Also post QR into event's group chat (if exists)
    try {
  let group = await GroupChat.findOne({ eventId, createdBy: req.userId });
  if (!group) group = await GroupChat.findOne({ eventId });
      if (group) {
        group.messages.push({
          senderId: req.userId,
          text: `📱 Work Hours QR Code\n\nScan this QR code to track your work hours for ${event.title}\n\n⏰ Use this for check-in and check-out`,
          type: 'system'
        });
        group.lastMessage = group.messages[group.messages.length - 1].text;
        group.lastMessageAt = new Date();
        await group.save();

        const workerParticipants = group.participants.filter(p => p.toString() !== req.userId.toString());
        for (const participant of workerParticipants) {
          await createNotification(participant, {
            type: 'qr_code',
            title: 'Work QR Code Shared',
            message: `Work hours QR code for ${event.title} has been posted in the event group. Tap to view and start tracking.`,
            relatedId: eventId,
            relatedModel: 'Event',
            actionUrl: `/work-qr/${eventId}`,
            metadata: { qrToken: schedule.qrToken, qrCode: schedule.qrCode }
          });

          io.to(`user_${participant}`).emit('notification', {
            type: 'qr_code',
            message: `Work QR code posted in group for ${event.title}`,
            qrCode: schedule.qrCode,
            actionUrl: `/work-qr/${eventId}`
          });
        }

        const messageWithQR = {
          ...group.messages[group.messages.length - 1].toObject?.() ?? group.messages[group.messages.length - 1],
          qrCode: schedule.qrCode
        };
        io.to(`group_${group._id}`).emit('group-message', {
          groupId: group._id,
          message: messageWithQR,
          qrCode: schedule.qrCode
        });
      }
    } catch (groupErr) {
      console.error('Error posting QR to group chat:', groupErr);
    }

    res.json({ 
      message: 'Work QR code sent successfully', 
      workersNotified: workerIds.length,
      qrCode: schedule.qrCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending work QR code', error: error.message });
  }
};

export const getEventWorkSummary = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify organizer owns this event
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const sessions = await WorkSession.find({ eventId })
      .populate('workerId', 'name email profilePhoto')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    // Group by worker
    const workerSummary = {};
    sessions.forEach(session => {
      const workerId = session.workerId._id.toString();
      if (!workerSummary[workerId]) {
        workerSummary[workerId] = {
          worker: session.workerId,
          totalHours: 0,
          totalEarnings: 0,
          sessions: []
        };
      }
      workerSummary[workerId].totalHours += session.totalHours;
      workerSummary[workerId].totalEarnings += session.earnings;
      workerSummary[workerId].sessions.push(session);
    });

    // Calculate badges for all workers
    const workerIds = Object.keys(workerSummary);
    const allWorkerSessions = await WorkSession.find({ 
      workerId: { $in: workerIds }, 
      status: 'checked-out' 
    });
    
    const workerBadges = {};
    workerIds.forEach(workerId => {
      const sessions = allWorkerSessions.filter(s => s.workerId.toString() === workerId);
      const totalHours = sessions.reduce((sum, session) => sum + session.totalHours, 0);
      const eventIds = [...new Set(sessions.map(session => session.eventId.toString()))];
      workerBadges[workerId] = calculateBadge(totalHours, eventIds.length);
    });

    const summary = Object.values(workerSummary).map(worker => ({
      ...worker,
      totalHours: Math.round(worker.totalHours * 100) / 100,
      totalEarnings: Math.round(worker.totalEarnings * 100) / 100,
      badge: workerBadges[worker.worker._id.toString()]
    }));

    const overallSummary = {
      totalWorkers: summary.length,
      totalHours: summary.reduce((sum, w) => sum + w.totalHours, 0),
      totalEarnings: summary.reduce((sum, w) => sum + w.totalEarnings, 0),
      totalSessions: sessions.length
    };

    res.json({ 
      workers: summary,
      overall: overallSummary
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching work summary', error: error.message });
  }
};