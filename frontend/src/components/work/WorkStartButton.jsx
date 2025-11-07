import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlay, FiSquare, FiClock } from 'react-icons/fi';
import api from '../../services/api';

export default function WorkStartButton({ groupId, onWorkStarted }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showJobSelection, setShowJobSelection] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchAvailableJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchAvailableJobs = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/available-jobs`);
      setJobs(res.jobs || []);
      setHasActiveSession(res.hasActiveSession || false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleStartWork = async (jobId) => {
    setLoading(true);
    try {
      const res = await api.post(`/groups/${groupId}/start-work`, { jobId });
      toast.success('Work session started successfully!');
      setShowJobSelection(false);
      setHasActiveSession(true);
      if (onWorkStarted) onWorkStarted(res.session);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start work session');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (jobs.length === 0) {
      toast.info('No jobs available for work tracking');
      return;
    }

    if (jobs.length === 1) {
      handleStartWork(jobs[0]._id);
    } else {
      setShowJobSelection(true);
    }
  };

  if (jobs.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleButtonClick}
        disabled={loading || hasActiveSession}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          hasActiveSession
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
        }`}
      >
        {hasActiveSession ? (
          <>
            <FiClock size={16} />
            Working
          </>
        ) : (
          <>
            <FiPlay size={16} />
            {loading ? 'Starting...' : 'Start Work'}
          </>
        )}
      </button>

      {/* Job Selection Modal */}
      {showJobSelection && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Select Job to Start</h3>
            <div className="space-y-2 mb-4">
              {jobs.map(job => (
                <button
                  key={job._id}
                  onClick={() => handleStartWork(job._id)}
                  disabled={loading || job.isActive}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    job.isActive
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Rate: ${job.payPerPerson}/hour
                      </div>
                    </div>
                    {job.isActive && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <FiClock size={14} />
                        Active
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowJobSelection(false)}
              className="w-full p-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}