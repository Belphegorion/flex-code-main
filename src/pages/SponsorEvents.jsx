import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiArrowLeft, FiVideo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

export default function SponsorEvents() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sponsoring, setSponsoring] = useState(false);
  const [sponsorAmount, setSponsorAmount] = useState('');
  const [sponsorMessage, setSponsorMessage] = useState('');
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  useEffect(() => {
    fetchEvents();
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/sponsors/events');
      setEvents(res.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setSelectedEvent(res.event);
    } catch (error) {
      toast.error('Event not found');
      navigate('/sponsor/events');
    }
  };

  const handleSponsor = async (e) => {
    e.preventDefault();
    
    if (!sponsorAmount || parseFloat(sponsorAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSponsoring(true);
    try {
      const res = await api.post('/sponsors/sponsor', {
        eventId: selectedEvent._id,
        amount: parseFloat(sponsorAmount),
        message: sponsorMessage
      });

      toast.success('Sponsorship offer sent successfully!');
      setShowSponsorModal(false);
      setSponsorAmount('');
      setSponsorMessage('');
      
      // Navigate to chat
      navigate(`/groups/${res.chatId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send sponsorship offer');
    } finally {
      setSponsoring(false);
    }
  };

  const joinVideoCall = async (event) => {
    try {
      const res = await api.post(`/sponsors/events/${event._id}/join-call`);
      toast.success('Joining video call...');
      // Here you would integrate with your video call system
      console.log('Video call data:', res);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join video call');
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (selectedEvent) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <FiArrowLeft /> Back to Events
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{selectedEvent.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">by {selectedEvent.organizerId?.name}</p>
              </div>
              <div className="flex gap-3">
                {selectedEvent.videoCallActive && (
                  <button
                    onClick={() => joinVideoCall(selectedEvent)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiVideo /> Join Call
                  </button>
                )}
                <button
                  onClick={() => setShowSponsorModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiDollarSign /> Sponsor Event
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <FiCalendar className="text-primary-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedEvent.dateStart).toLocaleDateString()} - 
                    {new Date(selectedEvent.dateEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="text-primary-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedEvent.location?.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiUsers className="text-primary-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Expected Attendance</p>
                  <p className="font-medium">{selectedEvent.tickets?.totalDispersed || 0} people</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">About This Event</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            {selectedEvent.tickets && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Event Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tickets Available:</span>
                    <span className="ml-2 font-medium">{selectedEvent.tickets.totalDispersed}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ticket Price:</span>
                    <span className="ml-2 font-medium">${selectedEvent.tickets.pricePerTicket}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sponsor Modal */}
          {showSponsorModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Sponsor "{selectedEvent.title}"</h3>
                
                <form onSubmit={handleSponsor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Sponsorship Amount ($)</label>
                    <input
                      type="number"
                      value={sponsorAmount}
                      onChange={(e) => setSponsorAmount(e.target.value)}
                      className="input-field"
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message to Organizer</label>
                    <textarea
                      value={sponsorMessage}
                      onChange={(e) => setSponsorMessage(e.target.value)}
                      className="input-field"
                      rows="3"
                      placeholder="Tell the organizer why you want to sponsor this event..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSponsorModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sponsoring}
                      className="btn-primary flex-1"
                    >
                      {sponsoring ? 'Sending...' : 'Send Offer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Available Events for Sponsorship</h1>

        {events.length === 0 ? (
          <div className="card text-center py-12">
            <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">No Events Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              There are currently no events available for sponsorship.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, idx) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/sponsor/events/${event._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  {event.videoCallActive && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <FiVideo size={12} /> Live
                    </div>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {event.description}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiCalendar size={16} />
                    <span>{new Date(event.dateStart).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiMapPin size={16} />
                    <span>{event.location?.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiUsers size={16} />
                    <span>{event.tickets?.totalDispersed || 0} expected attendees</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                  <span className="text-sm text-gray-500">by {event.organizerId?.name}</span>
                  <span className="text-primary-600 font-medium text-sm">View Details →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}