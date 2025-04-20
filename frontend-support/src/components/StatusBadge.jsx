// src/components/StatusBadge.js
import React from 'react';

const StatusBadge = ({ status }) => {
  let bgColor;
  
  switch (status) {
    case 'open':
      bgColor = 'bg-yellow-500';
      break;
    case 'in-progress':
      bgColor = 'bg-blue-500';
      break;
    case 'resolved':
      bgColor = 'bg-green-500';
      break;
    default:
      bgColor = 'bg-gray-500';
  }
  
  return (
    <span className={`${bgColor} text-white text-sm px-2 py-1 rounded-full uppercase`}>
      {status}
    </span>
  );
};

export default StatusBadge;