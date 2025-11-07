import { useState, useEffect } from 'react';
import { FiClock, FiDollarSign, FiUsers, FiCalendar, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../../services/api';

export default function WorkSummaryDashboard({ eventId }) {
  const [summary, setSummary] = useState({ workers: [], overall: {} });
  const [loading, setLoading] = useState(true);
  const [expandedWorker, setExpandedWorker] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, [eventId]);

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}/summary`);
      setSummary(res);
    } catch (error) {
      console.error('Error fetching work summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const toggleWorkerDetails = (workerId) => {
    setExpandedWorker(expandedWorker === workerId ? null : workerId);
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
      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiUsers className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Workers</p>
              <p className="text-2xl font-bold text-blue-600">{summary.overall.totalWorkers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiClock className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-bold text-green-600">{summary.overall.totalHours || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-purple-600">${summary.overall.totalEarnings || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-orange-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-orange-600">{summary.overall.totalSessions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Worker Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Worker Earnings & Hours</h3>
        {summary.workers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No work sessions recorded yet
          </div>
        ) : (
          <div className="space-y-3">
            {summary.workers.map(worker => (
              <div key={worker.worker._id} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => toggleWorkerDetails(worker.worker._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {worker.worker.name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{worker.worker.name}</h4>
                          {worker.badge && (
                            <span 
                              className="text-lg cursor-pointer" 
                              title={`${worker.badge.name} - ${worker.totalHours}h worked`}
                            >
                              {worker.badge.icon}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{worker.worker.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hours</p>
                        <p className="font-semibold">{worker.totalHours}h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Earnings</p>
                        <p className="font-semibold text-green-600">${worker.totalEarnings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
                        <p className="font-semibold">{worker.sessions.length}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        {expandedWorker === worker.worker._id ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedWorker === worker.worker._id && (
                  <div className="border-t bg-gray-50 dark:bg-gray-900 p-4">
                    <h5 className="font-medium mb-3">Work Sessions</h5>
                    <div className="space-y-2">
                      {worker.sessions.map(session => (
                        <div key={session._id} className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">{session.jobId?.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formatDate(session.date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 text-sm">${session.earnings}</p>
                              <p className="text-xs text-gray-600">{session.totalHours}h</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>In: {formatTime(session.checkInTime)}</span>
                            {session.checkOutTime ? (
                              <span>Out: {formatTime(session.checkOutTime)}</span>
                            ) : (
                              <span className="text-blue-600 font-medium">Currently working</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

