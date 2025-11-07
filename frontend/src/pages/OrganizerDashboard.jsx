import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiCalendar, FiUsers, FiDollarSign, FiTrendingUp, FiPlus, FiMapPin, FiClock, FiCheckCircle } from 'react-icons/fi';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your events and workforce</p>
            </div>
            <Link to="/events/create" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all">
              <FiPlus size={18} /> Create Event
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Events</span>
                <FiCalendar className="text-indigo-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-xs text-green-600 mt-1">↑ 8% vs last month</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                <FiClock className="text-blue-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</div>
              <div className="text-xs text-gray-500 mt-1">Next 30 days</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ongoing</span>
                <FiCheckCircle className="text-green-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.ongoing}</div>
              <div className="text-xs text-green-600 mt-1">Active now</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                <FiTrendingUp className="text-purple-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</div>
              <div className="text-xs text-gray-500 mt-1">All time</div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h2>
                <Link to="/worker-directory" className="text-sm text-indigo-600 hover:text-indigo-700">See all</Link>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <FiCalendar className="mx-auto text-gray-400 mb-3" size={40} />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No events yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((event, idx) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/events/${event._id}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <FiCalendar className="text-white" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(event.dateStart).toLocaleDateString()} • {event.location?.address || 'Location TBD'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                        {event.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Worker Directory</h3>
                <p className="text-sm text-indigo-100 mb-4">Find and hire talented workers</p>
                <Link to="/worker-directory" className="block w-full text-center px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                  Browse Workers
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Workers</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">$0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrganizerDashboard;
