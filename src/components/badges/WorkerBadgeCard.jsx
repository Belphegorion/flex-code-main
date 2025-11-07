import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BadgeDisplay from './BadgeDisplay';

const WorkerBadgeCard = () => {
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadgeData();
  }, []);

  const fetchBadgeData = async () => {
    try {
      const res = await api.get('/badges/my-badge');
      setBadgeData(res);
    } catch (error) {
      console.error('Error fetching badge:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!badgeData) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-center">Your Badge</h3>
      <BadgeDisplay badge={badgeData.badge} size="lg" showProgress={true} />
      
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Total Hours:</span>
          <span className="font-semibold">{badgeData.stats.totalHours}h</span>
        </div>
        <div className="flex justify-between">
          <span>Events:</span>
          <span className="font-semibold">{badgeData.stats.totalEvents}</span>
        </div>
        <div className="flex justify-between">
          <span>Earnings:</span>
          <span className="font-semibold">${badgeData.stats.totalEarnings}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkerBadgeCard;