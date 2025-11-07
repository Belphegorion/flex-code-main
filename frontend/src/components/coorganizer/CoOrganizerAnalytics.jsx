import { useState, useEffect } from 'react';
import { FiBarChart2, FiUsers, FiTrendingUp } from 'react-icons/fi';
import api from '../../services/api';

export default function CoOrganizerAnalytics({ eventId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/co-organizers/event/${eventId}/analytics`);
      setAnalytics(res.analytics);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!analytics) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FiBarChart2 /> Co-Organizer Analytics
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <FiUsers />
            <span className="text-sm font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold">{analytics.totalCoOrganizers}</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <FiTrendingUp />
            <span className="text-sm font-medium">Hired</span>
          </div>
          <div className="text-2xl font-bold">{analytics.hired}</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
            <FiTrendingUp />
            <span className="text-sm font-medium">Elevated</span>
          </div>
          <div className="text-2xl font-bold">{analytics.elevated}</div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Activity Breakdown</h4>
        <div className="space-y-2">
          {Object.entries(analytics.activityBreakdown || {}).map(([action, count]) => (
            <div key={action} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm capitalize">{action.replace(/_/g, ' ')}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
