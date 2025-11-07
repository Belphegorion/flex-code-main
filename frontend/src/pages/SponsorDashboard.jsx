import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiDollarSign, FiCalendar, FiUsers, FiTrendingUp, FiEye, FiVideo } from 'react-icons/fi';
import VideoCallModal from '../components/video/VideoCallModal';
import api from '../services/api';

const SponsorDashboard = () => {
  const [events, setEvents] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [stats, setStats] = useState({ totalSponsored: 0, activeEvents: 0, workersSupported: 0, roi: 0 });
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, sponsorshipsRes, statsRes] = await Promise.all([
        api.get('/sponsors/events'),
        api.get('/sponsors/sponsorships'),
        api.get('/sponsors/stats')
      ]);
      
      setEvents(eventsRes.events || []);
      setSponsorships(sponsorshipsRes.sponsorships || []);
      setStats(statsRes);
    } catch (error) {
      console.error('Error fetching sponsor data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">Sponsor Dashboard</h1>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard
                  icon={FiDollarSign}
                  label="Total Sponsored"
                  value={`$${stats.totalSponsored.toLocaleString()}`}
                  color="success"
                  delay={0}
                />
                <StatCard
                  icon={FiCalendar}
                  label="Active Events"
                  value={stats.activeEvents}
                  color="primary"
                  delay={0.1}
                />
                <StatCard
                  icon={FiUsers}
                  label="Workers Supported"
                  value={stats.workersSupported}
                  color="warning"
                  delay={0.2}
                />
                <StatCard
                  icon={FiTrendingUp}
                  label="ROI"
                  value={`${stats.roi}%`}
                  color="success"
                  delay={0.3}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Available Events</h2>
                    <Link to="/sponsor/events" className="text-primary-600 hover:underline text-sm">
                      View All
                    </Link>
                  </div>
                  {events.length === 0 ? (
                    <div className="text-center py-8">
                      <FiCalendar className="mx-auto text-gray-400 mb-3" size={40} />
                      <p className="text-gray-600 dark:text-gray-400">No events available for sponsorship</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.slice(0, 3).map(event => (
                        <div key={event._id} className="border dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow">
                          <h3 className="font-medium text-sm">{event.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(event.dateStart).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">by {event.organizerId.name}</span>
                            <Link 
                              to={`/sponsor/events/${event._id}`}
                              className="text-primary-600 hover:text-primary-700 text-xs flex items-center gap-1"
                            >
                              <FiEye size={12} /> View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card"
                >
                  <h2 className="text-xl font-semibold mb-4">Your Sponsorships</h2>
                  {sponsorships.length === 0 ? (
                    <div className="text-center py-8">
                      <FiDollarSign className="mx-auto text-gray-400 mb-3" size={40} />
                      <p className="text-gray-600 dark:text-gray-400">You haven't sponsored any events yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sponsorships.slice(0, 3).map((sponsorship, idx) => (
                        <div key={idx} className="border dark:border-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{sponsorship.eventId?.title}</h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Sponsored: ${sponsorship.amount.toLocaleString()}
                              </p>
                            </div>
                            {sponsorship.eventId?.videoCallActive && (
                              <button 
                                onClick={() => {
                                  setSelectedEventId(sponsorship.eventId._id);
                                  setShowVideoCall(true);
                                }}
                                className="text-green-600 hover:text-green-700 p-1" 
                                title="Join Video Call"
                              >
                                <FiVideo size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card mt-6"
              >
                <h2 className="text-xl font-semibold mb-4">Live Events</h2>
                {sponsorships.filter(s => s.eventId?.status === 'ongoing').length === 0 ? (
                  <div className="text-center py-8">
                    <FiUsers className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-600 dark:text-gray-400">No events currently in progress</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sponsorships
                      .filter(s => s.eventId?.status === 'ongoing')
                      .map((sponsorship, idx) => (
                        <div key={idx} className="border dark:border-gray-700 rounded-lg p-4">
                          <h3 className="font-medium mb-2">{sponsorship.eventId.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Your contribution: ${sponsorship.amount.toLocaleString()}
                          </p>
                          <div className="flex gap-2">
                            <Link 
                              to={`/groups?event=${sponsorship.eventId._id}`}
                              className="btn-secondary text-xs px-3 py-1 flex-1 text-center"
                            >
                              Chat
                            </Link>
                            {sponsorship.eventId.videoCallActive && (
                              <button 
                                onClick={() => {
                                  setSelectedEventId(sponsorship.eventId._id);
                                  setShowVideoCall(true);
                                }}
                                className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                              >
                                <FiVideo size={12} /> Join Call
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </motion.div>
            </>
          )}
        </motion.div>
        
        {showVideoCall && selectedEventId && (
          <VideoCallModal
            eventId={selectedEventId}
            onClose={() => {
              setShowVideoCall(false);
              setSelectedEventId(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default SponsorDashboard;
