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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {job.status}
              </span>
            </div>
            {job.matchScore && (
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {job.matchScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Match Score</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FiMapPin className="text-gray-400" size={20} />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
                <div className="font-medium">{job.location?.city || 'TBD'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FiDollarSign className="text-gray-400" size={20} />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pay</div>
                <div className="font-medium">${job.payPerPerson} per person</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FiCalendar className="text-gray-400" size={20} />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Start Date</div>
                <div className="font-medium">{new Date(job.dateStart).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FiUsers className="text-gray-400" size={20} />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Positions</div>
                <div className="font-medium">{job.positionsFilled || 0}/{job.totalPositions} filled</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{job.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {canApply && job.status === 'open' && (
            <div className="border-t dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold mb-3">Apply for this Job</h2>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="input-field mb-4"
                rows="4"
                placeholder="Tell the organizer why you're a great fit for this job..."
              />
              <button
                onClick={handleApply}
                className="btn-primary"
                disabled={applying}
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          )}

          {isOrganizer && (
            <div className="border-t dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold mb-3">Manage Job</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate(`/jobs/${id}/applicants`)}
                  className="btn-primary"
                >
                  View Applicants
                </button>
                <button 
                  onClick={() => navigate(`/events/${job.eventId}/jobs/${id}/edit`)}
                  className="btn-secondary"
                >
                  Edit Job
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default JobDetails;
