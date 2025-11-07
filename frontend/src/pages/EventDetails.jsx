import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiPlus, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import CoOrganizerManager from '../components/coorganizer/CoOrganizerManager';
import CoOrganizerAnalytics from '../components/coorganizer/CoOrganizerAnalytics';
import GroupHierarchy from '../components/groups/GroupHierarchy';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Event Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-3">{event?.title}</h1>
                  <p className="text-white/90 text-lg">{event?.description}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/events/${eventId}/work-hours`)}
                    className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 font-semibold"
                  >
                    <FiClock /> Work Hours
                  </button>
                  <button
                    onClick={() => navigate(`/events/${eventId}/edit`)}
                    className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 font-semibold shadow-lg"
                  >
                    <FiEdit2 /> Edit Event
                  </button>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <FiCalendar className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(event?.dateStart).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-600 rounded-lg">
                      <FiMapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event?.location?.address}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <FiUsers className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Workers</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {summary?.totalFilled} / {summary?.totalPositions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Overall Progress
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {summary?.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${summary?.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

      {/* Co-Organizer Management */}
      {eventId && (
        <>
          <CoOrganizerManager eventId={eventId} />
          <CoOrganizerAnalytics eventId={eventId} />
          <GroupHierarchy eventId={eventId} />
        </>
      )}

          {/* Jobs Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Jobs ({jobs.length})
              </h2>
              <button
                onClick={() => navigate(`/events/${eventId}/jobs/create`)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 font-semibold shadow-lg"
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
                  className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 hover:shadow-xl transition-all"
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
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 text-sm font-semibold shadow-md"
                      >
                        View Applicants
                      </button>
                      <button
                        onClick={() => navigate(`/events/${eventId}/jobs/${job._id}/edit`)}
                        className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
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
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 shadow-md ${
                          isFull 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600'
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
