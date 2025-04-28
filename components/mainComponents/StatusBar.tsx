
import React from 'react';
import { Signal, Battery, Wifi } from 'lucide-react';

const StatusBar: React.FC = () => {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex justify-between items-center px-5 py-2 w-full">
      <div className="text-sm font-medium">{time}</div>
      <div className="flex items-center space-x-2">
        <Signal size={16} />
        <Wifi size={16} />
        <Battery size={16} />
      </div>
    </div>
  );
};

export default StatusBar;
