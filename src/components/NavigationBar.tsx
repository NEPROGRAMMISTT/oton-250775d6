
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
    <div className="ios-header h-14 w-full left-0 right-0">
      <div className="max-w-full md:max-w-4xl lg:max-w-6xl mx-auto flex items-center justify-between h-full px-4">
        {/* Left side - Back button or empty spacer */}
        <div className="flex-1 flex justify-start">
          {showBackButton ? (
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
          ) : (
            <div></div> // Empty div to maintain flex spacing
          )}
        </div>
        
        {/* Center - Title */}
        <h1 className="text-lg font-semibold flex-0">
          {title}
        </h1>
        
        {/* Right side - Optional elements or empty spacer */}
        <div className="flex-1 flex justify-end">
          {rightElement || <div></div>}
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
