
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TabBar: React.FC = () => {
  const location = useLocation();
  
  const tabs = [
    {
      name: 'Translator',
      path: '/',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 8L10 8M15 8L19 8M12 8H12.01M7 16L11.5 11.5M16.5 16L12 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: 'Dictionaries',
      path: '/dictionaries',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19.5V4.5C4 4.5 4 3 5.5 3C7 3 17 3 18.5 3C20 3 20 4.5 20 4.5V19.5C20 19.5 20 18 18.5 18C17 18 14 18 14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 15C8 13.3431 9.34315 12 11 12H18.5C19.3284 12 20 12.6716 20 13.5V19.5C20 20.3284 19.3284 21 18.5 21H11C9.34315 21 8 19.6569 8 18V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-ios-card border-t border-ios-separator py-2">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link 
            key={tab.path} 
            to={tab.path}
            className={`flex flex-col items-center ${isActive ? 'text-ios-primary' : 'text-ios-gray'}`}
          >
            <div>{tab.icon}</div>
            <span className="text-xs mt-1">{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default TabBar;
