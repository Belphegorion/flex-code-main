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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      job.status === 'open' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      job.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                    }`}>
                      {job.status}
                    </span>
                    {job.matchScore && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{job.matchScore}% match</span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiMapPin className="text-gray-400" size={16} />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                  </div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{job.location?.city || 'TBD'}</div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiDollarSign className="text-gray-400" size={16} />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pay Rate</div>
                  </div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">${job.payPerPerson}</div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="text-gray-400" size={16} />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Start Date</div>
                  </div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{new Date(job.dateStart).toLocaleDateString()}</div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUsers className="text-gray-400" size={16} />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Positions</div>
                  </div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{job.positionsFilled || 0}/{job.totalPositions}</div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Description</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
              </div>

              {job.requiredSkills?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {canApply && job.status === 'open' && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <h2 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Apply for this Job</h2>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white mb-4 text-sm"
                    rows="4"
                    placeholder="Tell the organizer why you're a great fit for this job..."
                  />
                  <button
                    onClick={handleApply}
                    className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    disabled={applying}
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              )}

              {isOrganizer && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <h2 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Manage Job</h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/jobs/${id}/applicants`)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      View Applicants
                    </button>
                    <button 
                      onClick={() => navigate(`/events/${job.eventId}/jobs/${id}/edit`)}
                      className="px-5 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium text-sm transition-colors"
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
