import React from 'react';
interface LogoProps {
  className?: string;
}
export const Logo: React.FC<LogoProps> = ({
  className
}) => {
  return <div className="flex items-center">
      
      <div className="hidden lg:flex items-center gap-1 ml-1">
        <span className="bg-gradient-primary text-white px-2 py-0.5 rounded-md text-sm font-bold">F</span>
        <span className="font-bold text-xl">ixliFy</span>
        <span className="bg-gradient-primary text-white px-2 py-0.5 rounded-md text-sm font-bold">AI</span>
      </div>
    </div>;
};