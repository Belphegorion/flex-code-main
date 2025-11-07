import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUserPlus, FiTrash2, FiArrowUp } from 'react-icons/fi';
import api from '../../services/api';

export default function CoOrganizerManager({ eventId }) {
  const [coOrganizers, setCoOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchCoOrganizers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchCoOrganizers = async () => {
    try {
      const res = await api.get(`/co-organizers/event/${eventId}`);
      setCoOrganizers(res.coOrganizers);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemove = async (coOrganizerId) => {
    if (!confirm('Remove this co-organizer?')) return;
    
    try {
      await api.delete(`/co-organizers/${coOrganizerId}`);
      toast.success('Co-organizer removed');
      fetchCoOrganizers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Co-Organizers</h2>
      <div className="space-y-3">
        {coOrganizers.map(co => (
          <div key={co._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <img src={co.userId.profilePhoto || '/default-avatar.png'} alt={co.userId.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-medium">{co.userId.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {co.elevatedFrom === 'worker' ? 'Elevated' : 'Hired'}
                </div>
              </div>
            </div>
            <button onClick={() => handleRemove(co._id)} className="text-red-600 hover:text-red-700">
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
