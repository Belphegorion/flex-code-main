import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiBriefcase, FiCheckCircle, FiClock, FiDollarSign, FiTrendingUp, FiMapPin, FiCalendar } from 'react-icons/fi';
import api from '../services/api';

const ProDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      const apps = res.applications || [];
      setApplications(apps);
      const total = apps.length;
      const pending = apps.filter(a => a.status === 'pending').length;
      const accepted = apps.filter(a => a.status === 'accepted').length;
      const completed = apps.filter(a => a.status === 'completed').length;
      setStats({ total, pending, accepted, completed });
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Track your applications and opportunities</p>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
              Discover Jobs
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiBriefcase className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Applications</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 8% vs last month</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiClock className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Awaiting response</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiCheckCircle className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Accepted</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.accepted}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">Ready to work</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiDollarSign className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Completed</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Jobs finished</p>
            </motion.div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">See Details</button>
              </div>
            </div>
            {loading ? (
              <div className="p-12 text-center">
                <LoadingSpinner />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <FiBriefcase className="text-gray-400" size={32} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No applications yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Start applying to jobs and track your progress here</p>
                <Link to="/jobs" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Find Jobs
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {applications.map((app, idx) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {app.jobId?.title || 'Job'}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            app.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <FiMapPin size={12} />
                            <span>{app.jobId?.location?.city || 'Location TBD'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiDollarSign size={12} />
                            <span>${app.jobId?.payPerPerson || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiCalendar size={12} />
                            <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {app.jobId && (
                        <Link to={`/jobs/${app.jobId._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium whitespace-nowrap">
                          View template →
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProDashboard;
