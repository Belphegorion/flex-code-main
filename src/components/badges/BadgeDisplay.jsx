import React from 'react';

const BadgeDisplay = ({ badge, size = 'md', showProgress = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (!badge) return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-lg`}
        style={{ backgroundColor: badge.color }}
        title={badge.name}
      >
        <span className="text-2xl">{badge.icon}</span>
      </div>
      
      <div className="text-center">
        <div className={`font-semibold ${textSizes[size]}`} style={{ color: badge.color }}>
          {badge.name}
        </div>
        
        {showProgress && badge.progress && badge.progress.nextTier && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-gray-600">
              Next: {badge.progress.nextTier.name}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Hours</span>
                <span>{badge.progress.hoursProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${badge.progress.hoursProgress}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Events</span>
                <span>{badge.progress.eventsProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${badge.progress.eventsProgress}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              Need: {badge.progress.hoursNeeded}h, {badge.progress.eventsNeeded} events
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeDisplay;