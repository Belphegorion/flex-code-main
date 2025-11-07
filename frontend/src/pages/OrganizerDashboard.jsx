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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your events and workforce</p>
            </div>
            <Link to="/events/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
              <FiPlus size={18} /> Create Event
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiCalendar className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Events</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 8% vs last month</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiClock className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Upcoming</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Next 30 days</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiCheckCircle className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ongoing</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.ongoing}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">Active now</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiTrendingUp className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Completed</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">All time</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h2>
                <Link to="/events" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">See Details</Link>
              </div>
              <div className="p-6">
                {loading ? (
                  <LoadingSpinner />
                ) : events.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                      <FiCalendar className="text-gray-400" size={32} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No events yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.slice(0, 5).map((event, idx) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/events/${event._id}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <FiCalendar className="text-gray-600 dark:text-gray-400" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {new Date(event.dateStart).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-indigo-600 dark:bg-indigo-700 rounded-lg p-6 text-white">
                <h3 className="text-base font-semibold mb-1">Worker Directory</h3>
                <p className="text-sm text-indigo-100 mb-4">Find and hire talented workers</p>
                <Link to="/worker-directory" className="block w-full text-center px-4 py-2 bg-white text-indigo-600 font-medium text-sm rounded-lg hover:bg-indigo-50 transition-colors">
                  Browse Workers
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
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
