import React, { useState } from 'react';

const WorkerBadgeTooltip = ({ worker, showName = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!worker.badge) return null;

  return (
    <div className="relative inline-block">
      <div
        className="cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-lg" title={worker.badge.name}>
          {worker.badge.icon}
        </span>
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            <div className="font-semibold" style={{ color: worker.badge.color }}>
              {worker.badge.name}
            </div>
            {showName && (
              <div className="text-gray-300">{worker.name}</div>
            )}
            <div className="text-gray-300">
              {worker.totalHours}h • {worker.totalEvents} events
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerBadgeTooltip;