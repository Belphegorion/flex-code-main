import { useState, useEffect } from 'react';
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your jobs and applications</p>
          </div>
          <div className="w-full sm:w-auto">
            <StartWorkButton />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{acceptedJobs.length}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                <FiBriefcase size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
                <FiClock size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accepted</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {applications.filter(app => app.status === 'accepted').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                <FiCheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Jobs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <FiCheckCircle className="text-green-600 dark:text-green-400" />
              Active Jobs ({acceptedJobs.length})
            </h2>
            
            {acceptedJobs.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No active jobs yet</p>
                <button onClick={() => navigate('/jobs')} className="mt-4 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  Find Work
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {acceptedJobs.map(job => (
                  <div key={job._id} className="p-4 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-lg hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
                      <span className="text-green-600 dark:text-green-400 font-bold text-lg">${job.payPerPerson}/hr</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {job.eventId?.title}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <FiCalendar size={14} />
                        {new Date(job.eventId?.dateStart).toLocaleDateString()}
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <FiClock className="text-blue-600 dark:text-blue-400" />
              My Applications ({applications.length})
            </h2>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FiClock className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No applications yet</p>
                <button onClick={() => navigate('/jobs')} className="mt-4 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  Find Work
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {applications.map(application => (
                  <div key={application._id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md transition-all bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{application.jobId?.title}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {application.jobId?.eventId?.title}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        ${application.jobId?.payPerPerson}/hr
                      </span>
                    </div>
                    {application.coverLetter && (
                      <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
                        <strong className="text-gray-900 dark:text-gray-100">Cover Letter:</strong>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{application.coverLetter}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
