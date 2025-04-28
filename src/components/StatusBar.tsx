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
  return;
};
export default StatusBar;