import WorkSession from '../models/WorkSession.js';
import Event from '../models/Event.js';
import Job from '../models/Job.js';
import { calculateBadge } from '../utils/badgeSystem.js';

export const getWorkerBadge = async (req, res) => {
  try {
    const workerId = req.params.workerId || req.userId;

    // Get total work hours
    const sessions = await WorkSession.find({ workerId, status: 'checked-out' });
    const totalHours = sessions.reduce((sum, session) => sum + session.totalHours, 0);

    // Get total events worked
    const eventIds = [...new Set(sessions.map(session => session.eventId.toString()))];
    const totalEvents = eventIds.length;

    // Calculate badge
    const badge = calculateBadge(totalHours, totalEvents);

    res.json({
      badge,
      stats: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalEvents,
        totalSessions: sessions.length,
        totalEarnings: sessions.reduce((sum, session) => sum + session.earnings, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker badge', error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Aggregate worker stats
    const pipeline = [
      { $match: { status: 'checked-out' } },
      {
        $group: {
          _id: '$workerId',
          totalHours: { $sum: '$totalHours' },
          totalEarnings: { $sum: '$earnings' },
          totalSessions: { $sum: 1 },
          eventIds: { $addToSet: '$eventId' }
        }
      },
      {
        $addFields: {
          totalEvents: { $size: '$eventIds' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: '$worker' },
      {
        $project: {
          worker: {
            _id: '$worker._id',
            name: '$worker.name',
            profilePhoto: '$worker.profilePhoto'
          },
          totalHours: { $round: ['$totalHours', 2] },
          totalEvents: 1,
          totalEarnings: { $round: ['$totalEarnings', 2] },
          totalSessions: 1
        }
      },
      { $sort: { totalHours: -1, totalEvents: -1 } },
      { $limit: parseInt(limit) }
    ];

    const workers = await WorkSession.aggregate(pipeline);

    // Calculate badges for each worker
    const leaderboard = workers.map(worker => ({
      ...worker,
      badge: calculateBadge(worker.totalHours, worker.totalEvents)
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};