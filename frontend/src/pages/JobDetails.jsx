import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Layout from '../components/common/Layout';
import { FiMapPin, FiDollarSign, FiCalendar, FiUsers, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    if (!id || id === 'undefined') {
      toast.error('Invalid job ID');
      navigate(-1);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.job || res);
    } catch (error) {
      toast.error('Failed to load job details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    setApplying(true);
    try {
      await api.post('/applications', { jobId: id, coverLetter });
      toast.success('Application submitted successfully!');
      navigate('/worker');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job details...</p>
        </div>
      </Layout>
    );
  }

  if (!job) return null;

  const isOrganizer = user?.role === 'organizer';
  const canApply = user?.role === 'worker';

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-3">{job.title}</h1>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                      job.status === 'open' ? 'bg-green-500/20 border border-green-300' :
                      job.status === 'in-progress' ? 'bg-yellow-500/20 border border-yellow-300' :
                      'bg-gray-500/20 border border-gray-300'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {job.matchScore && (
                  <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-4xl font-bold">{job.matchScore}%</div>
                    <div className="text-sm opacity-90">Match Score</div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-lg">
                      <FiMapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</div>
                      <div className="font-semibold text-lg">{job.location?.city || 'TBD'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-600 rounded-lg">
                      <FiDollarSign className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pay Rate</div>
                      <div className="font-semibold text-lg">${job.payPerPerson} per person</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <FiCalendar className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</div>
                      <div className="font-semibold text-lg">{new Date(job.dateStart).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <FiUsers className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Positions</div>
                      <div className="font-semibold text-lg">{job.positionsFilled || 0}/{job.totalPositions} filled</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Description</h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {job.requiredSkills?.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-800 dark:text-indigo-200 rounded-lg text-sm font-semibold border border-indigo-200 dark:border-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {canApply && job.status === 'open' && (
                <div className="border-t dark:border-gray-700 pt-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Apply for this Job</h2>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
                    rows="5"
                    placeholder="Tell the organizer why you're a great fit for this job..."
                  />
                  <button
                    onClick={handleApply}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    disabled={applying}
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              )}

              {isOrganizer && (
                <div className="border-t dark:border-gray-700 pt-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manage Job</h2>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => navigate(`/jobs/${id}/applicants`)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                      View Applicants
                    </button>
                    <button 
                      onClick={() => navigate(`/events/${job.eventId}/jobs/${id}/edit`)}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      Edit Job
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetails;
