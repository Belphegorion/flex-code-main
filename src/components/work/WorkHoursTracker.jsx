import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiClock, FiDollarSign, FiCalendar, FiHash, FiEye, FiEyeOff } from 'react-icons/fi';
import QRScanner from '../groups/QRScanner';
import WorkQRDisplay from './WorkQRDisplay';
import api from '../../services/api';

export default function WorkHoursTracker({ eventId, jobs }) {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({ totalHours: 0, totalEarnings: 0, totalSessions: 0 });
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');
  const [actionType, setActionType] = useState(''); // 'check-in' or 'check-out'
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [eventId]);

  const fetchSessions = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}/my-sessions`);
      setSessions(res.sessions);
      setSummary(res.summary);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrData) => {
    try {
      const data = JSON.parse(qrData);
      
      if (data.type !== 'work-hours') {
        toast.error('Invalid QR code for work hours');
        return;
      }

      if (!selectedJob) {
        toast.error('Please select a job first');
        return;
      }

      const endpoint = actionType === 'check-in' ? '/work-schedule/check-in' : '/work-schedule/check-out';
      const res = await api.post(endpoint, {
        qrToken: data.token,
        jobId: selectedJob
      });

      toast.success(res.message);
      setShowQRScanner(false);
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'QR scan failed');
    }
  };

  const startCheckIn = () => {
    if (!selectedJob) {
      toast.error('Please select a job first');
      return;
    }
    setActionType('check-in');
    setShowQRScanner(true);
  };

  const startCheckOut = () => {
    if (!selectedJob) {
      toast.error('Please select a job first');
      return;
    }
    setActionType('check-out');
    setShowQRScanner(true);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiClock className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-bold text-blue-600">{summary.totalHours}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">${summary.totalEarnings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Work Days</p>
              <p className="text-2xl font-bold text-purple-600">{summary.totalSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Work Hours QR Code</h3>
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {showQRCode ? <FiEyeOff /> : <FiEye />}
            {showQRCode ? 'Hide' : 'Show'} QR
          </button>
        </div>
        
        {showQRCode && <WorkQRDisplay eventId={eventId} />}
      </div>

      {/* Check In/Out Controls */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">Work Hours Tracking</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Job</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a job...</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={startCheckIn}
              disabled={!selectedJob}
              className="btn-primary flex items-center gap-2 flex-1"
            >
              <FiHash /> Check In
            </button>
            <button
              onClick={startCheckOut}
              disabled={!selectedJob}
              className="btn-secondary flex items-center gap-2 flex-1"
            >
              <FiHash /> Check Out
            </button>
          </div>
        </div>
      </div>

      {/* Work Sessions History */}
      <div>
        <h3 className="font-semibold mb-4">Work History</h3>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No work sessions recorded yet
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{session.jobId?.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(session.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${session.earnings}</p>
                    <p className="text-sm text-gray-600">{session.totalHours}h</p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Check-in: {formatTime(session.checkInTime)}</span>
                  {session.checkOutTime && (
                    <span>Check-out: {formatTime(session.checkOutTime)}</span>
                  )}
                  {session.status === 'checked-in' && (
                    <span className="text-blue-600 font-medium">Currently working</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onSuccess={() => {}}
          title={`Scan QR to ${actionType === 'check-in' ? 'Check In' : 'Check Out'}`}
          onScanSuccess={handleQRScan}
        />
      )}
    </div>
  );
}