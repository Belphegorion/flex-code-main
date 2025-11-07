import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiBriefcase } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import StartWorkButton from '../components/work/StartWorkButton';
import api from '../services/api';

export default function WorkerDashboard() {
  const [applications, setApplications] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
    fetchAcceptedJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.applications || []);
    } catch (error) {
      toast.error('Failed to load applications');
    }
  };

  const fetchAcceptedJobs = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      setAcceptedJobs(res.jobs || []);
    } catch (error) {
      toast.error('Failed to load accepted jobs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <FiCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your jobs and earnings</p>
            </div>
            <StartWorkButton />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiBriefcase className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Jobs</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{acceptedJobs.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Currently working</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiClock className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {applications.filter(app => app.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Awaiting response</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FiCheckCircle className="text-gray-700 dark:text-gray-300" size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Accepted</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {applications.filter(app => app.status === 'accepted').length}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 8% vs last month</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Jobs ({acceptedJobs.length})</h2>
            </div>
            <div className="p-6">
            
              {acceptedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                    <FiCalendar className="text-gray-400" size={32} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No active jobs yet</p>
                  <button onClick={() => navigate('/jobs')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Find Work
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {acceptedJobs.map(job => (
                    <div key={job._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</h3>
                        <span className="text-gray-900 dark:text-white font-semibold text-sm">${job.payPerPerson}/hr</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {job.eventId?.title}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <FiCalendar size={12} />
                          {new Date(job.eventId?.dateStart).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Applications ({applications.length})</h2>
            </div>
            <div className="p-6">
            
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                    <FiClock className="text-gray-400" size={32} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No applications yet</p>
                  <button onClick={() => navigate('/jobs')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Find Work
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {applications.map(application => (
                    <div key={application._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{application.jobId?.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {application.jobId?.eventId?.title}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Applied: {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${application.jobId?.payPerPerson}/hr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
