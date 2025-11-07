import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LocationPicker from '../components/events/LocationPicker';
import api from '../services/api';

export default function EventEdit() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateStart: '',
    dateEnd: '',
    location: null,
    tickets: { totalDispersed: '', pricePerTicket: '' }
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      const event = res.event;
      setFormData({
        title: event.title,
        description: event.description,
        dateStart: new Date(event.dateStart).toISOString().slice(0, 16),
        dateEnd: new Date(event.dateEnd).toISOString().slice(0, 16),
        location: event.location,
        tickets: {
          totalDispersed: event.tickets?.totalDispersed || '',
          pricePerTicket: event.tickets?.pricePerTicket || ''
        }
      });
    } catch (error) {
      toast.error('Failed to load event');
      navigate('/organizer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/events/${eventId}`, formData);
      toast.success('Event updated successfully!');
      navigate(`/events/${eventId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold">Edit Event</h1>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Event Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="4"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.dateStart}
                  onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date & Time *</label>
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
              <label className="block text-sm font-medium mb-2">Event Location *</label>
              <LocationPicker 
                location={formData.location} 
                onChange={(location) => setFormData({ ...formData, location })} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Total Tickets</label>
                <input
                  type="number"
                  value={formData.tickets.totalDispersed}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tickets: { ...formData.tickets, totalDispersed: e.target.value }
                  })}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price per Ticket ($)</label>
                <input
                  type="number"
                  value={formData.tickets.pricePerTicket}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tickets: { ...formData.tickets, pricePerTicket: e.target.value }
                  })}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 flex-1"
              >
                <FiSave />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}