import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import WorkScheduleManager from '../components/work/WorkScheduleManager';
import WorkSummaryDashboard from '../components/work/WorkSummaryDashboard';
import WorkHoursTracker from '../components/work/WorkHoursTracker';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export default function WorkHours() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const [eventRes, jobsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/jobs`)
      ]);
      
      setEvent(eventRes.event);
      setJobs(jobsRes.jobs || []);
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setLoading(false);
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

  const isOrganizer = user?.role === 'organizer';
  const isWorker = user?.role === 'worker';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Work Hours - {event?.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isOrganizer ? 'Manage work schedules and track worker hours' : 'Track your work hours and earnings'}
            </p>
          </div>

          {isOrganizer && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <WorkScheduleManager eventId={eventId} />
              </div>
              <div className="card">
                <WorkSummaryDashboard eventId={eventId} />
              </div>
            </div>
          )}

          {isWorker && (
            <div className="card">
              <WorkHoursTracker eventId={eventId} jobs={jobs} />
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}