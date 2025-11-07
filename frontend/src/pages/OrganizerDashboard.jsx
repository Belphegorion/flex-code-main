import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiCalendar, FiClock, FiActivity, FiCheckCircle, FiPlus } from 'react-icons/fi';
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

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      ongoing: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      completed: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    };
    return badges[status] || badges.upcoming;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Organizer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your events and workforce</p>
          </div>
          <Link to="/events/create" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <FiPlus size={20} /> Create Event
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FiCalendar} label="Total Events" value={stats.total} color="primary" delay={0} />
          <StatCard icon={FiClock} label="Upcoming" value={stats.upcoming} color="info" delay={0.1} />
          <StatCard icon={FiActivity} label="Ongoing" value={stats.ongoing} color="success" delay={0.2} />
          <StatCard icon={FiCheckCircle} label="Completed" value={stats.completed} color="warning" delay={0.3} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Your Events</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No events created yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Start by creating your first event</p>
              <Link to="/events/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                <FiPlus size={18} /> Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, idx) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 cursor-pointer bg-gray-50 dark:bg-gray-800/50"
                  onClick={() => window.location.href = `/events/${event._id}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{event.location?.address || 'Location TBD'}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <FiCalendar size={14} />
                          {new Date(event.dateStart).toLocaleDateString()}
                        </span>
                        {event.dateEnd && (
                          <span className="text-gray-500 dark:text-gray-500">
                            to {new Date(event.dateEnd).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(event.status)}`}>
                        {event.status}
                      </span>
                      <span className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
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
