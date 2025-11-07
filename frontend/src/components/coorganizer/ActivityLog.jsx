import { useState, useEffect } from 'react';
import { FiActivity, FiClock } from 'react-icons/fi';
import api from '../../services/api';

export default function ActivityLog({ coOrganizerId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (coOrganizerId) {
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coOrganizerId]);

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/co-organizers/${coOrganizerId}/activities`);
      setActivities(res.activities);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      hired_worker: 'Hired Worker',
      created_job: 'Created Job',
      edited_event: 'Edited Event',
      created_group: 'Created Group',
      managed_application: 'Managed Application'
    };
    return labels[action] || action;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FiActivity /> Activity Log
      </h3>
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <FiClock className="mt-1 text-gray-500" />
            <div className="flex-1">
              <div className="font-medium">{getActionLabel(activity.action)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center text-gray-500 py-4">No activities yet</div>
        )}
      </div>
    </div>
  );
}
