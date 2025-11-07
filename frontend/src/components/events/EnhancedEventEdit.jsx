import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';

export default function EnhancedEventEdit() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    dateStart: '',
    dateEnd: '',
    location: { address: '', lat: null, lng: null },
    venue: { name: '', type: '', capacity: null },
    attendees: { expectedCount: 0 }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      const { event } = res;
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || '',
        dateStart: event.dateStart?.split('T')[0] || '',
        dateEnd: event.dateEnd?.split('T')[0] || '',
        location: event.location || { address: '', lat: null, lng: null },
        venue: event.venue || { name: '', type: '', capacity: null },
        attendees: event.attendees || { expectedCount: 0 }
      });
    } catch (error) {
      toast.error('Failed to load event');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/events/${eventId}`, formData);
      toast.success('Event updated');
      navigate(`/events/${eventId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900">
        <FiArrowLeft /> Back
      </button>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows="4"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={formData.dateStart}
              onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={formData.dateEnd}
              onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Venue Name</label>
          <input
            type="text"
            value={formData.venue.name}
            onChange={(e) => setFormData({ ...formData, venue: { ...formData.venue, name: e.target.value } })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Expected Attendees</label>
          <input
            type="number"
            value={formData.attendees.expectedCount}
            onChange={(e) => setFormData({ ...formData, attendees: { ...formData.attendees, expectedCount: parseInt(e.target.value) } })}
            className="input-field"
            min="1"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
