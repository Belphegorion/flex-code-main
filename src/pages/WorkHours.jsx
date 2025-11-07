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
            {/* Hero inspired by provided design — left content, right visual */}
            <div className="hero-banner p-6 mb-6">
              <div className="flex flex-col md:flex-row items-stretch gap-6">
                <div className="md:w-1/2 flex flex-col justify-center px-6 py-8">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-wide leading-tight">WORK HOURS</h1>
                  <h2 className="mt-3 text-sm opacity-90 uppercase">{event?.title}</h2>
                  <p className="mt-4 text-gray-200 text-sm max-w-xl">
                    {isOrganizer ? 'Manage work schedules and track worker hours' : 'Track your work hours and earnings'}
                  </p>
                  <div className="mt-6">
                    <button className="hero-cta">Open Work Tools</button>
                  </div>
                </div>

                <div className="md:w-1/2 flex items-center justify-center p-6">
                  {/* visual panel resembling image — keep rounded inner image */}
                  <div className="bg-gray-900 p-4 rounded-lg shadow-inner">
                    {event?.bannerUrl ? (
                      <img src={event.bannerUrl} alt="event" className="w-64 h-40 object-cover rounded-md" />
                    ) : (
                      <div className="w-64 h-40 bg-gray-700 rounded-md flex items-center justify-center text-sm text-gray-200">Event Visual</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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