import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUsers, FiClock, FiDownload, FiShare2 } from 'react-icons/fi';
import SendWorkQRButton from './SendWorkQRButton';
import api from '../../services/api';

export default function WorkScheduleManager({ eventId, eventTitle }) {
  const [schedule, setSchedule] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkData();
  }, [eventId]);

  const fetchWorkData = async () => {
    try {
      const [scheduleRes, summaryRes] = await Promise.all([
        api.get(`/work-schedule/${eventId}`),
        api.get(`/work-schedule/${eventId}/summary`)
      ]);
      
      setSchedule(scheduleRes.schedule);
      setSummary(summaryRes);
    } catch (error) {
      console.error('Error fetching work data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = async () => {
    try {
      if (!schedule?.qrCode) {
        toast.error('No QR code available');
        return;
      }
      
      const link = document.createElement('a');
      link.href = schedule.qrCode;
      link.download = `work-qr-${eventTitle}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('QR code downloaded!');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Management */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FiClock className="text-primary-600" />
            Work Hours QR Management
          </h3>
          <div className="flex gap-2">
            <SendWorkQRButton eventId={eventId} eventTitle={eventTitle} />
            {schedule?.qrCode && (
              <button
                onClick={downloadQR}
                className="btn-secondary flex items-center gap-2"
              >
                <FiDownload size={16} />
                Download QR
              </button>
            )}
          </div>
        </div>

        {schedule?.qrCode ? (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <img
                src={schedule.qrCode}
                alt="Work Hours QR Code"
                className="w-48 h-48"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">QR Code Status:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Valid until: {new Date(schedule.qrExpiry).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">How workers use this:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Scan QR code with camera or upload image</li>
                  <li>• Select their job for the event</li>
                  <li>• Check in/out to track work hours</li>
                  <li>• View earnings and session history</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">No work schedule created yet</p>
            <p className="text-sm text-gray-400">
              Send QR code to workers to enable work hours tracking
            </p>
          </div>
        )}
      </div>

      {/* Work Summary */}
      {summary && (
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiUsers className="text-primary-600" />
            Work Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.overall?.totalWorkers || 0}</div>
              <div className="text-sm text-gray-600">Active Workers</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{summary.overall?.totalHours || 0}h</div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">${summary.overall?.totalEarnings || 0}</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.overall?.totalSessions || 0}</div>
              <div className="text-sm text-gray-600">Work Sessions</div>
            </div>
          </div>

          {summary.workers && summary.workers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Worker Details:</h4>
              {summary.workers.map((worker, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center font-semibold">
                      {worker.worker.name?.charAt(0) || 'W'}
                    </div>
                    <div>
                      <div className="font-medium">{worker.worker.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {worker.badge?.tier} • {worker.sessions.length} sessions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{worker.totalHours}h</div>
                    <div className="text-sm text-green-600">${worker.totalEarnings}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}