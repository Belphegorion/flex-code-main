import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiCalendar, FiClock, FiHash } from 'react-icons/fi';
import api from '../../services/api';

export default function GroupScheduler({ groupId, onClose, onScheduled }) {
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSchedule = async (e) => {
    e.preventDefault();
    
    if (!sessionDate || !sessionTime) {
      toast.error('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/groups/${groupId}/schedule`, {
        sessionDate,
        sessionTime
      });
      
      toast.success(`Group session scheduled! QR code sent to ${res.workersNotified} workers`);
      onScheduled();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold">Schedule Group Session</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSchedule} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <FiCalendar className="inline mr-2" />
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FiClock className="inline mr-2" />
              Session Time
            </label>
            <input
              type="time"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FiHash className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  QR Code Generation
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  A QR code will be generated and sent to all workers assigned to this event. 
                  Workers can scan the QR code to join the group chat session.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}