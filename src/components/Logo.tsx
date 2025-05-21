
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className
}) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        <div className="bg-[#9b87f5] text-white w-8 h-8 rounded-lg flex items-center justify-center text-xl font-bold">
          F
        </div>
        <span className="font-bold text-[#9b87f5] text-xl">Fixlify AI</span>
      </div>
    </div>
  );
};
