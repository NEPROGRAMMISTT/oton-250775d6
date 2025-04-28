
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationBarProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ 
  title, 
  showBackButton = false,
  rightElement 
}) => {
  const navigate = useNavigate();

  return (
    <div className="ios-header h-14">
      {showBackButton && (
        <button 
          onClick={() => navigate(-1)}
          className="text-ios-primary flex items-center"
        >
          <svg 
            className="w-5 h-5 mr-1" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </button>
      )}
      <h1 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">
        {title}
      </h1>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};

export default NavigationBar;
