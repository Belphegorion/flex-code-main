import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';

export default function GroupHierarchy({ eventId }) {
  const [hierarchy, setHierarchy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (eventId) {
      fetchHierarchy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchHierarchy = async () => {
    try {
      const res = await api.get(`/groups/event/${eventId}/hierarchy`);
      setHierarchy(res);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const GroupCard = ({ group, level = 0 }) => {
    const marginClass = level === 0 ? '' : level === 1 ? 'ml-4' : 'ml-8';
    return (
    <div className={`${marginClass} mb-2`}>
      <button
        onClick={() => navigate(`/groups/${group._id}`)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
      >
        <div className="flex items-center gap-3">
          <FiUsers />
          <div>
            <div className="font-medium">{group.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {group.participants.length} members
            </div>
          </div>
        </div>
        <FiChevronRight />
      </button>
    </div>
    );
  };

  if (!hierarchy) return <div>Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Event Groups</h2>
      
      {hierarchy.mainGroup && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Main Group</div>
          <GroupCard group={hierarchy.mainGroup} />
        </div>
      )}

      {hierarchy.coOrganizerGroups?.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Co-Organizer Groups</div>
          {hierarchy.coOrganizerGroups.map(g => <GroupCard key={g._id} group={g} level={1} />)}
        </div>
      )}

      {hierarchy.workerGroups?.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Worker Groups</div>
          {hierarchy.workerGroups.map(g => <GroupCard key={g._id} group={g} level={1} />)}
        </div>
      )}
    </div>
  );
}
