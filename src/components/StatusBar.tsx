
import React from 'react';

const StatusBar: React.FC = () => {
  // Get current time
  const [time, setTime] = React.useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-center bg-ios-card px-4 py-1 text-xs">
      <div>{time}</div>
      <div className="flex items-center space-x-1">
        <div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 8L3 6M3 6L5 8M3 6V16M7 5C7 3.89543 7.89543 3 9 3H21C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H9C7.89543 21 7 20.1046 7 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5789 12C19.5789 16.1421 16.1421 19.5789 12 19.5789C7.85792 19.5789 4.42105 16.1421 4.42105 12C4.42105 7.85792 7.85792 4.42105 12 4.42105C16.1421 4.42105 19.5789 7.85792 19.5789 12Z" stroke="black" strokeWidth="1.2"/>
            <path d="M13.6833 7.06331C13.0524 6.81156 12.5092 6.73684 12 6.73684" stroke="black" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M16.7274 9.30681C16.2053 8.50179 15.6118 7.84862 14.9158 7.35938" stroke="black" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M19.7747 13.6078C19.3402 12.335 18.7113 11.2407 17.9463 10.3678" stroke="black" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M10.3158 6.73684C6.87829 6.73684 4.10526 9.12103 4.10526 12C4.10526 14.879 6.87829 17.2632 10.3158 17.2632C13.7533 17.2632 16.5263 14.879 16.5263 12C16.5263 9.12103 13.7533 6.73684 10.3158 6.73684Z" stroke="black" strokeWidth="1.2"/>
          </svg>
        </div>
        <div className="font-semibold">100%</div>
      </div>
    </div>
  );
};

export default StatusBar;
