import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiUserPlus } from 'react-icons/fi';
import api from '../../services/api';

export default function BulkHireModal({ eventId, onClose, onSuccess }) {
  const [userIds, setUserIds] = useState('');
  const [template, setTemplate] = useState('limited');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const users = userIds.split(',').map(id => id.trim()).filter(Boolean);
    
    if (users.length === 0) {
      toast.error('Enter at least one user ID');
      return;
    }

    setLoading(true);
    try {
      await api.post('/co-organizers/bulk-hire', { eventId, users, template });
      toast.success(`${users.length} co-organizers hired`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk hire failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Bulk Hire Co-Organizers</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">User IDs (comma-separated)</label>
            <textarea
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              className="input-field"
              rows="3"
              placeholder="user1, user2, user3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Permission Template</label>
            <select value={template} onChange={(e) => setTemplate(e.target.value)} className="input-field">
              <option value="full">Full Access</option>
              <option value="operations">Operations</option>
              <option value="limited">Limited</option>
              <option value="viewer">Viewer Only</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiUserPlus /> {loading ? 'Hiring...' : 'Hire All'}
          </button>
        </form>
      </div>
    </div>
  );
}
