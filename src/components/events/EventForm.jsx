import { useState } from 'react';
import LocationPicker from './LocationPicker';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function EventForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateStart: '',
    dateEnd: '',
    location: null
  });
  const [ticketFile, setTicketFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post('/api/events', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const eventId = res.data.event?._id || res.data._id;

      if (ticketFile) {
        const ticketFormData = new FormData();
        ticketFormData.append('ticket', ticketFile);
        await axios.post(`/api/events/${eventId}/ticket`, ticketFormData);
      }

      toast.success('Event created successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Event Title</label>
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
          <label className="block text-sm font-medium mb-2">Start Date & Time</label>
          <input
            type="datetime-local"
            value={formData.dateStart}
            onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End Date & Time</label>
          <input
            type="datetime-local"
            value={formData.dateEnd}
            onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Event Location</label>
        <LocationPicker
          location={formData.location}
          onChange={(loc) => setFormData({ ...formData, location: loc })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ticket Image (Optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setTicketFile(e.target.files[0])}
          className="input-field"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
