import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiStar, FiMail, FiPhone, FiMessageCircle, FiCheck, FiX } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import ProfileImageLink from '../components/profile/ProfileImageLink';
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

  const elevateWorker = async (workerId) => {
    if (!job?.eventId) {
      toast.error('Event information not available');
      return;
    }

    try {
      await api.post('/co-organizers/elevate', {
        eventId: job.eventId,
        workerId,
        permissions: { canHireWorkers: true, canManageJobs: true }
      });
      toast.success('Worker elevated to co-organizer!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to elevate worker');
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium mb-4">
              ← Back to Job
            </Link>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Applicants for {job?.title}</h1>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{applications.length} total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{pendingApps.length} pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{acceptedApps.length} accepted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Applications */}
          {pendingApps.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pending Applications</h2>
              <div className="space-y-4">
              {pendingApps.map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-400 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <ProfileImageLink
                      userId={app.proId?._id}
                      profilePhoto={app.proId?.profilePhoto}
                      name={app.proId?.name}
                      size="lg"
                    />
                    
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

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(app._id)}
                          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md flex items-center gap-2"
                        >
                          <FiCheck /> Accept
                        </button>
                        <button
                          onClick={() => handleDecline(app._id)}
                          className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-md flex items-center gap-2"
                        >
                          <FiX /> Decline
                        </button>
                        <Link
                          to={`/profile/${app.proId._id}`}
                          className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
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
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Accepted Workers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedApps.map(app => (
                <div key={app._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border-l-4 border-green-400">
                  <div className="flex items-center gap-3 mb-3">
                    <ProfileImageLink
                      userId={app.proId?._id}
                      profilePhoto={app.proId?.profilePhoto}
                      name={app.proId?.name}
                      size="md"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{app.proId?.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{app.proId?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/groups')}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <FiMessageCircle /> Event Group Chat
                    </button>
                    {job?.eventId && (
                      <button
                        onClick={() => elevateWorker(app.proId._id)}
                        className="w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                      >
                        Elevate to Co-Organizer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Declined Applications */}
          {declinedApps.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Declined Applications</h2>
              <div className="space-y-2">
              {declinedApps.map(app => (
                <div key={app._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 opacity-60 border-l-4 border-gray-300">
                  <div className="flex items-center gap-3">
                    <ProfileImageLink
                      userId={app.proId?._id}
                      profilePhoto={app.proId?.profilePhoto}
                      name={app.proId?.name}
                      size="sm"
                    />
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
              <p className="text-gray-500 text-lg">No applications yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
