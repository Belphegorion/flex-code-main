import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiStar, FiMail, FiPhone, FiMessageCircle, FiCheck, FiX } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import api from '../services/api';

export default function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const applicantsRes = await api.get(`/applications/job/${jobId}`);
      setApplications(applicantsRes.applications || []);
      setJob(applicantsRes.job);
    } catch (error) {
      toast.error('Failed to load applicants');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      await api.post(`/applications/${applicationId}/accept`);
      toast.success('Application accepted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept application');
    }
  };

  const handleDecline = async (applicationId) => {
    try {
      await api.post(`/applications/${applicationId}/decline`);
      toast.success('Application declined');
      fetchData();
    } catch (error) {
      toast.error('Failed to decline application');
    }
  };



  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'pending');
  const acceptedApps = applications.filter(a => a.status === 'accepted');
  const declinedApps = applications.filter(a => a.status === 'declined');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to={`/jobs/${jobId}`} className="text-primary-600 dark:text-primary-400 hover:underline mb-2 inline-block">
            ← Back to Job
          </Link>
          <h1 className="text-3xl font-bold mb-2">Applicants for {job?.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {applications.length} total applications • {pendingApps.length} pending • {acceptedApps.length} accepted
          </p>
        </div>

        {/* Pending Applications */}
        {pendingApps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pending Applications</h2>
            <div className="space-y-4">
              {pendingApps.map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                      {app.proId?.name?.charAt(0) || 'U'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold">{app.proId?.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <FiMail size={14} /> {app.proId?.email}
                            </span>
                            {app.proId?.phone && (
                              <span className="flex items-center gap-1">
                                <FiPhone size={14} /> {app.proId?.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {app.proId?.ratingAvg > 0 && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <FiStar size={16} fill="currentColor" />
                            <span className="font-semibold">{app.proId.ratingAvg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {app.proId?.badges?.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {app.proId.badges.map(badge => (
                            <span key={badge} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}

                      {app.coverLetter && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{app.coverLetter}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(app._id)}
                          className="btn-primary flex items-center gap-2"
                        >
                          <FiCheck /> Accept
                        </button>
                        <button
                          onClick={() => handleDecline(app._id)}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <FiX /> Decline
                        </button>
                        <Link
                          to={`/profile/${app.proId._id}`}
                          className="btn-secondary"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Applications */}
        {acceptedApps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Accepted Workers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedApps.map(app => (
                <div key={app._id} className="card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                      {app.proId?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{app.proId?.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{app.proId?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/groups')}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <FiMessageCircle /> Event Group Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Declined Applications */}
        {declinedApps.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Declined Applications</h2>
            <div className="space-y-2">
              {declinedApps.map(app => (
                <div key={app._id} className="card p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center">
                      {app.proId?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{app.proId?.name}</p>
                      <p className="text-sm text-gray-500">Declined</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-gray-500">No applications yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
