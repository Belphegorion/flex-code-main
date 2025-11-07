import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiPlus, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
    fetchEventJobs();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.event);
    } catch (error) {
      toast.error('Failed to load event');
    }
  };

  const fetchEventJobs = async () => {
    try {
      const res = await api.get(`/events/${eventId}/jobs`);
      setJobs(res.jobs);
      setSummary(res.summary);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Delete this job? Workers will be notified.')) return;
    
    try {
      await api.delete(`/events/${eventId}/jobs/${jobId}`);
      toast.success('Job deleted');
      fetchEventJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {event?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{event?.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/events/${eventId}/work-hours`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiClock /> Work Hours
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}/edit`)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
            >
              <FiEdit2 /> Edit Event
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <FiCalendar className="text-primary text-xl" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {new Date(event?.dateStart).toLocaleDateString()} - {new Date(event?.dateEnd).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <FiMapPin className="text-primary text-xl" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{event?.location?.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <FiUsers className="text-primary text-xl" />
            <div>
              <p className="text-sm text-gray-500">Workers</p>
              <p className="font-medium">
                {summary?.totalFilled} / {summary?.totalPositions}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-primary">
              {summary?.progress || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${summary?.progress || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Jobs ({jobs.length})
          </h2>
          <button
            onClick={() => navigate(`/events/${eventId}/jobs/create`)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
          >
            <FiPlus /> Add Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No jobs created yet. Add jobs to start hiring workers.
            </p>
            <button
              onClick={() => navigate(`/events/${eventId}/jobs/create`)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Create First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const progress = job.totalPositions > 0 
                ? (job.positionsFilled / job.totalPositions) * 100 
                : 0;
              const isFull = job.positionsFilled >= job.totalPositions;

              return (
                <div
                  key={job._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>Pay:</strong> ${job.payPerPerson}/person
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>Skills:</strong> {job.requiredSkills?.join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/jobs/${job._id}/applicants`)}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        View Applicants
                      </button>
                      <button
                        onClick={() => navigate(`/events/${eventId}/jobs/${job._id}/edit`)}
                        className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        disabled={job.positionsFilled > 0}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {/* Job Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Positions: {job.positionsFilled} / {job.totalPositions}
                      </span>
                      <span className={`text-sm font-bold ${isFull ? 'text-green-600' : 'text-primary'}`}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isFull 
                            ? 'bg-green-500' 
                            : 'bg-gradient-to-r from-primary to-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {isFull && (
                      <p className="text-green-600 text-sm font-medium mt-2">
                        ✓ All positions filled
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}
