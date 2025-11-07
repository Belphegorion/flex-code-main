import Job from '../models/Job.js';
import Event from '../models/Event.js';
import Application from '../models/Application.js';
import WorkSession from '../models/WorkSession.js';
import User from '../models/User.js';
import cache from '../utils/cache.js';

export const getOrganizerAnalytics = async (req, res) => {
  try {
    const cacheKey = `analytics_organizer_${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [events, jobs, applications, sessions] = await Promise.all([
      Event.find({ organizerId: req.userId }).lean(),
      Job.find({ organizerId: req.userId }).lean(),
      Application.find({ organizerId: req.userId }).lean(),
      WorkSession.find({ 
        eventId: { $in: (await Event.find({ organizerId: req.userId }).distinct('_id')) }
      }).lean()
    ]);

    const analytics = {
      overview: {
        totalEvents: events.length,
        totalJobs: jobs.length,
        totalApplications: applications.length,
        totalWorkers: new Set(sessions.map(s => s.workerId.toString())).size
      },
      events: {
        upcoming: events.filter(e => e.status === 'upcoming').length,
        ongoing: events.filter(e => e.status === 'ongoing').length,
        completed: events.filter(e => e.status === 'completed').length
      },
      jobs: {
        open: jobs.filter(j => j.status === 'open').length,
        filled: jobs.filter(j => j.positionsFilled >= j.totalPositions).length,
        inProgress: jobs.filter(j => j.status === 'in-progress').length,
        completed: jobs.filter(j => j.status === 'completed').length
      },
      applications: {
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        declined: applications.filter(a => a.status === 'declined').length
      },
      financial: {
        totalRevenue: events.reduce((sum, e) => sum + (e.revenue || 0), 0),
        totalExpenses: events.reduce((sum, e) => 
          sum + (e.expenses || []).reduce((s, exp) => s + (exp.amount || 0), 0), 0
        ),
        totalProfit: events.reduce((sum, e) => sum + (e.estimatedProfit || 0), 0)
      },
      workHours: {
        totalHours: sessions.reduce((sum, s) => sum + (s.totalHours || 0), 0),
        totalEarnings: sessions.reduce((sum, s) => sum + (s.earnings || 0), 0)
      }
    };

    cache.set(cacheKey, analytics, 300000); // Cache for 5 minutes
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

export const getWorkerAnalytics = async (req, res) => {
  try {
    const cacheKey = `analytics_worker_${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [applications, sessions, user] = await Promise.all([
      Application.find({ workerId: req.userId }).lean(),
      WorkSession.find({ workerId: req.userId }).lean(),
      User.findById(req.userId).lean()
    ]);

    const analytics = {
      overview: {
        totalApplications: applications.length,
        acceptedJobs: applications.filter(a => a.status === 'accepted').length,
        totalWorkHours: sessions.reduce((sum, s) => sum + (s.totalHours || 0), 0),
        totalEarnings: sessions.reduce((sum, s) => sum + (s.earnings || 0), 0)
      },
      applications: {
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        declined: applications.filter(a => a.status === 'declined').length,
        acceptanceRate: applications.length > 0 
          ? ((applications.filter(a => a.status === 'accepted').length / applications.length) * 100).toFixed(1)
          : 0
      },
      performance: {
        rating: user.ratingAvg || 0,
        totalRatings: user.totalRatings || 0,
        completedJobs: user.completedJobsCount || 0,
        reliabilityScore: user.reliabilityScore || 1.0
      },
      workSessions: {
        total: sessions.length,
        averageHours: sessions.length > 0 
          ? (sessions.reduce((sum, s) => sum + (s.totalHours || 0), 0) / sessions.length).toFixed(2)
          : 0,
        averageEarnings: sessions.length > 0
          ? (sessions.reduce((sum, s) => sum + (s.earnings || 0), 0) / sessions.length).toFixed(2)
          : 0
      }
    };

    cache.set(cacheKey, analytics, 300000);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

export const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findOne({ _id: eventId, organizerId: req.userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const cacheKey = `analytics_event_${eventId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [jobs, sessions] = await Promise.all([
      Job.find({ eventId }).lean(),
      WorkSession.find({ eventId }).lean()
    ]);

    const analytics = {
      event: {
        title: event.title,
        status: event.status,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd
      },
      jobs: {
        total: jobs.length,
        totalPositions: jobs.reduce((sum, j) => sum + j.totalPositions, 0),
        positionsFilled: jobs.reduce((sum, j) => sum + (j.positionsFilled || 0), 0),
        fillRate: (() => {
          const totalPos = jobs.reduce((sum, j) => sum + j.totalPositions, 0);
          const filled = jobs.reduce((sum, j) => sum + (j.positionsFilled || 0), 0);
          return totalPos > 0 ? ((filled / totalPos) * 100).toFixed(1) : 0;
        })()
      },
      workers: {
        total: new Set(sessions.map(s => s.workerId.toString())).size,
        totalHours: sessions.reduce((sum, s) => sum + (s.totalHours || 0), 0),
        totalCost: sessions.reduce((sum, s) => sum + (s.earnings || 0), 0)
      },
      financial: {
        revenue: event.revenue || 0,
        expenses: (event.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0),
        profit: event.estimatedProfit || 0,
        ticketsSold: event.tickets?.totalSold || 0,
        ticketsRevenue: (event.tickets?.totalSold || 0) * (event.tickets?.pricePerTicket || 0)
      }
    };

    cache.set(cacheKey, analytics, 180000); // Cache for 3 minutes
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event analytics', error: error.message });
  }
};
