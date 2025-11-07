import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiClock, FiPlay, FiSquare, FiQrCode, FiDownload } from 'react-icons/fi';
import QRScanner from './QRScanner';
import api from '../../services/api';

export default function WorkHoursTracker({ eventId }) {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [eventId]);

  const fetchSessions = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}/sessions`);
      setSessions(res.sessions || []);
      setSummary(res.summary || {});
      
      // Check for active session
      const active = res.sessions?.find(s => s.status === 'checked-in');
      setActiveSession(active || null);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = ({ qrData, jobs }) => {
    setShowScanner(false);
    
    if (jobs.length === 1) {
      // Auto-select if only one job
      handleCheckInOut(qrData.token, jobs[0]._id);
    } else {
      // Show job selection modal
      showJobSelection(qrData.token, jobs);
    }
  };

  const showJobSelection = (qrToken, jobs) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    
    const content = document.createElement('div');
    content.className = 'bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold mb-4';
    title.textContent = 'Select Job to Track';
    
    const jobList = document.createElement('div');
    jobList.className = 'space-y-2';
    
    jobs.forEach(job => {
      const button = document.createElement('button');
      button.className = 'w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600';
      button.innerHTML = `
        <div class="font-medium">${job.title}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Rate: $${job.payPerPerson}/hour</div>
      `;
      button.onclick = () => {
        modal.remove();
        handleCheckInOut(qrToken, job._id);
      };
      jobList.appendChild(button);
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'w-full mt-4 p-2 bg-gray-200 dark:bg-gray-600 rounded-lg';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => modal.remove();
    
    content.appendChild(title);
    content.appendChild(jobList);
    content.appendChild(cancelBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
  };

  const handleCheckInOut = async (qrToken, jobId) => {
    try {
      if (activeSession) {
        // Check out
        const res = await api.post('/work-schedule/check-out', {
          qrToken,
          jobId: activeSession.jobId
        });
        toast.success(`Checked out! Worked ${res.session.totalHours} hours, earned $${res.session.earnings}`);
        setActiveSession(null);
      } else {
        // Check in
        const res = await api.post('/work-schedule/check-in', {
          qrToken,
          jobId
        });
        toast.success('Checked in successfully!');
        setActiveSession(res.session);
      }
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process check-in/out');
    }
  };

  const downloadQR = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}/qr`);
      
      // Create download link
      const link = document.createElement('a');
      link.href = res.qrCode;
      link.download = `work-qr-${eventId}.png`;
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
      {/* Current Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FiClock className="text-primary-600" />
            Work Hours Tracker
          </h3>
          <button
            onClick={downloadQR}
            className="btn-secondary flex items-center gap-2"
          >
            <FiDownload size={16} />
            Download QR
          </button>
        </div>

        {activeSession ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-green-800 dark:text-green-200">Currently Working</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
              Started: {new Date(activeSession.checkInTime).toLocaleString()}
            </p>
            <button
              onClick={() => setShowScanner(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FiSquare size={16} />
              Scan QR to Check Out
            </button>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 mb-3">Ready to start working</p>
            <button
              onClick={() => setShowScanner(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <FiPlay size={16} />
              Scan QR to Check In
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{summary.totalHours || 0}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${summary.totalEarnings || 0}</div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalSessions || 0}</div>
            <div className="text-sm text-gray-600">Work Sessions</div>
          </div>
        </div>
      )}

      {/* Sessions History */}
      <div className="card p-6">
        <h4 className="font-bold mb-4">Work Sessions</h4>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No work sessions yet</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium">{session.jobId?.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{session.totalHours}h</div>
                  <div className="text-sm text-green-600">${session.earnings}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}