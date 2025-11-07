import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BadgeDisplay from './BadgeDisplay';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/badges/leaderboard?limit=20');
      setLeaderboard(res.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">🏆 Top Workers</h2>
      
      <div className="space-y-4">
        {leaderboard.map((worker, index) => (
          <div 
            key={worker.worker._id}
            className={`flex items-center p-4 rounded-lg border ${
              index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="text-2xl font-bold text-gray-500 w-8">
                {index + 1}
              </div>
              
              <img
                src={worker.worker.profilePhoto || '/default-avatar.png'}
                alt={worker.worker.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{worker.worker.name}</h3>
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>⏱️ {worker.totalHours}h</span>
                  <span>🎯 {worker.totalEvents} events</span>
                  <span>💰 ${worker.totalEarnings}</span>
                </div>
              </div>
              
              <BadgeDisplay badge={worker.badge} size="md" />
            </div>
          </div>
        ))}
      </div>
      
      {leaderboard.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No workers found. Start working to appear on the leaderboard!
        </div>
      )}
    </div>
  );
};

export default Leaderboard;