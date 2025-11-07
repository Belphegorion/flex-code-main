import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import WorkerBadgeTooltip from './WorkerBadgeTooltip';

const EventWorkersDisplay = ({ eventId }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchEventWorkers();
    }
  }, [eventId]);

  const fetchEventWorkers = async () => {
    try {
      const res = await api.get(`/event-workers/${eventId}`);
      setWorkers(res.workers);
    } catch (error) {
      console.error('Error fetching event workers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-200 rounded"></div>;
  }

  if (workers.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No workers assigned to this event yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        Event Workers ({workers.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map(worker => (
          <div key={worker._id} className="flex items-center space-x-3 p-3 border rounded-lg">
            <img
              src={worker.profilePhoto || '/default-avatar.png'}
              alt={worker.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-medium">{worker.name}</div>
              <div className="text-sm text-gray-600">{worker.jobTitle}</div>
            </div>
            <WorkerBadgeTooltip worker={worker} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventWorkersDisplay;