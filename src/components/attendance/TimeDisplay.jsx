import React from 'react';

const TimeDisplay = ({ time, label, className = '' }) => {
  // Format time from ISO string or return placeholder if not available
  const formattedTime = time 
    ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '--:--';

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-medium">{formattedTime}</span>
    </div>
  );
};

export default TimeDisplay;