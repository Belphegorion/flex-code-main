import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiClock, FiVideo, FiDownload, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import { format, differenceInHours } from 'date-fns';
import Modal from '../components/common/Modal';
import VideoCall from '../components/events/VideoCall';
import { QRCodeSVG } from 'qrcode.react';

export default function EventsHero() {
  const navigate = useNavigate();
  const [activeEvents, setActiveEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveEvents();
    const interval = setInterval(fetchActiveEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveEvents = async () => {
    try {
      const res = await api.get('/events/active/live');
      setActiveEvents(res.events || []);
    } catch (error) {
      console.error('Error fetching active events:', error);
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/video-call/start`);
      const event = activeEvents.find(e => e._id === eventId);
      setSelectedEvent({ ...event, qrCode: res.qrCode, videoCallId: res.videoCallId });
      setShowQRModal(true);
      toast.success('Video call started!');
    } catch (error) {
      toast.error('Error starting video call');
    }
  };

  const endVideoCall = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/video-call/end`);
      setActiveCall(null);
      toast.success('Video call ended');
      fetchActiveEvents();
    } catch (error) {
      toast.error('Error ending call');
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.dateStart);
    const end = new Date(event.dateEnd);
    
    if (now < start) return { label: 'Starting Soon', color: 'blue' };
    if (now >= start && now <= end) return { label: 'Live Now', color: 'green' };
    return { label: 'Ending Soon', color: 'orange' };
  };

  const getTimeRemaining = (event) => {
    const now = new Date();
    const start = new Date(event.dateStart);
    const end = new Date(event.dateEnd);
    
    if (now < start) {
      const hours = differenceInHours(start, now);
      return `Starts in ${hours}h`;
    }
    const hours = differenceInHours(end, now);
    return `Ends in ${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Live Events Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor and manage your active events in real-time</p>
          </div>
          <button onClick={() => navigate('/events')} className="btn-secondary">
            View All Events
          </button>
        </div>

        {activeEvents.length === 0 ? (
          <div className="card text-center py-12">
            <FiAlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold mb-2">No Active Events</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any live events at the moment</p>
            <button onClick={() => navigate('/events')} className="btn-primary">
              Create New Event
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {activeEvents.map(event => {
              const status = getEventStatus(event);
              const financials = event.calculatedFinancials || { actualExpenses: 0, workerCost: 0, totalExpenses: 0, netProfit: 0 };
              
              return (
                <div key={event._id} className="card bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">{event.title}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold animate-pulse ${
                          status.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          status.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {event.videoCallActive ? (
                        <button
                          onClick={() => setActiveCall({ eventId: event._id, videoCallId: event.videoCallId })}
                          className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <FiVideo /> Join Call
                        </button>
                      ) : (
                        <button
                          onClick={() => startVideoCall(event._id)}
                          className="btn-primary flex items-center gap-2"
                        >
                          <FiVideo /> Start Call
                        </button>
                      )}
                      {event.ticketImage && (
                        <button
                          onClick={() => window.open(event.ticketImage.url, '_blank')}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <FiDownload /> Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <FiMapPin className="text-primary-600" />
                      <span className="truncate">{event.location?.address?.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FiClock className="text-primary-600" />
                      <span>{getTimeRemaining(event)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FiUsers className="text-primary-600" />
                      <span>{event.workers?.length || 0} Workers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FiCalendar className="text-primary-600" />
                      <span>{format(new Date(event.dateStart), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenue</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${(event.revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expenses</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        ${financials.actualExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Worker Cost</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ${financials.workerCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Cost</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        ${financials.totalExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      financials.netProfit >= 0 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Net Profit</p>
                      <p className={`text-lg font-bold ${
                        financials.netProfit >= 0 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        ${financials.netProfit.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Tickets: {event.tickets?.totalSold || 0}/{event.tickets?.totalDispersed || 0} sold
                    </div>
                    <button
                      onClick={() => navigate(`/events/${event._id}/financials`)}
                      className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                    >
                      <FiTrendingUp /> View Full Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showQRModal && selectedEvent?.qrCode && (
          <Modal isOpen={true} onClose={() => setShowQRModal(false)} title="Video Call QR Code">
            <div className="text-center space-y-4">
              <p>Share this QR code with workers to join the video call</p>
              <div className="flex justify-center">
                <QRCodeSVG value={selectedEvent.qrCode} size={256} />
              </div>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setActiveCall({ eventId: selectedEvent._id, videoCallId: selectedEvent.videoCallId });
                }}
                className="btn-primary w-full"
              >
                Join Call Now
              </button>
            </div>
          </Modal>
        )}

        {activeCall && (
          <VideoCall
            eventId={activeCall.eventId}
            videoCallId={activeCall.videoCallId}
            onEnd={() => endVideoCall(activeCall.eventId)}
          />
        )}
      </div>
    </div>
  );
}
