import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiVideo, FiDownload, FiUsers, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';
import EventForm from '../components/events/EventForm';
import VideoCall from '../components/events/VideoCall';
import QRScanner from '../components/events/QRScanner';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import api from '../services/api';

export default function EventManagement() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.events || []);
    } catch (error) {
      toast.error('Error loading events');
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/video-call/start`);
      setSelectedEvent({ ...selectedEvent, qrCode: res.qrCode, videoCallId: res.videoCallId });
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
      fetchEvents();
    } catch (error) {
      toast.error('Error ending call');
    }
  };

  const downloadTicket = (ticketUrl) => {
    window.open(ticketUrl, '_blank');
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Management</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Create Event
        </button>
      </div>

      <div className="grid gap-6">
        {events.map(event => (
          <div key={event._id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Location:</strong> {event.location?.address}</p>
                  <p><strong>Start:</strong> {format(new Date(event.dateStart), 'PPpp')}</p>
                  <p><strong>End:</strong> {format(new Date(event.dateEnd), 'PPpp')}</p>
                  <p className="flex items-center gap-2">
                    <FiUsers /> <strong>Workers:</strong> {event.workers?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/events/${event._id}/financials`)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiDollarSign /> Financials
                </button>
                {event.ticketImage && (
                  <button
                    onClick={() => downloadTicket(event.ticketImage.url)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiDownload /> Ticket
                  </button>
                )}
                {event.videoCallActive ? (
                  <button
                    onClick={() => setActiveCall({ eventId: event._id, videoCallId: event.videoCallId })}
                    className="btn-primary flex items-center gap-2 bg-green-600"
                  >
                    <FiVideo /> Join Call
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      startVideoCall(event._id);
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiVideo /> Start Call
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Event">
        <EventForm onSuccess={() => {
          setShowCreateModal(false);
          fetchEvents();
        }} />
      </Modal>

      <Modal isOpen={showQRModal && !!selectedEvent?.qrCode} onClose={() => setShowQRModal(false)} title="Video Call QR Code">
        <div className="text-center space-y-4">
          <p>Share this QR code with workers to join the video call</p>
          <div className="flex justify-center">
            <QRCodeSVG value={selectedEvent?.qrCode || ''} size={256} />
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

      {activeCall && (
        <VideoCall
          eventId={activeCall.eventId}
          videoCallId={activeCall.videoCallId}
          onEnd={() => endVideoCall(activeCall.eventId)}
        />
      )}

      {showScanner && (
        <QRScanner
          onSuccess={(data) => {
            setShowScanner(false);
            setActiveCall({ eventId: data.eventId, videoCallId: data.videoCallId });
          }}
          onCancel={() => setShowScanner(false)}
        />
      )}

      <button
        onClick={() => setShowScanner(true)}
        className="fixed bottom-6 right-6 btn-primary rounded-full p-4 shadow-lg"
      >
        <FiVideo size={24} />
      </button>
    </div>
  );
}
