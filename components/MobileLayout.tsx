
import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = "" }) => {
  return (
    <div className="bg-black min-h-screen w-full flex items-center justify-center">
      <div className={`mobile-container bg-gray-900 text-white overflow-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
