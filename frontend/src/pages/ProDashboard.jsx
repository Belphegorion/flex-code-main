import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiBriefcase, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import api from '../services/api';

const ProDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Professional Dashboard</h1>
          <Link to="/jobs/discover" className="btn-primary">
            Discover Jobs
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FiBriefcase} label="Applications" value={stats.total} color="primary" delay={0} />
          <StatCard icon={FiClock} label="Pending" value={stats.pending} color="warning" delay={0.1} />
          <StatCard icon={FiCheckCircle} label="Accepted" value={stats.accepted} color="success" delay={0.2} />
          <StatCard icon={FiDollarSign} label="Completed" value={stats.completed} color="info" delay={0.3} />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">My Applications</h2>
          {loading ? (
            <LoadingSpinner />
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FiBriefcase className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No applications yet</p>
              <Link to="/jobs/discover" className="btn-primary inline-block">
                Find Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{app.jobId?.title || 'Job'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {app.jobId?.location?.city} • ${app.jobId?.payPerPerson}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        app.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {app.status}
                      </span>
                      {app.jobId && (
                        <Link to={`/jobs/${app.jobId._id}`} className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                          View Job →
                        </Link>
                      )}
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

export default ProDashboard;
