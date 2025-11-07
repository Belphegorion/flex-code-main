import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transition-all duration-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
