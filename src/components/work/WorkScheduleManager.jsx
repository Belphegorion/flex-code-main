import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiClock, FiSave, FiHash, FiEye, FiUsers, FiDownload, FiShare2 } from 'react-icons/fi';
import api from '../../services/api';
import QRCodeModal from './QRCodeModal';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function WorkScheduleManager({ eventId, onScheduleCreated }) {
  const [schedule, setSchedule] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: { startTime: '09:00', endTime: '17:00', isActive: false },
    tuesday: { startTime: '09:00', endTime: '17:00', isActive: false },
    wednesday: { startTime: '09:00', endTime: '17:00', isActive: false },
    thursday: { startTime: '09:00', endTime: '17:00', isActive: false },
    friday: { startTime: '09:00', endTime: '17:00', isActive: false },
    saturday: { startTime: '09:00', endTime: '17:00', isActive: false },
    sunday: { startTime: '09:00', endTime: '17:00', isActive: false }
  });
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [workingSummary, setWorkingSummary] = useState(null);

  useEffect(() => {
    fetchSchedule();
    fetchWorkers();
    fetchWorkingSummary();
  }, [eventId]);

  const fetchSchedule = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}`);
      setSchedule(res.schedule);
      setWeeklySchedule(res.schedule.weeklySchedule);
    } catch (error) {
      // Schedule doesn't exist yet, that's okay
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get(`/event-workers/${eventId}`);
      setWorkers(res.workers || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchWorkingSummary = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}/summary`);
      setWorkingSummary(res);
    } catch (error) {
      console.error('Error fetching work summary:', error);
    }
  };

  const downloadQR = () => {
    if (!schedule?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = schedule.qrCode;
    link.download = `work-hours-qr-${eventId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const copyQRLink = async () => {
    if (!schedule?.qrCode) return;
    
    try {
      await navigator.clipboard.writeText(schedule.qrCode);
      toast.success('QR code link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy QR code link');
    }
  };

  const handleDayToggle = (day) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], isActive: !prev[day].isActive }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (schedule) {
        await api.put(`/work-schedule/${eventId}`, { weeklySchedule });
        toast.success('Work schedule updated successfully');
      } else {
        const res = await api.post('/work-schedule', { eventId, weeklySchedule });
        setSchedule(res.schedule);
        toast.success('Work schedule created successfully');
        onScheduleCreated?.(res.schedule);
        fetchWorkers();
        fetchWorkingSummary();
      }
      fetchSchedule();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Work Schedule</h3>
        {schedule && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="btn-secondary flex items-center gap-2"
            >
              <FiHash /> {showQR ? 'Hide' : 'Show'} QR Code
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiEye /> View QR
            </button>
          </div>
        )}
      </div>

      {/* Worker Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiUsers className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Workers</p>
              <p className="text-2xl font-bold text-blue-600">{workers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiClock className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Currently Working</p>
              <p className="text-2xl font-bold text-green-600">
                {workingSummary?.workers?.filter(w => w.sessions.some(s => s.status === 'checked-in')).length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiHash className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((workingSummary?.overall?.totalHours || 0) * 100) / 100}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {showQR && schedule?.qrCode && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <div className="text-center">
            <img 
              src={schedule.qrCode} 
              alt="Work Hours QR" 
              className="mx-auto mb-4" 
              style={{ maxWidth: '250px' }}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Workers scan this QR code to check in/out for work hours
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={downloadQR}
                className="btn-secondary flex items-center gap-2"
              >
                <FiDownload /> Download
              </button>
              <button
                onClick={copyQRLink}
                className="btn-secondary flex items-center gap-2"
              >
                <FiShare2 /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {DAYS.map(day => (
          <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 w-24">
              <input
                type="checkbox"
                checked={weeklySchedule[day].isActive}
                onChange={() => handleDayToggle(day)}
                className="w-4 h-4"
              />
              <span className="capitalize font-medium">{day}</span>
            </div>
            
            {weeklySchedule[day].isActive && (
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <FiClock size={16} />
                  <input
                    type="time"
                    value={weeklySchedule[day].startTime}
                    onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                    className="input-field py-1 px-2 text-sm"
                  />
                </div>
                <span>to</span>
                <input
                  type="time"
                  value={weeklySchedule[day].endTime}
                  onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                  className="input-field py-1 px-2 text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn-primary flex items-center gap-2 w-full"
      >
        <FiSave />
        {loading ? 'Saving...' : schedule ? 'Update Schedule' : 'Create Schedule'}
      </button>
      
      {showQRModal && schedule?.qrCode && (
        <QRCodeModal
          qrCode={schedule.qrCode}
          title="Work Hours QR Code"
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}