import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiVideo, FiCalendar, FiClock, FiX } from 'react-icons/fi';
import api from '../../services/api';

export default function VideoMeetingScheduler({ groupId, onClose, onScheduled }) {
  const [meetingData, setMeetingData] = useState({
    meetingDate: '',
    meetingTime: '',
    meetingUrl: ''
  });
  const [scheduling, setScheduling] = useState(false);

  const generateMeetingUrl = () => {
    // Generate a simple meeting room ID
    const roomId = Math.random().toString(36).substring(2, 15);
    const meetingUrl = `https://meet.jit.si/eventflex-${roomId}`;
    setMeetingData(prev => ({ ...prev, meetingUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!meetingData.meetingDate || !meetingData.meetingTime || !meetingData.meetingUrl) {
      toast.error('Please fill in all fields');
      return;
    }

    setScheduling(true);
    try {
      await api.post(`/groups/${groupId}/schedule-meeting`, meetingData);
      toast.success('Video meeting scheduled successfully!');
      onScheduled();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FiVideo className="text-primary-600" />
            Schedule Video Meeting
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <FiCalendar className="inline mr-2" />
              Meeting Date
            </label>
            <input
              type="date"
              value={meetingData.meetingDate}
              onChange={(e) => setMeetingData(prev => ({ ...prev, meetingDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FiClock className="inline mr-2" />
              Meeting Time
            </label>
            <input
              type="time"
              value={meetingData.meetingTime}
              onChange={(e) => setMeetingData(prev => ({ ...prev, meetingTime: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Meeting URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={meetingData.meetingUrl}
                onChange={(e) => setMeetingData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                placeholder="https://meet.jit.si/your-room"
                className="input-field flex-1"
                required
              />
              <button
                type="button"
                onClick={generateMeetingUrl}
                className="btn-secondary px-3 py-2 text-sm"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use Jitsi Meet, Zoom, Google Meet, or any video conferencing URL
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Meeting Info:</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• All group members will be notified</li>
              <li>• Meeting link will be shared in group chat</li>
              <li>• Members can join directly from the chat</li>
            </ul>
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
              disabled={scheduling}
              className="btn-primary flex-1"
            >
              {scheduling ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}