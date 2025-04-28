
import React from 'react';

const StatusBar: React.FC = () => {
  // Get current time
  const [time, setTime] = React.useState<string>(new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ios-status-bar flex justify-between items-center h-7 px-4 text-xs">
      <div className="ios-time">{time}</div>
      <div className="ios-status-icons flex space-x-1">
        <div className="ios-cell-signal">📶</div>
        <div className="ios-wifi">📡</div>
        <div className="ios-battery">🔋</div>
      </div>
    </div>
  );
};

export default StatusBar;
