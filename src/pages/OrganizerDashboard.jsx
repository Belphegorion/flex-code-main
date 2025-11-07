import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiBriefcase, FiUsers, FiDollarSign, FiClock, FiCalendar, FiActivity } from 'react-icons/fi';
import api from '../services/api';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      const eventsList = res.events || [];
      setEvents(eventsList);
      const total = eventsList.length;
      const upcoming = eventsList.filter(e => e.status === 'upcoming').length;
      const ongoing = eventsList.filter(e => e.status === 'ongoing').length;
      const completed = eventsList.filter(e => e.status === 'completed').length;
      setStats({ total, upcoming, ongoing, completed });
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <Link to="/events/create" className="btn-primary flex items-center gap-2">
            <FiCalendar /> Create Event
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FiCalendar} label="Total Events" value={stats.total} color="primary" delay={0} />
          <StatCard icon={FiClock} label="Upcoming" value={stats.upcoming} color="success" delay={0.1} />
          <StatCard icon={FiActivity} label="Ongoing" value={stats.ongoing} color="warning" delay={0.2} />
          <StatCard icon={FiDollarSign} label="Completed" value={stats.completed} color="info" delay={0.3} />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Live Events</h2>
          {loading ? (
            <LoadingSpinner />
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No events created yet</p>
              <Link to="/events/create" className="btn-primary inline-block">
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, idx) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/events/${event._id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.location?.address}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <FiCalendar size={14} />
                          {new Date(event.dateStart).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        event.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {event.status}
                      </span>
                      <span className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrganizerDashboard;
